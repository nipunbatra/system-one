import { createRequire } from 'node:module';
const require = createRequire(process.env.PUPPETEER_FROM || process.cwd() + '/');
const puppeteer = require('puppeteer');
const b = await puppeteer.launch({ headless: true, executablePath: process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' });
const pg = await b.newPage(); await pg.setViewport({ width: 1920, height: 1080 });
for (const [p, v] of [[46, '3.3'], [67, '0.9']]) {
  await pg.goto(`http://localhost:5173/s/system-one/preview?p=${p}`); await pg.waitForSelector('[data-osd-preview="ready"]');
  const before = await pg.$eval('[data-body]', (e) => e.innerText.replace(/\s+/g, ' '));
  await pg.$eval('input[type=range]', (el, v) => { const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set; set.call(el, v); el.dispatchEvent(new Event('input', { bubbles: true })); }, v);
  await new Promise((r) => setTimeout(r, 200));
  console.log(p, 'BEFORE', before.slice(0, 150)); console.log(p, 'AFTER ', (await pg.$eval('[data-body]', (e) => e.innerText.replace(/\s+/g, ' '))).slice(0, 150));
}
await b.close();
