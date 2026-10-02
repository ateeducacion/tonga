// Measures the initial load of a served page: requests, bytes by type, external hosts, console errors.
// Usage: node scripts/measure-load.mjs http://127.0.0.1:4173/   (serve the site first: npm run preview)
import { chromium } from '@playwright/test';

export async function measureLoad(url) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1366, height: 768 } });
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
  const networkIdleMs = Date.now() - t0;
  await browser.close();

  const origin = new URL(url).origin;
  const bytesByType = {};
  for (const r of responses) bytesByType[r.type] = (bytesByType[r.type] ?? 0) + r.bytes;
  return {
    url,
    requests: responses.length,
    bytes: responses.reduce((n, r) => n + r.bytes, 0),
    bytesByType,
    externalRequests: responses.filter((r) => !r.url.startsWith(origin)).map((r) => r.url),
    consoleErrors: errors,
    networkIdleMs,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(await measureLoad(process.argv[2] ?? 'http://127.0.0.1:4173/'), null, 2));
}
