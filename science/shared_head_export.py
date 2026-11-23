"""Train the shared head in a form the browser demo can run, and check it on the browser's model.

The demo's ONNX model returns next-token scores (logits) at every position, not hidden vectors.
Logits are a linear map of the hidden vector, so we use the logits of 1,024 fixed tokens at the
end of each option line as the head's input. Both training and testing run the 4-bit ONNX model the demo downloads, so the browser computes
exactly what the head learned on. (A head trained on full-precision vectors lost 7 to 10 points
of accuracy when moved to the 4-bit model.)

Usage: python science/shared_head_export.py        (after shared_head.py extract)
"""
import json, random
from pathlib import Path
import numpy as np, torch

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "science" / "shared_head"
NAME = "Qwen/Qwen2.5-0.5B-Instruct"
K = 1024


def user_text(state, question, options):
    return f"{state}\n\n{question}\nOptions:\n" + "".join(f"- {o}\n" for o in options) + "End of options."


def ece(conf, correct, n_bins=10):
    conf, correct = np.asarray(conf), np.asarray(correct, dtype=float)
    edges, total = np.linspace(0, 1, n_bins + 1), 0.0
    for lo, hi in zip(edges[:-1], edges[1:]):
        m = (conf > lo) & (conf <= hi)
        if m.any():
            total += m.mean() * abs(correct[m].mean() - conf[m].mean())
    return float(total)


rows = json.load(open(OUT / "rows.json"))
from transformers import AutoTokenizer
import onnxruntime as ort
from huggingface_hub import hf_hub_download
tok = AutoTokenizer.from_pretrained(NAME)
rng = np.random.default_rng(0)
T_ids = np.sort(rng.choice(np.arange(1000, 100000), K, replace=False))      # ordinary text tokens
letters = [tok.encode(c, add_special_tokens=False)[0] for c in "ABCDEFGH"]
so = ort.SessionOptions(); so.intra_op_num_threads = 8
sess = ort.InferenceSession(hf_hub_download("onnx-community/Qwen2.5-0.5B-Instruct", "onnx/model_q4.onnx"), so, providers=["CPUExecutionProvider"])
chat = lambda u: tok.apply_chat_template([{"role": "user", "content": u}], tokenize=False, add_generation_prompt=True)
PAST = {i.name: np.zeros((1, i.shape[1], 0, i.shape[3]), dtype=np.float32) for i in sess.get_inputs() if i.name.startswith("past_key_values")}


def run(text):
    ids = tok(text, add_special_tokens=False)["input_ids"]
    a = np.array([ids], dtype=np.int64)
    return sess.run(["logits"], {"input_ids": a, "attention_mask": np.ones_like(a), "position_ids": np.arange(len(ids), dtype=np.int64)[None], **PAST})[0][0]


def browser_feats(r):
    text = chat(user_text(r["state"], r["q"], r["opts"]))
    pos, cut = [], text.index("Options:\n") + len("Options:\n")
    for o in r["opts"]:
        cut += len(f"- {o}\n")
        pos.append(len(tok(text[:cut], add_special_tokens=False)["input_ids"]) - 1)
    return run(text)[pos][:, T_ids]


def browser_letters(r):
    lg = run(chat(f"{r['state']}\n\n{r['q']}\n" + "\n".join(f"{'ABCDEFGH'[i]}. {o}" for i, o in enumerate(r["opts"])) + "\n\nAnswer with one letter."))[-1]
    z = lg[letters[:len(r["opts"])]]
    e = np.exp(z - z.max())
    return e / e.sum()


# which rows: 500 per training kind, the kept-out rows of seen kinds, and all held-out rows
by = {}
for i, r in enumerate(rows):
    by.setdefault((r["task"], r["train"], "letter_p" in r), []).append(i)
tr = [i for (t, train, kept), idx in by.items() if train and not kept for i in idx[:500]]
val = [i for (t, train, kept), idx in by.items() if train and kept for i in idx[:60]]
held = [i for (t, train, kept), idx in by.items() if not train for i in idx]
cache = OUT / "q4_feats.npy"
done = dict(np.load(cache, allow_pickle=True).item()) if cache.exists() else {}
todo = [i for i in tr + val + held if i not in done]
print(len(tr), "train,", len(val), "kept-out,", len(held), "held-out rows;", len(todo), "to run", flush=True)
for n, i in enumerate(todo):
    done[i] = (browser_feats(rows[i]), None if i in tr else browser_letters(rows[i]))
    if n % 500 == 499:
        np.save(cache, done, allow_pickle=True); print(n + 1, flush=True)
np.save(cache, done, allow_pickle=True)

X = np.concatenate([done[i][0] for i in tr])
mu, sd = X.mean(0), X.std(0) + 1e-6
torch.manual_seed(0)
head = torch.nn.Sequential(torch.nn.Linear(K, 64), torch.nn.ReLU(), torch.nn.Linear(64, 1))
opt = torch.optim.AdamW(head.parameters(), lr=1e-3, weight_decay=0.05)
Z = {i: torch.tensor((done[i][0] - mu) / sd, dtype=torch.float32) for i in done}
for epoch in range(12):
    random.Random(epoch).shuffle(tr)
    for b in range(0, len(tr), 64):
        loss = sum(torch.nn.functional.cross_entropy(head(Z[i]).T, torch.tensor([rows[i]["gold"]])) for i in tr[b:b + 64]) / 64
        opt.zero_grad(); loss.backward(); opt.step()


def probs(z, T=1.0):
    with torch.no_grad():
        return (head(z)[:, 0] / T).softmax(-1).numpy()


Ts = np.arange(0.5, 5.01, 0.1)
T = float(Ts[int(np.argmin([np.mean([-np.log(probs(Z[i], t)[rows[i]["gold"]] + 1e-9) for i in val]) for t in Ts]))])


def report(name, idx):
    g = [rows[i]["gold"] for i in idx]
    P, L = [probs(Z[i], T) for i in idx], [done[i][1] for i in idx]
    acc = lambda PP: float(np.mean([p.argmax() == y for p, y in zip(PP, g)]))
    e = lambda PP: ece([p.max() for p in PP], [p.argmax() == y for p, y in zip(PP, g)])
    out = dict(n=len(idx), options=len(rows[idx[0]]["opts"]), head_acc=acc(P), head_ece=e(P), letter_acc=acc(L), letter_ece=e(L))
    print(f"{name:42s} n={out['n']:4d}  head {out['head_acc']:.3f} (ece {out['head_ece']:.3f})  letters {out['letter_acc']:.3f} (ece {out['letter_ece']:.3f})")
    return out


res = {"model": "Qwen2.5-0.5B-Instruct, 4-bit ONNX", "params": sum(p.numel() for p in head.parameters()), "T": round(T, 1), "n_train": len(tr), "K": K,
       "train_kinds": sorted({rows[i]["task"] for i in tr}), "tasks": {}}
res["tasks"]["seen kinds, rows kept out of training"] = report("seen kinds, kept out of training", val)
for name in sorted({rows[i]["task"] for i in held}):
    res["tasks"][name] = report(name, [i for i in held if rows[i]["task"] == name])

sd_ = head.state_dict()
r4 = lambda a: [round(float(v), 4) for v in np.asarray(a).ravel()]
json.dump({"model": "onnx-community/Qwen2.5-0.5B-Instruct", "tokens": T_ids.tolist(), "mu": r4(mu), "sd": r4(sd),
           "w1": r4(sd_["0.weight"]), "b1": r4(sd_["0.bias"]), "w2": r4(sd_["2.weight"]), "b2": float(sd_["2.bias"][0]),
           "hidden": 64, "T": round(T, 1), "params": res["params"], "n_train": len(tr), "train_kinds": res["train_kinds"], "results": res["tasks"]},
          open(ROOT / "site" / "demo" / "head.json", "w"), separators=(",", ":"))
json.dump(res, open(OUT / "results_browser.json", "w"), indent=1)
print("wrote site/demo/head.json and", OUT / "results_browser.json")
