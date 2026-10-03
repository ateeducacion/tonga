// Human-review gallery (not a blocking test): screenshots of the main screens in four viewports,
// written to docs/screenshots/. Run with `npm run visual`.
import { test, expect } from '@playwright/test';

const VIEWPORTS = { desktop: [1600, 900], laptop: [1366, 768], tablet: [1024, 1366], phone: [390, 844] } as const;

for (const [name, [width, height]] of Object.entries(VIEWPORTS)) {
  test(`gallery ${name}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto('./');
    await expect(page.getByRole('dialog', { name: 'Nuevo dibujo' })).toBeVisible();
    await page.screenshot({ path: `docs/screenshots/${name}-1-new.png` });
    await page.getByRole('button', { name: 'Crear' }).click();
    await page.getByRole('button', { name: 'Abrir la biblioteca de imágenes' }).click();
    await page.getByLabel('Colección').selectOption({ label: 'Aves' });
    await expect(page.locator('#library-grid img').first()).toBeVisible();
    await page.waitForTimeout(500);
    await page.screenshot({ path: `docs/screenshots/${name}-2-library.png` });
    await page.getByLabel('Buscar en la biblioteca').fill('cuervo volando');
    await expect(page.locator('#library-grid [role="option"]')).toHaveCount(1);
    await page.locator('#library-grid [role="option"]').first().dblclick();
    await page.getByRole('button', { name: 'Añadir texto' }).click();
    const phone = name === 'phone';
    if (phone) await page.getByRole('tab', { name: 'Propiedades' }).click();
    await page.locator('#inspector textarea').fill('El cuervo canario');
    if (phone) await page.getByRole('button', { name: 'Ocultar panel' }).click();
    await page.waitForTimeout(300);
    await page.screenshot({ path: `docs/screenshots/${name}-3-editor.png` });
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.waitForTimeout(200);
    await page.screenshot({ path: `docs/screenshots/${name}-4-dark.png` });
  });
}
