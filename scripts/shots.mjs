// Screenshot every page (all steps revealed) and report anything outside its box.
// Usage: node scripts/shots.mjs <outDir> [firstPage] [lastPage]   (needs `npm run dev` on :5173)
import { createRequire } from 'node:module';
import fs from 'node:fs';
const require = createRequire(process.env.PUPPETEER_FROM || process.cwd() + '/');
const puppeteer = require('puppeteer');
const out = process.argv[2] || 'shots';
const first = Number(process.argv[3] || 1);
const last = Number(process.argv[4] || 999);
fs.mkdirSync(out, { recursive: true });
const browser = await puppeteer.launch({
  headless: true,
  executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
});
const page = await browser.newPage();
await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 0.5 });
page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
let problems = 0;
for (let p = first; p <= last; p++) {
  await page.goto(`http://localhost:5173/s/system-one/preview?p=${p}`, { waitUntil: 'domcontentloaded' });
  try {
    await page.waitForSelector('[data-osd-preview="ready"],[data-osd-preview="error"]', { timeout: 20000 });
  } catch {
    console.log(p, 'TIMEOUT');
    break;
  }
  const state = await page.$eval('[data-osd-preview]', (e) => e.getAttribute('data-osd-preview'));
  if (state === 'error') {
    const msg = await page.evaluate(() => document.body.innerText.slice(0, 200));
    if (/out of range/.test(msg)) break;
    console.log(p, 'ERROR', msg);
    problems++;
    continue;
  }
  await new Promise((r) => setTimeout(r, 250));
  const issues = await page.evaluate(() => {
    const res = [];
    const body = document.querySelector('[data-body]');
    const check = (root, box, name) => {
      for (const el of root.querySelectorAll('*')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if (r.right > box.right + 2 || r.bottom > box.bottom + 2 || r.left < box.left - 2 || r.top < box.top - 2) {
          res.push(`${name}: <${el.tagName.toLowerCase()}> "${(el.textContent || '').trim().slice(0, 40)}" ` +
            `[${Math.round(r.left)},${Math.round(r.top)} → ${Math.round(r.right)},${Math.round(r.bottom)}] vs ` +
            `[${Math.round(box.left)},${Math.round(box.top)} → ${Math.round(box.right)},${Math.round(box.bottom)}]`);
          break;
        }
      }
    };
    if (body) check(body, body.getBoundingClientRect(), 'body');
    const title = document.querySelector('h2');
    if (title && body && title.getBoundingClientRect().bottom > body.getBoundingClientRect().top + 2) res.push('title runs into body');
    for (const svg of document.querySelectorAll('[data-body] svg')) {
      const sb = svg.getBoundingClientRect();
      for (const t of svg.querySelectorAll('text')) {
        const r = t.getBoundingClientRect();
        if (r.right > sb.right + 2 || r.left < sb.left - 2 || r.bottom > sb.bottom + 2 || r.top < sb.top - 2) {
          res.push(`svg text clipped: "${t.textContent.slice(0, 40)}"`);
        }
      }
    }
    return res;
  });
  if (issues.length) {
    problems++;
    console.log(p, issues.join(' | '));
  }
  await page.screenshot({ path: `${out}/p${String(p).padStart(2, '0')}.png` });
}
console.log('pages with problems:', problems);
await browser.close();
