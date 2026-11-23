"""A shared ("dynamic") decision head on a frozen LLM.

One small scorer is applied to every option of every question. It is trained on a few
kinds of question and tested on kinds it never saw, to check that a new question needs
new text and no new head.

Stage 1 (this file, `extract`): write each row as a prompt with the options on their own
lines, run the frozen LLM once, and keep the hidden vector at the end of every option line.
Stage 2 (`train`): fit score = w . h + b, shared by all options, with cross-entropy across
the options of a question. Report accuracy and ECE on held-out tasks.

Usage: python science/shared_head.py extract | train
"""
import json, random, sys
from pathlib import Path
import numpy as np, torch

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "science" / "shared_head"
OUT.mkdir(exist_ok=True)
NAME = "Qwen/Qwen2.5-0.5B-Instruct"
random.seed(0)


def user_text(state, question, options):
    return f"{state}\n\n{question}\nOptions:\n" + "".join(f"- {o}\n" for o in options) + "End of options."


# ------------------------------------------------------------------ the tasks
def tasks():
    from datasets import load_dataset
    T = {}

    def take(ds, n, seed=0):
        return ds.shuffle(seed=seed).select(range(min(n, len(ds))))

    ag = load_dataset("fancyzhx/ag_news", split="train")
    names = ["world news", "sports", "business", "science and technology"]
    T["ag_news"] = dict(train=True, q="Which topic is this news about?", prefix="News: ",
                        rows=[(r["text"][:400], names, r["label"]) for r in take(ag, 1500)])
    sst = load_dataset("nyu-mll/glue", "sst2", split="train")
    T["sst2"] = dict(train=True, q="Is the feeling in this review positive or negative?", prefix="Review: ",
                     rows=[(r["sentence"], ["negative", "positive"], r["label"]) for r in take(sst, 1500)])
    emo = load_dataset("dair-ai/emotion", split="train")
    en = ["sadness", "joy", "love", "anger", "fear", "surprise"]
    T["emotion"] = dict(train=True, q="Which emotion does the writer express?", prefix="Message: ",
                        rows=[(r["text"], en, r["label"]) for r in take(emo, 1500)])
    snli = load_dataset("stanfordnlp/snli", split="train").filter(lambda r: r["label"] >= 0)
    sn = ["yes, it must be true", "it may or may not be true", "no, it cannot be true"]
    T["snli"] = dict(train=True, q="Given the first sentence, is the second sentence true?", prefix="",
                     rows=[(f"First sentence: {r['premise']}\nSecond sentence: {r['hypothesis']}", sn, r["label"]) for r in take(snli, 1500)])
    # yes or no questions made from the news topics, so the head also sees the noul shape
    yn = []
    for r in take(ag, 1500, seed=1):
        k = random.randrange(4)
        yn.append((r["text"][:400], f"Is this news about {names[k]}?", ["yes", "no"], 0 if r["label"] == k else 1))
    T["ag_yesno"] = dict(train=True, q=None, prefix="News: ", rows=yn)

    tw = load_dataset("cardiffnlp/tweet_eval", "sentiment", split="train")
    T["tweet_sentiment"] = dict(train=True, q="What is the mood of this post?", prefix="Post: ",
                                rows=[(r["text"], ["negative", "neutral", "positive"], r["label"]) for r in take(tw, 1000)])
    db = load_dataset("fancyzhx/dbpedia_14", split="train")
    dn = ["company", "school or university", "artist", "athlete", "politician", "vehicle", "building", "river, lake or mountain",
          "village", "animal", "plant", "music album", "film", "book"]
    rows = []
    for r in take(db, 1000):
        opts = random.sample([d for k, d in enumerate(dn) if k != r["label"]], 4) + [dn[r["label"]]]
        random.shuffle(opts)
        rows.append((r["content"][:400], opts, opts.index(dn[r["label"]])))
    T["dbpedia"] = dict(train=True, q="What is this text describing?", prefix="Text: ", rows=rows)
    bq = load_dataset("google/boolq", split="train")
    T["boolq"] = dict(train=True, q=None, prefix="Passage: ",
                      rows=[(r["passage"][:500], r["question"].capitalize() + "?", ["yes", "no"], 0 if r["answer"] else 1) for r in take(bq, 1000)])
    mr = load_dataset("nyu-mll/glue", "mrpc", split="train")
    T["mrpc"] = dict(train=True, q="Do the two sentences mean the same thing?", prefix="",
                     rows=[(f"Sentence one: {r['sentence1']}\nSentence two: {r['sentence2']}", ["yes", "no"], 0 if r["label"] == 1 else 1) for r in take(mr, 1000)])
    co = load_dataset("nyu-mll/glue", "cola", split="train")
    T["cola"] = dict(train=True, q="Is this sentence grammatically correct?", prefix="Sentence: ",
                     rows=[(r["sentence"], ["yes", "no"], 0 if r["label"] == 1 else 1) for r in take(co, 1000)])
    cq = load_dataset("tau/commonsense_qa", split="train")
    T["commonsense_qa"] = dict(train=True, q=None, prefix="",
                               rows=[("A general knowledge question.", r["question"], r["choices"]["text"], r["choices"]["label"].index(r["answerKey"])) for r in take(cq, 1000) if r["answerKey"]])
    arc = load_dataset("allenai/ai2_arc", "ARC-Easy", split="train")
    T["arc"] = dict(train=True, q=None, prefix="",
                    rows=[("A school science question.", r["question"], r["choices"]["text"], r["choices"]["label"].index(r["answerKey"])) for r in take(arc, 1000) if r["answerKey"] in r["choices"]["label"]])
    ng = load_dataset("SetFit/20_newsgroups", split="train")
    gl = sorted(set(ng["label_text"]))
    nice = lambda g: g.replace("comp.", "computers: ").replace("rec.", "recreation: ").replace("sci.", "science: ").replace("talk.", "debate: ").replace("soc.", "society: ").replace("misc.", "").replace("alt.", "").replace(".", " ")
    rows = []
    for r in take(ng, 1400):
        if len(r["text"].strip()) < 40:
            continue
        opts = random.sample([g for g in gl if g != r["label_text"]], 4) + [r["label_text"]]
        random.shuffle(opts)
        rows.append((" ".join(r["text"].split())[:400], [nice(o) for o in opts], opts.index(r["label_text"])))
    T["newsgroups"] = dict(train=True, q="Which discussion group was this posted in?", prefix="Post: ", rows=rows[:1000])

    # held out: kinds of question the head never trains on
    bank = load_dataset("mteb/banking77", split="test")
    labels = sorted(set(bank["label_text"]))
    rows = []
    for r in take(bank, 600):
        others = random.sample([l for l in labels if l != r["label_text"]], 4)
        opts = others + [r["label_text"]]
        random.shuffle(opts)
        rows.append((r["text"], [o.replace("_", " ") for o in opts], opts.index(r["label_text"])))
    T["banking77"] = dict(train=False, q="What does this bank customer want?", prefix="Message: ", rows=rows)
    trec = load_dataset("SetFit/TREC-QC", split="test")
    coarse = {"ABBR": "an abbreviation", "DESC": "a description or definition", "ENTY": "a thing or entity",
              "HUM": "a person or group", "LOC": "a place", "NUM": "a number or date"}
    keys = list(coarse)
    T["trec"] = dict(train=False, q="What kind of answer does this question ask for?", prefix="Question: ",
                     rows=[(r["text"], [coarse[k] for k in keys], keys.index(r["label_coarse_original"] if "label_coarse_original" in r else r["label_coarse_text"])) for r in take(trec, 500)])
    rt = load_dataset("cornell-movie-review-data/rotten_tomatoes", split="test")
    T["film_recommend"] = dict(train=False, q="Would the writer recommend this film to a friend?", prefix="Review: ",
                          rows=[(r["text"], ["yes", "no"], 0 if r["label"] == 1 else 1) for r in take(rt, 500)])
    return T


def build_rows(T):
    rows = []
    for name, t in T.items():
        for r in t["rows"]:
            if t["q"] is None:
                text, q, opts, gold = r
            else:
                (text, opts, gold), q = r, t["q"]
            opts = list(opts)
            if t["train"] and len(opts) > 2:          # shuffle the order so the head cannot learn positions
                order = list(range(len(opts)))
                random.shuffle(order)
                opts, gold = [opts[i] for i in order], order.index(gold)
            rows.append(dict(task=name, train=t["train"], state=t["prefix"] + text, q=q, opts=opts, gold=gold))
    return rows


# ------------------------------------------------------------------ stage 1
def extract():
    from transformers import AutoTokenizer, AutoModelForCausalLM
    tok = AutoTokenizer.from_pretrained(NAME)
    model = AutoModelForCausalLM.from_pretrained(NAME, dtype=torch.float32).to("mps").eval()
    letters = [tok.encode(c, add_special_tokens=False)[0] for c in "ABCDEFGH"]
    chat = lambda u: tok.apply_chat_template([{"role": "user", "content": u}], tokenize=False, add_generation_prompt=True)
    rows = build_rows(tasks())
    print(len(rows), "rows")
    feats, bad = [], 0
    for n, r in enumerate(rows):
        text = chat(user_text(r["state"], r["q"], r["opts"]))
        ids = tok(text, add_special_tokens=False)["input_ids"]
        # the position of the newline that ends each option line, found by tokenizing the text up to it
        pos, cut = [], text.index("Options:\n") + len("Options:\n")
        for o in r["opts"]:
            cut += len(f"- {o}\n")
            p = tok(text[:cut], add_special_tokens=False)["input_ids"]
            bad += p != ids[:len(p)]
            pos.append(len(p) - 1)
        with torch.no_grad():
            h = model(torch.tensor([ids], device="mps"), output_hidden_states=True).hidden_states[-1][0]
        feats.append(h[pos + [len(ids) - 1]].float().cpu().numpy())   # one row per option, then the last position
        if r['train'] and n % 8:
            continue
        # the letter readout on the same row, for comparison
        lt = chat(f"{r['state']}\n\n{r['q']}\n" + "\n".join(f"{'ABCDEFGH'[i]}. {o}" for i, o in enumerate(r["opts"])) + "\n\nAnswer with one letter.")
        with torch.no_grad():
            lg = model(**tok(lt, return_tensors="pt").to("mps")).logits[0, -1].float().cpu()
        r["letter_p"] = lg[letters[:len(r["opts"])]].softmax(-1).tolist()
        if n % 500 == 0:
            print(n, flush=True)
    print("prefix mismatches:", bad)
    np.save(OUT / "feats.npy", np.array(feats, dtype=object), allow_pickle=True)
    json.dump(rows, open(OUT / "rows.json", "w"))


# ------------------------------------------------------------------ stage 2
def ece(conf, correct, n_bins=10):
    conf, correct = np.asarray(conf), np.asarray(correct, dtype=float)
    edges, total = np.linspace(0, 1, n_bins + 1), 0.0
    for lo, hi in zip(edges[:-1], edges[1:]):
        m = (conf > lo) & (conf <= hi)
        if m.any():
            total += m.mean() * abs(correct[m].mean() - conf[m].mean())
    return float(total)


def train(kind="linear"):
    rows = json.load(open(OUT / "rows.json"))
    raw = np.load(OUT / "feats.npy", allow_pickle=True)
    # kind: "linear" scores the option vector; "pair" also uses option vector times the last-position vector; "mlp" is a small network
    def feat(f):
        o, last = f[:-1], f[-1]
        return np.concatenate([o, o * last], 1) if kind == "pair" else o
    feats = [feat(f) for f in raw]
    val = [i for i, r in enumerate(rows) if r["train"] and "letter_p" in r]     # rows of seen kinds, kept out of training
    tr = [i for i, r in enumerate(rows) if r["train"] and "letter_p" not in r]
    import os
    if os.environ.get("KINDS") == "5":      # the first experiment: only five kinds of training question
        five = {"ag_news", "sst2", "emotion", "snli", "ag_yesno"}
        tr, val = [i for i in tr if rows[i]["task"] in five], [i for i in val if rows[i]["task"] in five]
        kind_tag = "_5kinds"
    else:
        kind_tag = ""
    X = np.concatenate([feats[i] for i in tr])
    mu, sd = X.mean(0), X.std(0) + 1e-6
    torch.manual_seed(0)
    d = X.shape[1]
    head = torch.nn.Sequential(torch.nn.Linear(d, 64), torch.nn.ReLU(), torch.nn.Linear(64, 1)) if kind == "mlp" else torch.nn.Linear(d, 1)
    opt = torch.optim.AdamW(head.parameters(), lr=1e-3, weight_decay=0.05)
    Z = [torch.tensor((f - mu) / sd, dtype=torch.float32) for f in feats]
    for epoch in range(10):
        random.Random(epoch).shuffle(tr)
        for b in range(0, len(tr), 64):
            loss = sum(torch.nn.functional.cross_entropy(head(Z[i]).T, torch.tensor([rows[i]["gold"]])) for i in tr[b:b + 64]) / 64
            opt.zero_grad(); loss.backward(); opt.step()

    def probs(i, T=1.0):
        with torch.no_grad():
            return (head(Z[i])[:, 0] / T).softmax(-1).numpy()
    Ts = np.arange(0.5, 5.01, 0.1)       # one temperature for the head, fitted on the kept-out rows
    nll = [np.mean([-np.log(probs(i, T)[rows[i]["gold"]] + 1e-9) for i in val]) for T in Ts]
    T = float(Ts[int(np.argmin(nll))])
    res = {"kind": kind, "params": sum(p.numel() for p in head.parameters()), "T": round(T, 1), "n_train": len(tr),
           "train_kinds": sorted({rows[i]["task"] for i in tr}), "tasks": {}}
    groups = {"seen kinds, rows kept out of training": val}
    for name in sorted({r["task"] for r in rows if not r["train"]}):
        groups[name] = [i for i, r in enumerate(rows) if r["task"] == name]
    for name, idx in groups.items():
        g = np.array([rows[i]["gold"] for i in idx])
        P = [probs(i, T) for i in idx]
        L = [np.array(rows[i]["letter_p"]) for i in idx]
        res["tasks"][name] = dict(n=len(idx), options=len(rows[idx[0]]["opts"]),
            head_acc=float(np.mean([p.argmax() == y for p, y in zip(P, g)])), head_ece=ece([p.max() for p in P], [p.argmax() == y for p, y in zip(P, g)]),
            letter_acc=float(np.mean([p.argmax() == y for p, y in zip(L, g)])), letter_ece=ece([p.max() for p in L], [p.argmax() == y for p, y in zip(L, g)]))
        t = res["tasks"][name]
        print(f"{name:38s} n={t['n']:4d} opts={t['options']}  head acc {t['head_acc']:.3f} ece {t['head_ece']:.3f} | letters acc {t['letter_acc']:.3f} ece {t['letter_ece']:.3f}")
    print(kind, "params", res["params"], "T", round(T, 1), "train rows", len(tr))
    torch.save({"state": head.state_dict(), "mu": mu, "sd": sd, "T": T, "kind": kind}, OUT / f"head_{kind}{kind_tag}.pt")
    json.dump(res, open(OUT / f"results_{kind}{kind_tag}.json", "w"), indent=1)


if __name__ == "__main__":
    if sys.argv[1] == "extract":
        extract()
    else:
        train(sys.argv[2] if len(sys.argv) > 2 else "linear")
