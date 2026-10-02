// Characterization of the legacy app (served at the site root until the cutover).
// It pins what Tonga does today so the rebuilt app can be checked against it.
// Assertions are on state, file names, MIME and structure, never on pixels.
import { test, expect, type Page } from '@playwright/test';
import { copyFile, mkdir, readFile } from 'node:fs/promises';

declare global {
  interface Window {
    imageEditor: { isEmptyUndoStack(): boolean; getCanvasSize(): { width: number; height: number } };
  }
}

const DOWNLOAD_NAME = /^imagen_\d{8}_\d{6}\.(pdf|jpeg|png|svg)$/;

async function openLegacy(page: Page) {
  const errors: string[] = [];
  const external: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('request', (r) => {
    if (!r.url().startsWith('http://127.0.0.1')) external.push(r.url());
  });
  await page.goto('./');
  await expect(page.locator('.tie-btn-comenzar')).toBeVisible();
  await page.waitForFunction(() => window.imageEditor?.getCanvasSize().width > 0);
  return { errors, external };
}

async function start(page: Page) {
  await page.locator('.tie-btn-comenzar').click();
  await page.waitForFunction(() => window.imageEditor.isEmptyUndoStack());
}

test('loads without console errors or third-party requests (RULE-109)', async ({ page }) => {
  const { errors, external } = await openLegacy(page);
  await page.waitForLoadState('networkidle');
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test('Comenzar starts a project with an empty history (RULE-068)', async ({ page }) => {
  await openLegacy(page);
  await start(page);
  const size = await page.evaluate(() => window.imageEditor.getCanvasSize());
  expect(size.width).toBeGreaterThan(0);
  expect(size.height).toBeGreaterThan(0);
});

test('library: a collection opens and a double-click inserts the image (RULE-105/044/083)', async ({ page }) => {
  await openLegacy(page);
  await start(page);
  await page.locator('#tie-btn-imagen').click();
  await page.locator('button.accordion', { hasText: 'Fauna' }).click();
  await page.locator('a#triggerAbrirRepositorio', { hasText: 'Aves' }).first().click();
  const thumb = page.locator('#listaImagenes img.imgImagenRepositorio').first();
  await expect(thumb).toBeVisible({ timeout: 15_000 });
  await thumb.dblclick();
  await page.waitForFunction(() => !window.imageEditor.isEmptyUndoStack());
});

// RECORD_FIXTURES=1 refreshes test/fixtures/legacy/ (an image inserted from the library, then exported).
test('records legacy export fixtures', async ({ page }) => {
  test.skip(!process.env.RECORD_FIXTURES, 'set RECORD_FIXTURES=1 to refresh the fixtures');
  await openLegacy(page);
  await start(page);
  await page.locator('#tie-btn-imagen').click();
  await page.locator('button.accordion', { hasText: 'Fauna' }).click();
  await page.locator('a#triggerAbrirRepositorio', { hasText: 'Aves' }).first().click();
  await page.locator('#listaImagenes img.imgImagenRepositorio').first().dblclick();
  await page.waitForFunction(() => !window.imageEditor.isEmptyUndoStack());
  await page.keyboard.press('Escape');
  await mkdir('test/fixtures/legacy', { recursive: true });
  for (const format of ['PNG', 'JPG', 'SVG', 'PDF']) {
    const download = page.waitForEvent('download');
    await page.locator(`input.tui-image-editor-download-btn-tonga[title$="${format}"]`).click({ force: true });
    const file = await download;
    await copyFile(await file.path(), `test/fixtures/legacy/export.${file.suggestedFilename().split('.').pop()}`);
  }
});

for (const format of ['PNG', 'JPG', 'SVG', 'PDF'] as const) {
  test(`exports ${format} with the legacy file name (RULE-108/101/127)`, async ({ page }) => {
    await openLegacy(page);
    await start(page);
    const download = page.waitForEvent('download');
    await page.locator(`input.tui-image-editor-download-btn-tonga[title$="${format}"]`).click();
    const file = await download;
    expect(file.suggestedFilename()).toMatch(DOWNLOAD_NAME);
    const bytes = await readFile(await file.path());
    const head = bytes.subarray(0, 8).toString('latin1');
    if (format === 'PNG') expect(head.startsWith('\x89PNG')).toBe(true);
    if (format === 'JPG') expect(bytes[0] === 0xff && bytes[1] === 0xd8).toBe(true);
    if (format === 'PDF') expect(head.startsWith('%PDF-')).toBe(true);
    if (format === 'SVG') {
      const svg = bytes.toString('utf8');
      expect(svg).toContain('<svg');
      // RULE-086: the background travels inside the SVG, tagged for re-import.
      expect(svg).toContain('data-background');
    }
  });
}
