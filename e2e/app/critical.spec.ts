// Critical user flows of the rebuilt app (prompt §41, brief §5 behaviour contract).
import { readFile, writeFile } from 'node:fs/promises';
import type { Page } from '@playwright/test';
import { addShape, expect, layers, newDrawing, test } from './fixtures';

const inspector = (page: Page) => page.locator('#inspector');

async function downloadFrom(page: Page, trigger: () => Promise<void>) {
  const pending = page.waitForEvent('download'); // listener before the click
  await trigger();
  const file = await pending;
  return { name: file.suggestedFilename(), bytes: await readFile(await file.path()) };
}

async function exportAs(page: Page, format: 'PNG' | 'JPEG' | 'SVG' | 'PDF (A4)' | 'eXeLearning', filename = 'prueba') {
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
  await addShape(page, 'rectángulo');
  await expect(layers(page)).toHaveText(['Rectángulo 1', 'Texto 1']);

  // Colour via the accessible hex field, position, size and rotation via the inspector.
  await inspector(page).getByLabel('Relleno: otro color').fill('#336699');
  await inspector(page).getByText('Posición, tamaño y alineación').click(); // folded by default
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
  await expect(library.locator('#library-grid img').first()).toHaveAttribute('src', /thumbnails\/.+\.png\?v=[0-9a-f]{12}$/);
  await library.getByRole('button', { name: 'Añadir al lienzo' }).click();
  await expect(layers(page)).toHaveText(['Cuervo canario volando']);
  // The image loads from a versioned URL, but the document keeps the canonical path.
  const saved = await downloadFrom(page, () => page.getByRole('button', { name: 'Guardar' }).click());
  expect(JSON.parse(saved.bytes.toString('utf8')).layers[0].object.src).toMatch(/^repositorios\/aves\/[^?]+\.png$/);

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
  await addShape(page, 'elipse');
  await page.getByRole('button', { name: 'Abrir la biblioteca de imágenes' }).click();
  await page.getByLabel('Buscar en la biblioteca').fill('cuervo volando');
  await expect(page.locator('#library-grid').getByRole('option')).toHaveCount(1);
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

test('exports an eXeLearning package with an editable Slide, the screenshot and the base theme', async ({ page }, info) => {
  await newDrawing(page, 'Cuadrado');
  await addShape(page, 'elipse');
  await page.getByRole('button', { name: 'Abrir la biblioteca de imágenes' }).click();
  await page.getByLabel('Buscar en la biblioteca').fill('cuervo volando');
  await page.locator('#library-grid').getByRole('option').first().dblclick();
  await expect(layers(page)).toHaveCount(2);

  // Raster-only options are hidden for this format (and for PDF).
  await page.getByRole('button', { name: 'Exportar' }).click();
  const dialog = page.getByRole('dialog', { name: 'Exportar' });
  for (const format of ['eXeLearning', 'PDF (A4)']) {
    await dialog.getByLabel(format, { exact: true }).check();
    for (const option of ['Escala', 'Calidad JPEG', 'Fondo transparente (si el lienzo no tiene fondo)']) await expect(dialog.getByLabel(option)).toBeHidden();
  }
  await dialog.getByRole('button', { name: 'Cancelar' }).click();

  const elpx = await exportAs(page, 'eXeLearning');
  await writeFile(info.outputPath(elpx.name), elpx.bytes); // kept for manual checks in eXeLearning
  expect(elpx.name).toBe('prueba.elpx');
  expect(elpx.bytes.readUInt32LE(0)).toBe(0x04034b50); // ZIP
  const listing = elpx.bytes.toString('latin1');
  for (const f of ['content.xml', 'content.dtd', 'screenshot.png', 'content/resources/imagen-1.png', 'theme/config.xml', 'theme/img/icons.png']) expect(listing).toContain(f);
  // Stored entries: the theme files travel byte for byte, not reprocessed by the build.
  expect(elpx.bytes.includes(await readFile('vendor/exelearning/theme/style.css'))).toBe(true);
  expect(listing).toContain('<odeIdeviceTypeName>slide</odeIdeviceTypeName>');
  expect(listing).toMatch(/"engine":"fabric".*"type":"Ellipse"/s);
  expect(listing).toContain('"src":"{{context_path}}/content/resources/imagen-1.png"');
});

test('saves a .tonga project and opens it again (prompt §16)', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('button', { name: 'Añadir texto' }).click();
  await addShape(page, 'triángulo');
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
  await page.getByRole('tab', { name: /Capas/ }).click();
  await layers(page).first().click();
  await page.getByRole('tab', { name: 'Capas 1' }).press('ArrowLeft'); // back to Propiedades with the keyboard
  await expect(page.getByRole('tab', { name: 'Propiedades' })).toHaveAttribute('aria-selected', 'true');
  await inspector(page).getByLabel('Nombre', { exact: true }).fill('r');
  await inspector(page).getByLabel('Nombre', { exact: true }).press('Backspace');
  await expect(layers(page)).toHaveCount(1);
});

test('recovers an autosaved drawing after a reload, only when asked', async ({ page }) => {
  await newDrawing(page);
  await addShape(page, 'elipse');
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

test('status messages never cover the phone tool bar', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await newDrawing(page);
  await expect(page.locator('.toast').first()).toBeVisible(); // «Nuevo dibujo…» is still on screen
  await addShape(page, 'rectángulo', { timeout: 2000 });
  await expect(layers(page)).toHaveCount(1);
});

test('a freshly opened or created drawing has no unsaved changes', async ({ page }) => {
  await page.goto('./');
  await expect(page).toHaveTitle('Sin título · Tonga');
  await page.getByRole('dialog', { name: 'Nuevo dibujo' }).getByRole('button', { name: 'Crear' }).click();
  await expect(page).toHaveTitle('Sin título · Tonga');
  await page.getByRole('button', { name: 'Añadir texto' }).click();
  await expect(page).toHaveTitle('• Sin título · Tonga');
});

test('crops and adjusts an image from the inspector, undoably', async ({ page }) => {
  await newDrawing(page);
  await page.locator('#file-image').setInputFiles('test/fixtures/legacy/export.png');
  await expect(layers(page)).toHaveText(['export']);
  const image = page.getByRole('group', { name: 'Imagen' });
  const width = Number(await inspector(page).getByLabel('Ancho', { exact: true }).inputValue());

  await image.getByText('Recortar (% de cada lado)').click(); // folded by default
  await image.getByLabel('Izquierda').fill('25');
  await image.getByLabel('Derecha').fill('25');
  await expect(inspector(page).getByLabel('Ancho', { exact: true })).toHaveValue(String(Math.round(width / 2)));

  await image.getByLabel('Escala de grises').check();
  await image.getByLabel('Brillo').fill('40');
  await expect(image.getByText('40', { exact: true })).toBeVisible(); // the value next to the label

  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(image.getByLabel('Brillo')).toHaveValue('0');
  await expect(image.getByLabel('Escala de grises')).toBeChecked();

  await image.getByRole('button', { name: 'Quitar recorte y ajustes' }).click();
  await expect(image.getByLabel('Escala de grises')).not.toBeChecked();
  await expect(inspector(page).getByLabel('Ancho', { exact: true })).toHaveValue(String(width));
});

test('Info shows the source link, legal notices and a licences panel; nothing is pinned to the screen (RULE-099/111)', async ({ page }) => {
  await newDrawing(page);
  await expect(page.locator('body > footer')).toHaveCount(0);
  await page.getByRole('button', { name: 'Información, licencias y aviso legal' }).click();
  const about = page.getByRole('dialog', { name: 'Acerca de Tonga' });
  // The release commit bumps package.json, so main shows the new number before the tag exists.
  const { version } = JSON.parse(await readFile('package.json', 'utf8')) as { version: string };
  await expect(page.locator('#about-version')).toHaveText(version);
  await expect(page.locator('#about-version')).toHaveAttribute('title', new RegExp(`^Compilación ${version.replaceAll('.', '\\.')}\\+[0-9a-f]{7,}$`));
  await expect(about.getByRole('link', { name: /Código fuente en GitHub/ })).toHaveAttribute('href', 'https://github.com/ateeducacion/tonga');
  await expect(about.getByRole('link', { name: /Aviso legal/ })).toHaveAttribute('href', /gobiernodecanarias\.org/);
  await expect(about.getByRole('link', { name: /Política de privacidad/ })).toHaveAttribute('rel', 'noopener noreferrer');

  await about.getByRole('button', { name: 'Licencias' }).click();
  const licences = page.getByRole('dialog', { name: 'Licencias' });
  await expect(licences.getByText(/AGPL-3.0-or-later/)).toBeVisible();
  await expect(licences.getByRole('link', { name: 'CC BY-NC-SA 4.0' })).toBeVisible();
  await licences.getByRole('button', { name: 'Volver' }).click();
  await expect(licences).toBeHidden();
  await expect(about).toBeVisible();
});

test('the side panel shows Propiedades or Capas as tabs', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('button', { name: 'Añadir texto' }).click();
  await addShape(page, 'elipse');
  const props = page.getByRole('tab', { name: 'Propiedades' });
  const capas = page.getByRole('tab', { name: 'Capas 2' });
  await expect(props).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: 'Propiedades' })).toBeVisible();
  await expect(page.locator('#panel-layers')).toBeHidden();

  await props.focus();
  await page.keyboard.press('ArrowRight');
  await expect(capas).toBeFocused();
  await expect(capas).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tabpanel', { name: /Capas/ })).toBeVisible();
  await expect(layers(page)).toHaveText(['Elipse 1', 'Texto 1']);
  await page.keyboard.press('Home');
  await expect(props).toHaveAttribute('aria-selected', 'true');
});

test('colours: presets, transparent and the browser picker; stroke width as drawn lines; opacity slider', async ({ page }) => {
  await newDrawing(page);
  await addShape(page, 'rectángulo');
  const fill = inspector(page).getByRole('group', { name: 'Relleno', exact: true });
  await fill.getByRole('button', { name: 'Azul' }).click();
  // Exactly one swatch is marked as the current colour.
  await expect(fill.getByRole('button', { name: 'Azul' })).toHaveAttribute('aria-pressed', 'true');
  await expect(fill.locator('[aria-pressed="true"]')).toHaveCount(1);

  await fill.getByRole('button', { name: 'Transparente' }).click();
  await expect(fill.getByRole('button', { name: 'Transparente' })).toHaveAttribute('aria-pressed', 'true');
  await expect(fill.getByRole('button', { name: 'Azul' })).toHaveAttribute('aria-pressed', 'false');

  // Any other colour comes from the browser's picker and appears as a marked swatch of its own,
  // which stays there to come back to after choosing a preset.
  await fill.getByLabel('Relleno: otro color').fill('#123456');
  const custom = fill.getByRole('button', { name: 'Color personalizado #123456' });
  await expect(custom).toHaveAttribute('aria-pressed', 'true');
  await expect(fill.locator('[aria-pressed="true"]')).toHaveCount(1);
  await fill.getByRole('button', { name: 'Verde' }).click();
  await expect(custom).toHaveAttribute('aria-pressed', 'false');
  await custom.click();
  await expect(custom).toHaveAttribute('aria-pressed', 'true');

  const widths = inspector(page).getByRole('group', { name: 'Grosor del trazo' });
  await widths.getByRole('button', { name: /^Grueso/ }).click();
  await expect(widths.getByRole('button', { name: /^Grueso/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(inspector(page).getByLabel('Grosor exacto (px)')).toHaveValue('8');

  await inspector(page).getByLabel('Opacidad (%)').fill('40');
  await expect(inspector(page).getByText('40 %')).toBeVisible();
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(inspector(page).getByLabel('Opacidad (%)')).toHaveValue('100');
});

test('text: size with − and +, bold and alignment as toggles', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('button', { name: 'Añadir texto' }).click();
  const size = inspector(page).getByLabel('Tamaño', { exact: true });
  const before = Number(await size.inputValue());
  await inspector(page).getByRole('button', { name: 'Letra más grande' }).click();
  await expect(size).toHaveValue(String(before + 4));
  await inspector(page).getByRole('button', { name: 'Negrita' }).click();
  await expect(inspector(page).getByRole('button', { name: 'Negrita' })).toHaveAttribute('aria-pressed', 'true');
  await inspector(page).getByRole('button', { name: 'Alinear el texto a la derecha' }).click();
  await expect(inspector(page).getByRole('button', { name: 'Alinear el texto a la derecha' })).toHaveAttribute('aria-pressed', 'true');
  await expect(inspector(page).getByRole('button', { name: 'Centrar el texto' })).toHaveAttribute('aria-pressed', 'false');
});

test('the Formas menu adds predefined shapes with a fill, and closes with Escape', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('button', { name: 'Añadir forma' }).click();
  const menu = page.getByRole('group', { name: 'Formas' });
  await expect(menu.getByRole('heading')).toHaveText(['Formas', 'Flechas', 'Bocadillos']);
  await expect(menu.getByRole('button', { name: 'Añadir rectángulo', exact: true })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();

  await addShape(page, 'estrella');
  await expect(menu).toBeHidden();
  await addShape(page, 'bocadillo');
  await page.getByRole('tab', { name: /Capas/ }).click();
  await expect(layers(page)).toHaveText(['Bocadillo 1', 'Estrella 1']);
  await page.getByRole('tab', { name: 'Propiedades' }).click();
  await expect(inspector(page).getByRole('group', { name: 'Relleno', exact: true })).toBeVisible();
});

test('layers are renamed in place and reordered by dragging the grip', async ({ page }) => {
  await newDrawing(page);
  await addShape(page, 'rectángulo');
  await addShape(page, 'elipse');
  await page.getByRole('tab', { name: /Capas/ }).click();
  await expect(layers(page)).toHaveText(['Elipse 1', 'Rectángulo 1']);

  // Double click renames; Escape cancels; F2 renames by keyboard.
  await layers(page).first().dblclick();
  await page.getByLabel('Nombre de Elipse 1').fill('Un sol muy grande que brilla sobre las montañas');
  await page.getByLabel('Nombre de Elipse 1').press('Enter');
  // A long name truncates: the lock stays inside the panel.
  const panel = (await page.locator('#panel-layers').boundingBox())!;
  const lock = (await page.getByRole('button', { name: /^Bloquear Un sol/ }).boundingBox())!;
  expect(lock.x + lock.width).toBeLessThanOrEqual(panel.x + panel.width);
  await layers(page).first().press('F2');
  await page.getByLabel(/^Nombre de Un sol/).fill('Sol');
  await page.getByLabel(/^Nombre de Un sol/).press('Enter');
  await expect(layers(page)).toHaveText(['Sol', 'Rectángulo 1']);
  await layers(page).nth(1).press('F2');
  await page.getByLabel('Nombre de Rectángulo 1').fill('Nada');
  await page.getByLabel('Nombre de Rectángulo 1').press('Escape');
  await expect(layers(page)).toHaveText(['Sol', 'Rectángulo 1']);

  // Drag the bottom layer above the top one.
  const rows = page.locator('#layers .layer');
  await rows.nth(1).locator('.layer-grip').dragTo(rows.nth(0), { targetPosition: { x: 20, y: 2 } });
  await expect(layers(page)).toHaveText(['Rectángulo 1', 'Sol']);
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(layers(page)).toHaveText(['Sol', 'Rectángulo 1']);
});

test('right-click menu on the canvas; also with the Menu key (keyboard)', async ({ page }) => {
  await newDrawing(page);
  await addShape(page, 'rectángulo');
  await addShape(page, 'elipse');
  await page.getByRole('tab', { name: /Capas/ }).click();
  await expect(layers(page)).toHaveText(['Elipse 1', 'Rectángulo 1']);

  // Right-click the selected ellipse (centre of the canvas) and send it to the back.
  const canvas = page.locator('.upper-canvas');
  const box = (await canvas.boundingBox())!;
  await canvas.click({ button: 'right', position: { x: box.width / 2, y: box.height / 2 } });
  const menu = page.getByRole('menu', { name: 'Acciones' });
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: /Pegar/ })).toBeDisabled();
  await menu.getByRole('menuitem', { name: /Enviar al fondo/ }).click();
  await expect(menu).toBeHidden();
  await expect(layers(page)).toHaveText(['Rectángulo 1', 'Elipse 1']);

  // Keyboard: Menu key, arrows move inside the menu (not the object), Enter runs, Esc closes.
  await page.locator('body').press('ContextMenu');
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: /Cortar/ })).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(menu.getByRole('menuitem', { name: /Copiar/ })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await page.locator('body').press('Shift+F10');
  await menu.getByRole('menuitem', { name: /Duplicar/ }).press('Enter');
  await expect(layers(page)).toHaveCount(3);
});

test('a real right click keeps our menu open and never shows the browser menu', async ({ page }) => {
  await newDrawing(page);
  await page.evaluate(() => {
    (window as unknown as { nativeMenus: number }).nativeMenus = 0;
    window.addEventListener('contextmenu', (e) => {
      if (!e.defaultPrevented) (window as unknown as { nativeMenus: number }).nativeMenus++;
    });
  });
  const menu = page.getByRole('menu', { name: 'Acciones' });
  const canvas = page.locator('.upper-canvas');
  const box = (await canvas.boundingBox())!;
  const rightClick = async (x: number, y: number) => {
    await page.mouse.move(x, y);
    await page.mouse.down({ button: 'right' });
    await page.waitForTimeout(150);
    await page.mouse.up({ button: 'right' });
    await page.waitForTimeout(300);
  };

  // Empty canvas: the menu opens and stays open (it used to flash and close).
  await rightClick(box.x + 30, box.y + 30);
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: /Seleccionar todo/ })).toBeEnabled();
  await page.mouse.click(box.x + 5, box.y + box.height - 5); // a click outside closes it
  await expect(menu).toBeHidden();

  // On an object: only our menu.
  await addShape(page, 'rectángulo');
  await rightClick(box.x + box.width / 2, box.y + box.height / 2);
  await expect(menu).toBeVisible();
  await expect(menu.getByRole('menuitem', { name: /Borrar/ })).toBeEnabled();
  expect(await page.evaluate(() => (window as unknown as { nativeMenus: number }).nativeMenus)).toBe(0);
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
});
