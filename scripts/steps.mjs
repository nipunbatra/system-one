// Click through every step reveal in the real player and report anything odd.
// Usage: node scripts/steps.mjs [outDir]   (needs `npm run dev` on :5173)
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(process.env.PUPPETEER_FROM || process.cwd() + '/');
const puppeteer = require('puppeteer');
const out = process.argv[2];
if (out) fs.mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({ headless: true, executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1200, deviceScaleFactor: 0.5 });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
await page.goto('http://localhost:5173/s/system-one?p=1', { waitUntil: 'networkidle2', timeout: 60000 });
await new Promise((r) => setTimeout(r, 2500));
// Steps only reveal one at a time in presentation mode, so enter it the way a person does.
const clicked = await page.evaluate(() => {
  const b = [...document.querySelectorAll('button')].find((e) => /^\s*Present\s*$/.test(e.innerText));
  if (b) b.click();
  return !!b;
});
console.log('entered presentation mode:', clicked);
await new Promise((r) => setTimeout(r, 2500));
const read = () =>
  page.evaluate(() => {
    const cur = document.querySelector('[data-osd-current-page]');
    if (!cur) return null;
    const canvas = cur.getBoundingClientRect();
    const steps = [...cur.querySelectorAll('[data-osd-step]')].map((e) => {
      // a step that wraps an absolutely positioned overlay has no size of its own, so measure its child
      let r = e.getBoundingClientRect();
      if ((r.width < 4 || r.height < 4) && e.firstElementChild) r = e.firstElementChild.getBoundingClientRect();
      return { s: e.getAttribute('data-osd-step'), x: Math.round(r.left - canvas.left), y: Math.round(r.top - canvas.top), w: Math.round(r.width), h: Math.round(r.height), t: e.innerText.replace(/\s+/g, ' ').slice(0, 40) };
    });
    return { p: Number(cur.getAttribute('data-osd-current-page')) + 1, steps };
  });
let problems = 0, totalSteps = 0, pagesWithSteps = 0, last = 0;
const seen = new Set();
for (let guard = 0; guard < 1200; guard++) {
  const st = await read();
  if (!st) { console.log('no current page'); break; }
  if (!seen.has(st.p)) {
    seen.add(st.p);
    if (st.p !== last + 1) { console.log(`page jump ${last} -> ${st.p}`); problems++; }
    last = st.p;
    const n = st.steps.length;
    if (n) { pagesWithSteps++; totalSteps += n; }
    if (st.steps.some((s) => s.s !== 'pending')) { console.log(`p${st.p}: a step is already revealed on arrival`); problems++; }
    st.steps.forEach((s, i) => { if (s.w < 4 || s.h < 4) { console.log(`p${st.p}: step ${i + 1} has no size "${s.t}"`); problems++; } });
    for (let k = 0; k < n; k++) {
      await page.keyboard.press('ArrowRight');
      await new Promise((r) => setTimeout(r, 260));
      const now = await read();
      if (now.p !== st.p) { console.log(`p${st.p}: left the page after ${k} of ${n} steps`); problems++; break; }
      const shown = now.steps.map((s, i) => (s.s === 'revealed' ? i : -1)).filter((i) => i >= 0);
      if (shown.length !== k + 1 || shown.some((v, i) => v !== i)) { console.log(`p${st.p}: after press ${k + 1} revealed = [${shown}] of ${n}`); problems++; }
      if (out && process.env.SHOOT && process.env.SHOOT.split(',').includes(String(st.p))) await page.screenshot({ path: `${out}/p${st.p}-s${k + 1}.png` });
    }
    console.log(`p${st.p}: ${n} steps`);
  }
  if (st.p >= Number(process.env.PAGES ?? 144)) break;
  await page.keyboard.press('ArrowRight');
  await new Promise((r) => setTimeout(r, 260));
}
console.log(`pages visited ${seen.size} · pages with steps ${pagesWithSteps} · steps ${totalSteps} · problems ${problems}`);
await browser.close();
