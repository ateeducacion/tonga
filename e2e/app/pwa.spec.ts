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
