# System 1 models: deciding without writing

A 60 to 80 minute lecture on decision models such as Jev: models that read a
state, answer a typed question, and return calibrated probabilities without
generating text. The lecture has a deck of 120 slides with a 43-slide appendix, three notebooks and a five-page cheatsheet.

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

## Live demo

<https://nipunbatra.github.io/system-one/demo/> runs an off-the-shelf Qwen2.5-0.5B (or a smaller SmolLM2) in the browser with transformers.js and WebGPU.
You write an input and any number of your own questions (choice, noul, score, multi-select, or a tool call), and for each one see the exact prompt, the next-token scores and the option letters that are read.
It warns when little of the model's probability is on the option letters, and can save your scenarios in the browser.
A switch changes the method from reading letters to a trained shared head, and shows that head's working the same way.
It is one file, `site/demo/index.html`. It loads the `q4` weights: the `fp16` variants gave wrong scores on WebGPU when tested.

A second page, `site/demo/vision.html`, runs SmolVLM-500M the same way on a picture: yes/no, choice and score questions, a count asked as a ladder of yes/no questions, and detection three ways: a yes/no of every tile, zooming into the quarters that say yes, and asking in words (left or right half, top or bottom half). A third card asks one typed question of every tile, which gives a rough segmentation (a choice per tile) or a map of scores. The tiles can be as small as 24 × 24, or a quadtree asks again only where neighbouring answers differ, down to cells 1/32 of the picture wide; a third mode shows both masks side by side. Tiles go through the model four at a time, with a canvas doing the cutting and scaling, which takes about a third of the time of one tile per pass. The model menu also has SmolVLM-Instruct 2.2B, SmolVLM-256M and Liquid's LFM2.5-VL-450M. Every answer has a "Show the working" section with raw scores, token ranks and the arithmetic. It has ten sample photos, each with its own questions; nine were made with image models for the course's other decks.

A third page, `site/demo/draw.html`, draws a 500 × 500 single-channel picture with the text model and no training: it asks "dark or bright?" for 25 named regions (or 100, or 784 by coordinates), stretches the answers and blends between them. The finer grids are there to show that more questions do not help when the model cannot tell which place is meant.
No training is involved; a one-pass "which tile?" question is included to show that the untrained model cannot point directly.

## The shared-head experiment

`science/shared_head.py` trains one small scorer on a frozen Qwen2.5-0.5B that is reused for every option of every question, on 13 kinds of question, and tests it on three kinds it never saw.
`python science/shared_head.py extract` then `train mlp` reproduces the slide numbers (`KINDS=5` gives the five-kinds comparison); `shared_head_assets.py` writes them for the deck.
`science/shared_head_export.py` trains the same head on the 4-bit ONNX model the browser runs (it needs `onnxruntime`) and writes `site/demo/head.json` for the demo.
A head trained on the full-precision model lost 7 to 10 points when moved to the 4-bit one, which is why the demo's head is trained separately.

## Cheatsheet

A five-page companion: [PDF](https://nipunbatra.github.io/system-one/cheatsheet.pdf) or [web page](https://nipunbatra.github.io/system-one/cheatsheet.html).
It is generated by `python cheatsheet/build.py`, which reads the same `science.json` as the deck and prints the PDF with headless Chrome.
Rebuild it after re-running a notebook.

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
