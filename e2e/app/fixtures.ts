// Shared E2E setup: every test fails on unexpected console errors or third-party requests.
import { test as base, expect, type Page } from '@playwright/test';

export const test = base.extend<{ problems: string[] }>({
  problems: [
    async ({ page }, use) => {
      const problems: string[] = [];
      page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
      page.on('console', (m) => {
        if (m.type() === 'error') problems.push(`console: ${m.text()}`);
      });
      page.on('request', (r) => {
        if (!/^(http:\/\/127\.0\.0\.1|blob:|data:)/.test(r.url())) problems.push(`external request: ${r.url()}`);
      });
      await use(problems);
      expect(problems).toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Opens the app and creates a new drawing with the given preset (default A4 landscape). */
export async function newDrawing(page: Page, preset = 'A4 horizontal'): Promise<void> {
  await page.goto('./');
  const dialog = page.getByRole('dialog', { name: 'Nuevo dibujo' });
  await expect(dialog).toBeVisible();
  await dialog.getByText(preset).click();
  await dialog.getByRole('button', { name: 'Crear' }).click();
  await expect(dialog).toBeHidden();
}

/** Adds a shape from the «Formas» menu, e.g. addShape(page, 'rectángulo'). */
export async function addShape(page: Page, shape: string, options: { timeout?: number } = {}): Promise<void> {
  await page.getByRole('button', { name: 'Añadir forma' }).click(options);
  await page.getByRole('group', { name: 'Formas' }).getByRole('button', { name: `Añadir ${shape}`, exact: true }).click();
}

export function layers(page: Page) {
  return page.locator('#layers .layer-name');
}
