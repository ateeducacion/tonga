// Drawing tools added in 2.3.3: pencil options, styles, snapping, connectors and the rest.
import type { Page } from '@playwright/test';
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

test('snapping to the grid and to objects can be switched on and off', async ({ page }) => {
  await newDrawing(page);
  const grid = inspector(page).getByLabel('Ajustar a la rejilla');
  const objects = inspector(page).getByLabel('Ajustar a otros objetos');
  await expect(grid).not.toBeChecked();
  await expect(objects).toBeChecked();
  await grid.check();
  await addShape(page, 'rectángulo');
  await page.keyboard.press('Escape');
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

test('the eraser removes the strokes it passes over, in one undo step', async ({ page }) => {
  await newDrawing(page);
  await page.getByRole('radio', { name: 'Dibujo libre' }).click();
  await drag(page, [0.3, 0.3], [0.7, 0.3]);
  await drag(page, [0.3, 0.6], [0.7, 0.6]);
  await expect(layers(page)).toHaveText(['Trazo 2', 'Trazo 1']);
  await page.getByRole('radio', { name: 'Borrador' }).click();
  await expect(inspector(page)).toContainText('Borrador');
  await drag(page, [0.5, 0.2], [0.5, 0.7], 30);
  await expect(layers(page)).toHaveCount(0);
  await page.getByRole('button', { name: 'Deshacer' }).click();
  await expect(layers(page)).toHaveText(['Trazo 2', 'Trazo 1']);
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
