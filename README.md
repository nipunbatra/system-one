# System 1 models: deciding without writing

A 60 to 80 minute lecture on decision models such as Jev: models that read a
state, answer a typed question, and return calibrated probabilities without
generating text. The lecture has a 146-slide deck and three notebooks.

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

`node scripts/steps.mjs` opens the deck in presentation mode and presses through every step reveal,
reporting any slide whose steps appear out of order or have no size.

## Further reading

The deck cites these on the slides that use them, and lists them on its last page.

- Roitman, [The Hitchhiker's Guide to System 1 Models](https://arxiv.org/abs/2610.33775), 2026: the five families, head designs, cascades.
- Unsloth, [Train your own Decision Model](https://unsloth.ai/docs/basics/train-your-own-decision-model-with-unsloth): the recipe notebook 3 follows.
- Liquid AI cookbook, [fine-tuning a decision model with SFT](https://github.com/Liquid4All/cookbook/blob/main/finetuning/notebooks/sft_for_decision_models_with_unsloth.ipynb).
- Karpathy, [Deep Dive into LLMs like ChatGPT](https://www.youtube.com/watch?v=7xTGNNLPyMI); Huyen, [RLHF](https://huyenchip.com/2023/05/02/rlhf.html); scikit-learn, [Probability calibration](https://scikit-learn.org/stable/modules/calibration.html).

## A note on Jev

Jev's architecture, size, training data and the details of RLCD are not
published. The deck says what is public, and the notebooks build an open
reproduction of the idea with small open models.

## Credits

- The framing and the support-email example follow Martin Keen's IBM Technology video, [What Is Jev? The AI Model That Doesn't Generate Text](https://www.youtube.com/watch?v=YGgNBcIgI4s).
- Photo of Daniel Kahneman: nrkbeta, [CC BY-SA 2.0](https://creativecommons.org/licenses/by-sa/2.0/), via [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Daniel_Kahneman_(3283955327)_(cropped).jpg).
- The cover of *Thinking, Fast and Slow* is a low-resolution image shown to identify the book; copyright belongs to its publisher.
