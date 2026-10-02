// Measures the initial load of a served page: requests, bytes by type, external hosts, console errors.
// Usage: node scripts/measure-load.mjs http://127.0.0.1:4173/ [--json]   (start `npm run preview` first)
import { chromium } from '@playwright/test';

const url = process.argv[2] ?? 'http://127.0.0.1:4173/';
const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
const responses = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
page.on('response', async (r) => {
  const body = await r.body().catch(() => Buffer.alloc(0));
  responses.push({ url: r.url(), type: r.request().resourceType(), bytes: body.length });
});
const t0 = Date.now();
await page.goto(url, { waitUntil: 'networkidle' });
const loadMs = Date.now() - t0;
await browser.close();

const origin = new URL(url).origin;
const byType = {};
for (const r of responses) byType[r.type] = (byType[r.type] ?? 0) + r.bytes;
const result = {
  url,
  requests: responses.length,
  bytes: responses.reduce((n, r) => n + r.bytes, 0),
  bytesByType: byType,
  externalRequests: responses.filter((r) => !r.url.startsWith(origin)).map((r) => r.url),
  consoleErrors: errors,
  networkIdleMs: loadMs,
};
console.log(JSON.stringify(result, null, 2));
