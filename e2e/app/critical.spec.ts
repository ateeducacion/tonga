// Critical user flows of the rebuilt app (prompt §41, brief §5 behaviour contract).
import { readFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';
import { expect, layers, newDrawing, test } from './fixtures';

const inspector = (page: Page) => page.locator('#inspector');

async function downloadFrom(page: Page, trigger: () => Promise<void>) {
  const pending = page.waitForEvent('download'); // listener before the click
  await trigger();
  const file = await pending;
  return { name: file.suggestedFilename(), bytes: await readFile(await file.path()) };
}

async function exportAs(page: Page, format: 'PNG' | 'JPEG' | 'SVG' | 'PDF (A4)', filename = 'prueba') {
  await page.getByRole('button', { name: 'Exportar' }).click();
  const dialog = page.getByRole('dialog', { name: 'Exportar' });
  await dialog.getByLabel(format, { exact: true }).check();
  await dialog.getByLabel('Nombre del fichero').fill(filename);
  return downloadFrom(page, () => dialog.getByRole('button', { name: 'Descargar' }).click());
}

const pngSize = (b: Buffer) => [b.readUInt32BE(16), b.readUInt32BE(20)];

test('creates a drawing with text and a shape, edits them and undoes/redoes (RULE-068/070-072)', async ({ page }) => {
  await newDrawing(page);
  await expect(page.getByRole('button', { name: 'Deshacer' })).toBeDisabled();

  await page.getByRole('button', { name: 'Añadir texto' }).click();
  await inspector(page).getByLabel('Texto', { exact: true }).fill('Hola, clase');
  await page.getByRole('button', { name: 'Añadir rectángulo' }).click();
  await expect(layers(page)).toHaveText(['Rectángulo 1', 'Texto 1']);

  // Colour via the accessible hex field, position, size and rotation via the inspector.
  await inspector(page).getByLabel('Relleno (hexadecimal)').fill('#336699');
  await inspector(page).getByLabel('Relleno (hexadecimal)').press('Enter');
  await inspector(page).getByLabel('X', { exact: true }).fill('300');
  await inspector(page).getByLabel('Ancho', { exact: true }).fill('400');
  await inspector(page).getByLabel('Giro (°)', { exact: true }).fill('45');
  await expect(inspector(page).getByLabel('Alto', { exact: true })).toHaveValue('400'); // proportion kept

  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(inspector(page).getByLabel('Giro (°)', { exact: true })).toHaveValue('0');
  await page.getByRole('button', { name: 'Rehacer' }).click();
  await expect(inspector(page).getByLabel('Giro (°)', { exact: true })).toHaveValue('45');
});

test('adds an image from the library with search and an explicit button (RULE-105/083)', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('button', { name: 'Abrir la biblioteca de imágenes' }).click();
  const library = page.getByRole('dialog', { name: 'Biblioteca' });
  await library.getByLabel('Colección').selectOption({ label: 'Aves' });
  await library.getByLabel('Buscar en la biblioteca').fill('cuervo volando');
  await expect(library.locator('#library-grid').getByRole('option')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Añadir al lienzo' })).toBeDisabled();
  await library.locator('#library-grid').getByRole('option').first().click();
  await library.getByRole('button', { name: 'Añadir al lienzo' }).click();
  await expect(layers(page)).toHaveText(['Cuervo canario volando']);

  await page.getByRole('button', { name: 'Abrir la biblioteca de imágenes' }).click();
  await library.getByLabel('Buscar en la biblioteca').fill('zzzz-no-existe');
  await expect(library.getByText(/No hay resultados/)).toBeVisible();
});

test('a background item from the library becomes the canvas background (RULE-112/084)', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('button', { name: 'Abrir la biblioteca de imágenes' }).click();
  const library = page.getByRole('dialog', { name: 'Biblioteca' });
  await library.getByLabel('Buscar en la biblioteca').fill('auditorio');
  await library.getByRole('option', { name: 'Auditorio', exact: true }).dblclick();
  await expect(library).toBeHidden();
  await expect(layers(page)).toHaveCount(0);
  await expect(inspector(page).getByText('El fondo es una imagen de la biblioteca.')).toBeVisible();
});

test('exports PNG, JPEG, SVG and PDF in the browser (RULE-108/101/114/022/086)', async ({ page }) => {
  await newDrawing(page, 'Cuadrado');
  await page.getByRole('button', { name: 'Añadir elipse' }).click();
  await page.getByRole('button', { name: 'Abrir la biblioteca de imágenes' }).click();
  await page.getByLabel('Buscar en la biblioteca').fill('cuervo volando');
  await page.locator('#library-grid').getByRole('option').first().dblclick();
  await expect(layers(page)).toHaveCount(2);

  const png = await exportAs(page, 'PNG');
  expect(png.name).toBe('prueba.png');
  expect(png.bytes.subarray(1, 4).toString()).toBe('PNG');
  expect(pngSize(png.bytes)).toEqual([1080, 1080]);

  const jpeg = await exportAs(page, 'JPEG');
  expect(jpeg.name).toBe('prueba.jpg');
  expect([jpeg.bytes[0], jpeg.bytes[1]]).toEqual([0xff, 0xd8]);

  const svg = await exportAs(page, 'SVG');
  const text = svg.bytes.toString('utf8');
  expect(svg.name).toBe('prueba.svg');
  expect(text).toContain('<ellipse');
  expect(text).toMatch(/<image[^>]+href="data:image\/png;base64,/); // self-contained
  expect(text).not.toContain('repositorios/');

  const pdf = await exportAs(page, 'PDF (A4)');
  expect(pdf.name).toBe('prueba.pdf');
  expect(pdf.bytes.subarray(0, 5).toString()).toBe('%PDF-');
  expect(pdf.bytes.toString('latin1')).toContain('/MediaBox [0 0 595.28 841.89]');
});

test('saves a .tonga project and opens it again (prompt §16)', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('button', { name: 'Añadir texto' }).click();
  await page.getByRole('button', { name: 'Añadir triángulo' }).click();
  const saved = await downloadFrom(page, () => page.getByRole('button', { name: 'Guardar' }).click());
  expect(saved.name).toMatch(/\.tonga$/);
  const project = JSON.parse(saved.bytes.toString('utf8'));
  expect(project).toMatchObject({ format: 'tonga', version: 1 });

  await page.getByRole('button', { name: 'Nuevo' }).click();
  await page.getByRole('dialog', { name: 'Nuevo dibujo' }).getByRole('button', { name: 'Crear' }).click();
  await expect(layers(page)).toHaveCount(0);
  await page.locator('#file-project').setInputFiles({ name: saved.name, mimeType: 'application/json', buffer: saved.bytes });
  await expect(layers(page)).toHaveText(['Triángulo 1', 'Texto 1']);
});

test('imports a PNG with a real file upload', async ({ page }) => {
  await newDrawing(page);
  await page.locator('#file-image').setInputFiles('test/fixtures/legacy/export.png');
  await expect(layers(page)).toHaveText(['export']);
});

test('reopens a drawing exported by Tonga 1 with its background (RULE-046)', async ({ page }) => {
  await newDrawing(page);
  await page.locator('#file-image').setInputFiles('test/fixtures/legacy/export.svg');
  await expect(page.getByText('Dibujo de Tonga 1')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(inspector(page).getByLabel('Ancho del lienzo')).toHaveValue('2000');
  await expect(inspector(page).getByLabel('Alto del lienzo')).toHaveValue('1335');
  await expect(layers(page)).toHaveCount(1);
});

test('works with the keyboard only: add, move, delete, undo (RULE-100)', async ({ page }) => {
  await newDrawing(page);
  await page.keyboard.press('r');
  await expect(layers(page)).toHaveText(['Rectángulo 1']);
  const x = Number(await inspector(page).getByLabel('X', { exact: true }).inputValue());
  await page.locator('body').press('Shift+ArrowRight');
  await expect(inspector(page).getByLabel('X', { exact: true })).toHaveValue(String(x + 10));
  await page.locator('body').press('Delete');
  await expect(layers(page)).toHaveCount(0);
  await page.locator('body').press('ControlOrMeta+z');
  await expect(layers(page)).toHaveText(['Rectángulo 1']);

  // Typing in a field never triggers shortcuts.
  await layers(page).first().click();
  await inspector(page).getByLabel('Nombre', { exact: true }).fill('r');
  await inspector(page).getByLabel('Nombre', { exact: true }).press('Backspace');
  await expect(layers(page)).toHaveCount(1);
});

test('recovers an autosaved drawing after a reload, only when asked', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('button', { name: 'Añadir elipse' }).click();
  await page.waitForTimeout(2000); // autosave debounce
  await page.reload();
  const ask = page.getByRole('dialog', { name: 'Hay un dibujo sin guardar' });
  await expect(ask).toBeVisible();
  await ask.getByRole('button', { name: 'Recuperar' }).click();
  await expect(layers(page)).toHaveText(['Elipse 1']);
});

test('shows the properties panel as a drawer on a phone', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await newDrawing(page);
  await page.getByRole('button', { name: 'Añadir texto' }).click();
  await expect(page.locator('#sidepanel')).toBeHidden();
  await page.getByRole('button', { name: 'Mostrar propiedades y capas' }).click();
  await expect(inspector(page).getByLabel('Texto', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar panel' }).click();
  await expect(page.locator('#sidepanel')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Exportar' })).toBeInViewport();
});
