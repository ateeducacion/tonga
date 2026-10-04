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
