// Automated accessibility checks (axe). Zero violations here is not WCAG conformance:
// the manual checks are in docs/ACCESSIBILITY.md.
import AxeBuilder from '@axe-core/playwright';
import type { Page } from '@playwright/test';
import { expect, newDrawing, test } from './fixtures';

async function audit(page: Page) {
  const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  return violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

test('start screen', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('dialog', { name: 'Nuevo dibujo' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
});

test('editor with a selection, both side panel tabs', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('button', { name: 'Añadir texto' }).click();
  expect(await audit(page)).toEqual([]);
  await page.getByRole('tab', { name: /Capas/ }).click();
  expect(await audit(page)).toEqual([]);
});

test('library', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('button', { name: 'Abrir la biblioteca de imágenes' }).click();
  await expect(page.locator('#library-grid').getByRole('option').first()).toBeVisible();
  expect(await audit(page)).toEqual([]);
});

test('export and help dialogs', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('button', { name: 'Exportar' }).click();
  expect(await audit(page)).toEqual([]);
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: 'Ayuda y atajos' }).click();
  expect(await audit(page)).toEqual([]);
});

test('phone layout with the drawer open, dark theme', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.setViewportSize({ width: 390, height: 844 });
  await newDrawing(page);
  await page.getByRole('button', { name: 'Añadir rectángulo' }).click();
  await page.getByRole('button', { name: 'Mostrar propiedades y capas' }).click();
  expect(await audit(page)).toEqual([]);
});

test('image tools in the inspector', async ({ page }) => {
  await newDrawing(page);
  await page.locator('#file-image').setInputFiles('test/fixtures/legacy/export.png');
  await expect(page.getByRole('group', { name: 'Imagen' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
});

test('information and licences dialogs', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('button', { name: 'Información, licencias y aviso legal' }).click();
  expect(await audit(page)).toEqual([]);
  await page.getByRole('button', { name: 'Licencias', exact: true }).click();
  expect(await audit(page)).toEqual([]);
});

test('canvas context menu', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('button', { name: 'Añadir rectángulo' }).click();
  await page.locator('body').press('ContextMenu');
  await expect(page.getByRole('menu', { name: 'Acciones' })).toBeVisible();
  expect(await audit(page)).toEqual([]);
});
