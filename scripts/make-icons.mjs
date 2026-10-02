// One-off generator of the PWA PNG icons from public/favicon.svg (run when the logo changes).
import { chromium } from '@playwright/test';
import { readFileSync } from 'node:fs';

const svg = readFileSync('public/favicon.svg', 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage();
for (const [size, maskable] of [[192, false], [512, false], [512, true]]) {
  // Maskable icons keep the logo inside the central 80% safe zone on a solid background.
  const inner = maskable ? size * 0.6 : size;
  const bg = maskable ? '#1b1d22' : 'transparent';
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<body style="margin:0;display:grid;place-items:center;width:${size}px;height:${size}px;background:${bg}">${svg.replace('<svg ', `<svg width="${inner}" height="${inner}" `)}</body>`);
  await page.screenshot({ path: `public/icons/icon-${size}${maskable ? '-maskable' : ''}.png`, omitBackground: !maskable });
}
await browser.close();
console.log('public/icons/*.png written');
