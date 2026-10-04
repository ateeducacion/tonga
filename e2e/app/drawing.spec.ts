// Drawing tools added in 2.3.3: pencil options, styles, snapping, connectors and the rest.
import type { Page } from '@playwright/test';
import { expect, layers, newDrawing, test } from './fixtures';

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
