"""Builds the three lecture notebooks. Run: ../.venv/bin/python build.py
Notebooks 1 and 2 run anywhere (Colab CPU or T4, a laptop). Notebook 3 needs a CUDA GPU."""
import nbformat as nbf

def nb(cells, path):
    n = nbf.v4.new_notebook()
    n.metadata = {"kernelspec": {"display_name": "Python 3", "language": "python", "name": "python3"},
                  "accelerator": "GPU", "colab": {"provenance": []}}
    for kind, src in cells:
        src = src.strip("\n")
        n.cells.append(nbf.v4.new_markdown_cell(src) if kind == "md" else nbf.v4.new_code_cell(src))
    nbf.write(n, path)
    print("wrote", path)

SETUP = '''
import json, time, numpy as np, torch
import matplotlib.pyplot as plt
from transformers import AutoTokenizer, AutoModelForCausalLM
from datasets import load_dataset

torch.manual_seed(0)
device = "cuda" if torch.cuda.is_available() else "mps" if torch.backends.mps.is_available() else "cpu"
name = "Qwen/Qwen2.5-0.5B-Instruct"          # 494 M parameters, a decoder-only transformer
tok = AutoTokenizer.from_pretrained(name)
tok.padding_side = "left"                     # so the last position is always the real last token
model = AutoModelForCausalLM.from_pretrained(name, dtype=torch.float32).to(device).eval()
print(device, f"{sum(p.numel() for p in model.parameters())/1e6:.0f} M parameters,",
      model.config.num_hidden_layers, "layers, vocabulary", model.config.vocab_size)
'''

HELPERS = '''
LETTERS = "ABCDEFGH"
letter_ids = [tok.encode(c, add_special_tokens=False)[0] for c in LETTERS]   # each letter is one token

def chat(user):
    """Wrap a user message in the model's chat format, ending where the answer starts."""
    return tok.apply_chat_template([{"role": "user", "content": user}],
                                   tokenize=False, add_generation_prompt=True)

def prompt(state, question, options):
    lines = [f"{LETTERS[i]}. {o}" for i, o in enumerate(options)]
    return chat(f"{state}\\n\\n{question}\\n" + "\\n".join(lines) + "\\n\\nAnswer with one letter.")
'''

ECE = '''
def ece(conf, correct, n_bins=10):
    conf, correct = np.asarray(conf), np.asarray(correct, dtype=float)
    edges = np.linspace(0, 1, n_bins + 1)
    total = 0.0
    for lo, hi in zip(edges[:-1], edges[1:]):
        in_bin = (conf > lo) & (conf <= hi)
        if in_bin.any():
            gap = abs(correct[in_bin].mean() - conf[in_bin].mean())
            total += in_bin.mean() * gap          # weight = share of predictions in this bin
    return total
'''

BINS = '''
def bin_table(conf, correct, n_bins=10):
    conf, correct = np.asarray(conf), np.asarray(correct, dtype=float)
    edges = np.linspace(0, 1, n_bins + 1)
    rows = []
    for lo, hi in zip(edges[:-1], edges[1:]):
        m = (conf > lo) & (conf <= hi)
        rows.append({"lo": round(float(lo), 2), "hi": round(float(hi), 2), "n": int(m.sum()),
                     "conf": round(float(conf[m].mean()), 4) if m.any() else None,
                     "acc": round(float(correct[m].mean()), 4) if m.any() else None})
    return rows

def reliability(conf, correct, title, ax):
    rows = [r for r in bin_table(conf, correct) if r["n"]]
    ax.plot([0, 1], [0, 1], "--", color="gray", label="perfect calibration")
    ax.plot([r["conf"] for r in rows], [r["acc"] for r in rows], "o-", color="#6d28d9")
    for r in rows:
        ax.annotate(str(r["n"]), (r["conf"], r["acc"]), textcoords="offset points", xytext=(6, -12), fontsize=8)
    ax.set(xlabel="confidence (the probability the model gave)", ylabel="accuracy (how often it was right)",
           title=f"{title}\\nECE = {ece(conf, correct):.3f}", xlim=(0, 1), ylim=(0, 1), aspect="equal")
    ax.legend(loc="upper left")
'''

AGNEWS = '''
TOPICS = ["World", "Sports", "Business", "Science and technology"]

def news_prompt(text):
    return prompt("News: " + text[:600], "Which topic is this news about?", TOPICS)

@torch.no_grad()
def run(texts, batch_size=16, want_hidden=False):
    """One forward pass per news item. Returns the 4 option logits (and the last hidden vector)."""
    all_logits, all_hidden = [], []
    for i in range(0, len(texts), batch_size):
        x = tok([news_prompt(t) for t in texts[i:i + batch_size]], return_tensors="pt", padding=True).to(device)
        out = model(**x, output_hidden_states=want_hidden)
        all_logits.append(out.logits[:, -1, letter_ids[:4]].float().cpu())
        if want_hidden:
            all_hidden.append(out.hidden_states[-1][:, -1].float().cpu())
    return (torch.cat(all_logits), torch.cat(all_hidden)) if want_hidden else torch.cat(all_logits)
'''

# ---------------------------------------------------------------- notebook 1
nb1 = [
("md", '''
# 1 · Read, don't write: decisions and calibration from a small LLM

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/nipunbatra/system-one/blob/main/notebooks/01_read_dont_write.ipynb)

Companion to the lecture **System 1 models: deciding without writing**.

We take a small open LLM (Qwen2.5-0.5B-Instruct, 494 M parameters) and

1. watch it generate an answer one token at a time,
2. read the answer's probabilities from a **single forward pass** instead,
3. measure whether those probabilities can be trusted (reliability diagram, ECE),
4. fix them with one number (temperature scaling),
5. turn them into decisions with thresholds.

Runs on a free Colab runtime. A T4 GPU (Runtime → Change runtime type) makes step 3 take about a minute; on CPU it takes about ten.
'''),
("code", "%pip install -q transformers datasets"),
("code", SETUP),
("md", '''
## 1. Text becomes tokens

Our running example is one support email. The model never sees letters or words, only token ids.
'''),
("code", '''
email = "I was charged twice this month, please fix it."
ids = tok(email)["input_ids"]
tokens = [tok.decode([i]) for i in ids]
print(len(ids), "tokens")
for i, t in zip(ids, tokens):
    print(f"{i:>7}  {t!r}")
'''),
("md", '''
## 2. One forward pass gives one distribution over the next token

We ask which team should handle the email and look at what the model wants to say **next**.
The model outputs one number (a logit) per vocabulary entry; softmax turns the 151,936 logits into probabilities.
'''),
("code", HELPERS + '''
teams = ["billing (invoices, payments, refunds)", "technical (bugs, outages, errors)", "sales (pricing, new plans)"]
p = prompt("Email: " + email, "Which team should handle this email?", teams)
print(p)
'''),
("code", '''
x = tok(p, return_tensors="pt").to(device)
with torch.no_grad():
    logits = model(**x).logits[0, -1].float().cpu()     # logits for the next token only
probs = logits.softmax(-1)
print("input tokens:", x["input_ids"].shape[1], "| logits:", tuple(logits.shape), "| probabilities sum to", round(probs.sum().item(), 4))
top = probs.topk(8)
next_tokens = [(tok.decode([i]), round(v.item(), 4)) for v, i in zip(top.values, top.indices)]
for t, v in next_tokens:
    print(f"{t!r:>12}  {v:.4f}  " + "#" * int(60 * v))
'''),
("md", '''
## 3. Writing the answer: one forward pass per token

This is what a chatbot does. Pick a token, append it, run the whole model again.
'''),
("code", '''
json_prompt = chat("Email: " + email + "\\n\\nReturn JSON with keys team (billing, technical or sales), "
                   "refund (true or false) and urgency (0, 1 or 2).")
ids = tok(json_prompt, return_tensors="pt")["input_ids"].to(device)
n_prompt = ids.shape[1]
passes = 0
with torch.no_grad():
    while True:
        logits = model(ids).logits[0, -1]               # one full forward pass
        passes += 1
        nxt = logits.argmax()                           # greedy: take the most likely token
        if nxt.item() == tok.eos_token_id or nxt.item() == tok.convert_tokens_to_ids("<|im_end|>") or passes > 60:
            break
        ids = torch.cat([ids, nxt.view(1, 1)], dim=1)   # append it and go again
generated = tok.decode(ids[0, n_prompt:])
n_generated = ids.shape[1] - n_prompt
print(generated)
print(f"\\n{n_generated} tokens written, so {passes} forward passes")
'''),
("code", '''
def clock(fn, repeats=5):
    fn()                                                # warm-up
    if device == "cuda": torch.cuda.synchronize()
    times = []
    for _ in range(repeats):
        t = time.perf_counter(); fn()
        if device == "cuda": torch.cuda.synchronize()
        times.append(time.perf_counter() - t)
    return 1000 * float(np.median(times))

xj = tok(json_prompt, return_tensors="pt").to(device)
with torch.no_grad():
    ms_generate = clock(lambda: model.generate(**xj, max_new_tokens=60, do_sample=False))   # with the usual cache
    ms_one_pass = clock(lambda: model(**x).logits[0, -1].cpu())
print(f"write the JSON : {ms_generate:6.0f} ms")
print(f"one forward pass: {ms_one_pass:6.0f} ms   ({ms_generate / ms_one_pass:.1f}x faster)")
'''),
("md", '''
## 4. Reading the answer instead

The answer was already in the first distribution. We keep only the logits of the option letters and renormalise.
No token is generated.
'''),
("code", '''
@torch.no_grad()
def decide(state, question, options):
    """Probability of each option, from one forward pass."""
    x = tok(prompt(state, question, options), return_tensors="pt").to(device)
    logits = model(**x).logits[0, -1].float().cpu()
    option_logits = logits[letter_ids[:len(options)]]   # keep only the option letters
    return option_logits.softmax(-1)                    # renormalise over the options

p_team = decide("Email: " + email, "Which team should handle this email?", teams)
for o, v in zip(teams, p_team): print(f"{v:.3f}  {o}")
'''),
("md", '''
The three question types of a decision model are all this one readout:

- **choice**: a probability per option (above),
- **noul** (yes/no): two options, report P(yes),
- **score**: ordered levels, report the probability-weighted level.
'''),
("code", '''
p_refund = decide("Email: " + email, "Is the customer asking for money back?", ["yes", "no"])
print(f"noul   P(yes) = {p_refund[0]:.3f}")

levels = ["not urgent", "soon", "today"]
p_urgency = decide("Email: " + email, "How urgent is this email?", levels)
score = sum(i * v.item() for i, v in enumerate(p_urgency))
print("score  " + ", ".join(f"P({l}) = {v:.3f}" for l, v in zip(levels, p_urgency)))
print("       weighted level = " + " + ".join(f"{i} x {v:.3f}" for i, v in enumerate(p_urgency)) + f" = {score:.2f}")
'''),
("md", '''
## 5. Calibration by hand

A model is **calibrated** if, among the answers it gives with probability 0.8, about 80% are right.

Ten made-up predictions first, so every number can be checked by hand:
'''),
("code", ECE + '''
toy_conf    = [0.95, 0.90, 0.90, 0.90, 0.85,   0.75, 0.70, 0.65,   0.55, 0.45]
toy_correct = [1,    1,    1,    0,    0,      1,    1,    0,      1,    0   ]
# three bins: (0.4, 0.6], (0.6, 0.8], (0.8, 1.0]
for lo, hi in [(0.4, 0.6), (0.6, 0.8), (0.8, 1.0)]:
    m = (np.array(toy_conf) > lo) & (np.array(toy_conf) <= hi)
    c, a = np.array(toy_conf)[m].mean(), np.array(toy_correct)[m].mean()
    print(f"bin ({lo}, {hi}]: {m.sum()} predictions, mean confidence {c:.2f}, accuracy {a:.2f}, gap {abs(a - c):.2f}")
print("ECE = 0.2 x 0.00 + 0.3 x 0.03 + 0.5 x 0.30 =", round(ece(toy_conf, toy_correct, n_bins=5), 3))
'''),
("md", '''
## 6. Is our LLM calibrated?

AG News: 4 topics, so a 4-way **choice**. 500 items to tune on, 1,000 to test on.
'''),
("code", AGNEWS + '''
ds = load_dataset("fancyzhx/ag_news", split="test").shuffle(seed=0)
val, test = ds.select(range(500)), ds.select(range(500, 1500))
t = time.perf_counter()
val_logits, test_logits = run(val["text"]), run(test["text"])
print(f"{len(val) + len(test)} decisions in {time.perf_counter() - t:.0f} s")
val_y, test_y = torch.tensor(val["label"]), torch.tensor(test["label"])
'''),
("code", BINS + '''
probs = test_logits.softmax(-1)
conf, pred = probs.max(-1)
correct = (pred == test_y).float()
print(f"accuracy        {correct.mean():.3f}")
print(f"mean confidence {conf.mean():.3f}   <- the model thinks it is right this often")
print(f"ECE             {ece(conf, correct):.3f}")
fig, ax = plt.subplots(figsize=(5, 5)); reliability(conf, correct, "Qwen2.5-0.5B, read from logits", ax); plt.show()
'''),
("md", '''
## 7. One number fixes most of it: temperature scaling

Divide every logit by a temperature **T** before the softmax. T > 1 flattens the distribution (less sure), T < 1 sharpens it.
The ranking of the options never changes, so accuracy stays the same. We pick the T that gives the best log-likelihood on the 500 tuning items.
'''),
("code", '''
z = torch.tensor([2.0, 1.0, 0.1])
for T in [0.5, 1.0, 2.0, 5.0]:
    print(f"T = {T}:  softmax(z / T) =", [round(v, 2) for v in (z / T).softmax(-1).tolist()])
'''),
("code", '''
Ts = np.linspace(0.5, 10, 191)
nll = [torch.nn.functional.cross_entropy(val_logits / T, val_y).item() for T in Ts]
T = float(Ts[int(np.argmin(nll))])
print(f"best temperature T = {T:.2f}")

probs_T = (test_logits / T).softmax(-1)
conf_T, pred_T = probs_T.max(-1)
print(f"accuracy        {(pred_T == test_y).float().mean():.3f}   (unchanged)")
print(f"mean confidence {conf_T.mean():.3f}")
print(f"ECE             {ece(conf, correct):.3f}  ->  {ece(conf_T, correct):.3f}")
fig, axes = plt.subplots(1, 2, figsize=(10.5, 5))
reliability(conf, correct, "before", axes[0]); reliability(conf_T, correct, f"after, T = {T:.2f}", axes[1]); plt.show()
'''),
("md", '''
## 8. From probabilities to software: thresholds

Act automatically only when the model is sure enough; send the rest to a person (or to a bigger model).
With calibrated probabilities the threshold tells you, in advance, roughly how often the automatic path is wrong.
'''),
("code", '''
thresholds = []
print("threshold | handled automatically | wrong among those")
for tau in [0.0, 0.5, 0.6, 0.7, 0.8, 0.9]:
    auto = conf_T >= tau
    row = {"tau": tau, "coverage": round(auto.float().mean().item(), 4),
           "error": round(1 - correct[auto].mean().item(), 4), "n": int(auto.sum())}
    thresholds.append(row)
    print(f"   {tau:.1f}    |        {100 * row['coverage']:5.1f}%         |      {100 * row['error']:4.1f}%")
'''),
("code", '''
results = {
    "model": name, "params_M": round(sum(p.numel() for p in model.parameters()) / 1e6), "device": device,
    "layers": model.config.num_hidden_layers, "hidden": model.config.hidden_size, "vocab": model.config.vocab_size,
    "email": email, "tokens": tokens, "token_ids": tok(email)["input_ids"], "prompt_tokens": int(x["input_ids"].shape[1]),
    "next_tokens": next_tokens,
    "letter_logits": [round(v, 3) for v in model(**x).logits[0, -1].float().cpu()[letter_ids[:3]].tolist()],
    "p_team": [round(v, 4) for v in p_team.tolist()], "p_refund_yes": round(p_refund[0].item(), 4),
    "p_urgency": [round(v, 4) for v in p_urgency.tolist()], "urgency_score": round(score, 3),
    "generated": generated, "n_generated": int(n_generated), "passes": int(passes),
    "ms_generate": round(ms_generate), "ms_one_pass": round(ms_one_pass),
    "agnews": {"n": len(test), "accuracy": round(correct.mean().item(), 4),
               "mean_conf": round(conf.mean().item(), 4), "ece": round(ece(conf, correct), 4),
               "bins": bin_table(conf, correct), "T": round(T, 2),
               "mean_conf_T": round(conf_T.mean().item(), 4), "ece_T": round(ece(conf_T, correct), 4),
               "bins_T": bin_table(conf_T, correct), "thresholds": thresholds,
               "conf": [round(v, 3) for v in conf.tolist()], "conf_T": [round(v, 3) for v in conf_T.tolist()],
               "correct": [int(v) for v in correct.tolist()]},
}
json.dump(results, open("results_1.json", "w"))
print("saved results_1.json")
'''),
("md", '''
## Things to try

- Change the email. When does the team readout become a coin flip?
- Swap the order of the options. Do the probabilities move? (They do. This is a known weakness of letter readout.)
- Use 15 bins instead of 10 in `ece`. How much does the number change?
'''),
]

# ---------------------------------------------------------------- notebook 2
nb2 = [
("md", '''
# 2 · Train your own decision head

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/nipunbatra/system-one/blob/main/notebooks/02_train_a_decision_head.ipynb)

Companion to the lecture **System 1 models: deciding without writing**.

Notebook 1 read answers from the LLM's own next-token logits. Here we keep the LLM frozen and train a **small head** on the same vector, which is the idea behind decision models:

1. one forward pass gives a vector that summarises the input and the question,
2. a small head turns that vector into a probability per option,
3. the head is trained with a **proper scoring rule**, a loss that is smallest when the stated probability equals the true chance,
4. a held-out set calibrates the result.

Runs on a free Colab runtime (T4 recommended: about two minutes in total).
'''),
("code", "%pip install -q transformers datasets"),
("code", SETUP),
("code", HELPERS + ECE + BINS + AGNEWS),
("md", '''
## 1. A loss that rewards honesty

Suppose an answer is right 70% of the time. Which probability should the model state?

- **Accuracy** only checks whether the top answer was right. Saying 0.7 or 0.99 earns the same.
- The **Brier score** (p − y)² and the **log score** −log p are *proper scoring rules*: their expected value is best exactly at p = 0.7.
'''),
("code", '''
true_chance = 0.7
p = np.linspace(0.01, 0.99, 99)
brier = true_chance * (1 - p) ** 2 + (1 - true_chance) * p ** 2          # expected (p - y)^2
logs  = -(true_chance * np.log(p) + (1 - true_chance) * np.log(1 - p))  # expected -log p(y)
for q in [0.5, 0.7, 0.9, 0.99]:
    print(f"say {q:.2f}: expected Brier = {true_chance * (1 - q) ** 2 + (1 - true_chance) * q ** 2:.3f}")
fig, ax = plt.subplots(1, 2, figsize=(9, 3.5))
ax[0].plot(p, brier, color="#be123c"); ax[0].axvline(true_chance, ls="--", color="gray"); ax[0].set(title="expected Brier score", xlabel="stated probability p")
ax[1].plot(p, logs, color="#be123c");  ax[1].axvline(true_chance, ls="--", color="gray"); ax[1].set(title="expected log score", xlabel="stated probability p")
plt.tight_layout(); plt.show()
print("both curves are lowest at p =", p[brier.argmin()].round(2), "and", p[logs.argmin()].round(2))
'''),
("md", '''
## 2. One forward pass per item, keep the last vector

Same prompt as notebook 1. From each pass we keep two things: the four option-letter logits (the zero-shot answer) and the 896-number hidden vector at the last position.
'''),
("code", '''
train = load_dataset("fancyzhx/ag_news", split="train").shuffle(seed=0).select(range(2000))
ds = load_dataset("fancyzhx/ag_news", split="test").shuffle(seed=0)
val, test = ds.select(range(500)), ds.select(range(500, 1500))
t = time.perf_counter()
_, H_train = run(train["text"], want_hidden=True)
val_logits, H_val = run(val["text"], want_hidden=True)
test_logits, H_test = run(test["text"], want_hidden=True)
y_train, y_val, y_test = (torch.tensor(d["label"]) for d in (train, val, test))
print(f"{len(train) + len(val) + len(test)} forward passes in {time.perf_counter() - t:.0f} s; vectors:", tuple(H_train.shape))
mu, sd = H_train.mean(0), H_train.std(0) + 1e-6
H_train, H_val, H_test = ((h - mu) / sd for h in (H_train, H_val, H_test))
'''),
("code", '''
def report(logits, y, label):
    probs = logits.softmax(-1); conf, pred = probs.max(-1); correct = (pred == y).float()
    brier = ((probs - torch.nn.functional.one_hot(y, 4)) ** 2).sum(-1).mean().item()
    out = {"accuracy": round(correct.mean().item(), 4), "mean_conf": round(conf.mean().item(), 4),
           "ece": round(ece(conf, correct), 4), "brier": round(brier, 4), "bins": bin_table(conf, correct)}
    print(f"{label:<34} accuracy {out['accuracy']:.3f}   mean confidence {out['mean_conf']:.3f}   ECE {out['ece']:.3f}   Brier {out['brier']:.3f}")
    return out

zero_shot = report(test_logits, y_test, "LLM letters, no training")
'''),
("md", '''
## 3. The head: one linear layer, trained with the log score

896 numbers in, 4 scores out. The LLM is not touched. Cross-entropy is the log score, a proper scoring rule.
'''),
("code", '''
def train_head(loss_name, steps=300):
    torch.manual_seed(0)
    head = torch.nn.Linear(H_train.shape[1], 4)
    opt = torch.optim.AdamW(head.parameters(), lr=1e-3, weight_decay=0.1)
    curve = []
    for step in range(steps):
        logits = head(H_train)
        if loss_name == "log":                                     # -log p(correct option)
            loss = torch.nn.functional.cross_entropy(logits, y_train)
        else:                                                      # Brier: squared distance to the one-hot answer
            loss = ((logits.softmax(-1) - torch.nn.functional.one_hot(y_train, 4)) ** 2).sum(-1).mean()
        opt.zero_grad(); loss.backward(); opt.step()
        curve.append(round(loss.item(), 4))
    return head, curve

head, curve = train_head("log")
print("parameters in the head:", sum(p.numel() for p in head.parameters()), "| loss", curve[0], "->", curve[-1])
with torch.no_grad():
    head_test, head_val = head(H_test), head(H_val)
head_log = report(head_test, y_test, "trained head (log score)")
'''),
("code", '''
head_b, curve_b = train_head("brier")
with torch.no_grad():
    head_brier = report(head_b(H_test), y_test, "trained head (Brier score)")
'''),
("md", '''
## 4. Calibrate on held-out rows

The head has seen the training rows, so its confidence there is optimistic. We fit one temperature on the 500 held-out rows, as in notebook 1.
'''),
("code", '''
def fit_T(logits, y):
    Ts = np.linspace(0.5, 10, 191)
    return float(Ts[int(np.argmin([torch.nn.functional.cross_entropy(logits / T, y).item() for T in Ts]))])

T_head, T_zero = fit_T(head_val, y_val), fit_T(val_logits, y_val)
print(f"temperatures: head {T_head:.2f}, LLM letters {T_zero:.2f}")
zero_shot_T = report(test_logits / T_zero, y_test, "LLM letters + temperature")
head_log_T  = report(head_test / T_head, y_test, "trained head + temperature")

fig, axes = plt.subplots(1, 3, figsize=(15, 5))
for ax, lg, title in [(axes[0], test_logits, "LLM letters, no training"), (axes[1], head_test, "trained head"),
                      (axes[2], head_test / T_head, f"trained head, T = {T_head:.2f}")]:
    pr = lg.softmax(-1); c, pd_ = pr.max(-1); reliability(c, (pd_ == y_test).float(), title, ax)
plt.show()
'''),
("md", '''
## 5. Use it

One forward pass through the LLM, one matrix multiply in the head, four probabilities out.
'''),
("code", '''
@torch.no_grad()
def predict(text):
    _, h = run([text], want_hidden=True)
    probs = (head((h - mu) / sd) / T_head).softmax(-1)[0]
    return {t: round(v.item(), 3) for t, v in zip(TOPICS, probs)}

examples = ["Sensex closes 400 points higher as IT stocks rally after strong quarterly results.",
            "ISRO launches a new satellite to study how the monsoon forms over the Indian Ocean.",
            "The team chased 280 in the final over to level the one-day series."]
demo = []
for e in examples:
    out = predict(e); demo.append({"text": e, "probs": out}); print(out, "<-", e)
'''),
("code", '''
results = {"n_train": len(train), "n_val": len(val), "n_test": len(test), "hidden": int(H_train.shape[1]),
           "head_params": sum(p.numel() for p in head.parameters()),
           "zero_shot": zero_shot, "zero_shot_T": zero_shot_T, "head_log": head_log, "head_brier": head_brier,
           "head_log_T": head_log_T, "T_head": round(T_head, 2), "T_zero": round(T_zero, 2),
           "curve": curve[::10], "demo": demo,
           "head_conf_T": [round(v, 3) for v in (head_test / T_head).softmax(-1).max(-1).values.tolist()],
           "head_correct": [int(v) for v in ((head_test.argmax(-1)) == y_test).tolist()],
           "expected_brier": {str(q): round(0.7 * (1 - q) ** 2 + 0.3 * q ** 2, 4) for q in [0.5, 0.7, 0.9, 1.0]}}
json.dump(results, open("results_2.json", "w"))
print("saved results_2.json")
'''),
("md", '''
## Things to try

- Train on 200 rows instead of 2,000. What happens to accuracy and to ECE before the temperature?
- Train for 3,000 steps. The training loss keeps falling. Does the test ECE?
- Unfreeze the LLM with LoRA instead of training only a head. That is notebook 3.
'''),
]

# ---------------------------------------------------------------- notebook 3
nb3 = [
("md", '''
# 3 · A full decision model with Unsloth

[![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/nipunbatra/system-one/blob/main/notebooks/03_unsloth_decision_model.ipynb)

Companion to the lecture **System 1 models: deciding without writing**.

Notebook 2 trained a head on a frozen LLM for one fixed question. Unsloth's `FastDecisionModel` does the general version: LoRA adapters on the LLM plus a small head that reads **every question about an input in one pass** and scores each option, for the three question types `choice`, `noul` and `score`.

This notebook follows Unsloth's official decision-model notebook ([guide](https://unsloth.ai/docs/basics/train-your-own-decision-model-with-unsloth), [original notebook](https://colab.research.google.com/github/unslothai/notebooks/blob/main/nb/Qwen3_5_(4B)-Decision.ipynb)), with the smaller `unsloth/Qwen3.5-0.8B` so it fits a free T4.

**Needs a CUDA GPU**: Runtime → Change runtime type → T4. Unsloth reports about 42 minutes for a full run of the 0.8B model; the T4 trains Qwen3.5 in float32, so expect it to be slower there. Start it before class.
'''),
("code", '''
%%capture
import os, importlib.util
!pip install --upgrade -qqq uv
if importlib.util.find_spec("torch") is None or "COLAB_" in "".join(os.environ.keys()):
    try: import numpy, PIL; _numpy = f"numpy=={numpy.__version__}"; _pil = f"pillow=={PIL.__version__}"
    except: _numpy = "numpy"; _pil = "pillow"
    !uv pip install -qqq \\
        "torch==2.8.0" "triton>=3.3.0" {_numpy} {_pil} torchvision "torchaudio==2.8.0" bitsandbytes xformers==0.0.32.post2 \\
        "unsloth_zoo[base] @ git+https://github.com/unslothai/unsloth-zoo" \\
        "unsloth[base] @ git+https://github.com/unslothai/unsloth"
    !uv pip install -qqq --no-deps "torchcodec==0.7.0"
elif importlib.util.find_spec("unsloth") is None:
    !uv pip install -qqq unsloth
!uv pip install --upgrade --no-deps "tokenizers>=0.22.0,<=0.23.0" trl==0.22.2 unsloth unsloth_zoo
!uv pip install transformers==5.2.0
!unsloth install-kernels
!uv pip install --no-deps --upgrade "torchao>=0.16.0"
'''),
("md", "## 1. An LLM plus a decision head"),
("code", '''
from unsloth import FastDecisionModel, DecisionTrainer, is_bfloat16_supported
import torch

model, tokenizer = FastDecisionModel.from_pretrained(
    model_name = "unsloth/Qwen3.5-0.8B",
    max_seq_length = 2048,   # longest input; long inputs keep the question and options
    load_in_4bit = True,     # 4-bit weights to save memory
)
model = FastDecisionModel.get_peft_model(
    model,
    r = 16, lora_alpha = 16, lora_dropout = 0,   # LoRA: train small adapters, not the whole LLM
    use_gradient_checkpointing = "unsloth",
    random_state = 3407,
)
'''),
("md", '''
## 2. Data: state, questions, gold

Each row has a `state` (the input), the `questions` to decide about it, and the `gold` answers.
'''),
("code", '''
from datasets import load_dataset
import json

dataset = load_dataset("LocalLLaMA/typed-decisions", "all", split = "train")
print(dataset[0]["state"][:500])
print(json.dumps(json.loads(dataset[0]["questions"]), indent = 2)[:1000])
print(dataset[0]["gold"])
'''),
("code", '''
items, report = FastDecisionModel.build_dataset(dataset, tokenizer, model)
print(f"Skipped {report['skipped']} of {report['total']} decisions")

train_items, eval_items = FastDecisionModel.split_holdout(items, seed = 3407)   # held-out rows for calibration
print(f"{len(train_items)} training rows, {len(eval_items)} held out")
'''),
("md", "Accuracy before training. The head is new, so this is close to guessing."),
("code", "FastDecisionModel.evaluate(model, tokenizer, eval_items)"),
("md", "## 3. Train"),
("code", '''
from transformers import TrainingArguments

trainer = DecisionTrainer(
    model = model,
    processing_class = tokenizer,
    train_dataset = train_items,
    eval_dataset = eval_items,
    args = TrainingArguments(
        per_device_train_batch_size = 8,
        gradient_accumulation_steps = 4,
        warmup_steps = 10,
        max_steps = 60,                 # a short run; use num_train_epochs = 2 for the full one
        learning_rate = 2e-4,
        lr_scheduler_type = "cosine",
        weight_decay = 0.01,
        bf16 = is_bfloat16_supported(),
        fp16 = not is_bfloat16_supported(),
        eval_strategy = "epoch",
        logging_steps = 10,
        output_dir = "outputs",
        report_to = "none",
        seed = 3407,
    ),
)
trainer_stats = trainer.train()
print(round(trainer_stats.metrics["train_runtime"] / 60, 1), "minutes")
'''),
("md", '''
## 4. Calibrate on the held-out rows, then test

`calibrate` adjusts the probabilities on rows the model did not train on, and prints held-out accuracy, the calibration error (`ece`) and the loss.
'''),
("code", "FastDecisionModel.calibrate(model, tokenizer, eval_items)"),
("code", '''
test = load_dataset("LocalLLaMA/typed-decisions", "all", split = "test")
test_items, _ = FastDecisionModel.build_dataset(test, tokenizer, model)
FastDecisionModel.evaluate(model, tokenizer, test_items)
'''),
("md", '''
## 5. Decide

One call, three questions about one email, a probability for every option.
'''),
("code", '''
FastDecisionModel.for_inference(model)
answers = FastDecisionModel.predict(
    model,
    tokenizer,
    "Hi, I was charged twice for invoice #4411. Please refund the duplicate today.",
    {
        "team": {
            "type": "choice",
            "instructions": "Which team should handle this?",
            "criteria": {
                "billing": "invoices, payments, refunds",
                "technical": "bugs, outages, errors",
                "sales": "pricing, new plans",
            },
        },
        "refund": {"type": "noul", "instructions": "Does the customer ask for a refund?"},
        "urgency": {
            "type": "score",
            "instructions": "How urgent is this?",
            "criteria": ["not urgent", "soon", "today"],
        },
    },
)
for name, result in answers.items():
    print(name, result["answer"], {k: round(v, 3) for k, v in result["probabilities"].items()})
'''),
("code", '''
model.save_pretrained("qwen_decisions")   # LoRA adapters, the decision head and its calibration
'''),
]

nb(nb1, "01_read_dont_write.ipynb")
nb(nb2, "02_train_a_decision_head.ipynb")
nb(nb3, "03_unsloth_decision_model.ipynb")
