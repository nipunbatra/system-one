"""Merge the notebooks' results into the one JSON file the slides read."""
import json, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
r1 = json.load(open(root / "notebooks/results_1.json")); r2 = json.load(open(root / "notebooks/results_2.json"))
a = r1.pop("agnews")
out = dict(r1)
out["zs"] = {k: a[k] for k in ("n", "accuracy", "mean_conf", "ece", "bins", "T", "mean_conf_T", "ece_T", "bins_T")}
out["head"] = {"n_train": r2["n_train"], "n_val": r2["n_val"], "params": r2["head_params"], "T": r2["T_head"],
               "raw": r2["head_log"], "cal": r2["head_log_T"], "brier_loss": r2["head_brier"],
               "conf": r2["head_conf_T"], "correct": r2["head_correct"], "curve": r2["curve"], "demo": r2["demo"]}
out["expected_brier"] = r2["expected_brier"]
json.dump(out, open(root / "slides/system-one/assets/science.json", "w"))
print("ok", out["head"]["raw"]["accuracy"], out["head"]["cal"]["ece"], out["zs"]["ece"])
