# System 1 models: deciding without writing

A 60 to 80 minute lecture on decision models such as Jev: models that read a
state, answer a typed question, and return calibrated probabilities without
generating text. The lecture has a 73-slide deck and three notebooks.

Audience: students who have studied machine learning and a little deep
learning, and have not looked inside an LLM.

## Notebooks

| | Notebook | What it covers | Runtime |
|---|---|---|---|
| 1 | [Read, don't write](notebooks/01_read_dont_write.ipynb) [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/nipunbatra/system-one/blob/main/notebooks/01_read_dont_write.ipynb) | Tokens, the generation loop, reading option probabilities, ECE, temperature scaling, thresholds | CPU or T4 |
| 2 | [Train a decision head](notebooks/02_train_a_decision_head.ipynb) [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/nipunbatra/system-one/blob/main/notebooks/02_train_a_decision_head.ipynb) | Proper scoring rules, a linear head on a frozen LLM, calibration on held-out rows | CPU or T4 |
| 3 | [Unsloth decision model](notebooks/03_unsloth_decision_model.ipynb) [![Open in Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/nipunbatra/system-one/blob/main/notebooks/03_unsloth_decision_model.ipynb) | LoRA plus a decision head on Qwen3.5-0.8B with Unsloth's `FastDecisionModel` | T4 (CUDA needed) |

Notebooks 1 and 2 use `Qwen/Qwen2.5-0.5B-Instruct` and AG News. Their saved
outputs come from a run on an Apple laptop, and every measured number in the
slides comes from those runs. Notebook 3 follows Unsloth's official recipe and
is committed without outputs.

## Slides

**View the slides: <https://nipunbatra.github.io/system-one/s/system-one>**

The deck is one file, `slides/system-one/index.tsx`, built with
[open-slide](https://github.com/open-slide/open-slide).

To run them locally:

```bash
npm install
npm run dev
```

Then open `http://localhost:5173/s/system-one`.

## How the numbers reach the slides

1. `notebooks/build.py` writes the three notebooks.
2. Running notebooks 1 and 2 writes `notebooks/results_1.json` and `results_2.json`.
3. `science/make_assets.py` merges them into `slides/system-one/assets/science.json`, which the deck imports.

## Checking pages

`node scripts/shots.mjs <outdir>` screenshots every page from the running dev
server and reports any page whose content overflows. It needs Puppeteer; set
`PUPPETEER_FROM` to a folder whose `node_modules` has it, and `CHROME` to a
Chrome binary if it is not in the default macOS location.

## A note on Jev

Jev's architecture, size, training data and the details of RLCD are not
published. The deck says what is public, and the notebooks build an open
reproduction of the idea with small open models.
