import { test, expect } from '@playwright/test';

test('the rebuilt app loads from a subdirectory without errors or third-party requests', async ({ page }) => {
  const problems: string[] = [];
  page.on('pageerror', (e) => problems.push(e.message));
  page.on('console', (m) => m.type() === 'error' && problems.push(m.text()));
  page.on('request', (r) => {
    if (!r.url().startsWith('http://127.0.0.1')) problems.push(`external: ${r.url()}`);
  });
  await page.goto('./next/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Tonga');
  expect(problems).toEqual([]);
});
