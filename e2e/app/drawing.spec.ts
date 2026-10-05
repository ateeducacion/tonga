// Drawing tools added in 2.3.3: pencil options, styles, snapping, connectors and the rest.
import type { Page } from '@playwright/test';
import { Buffer } from 'node:buffer';
import { zip } from '../../src/export/zip';
import { addShape, expect, layers, newDrawing, test } from './fixtures';

const inspector = (page: Page) => page.locator('#inspector');

/** Drags on the canvas between two points given as fractions of its size. */
async function drag(page: Page, from: [number, number], to: [number, number], steps = 8): Promise<void> {
  const box = await page.locator('canvas.upper-canvas').boundingBox();
  if (!box) throw new Error('no canvas');
  await page.mouse.move(box.x + box.width * from[0], box.y + box.height * from[1]);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * to[0], box.y + box.height * to[1], { steps });
  await page.mouse.up();
}

test('the pencil has colour, width and a straight mode, kept for the next strokes', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('radio', { name: 'Dibujo libre' }).click();
  const colour = inspector(page).getByRole('group', { name: 'Color del lápiz' });
  await colour.getByRole('button', { name: 'Azul' }).click();
  await expect(colour.getByRole('button', { name: 'Azul' })).toHaveAttribute('aria-pressed', 'true');
  await inspector(page).getByRole('button', { name: 'Grueso (8 px)' }).click();
  await drag(page, [0.2, 0.3], [0.4, 0.5]);
  await expect(layers(page)).toHaveText(['Trazo 1']);

  await inspector(page).getByRole('button', { name: 'Recta' }).click();
  await drag(page, [0.2, 0.7], [0.6, 0.7]);
  await expect(layers(page)).toHaveText(['Línea 1', 'Trazo 1']);

  await page.getByRole('radio', { name: 'Seleccionar' }).click();
  await page.getByRole('radio', { name: 'Dibujo libre' }).click();
  await expect(inspector(page).getByRole('button', { name: 'Recta' })).toHaveAttribute('aria-pressed', 'true');
  await expect(colour.getByRole('button', { name: 'Azul' })).toHaveAttribute('aria-pressed', 'true');
});

test('text can be underlined; shapes get a shadow; a new shape reuses the last style', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('button', { name: 'Añadir texto' }).click();
  const underline = inspector(page).getByRole('button', { name: 'Subrayado' });
  await underline.click();
  await expect(underline).toHaveAttribute('aria-pressed', 'true');

  await addShape(page, 'rectángulo');
  await inspector(page).getByRole('group', { name: 'Relleno' }).getByRole('button', { name: 'Azul' }).click();
  await inspector(page).locator('summary', { hasText: 'Sombra' }).click(); // folded by default
  await inspector(page).getByLabel('Sombra', { exact: true }).check();
  await inspector(page).getByLabel('Difuminado').fill('30');
  await expect(inspector(page).locator('[data-output="shadowBlur"]')).toHaveText('30');

  await addShape(page, 'estrella');
  await expect(inspector(page).getByRole('group', { name: 'Relleno' }).getByRole('button', { name: 'Azul' })).toHaveAttribute('aria-pressed', 'true');
  await expect(inspector(page).getByLabel('Sombra', { exact: true })).toBeChecked();
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(layers(page)).toHaveText(['Rectángulo 1', 'Texto 1']);
});

/** Fires the paste event a browser sends after Ctrl+V, with what another app copied. */
async function pasteFromAnotherApp(page: Page, content: { png?: string; text?: string }): Promise<void> {
  await page.evaluate(async ({ png, text }) => {
    const data = new DataTransfer();
    if (png) data.items.add(new File([await (await fetch(png)).blob()], 'captura.png', { type: 'image/png' }));
    if (text) data.setData('text/plain', text);
    // Firefox ignores clipboardData in the constructor, so it is set on the event itself.
    const event = new ClipboardEvent('paste', { bubbles: true, cancelable: true });
    Object.defineProperty(event, 'clipboardData', { value: data });
    document.body.dispatchEvent(event);
  }, content);
}

test('an image or text copied in another app is pasted onto the canvas', async ({ page }) => {
  await newDrawing(page);
  const png = await page.evaluate(() => {
    const c = document.createElement('canvas');
    c.width = 30;
    c.height = 20;
    (c.getContext('2d') as CanvasRenderingContext2D).fillRect(0, 0, 30, 20);
    return c.toDataURL('image/png');
  });
  await pasteFromAnotherApp(page, { png });
  await expect(layers(page)).toHaveText(['captura']);
  await pasteFromAnotherApp(page, { text: 'Fotosíntesis' });
  await expect(layers(page)).toHaveText(['Texto 1', 'captura']);
  await expect(inspector(page).getByLabel('Texto', { exact: true })).toHaveValue('Fotosíntesis');

  // Copied inside Tonga: Ctrl+V pastes the objects, as before.
  await page.keyboard.press('ControlOrMeta+C');
  await page.keyboard.press('ControlOrMeta+V');
  await expect(layers(page)).toHaveText(['Texto 2', 'Texto 1', 'captura']);
});

test('snapping to other objects and to the grid can be switched on and off, and stays so', async ({ page }) => {
  await newDrawing(page);
  const objects = inspector(page).getByLabel('Ajustar a otros objetos');
  const grid = inspector(page).getByLabel('Ajustar a la rejilla');
  await expect(objects).not.toBeChecked(); // off by default
  await expect(grid).not.toBeChecked();
  await expect(inspector(page).getByText('Mostrar rejilla')).toHaveCount(0);
  await objects.check();
  await grid.check();
  await addShape(page, 'rectángulo');
  await drag(page, [0.5, 0.5], [0.6, 0.6]); // a drag shows the grid and snaps to it
  await page.keyboard.press('Escape');
  await expect(inspector(page).getByLabel('Ajustar a otros objetos')).toBeChecked();
  await expect(inspector(page).getByLabel('Ajustar a la rejilla')).toBeChecked();
});

test('two objects are joined by a connector; a double click writes inside a shape', async ({ page }) => {
  await newDrawing(page);
  await addShape(page, 'rectángulo');
  await page.keyboard.press('Shift+ArrowLeft'); // nudge it away from the second one
  for (let i = 0; i < 20; i++) await page.keyboard.press('Shift+ArrowLeft');
  await addShape(page, 'elipse');
  for (let i = 0; i < 20; i++) await page.keyboard.press('Shift+ArrowRight');
  await page.keyboard.press('ControlOrMeta+A');
  await inspector(page).getByRole('button', { name: 'Conectar con flecha' }).click();
  await expect(layers(page)).toHaveText(['Elipse 1', 'Rectángulo 1', 'Conector 1']);
  await expect(inspector(page).getByRole('button', { name: 'Punta de flecha' })).toHaveAttribute('aria-pressed', 'true');
  await inspector(page).getByRole('button', { name: 'Punta de flecha' }).click();
  await expect(inspector(page).getByRole('button', { name: 'Punta de flecha' })).toHaveAttribute('aria-pressed', 'false');

  // The ellipse sits right of the centre: double-click it and type.
  const box = await page.locator('canvas.upper-canvas').boundingBox();
  if (!box) throw new Error('no canvas');
  await page.keyboard.press('Escape');
  await page.mouse.dblclick(box.x + box.width / 2 + box.width * 0.18, box.y + box.height / 2);
  await page.keyboard.type('Oxígeno');
  await expect(layers(page)).toHaveText(['Texto 1', 'Elipse 1', 'Rectángulo 1', 'Conector 1']); // just above its shape
  await expect(inspector(page).getByLabel('Texto', { exact: true })).toHaveValue('Oxígeno');
});

test('an image is cropped with the mouse, and takes the new filters', async ({ page }) => {
  await newDrawing(page); // A4 landscape, 1123 px wide
  await page.locator('#file-image').setInputFiles('test/fixtures/import/white-frame.png'); // 120×80, at the centre
  const image = inspector(page).getByRole('group', { name: 'Imagen' });
  await image.getByRole('button', { name: 'Recortar con el ratón' }).click();
  await expect(inspector(page).getByRole('button', { name: 'Aplicar el recorte' })).toBeVisible();
  const box = await page.locator('canvas.upper-canvas').boundingBox();
  if (!box) throw new Error('no canvas');
  const zoom = box.width / 1123;
  const [cx, cy] = [box.x + box.width / 2, box.y + box.height / 2];
  await page.mouse.move(cx + 60 * zoom, cy); // the frame's right handle
  await page.mouse.down();
  await page.mouse.move(cx, cy, { steps: 6 });
  await page.mouse.up();
  await inspector(page).getByRole('button', { name: 'Aplicar el recorte' }).click();
  await image.getByText('Recortar (% de cada lado)').click();
  await expect.poll(async () => Number(await image.getByLabel('Derecha').inputValue())).toBeGreaterThan(40);

  await image.getByRole('button', { name: 'Recortar con el ratón' }).click();
  await page.keyboard.press('Escape'); // cancels
  await expect(inspector(page).getByRole('group', { name: 'Imagen' })).toBeVisible();

  await image.getByLabel('Vintage').check();
  await image.getByLabel('Pixelado').fill('30');
  await expect(image.locator('[data-output="pixelate"]')).toHaveText('30');
});

test('a shape takes a two-colour gradient in three directions', async ({ page }) => {
  await newDrawing(page);
  await addShape(page, 'rectángulo');
  const second = inspector(page).getByRole('group', { name: 'Segundo color' });
  await expect(second).toBeHidden();
  await inspector(page).getByLabel('Degradado', { exact: true }).check();
  await expect(second).toBeVisible();
  await second.getByRole('button', { name: 'Morado' }).click();
  await inspector(page).getByRole('button', { name: 'Diagonal' }).click();
  await expect(inspector(page).getByRole('button', { name: 'Diagonal' })).toHaveAttribute('aria-pressed', 'true');
  await expect(second.getByRole('button', { name: 'Morado' })).toHaveAttribute('aria-pressed', 'true');
  await inspector(page).getByLabel('Degradado', { exact: true }).uncheck();
  await expect(second).toBeHidden();
});

test('the library has icons and symbols, credited to Lucide', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('button', { name: 'Abrir la biblioteca de imágenes' }).click();
  const library = page.getByRole('dialog', { name: 'Biblioteca' });
  await library.getByLabel('Colección').selectOption({ label: 'Material escolar' });
  await library.getByLabel('Buscar en la biblioteca').fill('colegio');
  const option = library.locator('#library-grid').getByRole('option');
  await expect(option).toHaveCount(1);
  await option.first().click();
  await expect(library).toContainText('Colegio · Material escolar · Lucide Icons and Contributors, ISC');
  await library.getByRole('button', { name: 'Añadir al lienzo' }).click();
  await expect(layers(page)).toHaveText(['Colegio']);
});

test('a new drawing can start from a template, all of it editable', async ({ page }) => {
  await page.goto('./');
  const dialog = page.getByRole('dialog', { name: 'Nuevo dibujo' });
  await dialog.getByLabel('Plantilla').selectOption({ label: 'Mapa conceptual' });
  await dialog.getByRole('button', { name: 'Crear' }).click();
  await expect(page.getByText('con la plantilla «Mapa conceptual»').first()).toBeVisible();
  await expect(layers(page).filter({ hasText: /^Idea principal$/ })).toHaveCount(1);
  await expect(layers(page).filter({ hasText: 'Texto de Idea 1' })).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Deshacer' })).toBeDisabled(); // a fresh document
});

test('a resource cover template has a title to edit and a library image', async ({ page }) => {
  await page.goto('./');
  const dialog = page.getByRole('dialog', { name: 'Nuevo dibujo' });
  await dialog.getByText('Presentación 16:9').click();
  await dialog.getByLabel('Plantilla').selectOption({ label: 'Portada de recurso (panel lateral)' });
  await dialog.getByRole('button', { name: 'Crear' }).click();
  await page.getByRole('tab', { name: /Capas/ }).click();
  await expect(layers(page).filter({ hasText: /^Imagen$/ })).toHaveCount(1);
  await page.getByRole('button', { name: /^Título/ }).first().click();
  await page.getByRole('tab', { name: 'Propiedades' }).click();
  await inspector(page).getByLabel('Texto', { exact: true }).fill('¿Qué es un volcán?');
  await expect(inspector(page).getByLabel('Texto', { exact: true })).toHaveValue('¿Qué es un volcán?');
});

test('an eXeLearning block with one slide opens directly as a drawing', async ({ page }) => {
  await newDrawing(page);
  await page.locator('#file-project').setInputFiles('test/fixtures/import/portada-volcan.block');
  await expect(page.getByText('Diapositiva «Diapositiva» abierta.').first()).toBeVisible();
  await page.getByRole('tab', { name: /Capas/ }).click();
  await expect(layers(page)).toHaveCount(41);
  await expect(layers(page).filter({ hasText: /^Texto 1$/ })).toHaveCount(1);
});

test('an eXeLearning project with several slides asks which one to open', async ({ page }) => {
  const slide = (text: string, colour: string) => JSON.stringify({
    engine: 'fabric', width: 800, height: 450, background: colour,
    fabric: { objects: [{ type: 'Textbox', left: 400, top: 225, width: 300, text, fontSize: 40 }] },
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 450"><rect width="800" height="450" fill="${colour}"/></svg>`,
  });
  const component = (page: string, json: string) => `<odeComponent><odePageId>${page}</odePageId><odeIdeviceTypeName>slide</odeIdeviceTypeName><jsonProperties><![CDATA[${json}]]></jsonProperties></odeComponent>`;
  const xml = `<?xml version="1.0"?><ode><odeNavStructures><odeNavStructure><odePageId>p1</odePageId><pageName>Portada</pageName></odeNavStructure><odeNavStructure><odePageId>p2</odePageId><pageName>Actividad</pageName></odeNavStructure></odeNavStructures>${component('p1', slide('Bienvenida', '#fde68a'))}${component('p2', slide('Ejercicio', '#bfdbfe'))}</ode>`;
  await newDrawing(page);
  await page.locator('#file-project').setInputFiles({ name: 'curso.elpx', mimeType: 'application/zip', buffer: Buffer.from(zip({ 'content.xml': xml })) });
  const dialog = page.getByRole('dialog', { name: '¿Qué diapositiva abres?' });
  await expect(dialog.getByRole('radio')).toHaveCount(2);
  await expect(dialog.getByRole('radio', { name: /Portada/ })).toBeChecked();
  await dialog.getByRole('radio', { name: /Actividad/ }).check();
  await dialog.getByRole('button', { name: 'Abrir' }).click();
  await expect(page.getByText('Diapositiva «Actividad» abierta.').first()).toBeVisible();
  await page.getByRole('tab', { name: /Capas/ }).click();
  await page.getByRole('button', { name: /^Texto 1/ }).click();
  await page.getByRole('tab', { name: 'Propiedades' }).click();
  await expect(inspector(page).getByLabel('Texto', { exact: true })).toHaveValue('Ejercicio');

  // Cancelling keeps the drawing that was open.
  await page.locator('#file-project').setInputFiles({ name: 'curso.elpx', mimeType: 'application/zip', buffer: Buffer.from(zip({ 'content.xml': xml })) });
  await dialog.getByRole('button', { name: 'Cancelar' }).click();
  await expect(dialog).toBeHidden();
  await page.getByRole('tab', { name: /Capas/ }).click();
  await expect(layers(page)).toHaveText(['Texto 1']);
});

test('a file dropped on «Nuevo dibujo» opens', async ({ page }) => {
  const json = JSON.stringify({
    engine: 'fabric', width: 800, height: 450, background: '#fde68a',
    fabric: { objects: [{ type: 'Textbox', left: 400, top: 225, width: 300, text: 'Hola', fontSize: 40 }] },
  });
  const xml = `<?xml version="1.0"?><ode><odeNavStructures><odeNavStructure><odePageId>p1</odePageId><pageName>Portada</pageName></odeNavStructure></odeNavStructures><odeComponent><odePageId>p1</odePageId><odeIdeviceTypeName>slide</odeIdeviceTypeName><jsonProperties><![CDATA[${json}]]></jsonProperties></odeComponent></ode>`;
  await page.goto('./');
  const dialog = page.getByRole('dialog', { name: 'Nuevo dibujo' });
  await expect(dialog).toBeVisible();
  await page.evaluate((bytes) => {
    const data = new DataTransfer();
    data.items.add(new File([new Uint8Array(bytes)], 'curso.elpx', { type: 'application/zip' }));
    const event = new DragEvent('drop', { bubbles: true, cancelable: true });
    // Firefox ignores dataTransfer in the constructor, so it is set on the event itself.
    Object.defineProperty(event, 'dataTransfer', { value: data });
    document.getElementById('dlg-new')?.dispatchEvent(event);
  }, [...zip({ 'content.xml': xml })]);
  await expect(dialog).toBeHidden();
  await expect(page.getByText('Diapositiva «Portada» abierta.').first()).toBeVisible();
  await page.getByRole('tab', { name: /Capas/ }).click();
  await expect(layers(page)).toHaveText(['Texto 1']);
});

test('several layers are chosen with Ctrl or Shift + click and combined into one', async ({ page }) => {
  await newDrawing(page);
  await addShape(page, 'rectángulo');
  await addShape(page, 'elipse');
  await page.getByRole('button', { name: 'Añadir texto' }).click();
  await page.getByRole('tab', { name: /Capas/ }).click();
  const bar = page.getByRole('group', { name: 'Capas seleccionadas' });
  await expect(bar).toBeHidden();
  await expect(page.getByText('Ctrl o Mayús + clic para elegir varias capas')).toBeVisible();

  await page.getByRole('button', { name: /^Rectángulo 1/ }).click({ modifiers: ['ControlOrMeta'] });
  await expect(bar).toContainText('2 capas seleccionadas');
  await page.getByRole('button', { name: /^Elipse 1/ }).focus();
  await page.keyboard.press('Shift+Enter'); // the keyboard way
  await expect(bar).toContainText('3 capas seleccionadas');
  await page.getByRole('button', { name: /^Texto 1/ }).click({ modifiers: ['Shift'] }); // and out again
  await expect(bar).toContainText('2 capas seleccionadas');

  await bar.getByRole('button', { name: 'Combinar capas' }).click();
  await expect(layers(page)).toHaveText(['Texto 1', 'Grupo 1']);
  await expect(bar).toBeHidden();
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(layers(page)).toHaveText(['Texto 1', 'Elipse 1', 'Rectángulo 1']);
});

test('objects selected on the canvas are combined with one visible button', async ({ page }) => {
  await newDrawing(page);
  await addShape(page, 'rectángulo');
  await addShape(page, 'estrella');
  await page.keyboard.press('ControlOrMeta+A');
  await inspector(page).getByRole('button', { name: 'Combinar 2 objetos en una capa' }).click();
  await page.getByRole('tab', { name: /Capas/ }).click();
  await expect(layers(page)).toHaveText(['Grupo 1']);
});

test('arrow lines take a dashed or dotted style; three objects spread evenly', async ({ page }) => {
  await newDrawing(page);
  await addShape(page, 'línea con flecha');
  await expect(layers(page)).toHaveText(['Línea con flecha 1']);
  await expect(inspector(page).getByRole('group', { name: 'Relleno' })).toHaveCount(0);
  const dashed = inspector(page).getByRole('button', { name: 'Línea discontinua' });
  await dashed.click();
  await expect(dashed).toHaveAttribute('aria-pressed', 'true');
  await addShape(page, 'base de datos');
  await addShape(page, 'documento');
  await page.keyboard.press('ControlOrMeta+A');
  await inspector(page).locator('summary', { hasText: 'Posición, tamaño y alineación' }).click();
  await inspector(page).getByRole('button', { name: 'Alinear a la izquierda' }).click();
  await inspector(page).getByRole('button', { name: 'Distribuir en vertical' }).click();
  await expect(page.getByRole('button', { name: 'Deshacer' })).toBeEnabled();
  await expect(inspector(page).getByRole('button', { name: 'Distribuir en horizontal' })).toBeVisible();
});
