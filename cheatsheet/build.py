"""Builds the companion cheatsheet: site/cheatsheet.html and site/cheatsheet.pdf.

Every measured number is read from slides/system-one/assets/science.json, the same
file the deck imports. Usage: python cheatsheet/build.py   (needs Google Chrome for the PDF;
set CHROME to its binary if it is not in the default macOS location).
"""
import json, math, os, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sci = json.loads((ROOT / "slides/system-one/assets/science.json").read_text())
zs, head, cc = sci["zs"], sci["head"], sci["conf_compare"]
f2 = lambda x: f"{x:.2f}"
_sh = json.loads((ROOT / "slides/system-one/assets/shared_head.json").read_text())
_u = ["banking77", "film_recommend", "trec"]
sh5 = ", ".join(f2(_sh["narrow"]["tasks"][k]["head_acc"]) for k in _u)
sh13 = ", ".join(f2(_sh["wide"]["tasks"][k]["head_acc"]) for k in _u)
shl = ", ".join(f2(_sh["wide"]["tasks"][k]["letter_acc"]) for k in _u)

# ---- the letter readout, worked
z = sci["letter_logits"]
zmax = max(z)
ez = [math.exp(v - zmax) for v in z]
tot = sum(ez)
teams = ["A billing", "B technical", "C sales"]
readout_rows = "".join(
    f"<tr><td>{t}</td><td>{v:.2f}</td><td>{v - zmax:.2f}</td><td>{e:.2f}</td><td class='p'>{e:.2f} / {tot:.2f} = {e / tot:.2f}</td></tr>"
    for t, v, e in zip(teams, z, ez)
)


def reliability(bins, title, ece):
    """A small reliability diagram as inline SVG."""
    S, o = 150, 26
    px = lambda v: o + v * S
    py = lambda v: 8 + (1 - v) * S
    dots = [b for b in bins if b["n"]]
    n = sum(b["n"] for b in dots)
    parts = [f'<rect x="{o}" y="8" width="{S}" height="{S}" fill="#fffdf9" stroke="#ded6c9"/>',
             f'<line x1="{px(0)}" y1="{py(0)}" x2="{px(1)}" y2="{py(1)}" stroke="#8a8179" stroke-dasharray="4 3"/>']
    for b in dots:
        parts.append(f'<line x1="{px(b["conf"])}" y1="{py(b["conf"])}" x2="{px(b["conf"])}" y2="{py(b["acc"])}" stroke="#be123c" stroke-width="2.5"/>')
    path = " ".join(f'{"M" if i == 0 else "L"}{px(b["conf"]):.1f},{py(b["acc"]):.1f}' for i, b in enumerate(dots))
    parts.append(f'<path d="{path}" fill="none" stroke="#1f1b16" stroke-width="1.2"/>')
    for b in dots:
        parts.append(f'<circle cx="{px(b["conf"]):.1f}" cy="{py(b["acc"]):.1f}" r="{2 + 6 * math.sqrt(b["n"] / n):.1f}" fill="#1f1b16"/>')
    for v in (0, 0.5, 1):
        parts.append(f'<text x="{px(v)}" y="{py(0) + 11}" font-size="7.5" text-anchor="middle" fill="#57504a">{v:.1f}</text>')
        parts.append(f'<text x="{o - 4}" y="{py(v) + 3}" font-size="7.5" text-anchor="end" fill="#57504a">{v:.1f}</text>')
    parts.append(f'<text x="{px(0.5)}" y="{py(0) + 22}" font-size="8" text-anchor="middle" fill="#6d28d9">confidence (what the model said)</text>')
    parts.append(f'<text transform="translate(8 {py(0.5)}) rotate(-90)" font-size="8" text-anchor="middle" fill="#0f766e">accuracy (what happened)</text>')
    parts.append(f'<text x="{px(0.5)}" y="{py(0) + 35}" font-size="9" font-weight="700" text-anchor="middle">{title} · ECE {ece}</text>')
    return f'<svg viewBox="0 0 {o + S + 6} {S + 48}" width="{o + S + 6}" height="{S + 48}">{"".join(parts)}</svg>'


def sm(v, T=1.0):
    e = [math.exp(x / T) for x in v]
    return [x / sum(e) for x in e]


toy = [2.0, 1.0, 0.1]
t1, t2 = sm(toy), sm(toy, 2)

HTML = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>System 1 models: cheatsheet</title>
<style>
@page {{ size: A4; margin: 11mm 12mm 12mm; }}
:root {{ --ink:#1f1b16; --soft:#57504a; --muted:#8a8179; --rule:#ded6c9; --panel:#f1ece3; --white:#fffdf9;
  --s1:#b45309; --s2:#1d4ed8; --pred:#6d28d9; --truth:#0f766e; --loss:#be123c; --accent:#c44536; }}
* {{ box-sizing: border-box; }}
html {{ -webkit-print-color-adjust: exact; print-color-adjust: exact; }}
body {{ margin:0; color:var(--ink); font: 9.9pt/1.44 -apple-system, "Helvetica Neue", Helvetica, Arial, sans-serif; background:#fff; }}
.page {{ page-break-after: always; }} .page:last-child {{ page-break-after: auto; }}
@media screen {{ body {{ background:#e9e4da; }} .page {{ background:#fff; width:210mm; min-height:297mm; margin:8mm auto; padding:11mm 12mm; box-shadow:0 2px 12px #0002; }} }}
h1 {{ font: 700 19pt/1.1 "Iowan Old Style", Palatino, Georgia, serif; margin:0; }}
h2 {{ font: 700 13.5pt/1.15 "Iowan Old Style", Palatino, Georgia, serif; margin:0 0 5pt; padding-bottom:3pt; border-bottom:1.6pt solid var(--accent); display:flex; gap:7pt; align-items:baseline; }}
h2 .n {{ font: 700 8pt/1 -apple-system, sans-serif; letter-spacing:.12em; color:#fff; background:var(--accent); border-radius:9pt; padding:3pt 7pt; position:relative; top:-1.5pt; }}
h3 {{ font: 700 9.6pt/1.2 -apple-system, "Helvetica Neue", sans-serif; margin:8pt 0 3pt; color:var(--ink); }}
p {{ margin:0 0 4pt; }} ul, ol {{ margin:0 0 4pt; padding-left:13pt; }} li {{ margin-bottom:1.5pt; }}
.cols {{ display:grid; grid-template-columns:1fr 1fr; gap:6mm; align-items:start; }}
.sub {{ color:var(--soft); }} .muted {{ color:var(--muted); font-size:8pt; }}
.key {{ background:#fbeee9; border-left:3.5pt solid var(--accent); border-radius:4pt; padding:6pt 9pt; margin:0 0 6pt; font: 10.6pt/1.35 "Iowan Old Style", Palatino, Georgia, serif; }}
.key b.t {{ display:block; font: 700 6.8pt/1 -apple-system, sans-serif; letter-spacing:.14em; color:var(--accent); margin-bottom:3pt; }}
.box {{ background:var(--white); border:1pt solid var(--rule); border-radius:4pt; padding:6pt 8pt; margin:0 0 6pt; break-inside:avoid; }}
table {{ border-collapse:collapse; width:100%; margin:0 0 7pt; font-size:9pt; break-inside:avoid; }}
th {{ text-align:left; font-size:7pt; letter-spacing:.08em; text-transform:uppercase; color:var(--muted); padding:2pt 5pt 2pt 0; border-bottom:1pt solid var(--rule); }}
td {{ padding:2.6pt 5pt 2.6pt 0; border-bottom:.7pt solid var(--rule); vertical-align:top; }}
code, pre, .m {{ font-family: "SF Mono", Menlo, Consolas, monospace; font-size:8.3pt; }}
.eqc {{ grid-template-columns:minmax(0,1fr) minmax(0,1fr); }} .eqc pre {{ font-size:7.7pt; }}
pre {{ background:var(--white); border:1pt solid var(--rule); border-radius:4pt; padding:5pt 7pt; margin:0 0 6pt; line-height:1.4; white-space:pre; overflow:hidden; break-inside:avoid; }}
.p {{ color:var(--pred); }} .t {{ color:var(--truth); }} .l {{ color:var(--loss); font-weight:700; }} .s1 {{ color:var(--s1); }} .s2 {{ color:var(--s2); }}
.chip {{ display:inline-block; font: 700 7.6pt/1 "SF Mono", Menlo, monospace; color:#fff; background:var(--s1); border-radius:3pt; padding:2pt 4pt; }}
.eq {{ font: 12pt/1.4 "Iowan Old Style", Palatino, Georgia, serif; text-align:center; margin:3pt 0 5pt; }}
.head {{ display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2pt solid var(--ink); padding-bottom:5pt; margin-bottom:7pt; }}
.head .r {{ text-align:right; font-size:8pt; color:var(--soft); flex:none; margin-left:10pt; }}
.foot {{ margin-top:5pt; font-size:7.4pt; color:var(--muted); }}
a {{ color:var(--s2); text-decoration:none; }}
.flow {{ display:flex; gap:3pt; align-items:stretch; margin:0 0 6pt; }}
.flow div {{ flex:1; border:1pt solid var(--ink); border-radius:4pt; padding:4pt 5pt; font-size:8pt; text-align:center; background:var(--white); }}
.flow div b {{ display:block; font-size:8.6pt; }} .flow i {{ align-self:center; font-style:normal; color:var(--muted); }}
.figs {{ display:flex; gap:4pt; justify-content:space-between; }}
</style></head><body>

<div class="page">
<div class="head">
  <div><div style="font:700 7.5pt/1 -apple-system,sans-serif;letter-spacing:.16em;color:var(--accent);margin-bottom:4pt">CHEATSHEET</div>
  <h1>System 1 models: deciding without writing</h1></div>
  <div class="r">Nipun Batra · IIT Gandhinagar<br>slides and notebooks: <a href="https://nipunbatra.github.io/system-one/">nipunbatra.github.io/system-one</a></div>
</div>

<div class="key"><b class="t">THE DEFINITION</b>A decision model reads an input and a list of questions. For each question it returns <span class="s1">one answer from a fixed set</span>, with a <span class="p">probability</span> for every allowed answer. It writes no text.</div>

<div class="flow">
  <div><b>state + questions</b>email, image tile, game board</div><i>→</i>
  <div style="border-color:var(--s2)"><b class="s2">one forward pass</b>tokens → attention → vector</div><i>→</i>
  <div style="border-color:var(--s1)"><b class="s1">option scores</b>letter logits or a trained head</div><i>→</i>
  <div style="border-color:var(--pred)"><b class="p">softmax, ÷ T</b>probabilities</div><i>→</i>
  <div><b>thresholds</b>act · ask a person · skip</div>
</div>

<div class="cols">
<div>
<h2><span class="n">PART 1</span>Two ways of thinking</h2>
<table><tr><th></th><th>System 1</th><th>System 2</th></tr>
<tr><td>How</td><td>fast, automatic</td><td>slow, in steps</td></tr>
<tr><td>You</td><td>2 × 2, a friend's face</td><td>17 × 24, a tax form</td></tr>
<tr><td>ML</td><td>Is this spam? Which digit?</td><td>Write a data loader. Prove convexity.</td></tr>
<tr><td>Model</td><td class="s1">decision model</td><td class="s2">chat LLM, reasoning model</td></tr></table>
<p><b>Exam picture.</b> A chat LLM writes in the answer booklet. A decision model fills a bubble sheet, and shades each bubble by how sure it is.</p>

<h3>Answer types</h3>
<table><tr><th>Type</th><th>Returns</th><th>Example</th></tr>
<tr><td><span class="chip">noul</span></td><td>P(yes)</td><td>Is the customer asking for a refund?</td></tr>
<tr><td><span class="chip">choice</span></td><td>a probability per option</td><td>Which team: billing, technical, sales?</td></tr>
<tr><td><span class="chip">score</span></td><td>a probability per level, and the weighted level</td><td>How urgent: not urgent, soon, today?</td></tr>
<tr><td><span class="chip">choice multiple</span></td><td>one yes or no per option</td><td>Which topics does it mention?</td></tr>
<tr><td><span class="chip">text</span> <span class="chip">number</span> <span class="chip">date</span></td><td>a value and the characters it was read from</td><td>What is the invoice total?</td></tr>
<tr><td><span class="chip">spans</span> <span class="chip">box</span></td><td>positions in the text or picture</td><td>Where is the kiln in this tile?</td></tr></table>
<p class="muted">noul, choice and score are Jev's types. The last three rows are from Liquid's d1.2 (November 2026), which also takes images and audio.</p>
<p><b>Built from small choices.</b> A box is one yes or no and four picks among 1,000 positions. A number estimate is one pick among up to 128 values, reported as the median and the 10% to 90% range. A value read from text is two picks among the input's positions, start and end. A bigger task splits the same way: one typed question per fact the program needs, and plain code combines the answers.</p>
<p><b>Rule of thumb.</b> If the answer comes from a list, a scale, a yes or no, or a place in the input, it is a System 1 call. If the answer has to be written, it needs an LLM.</p>
</div>

<div>
<h3 style="margin-top:0">One request</h3>
<pre>{{"state": "{sci['email']}",
 "questions": {{
   "team":    {{"type": "choice", "instructions": "Which team?",
               "criteria": {{"billing": "...", "technical": "...",
                            "sales": "..."}}}},
   "refund":  {{"type": "noul",
               "instructions": "Does the customer ask for a refund?"}},
   "urgency": {{"type": "score", "instructions": "How urgent?",
               "criteria": ["not urgent", "soon", "today"]}}}}}}</pre>
<h3>One response</h3>
<pre>{{"answers": {{
   "team":    {{"choice": "technical", "probabilities":
               {{"billing": {f2(sci['p_team'][0])}, "technical": {f2(sci['p_team'][1])}, "sales": {f2(sci['p_team'][2])}}}}},
   "refund":  {{"noul": {f2(sci['p_refund_yes'])}}},
   "urgency": {{"score": {f2(sci['urgency_score'])}, "probabilities":
               {{"0": {f2(sci['p_urgency'][0])}, "1": {f2(sci['p_urgency'][1])}, "2": {f2(sci['p_urgency'][2])}}}}}}},
 "usage": {{"output_tokens": 0}}}}</pre>
<p><b>In between.</b> The request has no letters. Our code writes each question as a prompt, labels the options A, B, C in the order given, and reads the scores of exactly those letter tokens. In a hosted model this happens inside the service.</p>
<p class="muted">Field names follow the Jev, Liquid and Unsloth formats. The numbers are from our small open model (Qwen2.5-0.5B-Instruct, 494 M parameters), read with no training for this task, so they show the format and not good answers.</p>

<h3>Who makes them</h3>
<table><tr><th>Model</th><th>Access</th><th>Note</th></tr>
<tr><td>Jev</td><td>hosted, Sep 2026</td><td>the first; $0.042 per million input tokens; internals unpublished</td></tr>
<tr><td>Liquid d1, d1.2</td><td>open weights; hosted</td><td>text, images, audio; more answer types</td></tr>
<tr><td>Laya, System One Gemma</td><td>open weights</td><td>421 M and 270 M parameters</td></tr>
<tr><td>Unsloth FastDecisionModel</td><td>train your own</td><td>a head and LoRA on an open LLM</td></tr></table>
</div>
</div>
<div class="foot">Sources for this page: Keen, IBM Technology, 2026; Kahneman, 2011; Liquid AI docs, 2026; Roitman, arXiv 2610.33775. Model facts are from vendor pages and Roitman's guide, and few have independent tests.</div>
</div>

<div class="page">
<div class="cols">
<div>
<h2><span class="n">PART 2</span>How an LLM answers</h2>
<ol>
<li><b>Tokens.</b> Text becomes integers. Our email is {len(sci['tokens'])} tokens from a vocabulary of {sci['vocab']:,}.</li>
<li><b>Vectors.</b> Each id picks a row of a table: {sci['hidden']} numbers.</li>
<li><b>Attention.</b> Each token's vector becomes a weighted mix of the tokens before it.</li>
<li><b>Blocks.</b> Attention and a small network, repeated {sci['layers']} times. Keep the vector at the last position.</li>
<li><b>Logits.</b> An output layer turns that vector into {sci['vocab']:,} scores, one per token.</li>
<li><b>Softmax.</b> Scores become probabilities.</li>
<li><b>Loop.</b> Pick a token, append it, run everything again.</li>
</ol>
<div class="eq"><i class="p">p</i><sub>i</sub> = e<sup>z<sub>i</sub></sup> / Σ<sub>j</sub> e<sup>z<sub>j</sub></sup></div>
<table><tr><th>logit z</th><th>e<sup>z</sup></th><th>÷ total 11.21</th></tr>
<tr><td>2.0</td><td>7.39</td><td class="p">{f2(t1[0])}</td></tr><tr><td>1.0</td><td>2.72</td><td class="p">{f2(t1[1])}</td></tr><tr><td>0.1</td><td>1.11</td><td class="p">{f2(t1[2])}</td></tr></table>
<p><b>Encoder or decoder.</b> In an encoder a token sees both sides, and the output is a vector per token (BERT). In a decoder a token sees only its left, and the output is the next token (GPT, Claude, Qwen). Chat models are decoders, which is why they write one token at a time.</p>

<h3>Three costs of writing a quick decision</h3>
<table><tr><th>Cost</th><th>Measured on our model</th></tr>
<tr><td>Time</td><td>{sci['n_generated']} tokens + 1 stop = {sci['passes']} passes = {sci['ms_generate']} ms. A million emails: about {round(sci['ms_generate'] * 1e6 / 3.6e6)} hours.</td></tr>
<tr><td>Format</td><td>Of {sci['written']['n']} JSON answers, {sci['written']['n'] - sci['written']['usable']} could not be used. Fixes: retry, repair, an LLM judge, constrained decoding.</td></tr>
<tr><td>Confidence</td><td>Written confidence averaged {f2(sci['written']['mean_stated'])}; it was right {f2(sci['written']['accuracy'])} of the time.</td></tr></table>
<p class="muted">A reasoning model that writes 300 thinking tokens and a 40-token answer runs 341 passes.</p>
</div>

<div>
<h2><span class="n">PART 3</span>Read, don't write</h2>
<div class="key"><b class="t">THE IDEA</b>The answer is already in the first forward pass. Keep the logits of the option letters, apply softmax, and skip the writing.</div>
<table><tr><th>option</th><th>logit</th><th>minus {zmax:.2f}</th><th>e to that</th><th>probability</th></tr>{readout_rows}</table>
<pre>letter_ids = [tok.encode(c)[0] for c in "ABCDEFGH"]

def decide(state, question, options):
    x = tok(prompt(state, question, options), return_tensors="pt")
    logits = model(**x).logits[0, -1]            # one forward pass
    keep = logits[letter_ids[:len(options)]]     # only the options
    return keep.softmax(-1)                      # renormalise</pre>
<p>Reading took {sci['ms_one_pass']} ms against {sci['ms_generate']} ms for writing: {sci['ms_generate'] / sci['ms_one_pass']:.1f} times faster. Counting written answers instead needs 97 samples for ±0.10 (1.96² × 0.25 / 0.10² = 96.04).</p>
<p><b>Score.</b> The probability-weighted level: 0 × {f2(sci['p_urgency'][0])} + 1 × {f2(sci['p_urgency'][1])} + 2 × {f2(sci['p_urgency'][2])} = {f2(sci['urgency_score'])}.</p>

<h3>Three designs, the same transformer blocks</h3>
<table><tr><th></th><th>Top of the model</th><th>Passes</th><th>Trained?</th></tr>
<tr><td class="s2"><b>Chat LLM</b></td><td>{sci['vocab']:,} scores, pick a token, loop</td><td>one per token</td><td>to write text</td></tr>
<tr><td class="s1"><b>Letter readout</b></td><td>the same scores, keep the option letters</td><td>1</td><td>no, or as Liquid does</td></tr>
<tr><td class="s1"><b>New head</b></td><td>a small layer with one score per option</td><td>1</td><td>yes: ours, Unsloth</td></tr></table>
<p>A decision model is either of the last two, once trained.</p>
<h3>Turning a chat model into a decision model</h3>
<ol><li>Remove the vocabulary output layer.</li><li>Let every token see both sides, since nothing is written.</li><li>Attach a small head and train, with LoRA (small trainable additions to the frozen blocks).</li></ol>
<p class="muted">The recipe of System One Gemma, as described by Roitman. Our notebook 2 does steps 1 and 3.</p>
</div>
</div>
<div class="foot">Run it: notebook 1, <a href="https://colab.research.google.com/github/nipunbatra/system-one/blob/main/notebooks/01_read_dont_write.ipynb">Read, don't write</a>. Timings are from a MacBook GPU.</div>
</div>

<div class="page">
<h2><span class="n">PART 4</span>Calibration</h2>
<div class="cols">
<div>
<div class="key"><b class="t">THE DEFINITION</b>Among all the answers given with <span class="p">probability p</span>, a <span class="t">fraction p</span> are correct. A forecaster who says 80% on ten days is calibrated if it rains on eight.</div>
<p><b>Confidence</b> is the largest softmax probability, and the <b>answer</b> is the option that has it. Calibration is a property of a group of predictions, never of one.</p>
<h3>ECE by hand, ten predictions</h3>
<table><tr><th>bin</th><th>n</th><th>mean confidence</th><th>accuracy</th><th>gap</th><th>n/N × gap</th></tr>
<tr><td>0.4 to 0.6</td><td>2</td><td class="p">(0.55 + 0.45) / 2 = 0.50</td><td class="t">1 / 2 = 0.50</td><td>0.00</td><td>0.2 × 0.00 = 0.00</td></tr>
<tr><td>0.6 to 0.8</td><td>3</td><td class="p">2.10 / 3 = 0.70</td><td class="t">2 / 3 = 0.67</td><td>0.03</td><td>0.3 × 0.03 = 0.01</td></tr>
<tr><td>0.8 to 1.0</td><td>5</td><td class="p">4.50 / 5 = 0.90</td><td class="t">3 / 5 = 0.60</td><td>0.30</td><td>0.5 × 0.30 = 0.15</td></tr>
<tr><td colspan="5" style="text-align:right"><b>ECE</b></td><td class="l">0.16</td></tr></table>
<div class="eq">ECE = Σ<sub>bins</sub> (n<sub>bin</sub> / N) × | <span class="t">accuracy</span> − <span class="p">confidence</span> |</div>
<pre>def ece(conf, correct, n_bins=10):
    edges = np.linspace(0, 1, n_bins + 1)
    total = 0.0
    for lo, hi in zip(edges[:-1], edges[1:]):
        in_bin = (conf > lo) & (conf <= hi)
        if in_bin.any():
            gap = abs(correct[in_bin].mean() - conf[in_bin].mean())
            total += in_bin.mean() * gap
    return total</pre>
<h3>Where can a confidence come from?</h3>
<table><tr><th>Source</th><th>Cost</th><th>On our model ({cc['n']} items)</th></tr>
<tr><td>Read the softmax</td><td>1 pass</td><td>accuracy {f2(cc['read']['accuracy'])}, confidence {f2(cc['read']['mean_conf'])}, ECE {f2(cc['read']['ece'])}</td></tr>
<tr><td>Ask the model to write it</td><td>more tokens</td><td>accuracy {f2(cc['written']['accuracy'])}, confidence {f2(cc['written']['mean_conf'])}, ECE {f2(cc['written']['ece'])}</td></tr>
<tr><td>Sample and count</td><td>1 generation per sample</td><td>matches the read value, at 200 times the cost</td></tr></table>
<p class="muted">Tian et al., 2023, found written confidence better calibrated on ChatGPT, GPT-4 and Claude. Results depend on the model, so measure on yours.</p>
</div>

<div>
<p><b>Our test.</b> Qwen2.5-0.5B, AG News, four topics, {zs['n']:,} test items, read from letter logits. Accuracy <span class="t">{f2(zs['accuracy'])}</span>, mean confidence <span class="p">{f2(zs['mean_conf'])}</span>: over-confident.</p>
<div class="figs">{reliability(zs['bins'], 'as read', f2(zs['ece']))}{reliability(zs['bins_T'], f"T = {zs['T']}", f2(zs['ece_T']))}</div>
<p class="muted">Each dot is one bin, sized by how many predictions it holds. Red bars are the gaps. On the dashed line the model is calibrated; below it, over-confident.</p>
<h3>Temperature scaling</h3>
<div class="eq"><i class="p">p</i> = softmax(z / <span class="l">T</span>)</div>
<table><tr><th>logit z</th><th>z / 2</th><th>e to that</th><th>T = 2</th><th>T = 1</th></tr>
<tr><td>2.0</td><td>1.00</td><td>2.72</td><td class="p">2.72 / 5.42 = {f2(t2[0])}</td><td>{f2(t1[0])}</td></tr>
<tr><td>1.0</td><td>0.50</td><td>1.65</td><td class="p">1.65 / 5.42 = {f2(t2[1])}</td><td>{f2(t1[1])}</td></tr>
<tr><td>0.1</td><td>0.05</td><td>1.05</td><td class="p">1.05 / 5.42 = {f2(t2[2])}</td><td>{f2(t1[2])}</td></tr></table>
<ul>
<li>T above 1 flattens the probabilities, T below 1 sharpens them. The order of the options never changes, so <b>accuracy stays the same</b>.</li>
<li>Choose T on held-out items, by the lowest log loss (the average of −log of the probability given to the correct option). Ours: T = {zs['T']}, log loss {zs['nll_at_1']:.2f} → {zs['nll_best']:.2f}.</li>
<li>Never choose T on the test items.</li>
</ul>
<table><tr><th></th><th>accuracy</th><th>confidence</th><th>ECE</th></tr>
<tr><td>as read</td><td class="t">{f2(zs['accuracy'])}</td><td class="p">{f2(zs['mean_conf'])}</td><td class="l">{f2(zs['ece'])}</td></tr>
<tr><td>with T = {zs['T']}</td><td class="t">{f2(zs['accuracy'])}</td><td class="p">{f2(zs['mean_conf_T'])}</td><td class="l">{f2(zs['ece_T'])}</td></tr></table>
<h3>Three repairs</h3>
<table><tr><th>Method</th><th>Fits</th><th>Use when</th></tr>
<tr><td>Temperature</td><td>1 number</td><td>start here; hard to overfit</td></tr>
<tr><td>Platt, sigmoid(a·z + b)</td><td>2 numbers</td><td>the diagram is shifted or tilted</td></tr>
<tr><td>Isotonic</td><td>a staircase</td><td>it bends in several places and you have over 1,000 held-out items</td></tr></table>
<p><b>Calibration is not accuracy.</b> A temperature repairs the confidence. Every wrong answer stays wrong, and only training repairs those.</p>
</div>
</div>
<div class="foot">Sources: Guo et al., ICML 2017; scikit-learn user guide, "Probability calibration"; Tian et al., EMNLP 2023; Roitman, 2026. Run it: notebook 1.</div>
</div>

<div class="page">
<h2><span class="n">PART 5</span>Training for calibration</h2>
<div class="cols eqc">
<div>
<h3 style="margin-top:0">How a chat model is trained</h3>
<table><tr><th>Stage</th><th>Data</th><th>Objective</th><th>Scale</th></tr>
<tr><td>1 Pre-training</td><td>web pages, books, code</td><td>predict the next token</td><td>trillions of tokens</td></tr>
<tr><td>2 Supervised fine-tuning</td><td>instruction and response pairs</td><td>next token of the response</td><td>thousands to millions of pairs</td></tr>
<tr><td>3 Reinforcement learning</td><td>the model's own answers, scored</td><td>raise the expected reward</td><td>tens of thousands of prompts</td></tr></table>
<table><tr><th>Reward</th><th>Given for</th><th>Ignores</th></tr>
<tr><td>RLHF, human feedback</td><td>the answer people prefer of two</td><td>doubt: confident answers win</td></tr>
<tr><td>RLVR, verifiable rewards</td><td>a final answer that passes a check</td><td>how likely it was to be right</td></tr>
<tr><td>A proper scoring rule</td><td>a stated probability close to what happened</td><td></td></tr></table>
<p class="muted">RLCD, "reinforcement learning for calibrated decisions", is TypeSafe's name for how Jev is trained. Only the goal is published.</p>

<h3>Proper scoring rules</h3>
<p>Ten customers send the same email, so the model gives all ten the same P(refund). Later, <span class="t">7 wanted a refund and 3 did not</span>. Which number should it have said?</p>
<div class="eq"><span class="l">Brier penalty</span> = (<i class="p">p</i> − <i class="t">y</i>)² &nbsp;&nbsp; <span class="l">log loss</span> = −log <i class="p">p</i><sub class="t">correct</sub></div>
<table><tr><th>says</th><th>Brier total: 7 × (p − 1)² + 3 × p²</th><th>log loss total</th><th>right answers</th></tr>
<tr><td class="p">0.5</td><td>7 × 0.25 + 3 × 0.25 = 2.50</td><td>6.93</td><td>7</td></tr>
<tr style="background:#e9f5f3"><td class="p"><b>0.7</b></td><td>7 × 0.09 + 3 × 0.49 = <b class="l">2.10</b></td><td><b class="l">6.11</b></td><td>7</td></tr>
<tr><td class="p">0.9</td><td>7 × 0.01 + 3 × 0.81 = 2.50</td><td>7.65</td><td>7</td></tr>
<tr><td class="p">0.99</td><td>7 × 0.0001 + 3 × 0.98 = 2.94</td><td>13.89</td><td>7</td></tr></table>
<p>Counting right answers cannot tell 0.7 from 0.99. Both penalties are lowest at the true rate, 0.7. A rule with this property is <b>proper</b>, and cross-entropy, the usual classification loss, is one.</p>
<p><b>Exam picture.</b> With +4 for right and −1 for wrong you mark an answer only when you are more than 20% sure (4p − (1 − p) = 0). The marks shape the student, and the reward shapes the model.</p>
<p class="muted">A proper score is the right incentive, not a guarantee: a small model, noisy labels or new kinds of input can still leave a trained model miscalibrated.</p>
</div>

<div>
<h3 style="margin-top:0">A decision head on a frozen LLM</h3>
<p>The head reads the last-position vector h ({sci['hidden']} numbers) and computes one weighted sum per option, then softmax.</p>
<div class="eq">score<sub>option</sub> = <span class="s1">w</span><sub>option</sub> · <span class="p">h</span> + <span class="s1">b</span><sub>option</sub></div>
<p>{sci['hidden']} × 4 + 4 = <b>{head['params']:,} trained numbers</b>; the 494 M of the LLM are frozen.</p>
<pre>H = last_vectors(llm, train_items)   # one pass per item
head = torch.nn.Linear({sci['hidden']}, 4)
opt = torch.optim.AdamW(head.parameters(), lr=1e-3,
                        weight_decay=0.1)
for step in range(300):              # a few seconds
    loss = F.cross_entropy(head(H), y)   # the log score
    opt.zero_grad(); loss.backward(); opt.step()</pre>
<table><tr><th>{zs['n']:,} AG News test items</th><th>accuracy</th><th>ECE</th></tr>
<tr><td>LLM letters, as read</td><td class="t">{f2(zs['accuracy'])}</td><td class="l">{f2(zs['ece'])}</td></tr>
<tr><td>LLM letters, T = {zs['T']}</td><td class="t">{f2(zs['accuracy'])}</td><td class="l">{f2(zs['ece_T'])}</td></tr>
<tr><td>trained head</td><td class="t">{f2(head['raw']['accuracy'])}</td><td class="l">{f2(head['raw']['ece'])}</td></tr>
<tr><td>trained head, T = {head['T']}</td><td class="t">{f2(head['cal']['accuracy'])}</td><td class="l">{f2(head['cal']['ece'])}</td></tr></table>
<p>Temperature repairs the confidence. Training is what raises the accuracy.</p>

<h3>Training a decision model, on one page</h3>
<div class="flow" style="font-size:7.4pt">
  <div><b>1 rows</b>input, questions, answers</div><i>→</i><div style="border-color:var(--s2)"><b class="s2">2 one pass</b>probabilities</div><i>→</i>
  <div style="border-color:var(--loss)"><b class="l">3 proper loss</b>adjust, repeat</div><i>→</i><div style="border-color:var(--pred)"><b class="p">4 held-out</b>fit T</div><i>→</i><div style="border-color:var(--truth)"><b class="t">5 test</b>accuracy, ECE</div>
</div>
<table><tr><th>Who trains</th><th>Weights trained</th><th>Rows</th><th>Result</th></tr>
<tr><td>Our head<br><span class="muted">you, seconds</span></td><td>the head only</td><td>{head['n_train']:,} news items, one question</td><td>{f2(zs['accuracy'])} → {f2(head['raw']['accuracy'])}</td></tr>
<tr><td>Unsloth<br><span class="muted">you, about 40 min</span></td><td>a new head and LoRA</td><td>many inputs, each with choice, noul, score questions</td><td>36% → 73%</td></tr>
<tr><td>Liquid cookbook<br><span class="muted">you, minutes</span></td><td>LoRA; the letter readout is kept</td><td>bank messages; the target is one option-code token</td><td>83% → 90%</td></tr>
<tr><td>Jev<br><span class="muted">the vendor</span></td><td colspan="3" class="muted">not published</td></tr></table>
<pre>FDM = FastDecisionModel                  # Unsloth
model, tok = FDM.from_pretrained("unsloth/Qwen3.5-0.8B")
model = FDM.get_peft_model(model, r=16, lora_alpha=16)
items, _ = FDM.build_dataset(dataset, tok, model)
train, held = FDM.split_holdout(items, seed=3407)
DecisionTrainer(model=model, train_dataset=train,
                ...).train()
FDM.calibrate(model, tok, held)
FDM.predict(model, tok, email, questions)</pre>
</div>
</div>
<div class="foot">Sources: Ouyang et al., 2022; Huyen, "RLHF", 2023; Brier, 1950; Unsloth's guide and Liquid AI's cookbook, 2026 (their numbers, not reproduced by us). Run it: notebooks 2 and 3. Notebook 3 needs a CUDA GPU.</div>
</div>

<div class="page">
<h2><span class="n">PART 6</span>Putting it to work</h2>
<div class="cols">
<div>
<h3 style="margin-top:0">A recipe for your own problem</h3>
<ol>
<li><b>Write the state and the questions.</b> Give each question a type.</li>
<li><b>Label a small test set yourself.</b> One or two hundred real inputs.</li>
<li><b>Try a general model with no training.</b> Record accuracy and draw the reliability diagram.</li>
<li><b>If the confidence is off, calibrate.</b> Fit a temperature on half the labels, check on the other half.</li>
<li><b>If the accuracy is short, train.</b> Fine-tune on labelled rows, or train a head on frozen vectors.</li>
</ol>
<p>A general decision model takes the question as input, so a new question needs new text and no new training. Training happens once, on many kinds of question.</p>
<h3>A head that takes any question</h3>
<p>Write the options one per line and read the model's vector at the end of each line. One small trained scorer turns each vector into a score, then softmax. It has one output, so it works for any number of options and any question.</p>
<p class="muted">Our experiment on the frozen Qwen2.5-0.5B, 57,473 trained numbers, tested on three kinds of question it never saw. Trained on 5 kinds: {sh5}. Trained on 13 kinds: {sh13}. Letters, untrained: {shl}. Variety of training questions is what makes it general.</p>
<h3>Thresholds from costs</h3>
<div class="eq">act when <i class="p">p</i> &gt; c / (c + b)</div>
<p>b is the benefit of a right automatic action and c the cost of a wrong one. A wanted refund saves ₹50, an unwanted one costs ₹450 to undo: 450 / (450 + 50) = <b>0.90</b>. Our email reads {f2(sci['p_refund_yes'])}, so a person looks at it. The rule holds only for calibrated probabilities.</p>
<h3>The cascade</h3>
<div class="flow"><div style="border-color:var(--s1)"><b class="s1">decision model</b>every input</div><i>→</i><div style="border-color:var(--s2)"><b class="s2">LLM, person or search</b>only the unsure ones</div><i>→</i><div><b>result</b></div></div>
<table><tr><th>Application</th><th>Decision model asks</th><th>Slow step</th></tr>
<tr><td>Support email</td><td>team, refund, urgency</td><td>an LLM writes the reply</td></tr>
<tr><td>Brick kilns in satellite tiles</td><td>is there a kiln, and where</td><td>a person confirms</td></tr>
<tr><td>A game move</td><td>a probability per legal move</td><td>a search</td></tr></table>
<h3>Limits to keep in mind</h3>
<ul>
<li>It returns probabilities and no reasons.</li>
<li>Default thresholds can fail; tune them on your data.</li>
<li>Counting and arithmetic belong in code.</li>
<li>Calibration is measured on past data and drifts when inputs change. Reordering options can move the probabilities.</li>
<li>Rare events: most flagged items can still be false alarms.</li>
</ul>
</div>

<div>
<h3 style="margin-top:0">Five families that decide in one pass</h3>
<table><tr><th></th><th>Family</th><th>Returns</th></tr>
<tr><td>I</td><td>Encoder classifiers (BERT)</td><td>one label from a set fixed at training</td></tr>
<tr><td>II</td><td>Reward models</td><td>one score for an answer; the judge in RLHF</td></tr>
<tr style="background:#fdf3e4"><td>III</td><td><b>Decision engines</b> (Jev, Laya, d1)</td><td>typed answers to questions in the request</td></tr>
<tr><td>IV</td><td>Contrastive models</td><td>how well an input matches each stored action</td></tr>
<tr><td>V</td><td>Extraction models</td><td>a value copied from the input</td></tr></table>
<p class="muted">After Roitman, 2026, a single-author practical guide.</p>

<h3>Words</h3>
<table>
<tr><td><b>forward pass</b></td><td>one run of the model over the input</td></tr>
<tr><td><b>logit</b></td><td>a raw score before softmax; any real number</td></tr>
<tr><td><b>softmax</b></td><td>turns scores into probabilities that sum to 1</td></tr>
<tr><td><b>confidence</b></td><td>the largest of those probabilities</td></tr>
<tr><td><b>calibrated</b></td><td>confidence matches how often the model is right</td></tr>
<tr><td><b>reliability diagram</b></td><td>confidence against accuracy, bin by bin</td></tr>
<tr><td><b>ECE</b></td><td>the average gap in that diagram, weighted by bin size</td></tr>
<tr><td><b>temperature T</b></td><td>divide the logits by T before softmax</td></tr>
<tr><td><b>proper scoring rule</b></td><td>a penalty that is lowest at the true probability</td></tr>
<tr><td><b>decision head</b></td><td>a small trained layer with one score per option</td></tr>
<tr><td><b>LoRA</b></td><td>small trainable additions to frozen weights</td></tr>
<tr><td><b>noul</b></td><td>a yes or no question, answered as P(yes)</td></tr>
<tr><td><b>state</b></td><td>the input the questions are about</td></tr>
</table>

<h3>Check yourself</h3>
<ol>
<li>Logits 2.0, 2.0, 0.0. Probabilities? <span class="muted">7.39, 7.39, 1.00 over 15.78: 0.47, 0.47, 0.06. A tie, so ask a person.</span></li>
<li>50 answers at confidence 0.9, 30 right. <span class="muted">Accuracy 0.60, gap 0.30, over-confident. T above 1 lowers the 0.9; the 30 stays 30.</span></li>
<li>7 of 10 are yes. Brier total for saying 0.6? <span class="muted">7 × 0.16 + 3 × 0.36 = 2.20, worse than 2.10 at 0.7.</span></li>
<li>Accuracy 0.62, ECE 0.04 on your data. <span class="muted">Train. Calibration is already fine and never changes accuracy.</span></li>
</ol>

<h3>Go further</h3>
<p style="font-size:8.3pt">Roitman, <a href="https://arxiv.org/abs/2610.33775">The Hitchhiker's Guide to System 1 Models</a> · Unsloth, <a href="https://unsloth.ai/docs/basics/train-your-own-decision-model-with-unsloth">Train your own Decision Model</a> · Liquid AI, <a href="https://github.com/Liquid4All/cookbook/blob/main/finetuning/notebooks/sft_for_decision_models_with_unsloth.ipynb">fine-tuning cookbook</a> · Karpathy, <a href="https://www.youtube.com/watch?v=7xTGNNLPyMI">Deep Dive into LLMs</a> · 3Blue1Brown, <a href="https://www.youtube.com/watch?v=wjZofJX0v4M">Transformers</a> · Huyen, <a href="https://huyenchip.com/2023/05/02/rlhf.html">RLHF</a> · scikit-learn, <a href="https://scikit-learn.org/stable/modules/calibration.html">Probability calibration</a> · Keen, <a href="https://www.youtube.com/watch?v=YGgNBcIgI4s">What Is Jev?</a></p>
</div>
</div>
<div class="foot">Threshold values and rupee amounts are illustrative. Limits are from Deußer et al., arXiv 2609.37647, and from Part 4. Every measured number on this sheet comes from notebooks 1 and 2 of the lecture.</div>
</div>
</body></html>
"""

out = ROOT / "site"
(out / "cheatsheet.html").write_text(HTML)
chrome = os.environ.get("CHROME", "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome")
if "--html-only" not in sys.argv:
    subprocess.run([chrome, "--headless=new", "--disable-gpu", "--no-pdf-header-footer",
                    f"--print-to-pdf={out / 'cheatsheet.pdf'}", (out / "cheatsheet.html").as_uri()],
                   check=True, capture_output=True)
print("wrote", out / "cheatsheet.html", "and cheatsheet.pdf")
