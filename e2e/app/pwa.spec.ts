// Installable and usable offline once loaded (prompt §32).
import { expect, test } from './fixtures';

test('ships a manifest and serves the app shell offline', async ({ page, context, browserName }) => {
  test.skip(browserName === 'webkit', 'Playwright WebKit does not run service workers');
  const manifest = await (await page.request.get('./manifest.webmanifest')).json();
  expect(manifest).toMatchObject({ short_name: 'Tonga', display: 'standalone', start_url: './' });

  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload(); // now controlled by the service worker
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('dialog', { name: 'Nuevo dibujo' })).toBeVisible();
  await context.setOffline(false);
});

test('library images: a versioned URL is cached for good, a plain one is refreshed from the network', async ({ page, context, browserName }) => {
  test.skip(browserName !== 'chromium', 'Only Chromium routes requests made by the service worker');
  let served = 0;
  let offline = false;
  await context.route(/repositorios\/aves\/Abubilla\.png/, (route) => (offline ? route.abort('internetdisconnected') : route.fulfill({ contentType: 'image/png', body: `copy ${++served}` })));
  await page.goto('./');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

  const get = (url: string) => page.evaluate(async (u) => (await fetch(u)).text(), url);
  // Same name, new content: without a revision the worker must not keep serving the old copy.
  expect(await get('repositorios/aves/Abubilla.png')).toBe('copy 1');
  expect(await get('repositorios/aves/Abubilla.png')).toBe('copy 2');
  // With a revision the bytes cannot change, so the cached copy is used.
  const first = await get('repositorios/aves/Abubilla.png?v=aaaaaaaaaaaa');
  expect(await get('repositorios/aves/Abubilla.png?v=aaaaaaaaaaaa')).toBe(first);
  // Offline, a plain URL falls back to its last cached copy.
  offline = true;
  expect(await get('repositorios/aves/Abubilla.png')).toBe('copy 2');
});
