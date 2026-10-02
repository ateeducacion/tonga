// Generates public/og-image.jpg (1200x630, the size WhatsApp, Telegram and social networks expect)
// by building a real scene in the app. Run after `npm run build`: node scripts/make-og-image.mjs
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { statSync } from 'node:fs';

const PORT = 4195;
const server = spawn('node', ['scripts/serve.mjs', String(PORT)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));

const browser = await chromium.launch();
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1, colorScheme: 'light' });
  await page.goto(`http://127.0.0.1:${PORT}/`);
  const create = page.getByRole('dialog', { name: 'Nuevo dibujo' });
  await create.getByText('Presentación 16:9').click();
  await create.getByRole('button', { name: 'Crear' }).click();

  const library = page.getByRole('dialog', { name: 'Biblioteca' });
  const fromLibrary = async (query, title, asBackground = false) => {
    await page.getByRole('button', { name: 'Abrir la biblioteca de imágenes' }).click();
    await library.getByLabel('Buscar en la biblioteca').fill(query);
    await library.locator('#library-grid').getByRole('option', { name: title, exact: true }).first().click();
    await library.getByRole('button', { name: asBackground ? 'Usar como fondo' : 'Añadir al lienzo' }).click();
    await page.waitForTimeout(400);
  };
  const place = async (x, y, width) => {
    const insp = page.locator('#inspector');
    if (width) await insp.getByLabel('Ancho', { exact: true }).fill(String(width));
    await insp.getByLabel('X', { exact: true }).fill(String(x));
    await insp.getByLabel('Y', { exact: true }).fill(String(y));
  };

  await fromLibrary('laboratorio', 'Laboratorio', true);
  await fromLibrary('abubilla', 'Abubilla');
  await place(1560, 610, 520);
  await fromLibrary('canario serinus', 'Canario serinus canaria');
  await place(330, 690, 380);

  await page.getByRole('button', { name: 'Añadir texto' }).click();
  const insp = page.locator('#inspector');
  await insp.getByLabel('Texto', { exact: true }).fill('¡Dibuja y aprende!');
  await insp.getByLabel('Tamaño').fill('120');
  await insp.getByLabel('Negrita').check();
  await insp.getByLabel('Color del texto (hexadecimal)').fill('#b9480f');
  await insp.getByLabel('Color del texto (hexadecimal)').press('Enter');
  await place(960, 170);

  // Clean frame: nothing selected, no toasts, page not scrolled by the inspector inputs.
  await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : undefined));
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    document.querySelectorAll('.toast').forEach((t) => t.remove());
    document.scrollingElement?.scrollTo(0, 0);
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'public/og-image.jpg', type: 'jpeg', quality: 82 });
  console.log(`public/og-image.jpg: ${statSync('public/og-image.jpg').size} bytes`);
} finally {
  await browser.close();
  server.kill();
}
