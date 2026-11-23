"""Writes slides/system-one/assets/shared_head.json: the shared head's results and its working on the lecture's email."""
import json
from pathlib import Path
import numpy as np, torch
from transformers import AutoTokenizer, AutoModelForCausalLM

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "science" / "shared_head"
NAME = "Qwen/Qwen2.5-0.5B-Instruct"
sci = json.load(open(ROOT / "slides/system-one/assets/science.json"))
ck = torch.load(OUT / "head_mlp.pt", weights_only=False)
head = torch.nn.Sequential(torch.nn.Linear(896, 64), torch.nn.ReLU(), torch.nn.Linear(64, 1)); head.load_state_dict(ck["state"])
tok = AutoTokenizer.from_pretrained(NAME)
model = AutoModelForCausalLM.from_pretrained(NAME, dtype=torch.float32).eval()
chat = lambda u: tok.apply_chat_template([{"role": "user", "content": u}], tokenize=False, add_generation_prompt=True)


def read(state, q, opts):
    text = chat(f"{state}\n\n{q}\nOptions:\n" + "".join(f"- {o}\n" for o in opts) + "End of options.")
    ids = tok(text, add_special_tokens=False)["input_ids"]
    pos, cut = [], text.index("Options:\n") + len("Options:\n")
    for o in opts:
        cut += len(f"- {o}\n"); pos.append(len(tok(text[:cut], add_special_tokens=False)["input_ids"]) - 1)
    with torch.no_grad():
        h = model(torch.tensor([ids]), output_hidden_states=True).hidden_states[-1][0][pos].numpy()
        z = head(torch.tensor((h - ck["mu"]) / ck["sd"], dtype=torch.float32))[:, 0]
        p = (z / ck["T"]).softmax(-1)
    return dict(question=q, options=opts, n_tokens=len(ids), positions=pos, scores=[round(float(v), 3) for v in z], probs=[round(float(v), 4) for v in p])


state = "Email: " + sci["email"]
ex = [read(state, "Which team should handle this email?", ["billing (invoices, payments, refunds)", "technical (bugs, outages, errors)", "sales (pricing, new plans)"]),
      read(state, "Is the customer asking for money back?", ["yes", "no"]),
      read(state, "How urgent is this email?", ["not urgent", "soon", "today"])]
for e in ex:
    print(e["question"], e["scores"], e["probs"], e["positions"], e["n_tokens"])
r13, r5 = json.load(open(OUT / "results_mlp.json")), json.load(open(OUT / "results_mlp_5kinds.json"))
pick = lambda r: {k: {a: round(b, 3) if isinstance(b, float) else b for a, b in v.items()} for k, v in r["tasks"].items()}
json.dump({"params": r13["params"], "T": r13["T"], "hidden": 64, "email": ex,
           "wide": {"kinds": r13["train_kinds"], "n_train": r13["n_train"], "tasks": pick(r13)},
           "narrow": {"kinds": r5["train_kinds"], "n_train": r5["n_train"], "tasks": pick(r5)}},
          open(ROOT / "slides/system-one/assets/shared_head.json", "w"), indent=1)
print("wrote shared_head.json")
