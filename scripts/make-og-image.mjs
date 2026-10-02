// Renders the link-preview card (Open Graph / Twitter, 1200x630) into public/og-image.jpg:
// Tonga's name and logo plus a real capture of the app with a scene built from the library.
// Same visual family as the other ATE tools (e.g. elpx-optimizer's social card).
// Usage: npm run build && node scripts/make-og-image.mjs
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';

const PORT = 4195;
const dataUri = (file, mime) => `data:${mime};base64,${readFileSync(file).toString('base64')}`;
const server = spawn('node', ['scripts/serve.mjs', String(PORT)], { stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));

const browser = await chromium.launch();
try {
  // 1. A real capture of the editor with a classroom scene.
  const page = await browser.newPage({ viewport: { width: 1180, height: 720 }, deviceScaleFactor: 2, colorScheme: 'light', locale: 'es-ES' });
  await page.goto(`http://127.0.0.1:${PORT}/`);
  const create = page.getByRole('dialog', { name: 'Nuevo dibujo' });
  await create.getByText('Presentación 16:9').click();
  await create.getByRole('button', { name: 'Crear' }).click();

  const library = page.getByRole('dialog', { name: 'Biblioteca' });
  const inspector = page.locator('#inspector');
  const fromLibrary = async (query, title, asBackground = false) => {
    await page.getByRole('button', { name: 'Abrir la biblioteca de imágenes' }).click();
    await library.getByLabel('Buscar en la biblioteca').fill(query);
    await library.locator('#library-grid').getByRole('option', { name: title, exact: true }).first().click();
    await library.getByRole('button', { name: asBackground ? 'Usar como fondo' : 'Añadir al lienzo' }).click();
    await page.waitForTimeout(400);
  };
  const place = async (x, y, width) => {
    if (width) await inspector.getByLabel('Ancho', { exact: true }).fill(String(width));
    await inspector.getByLabel('X', { exact: true }).fill(String(x));
    await inspector.getByLabel('Y', { exact: true }).fill(String(y));
  };

  await fromLibrary('laboratorio', 'Laboratorio', true);
  await fromLibrary('abubilla', 'Abubilla');
  await place(1560, 610, 520);
  await fromLibrary('canario serinus', 'Canario serinus canaria');
  await place(330, 690, 380);
  await page.getByRole('button', { name: 'Añadir texto' }).click();
  await inspector.getByLabel('Texto', { exact: true }).fill('¡Dibuja y aprende!');
  await inspector.getByLabel('Tamaño').fill('120');
  await inspector.getByLabel('Negrita').check();
  await inspector.getByLabel('Color del texto (hexadecimal)').fill('#b9480f');
  await inspector.getByLabel('Color del texto (hexadecimal)').press('Enter');
  await place(960, 170);
  await page.evaluate(() => (document.activeElement instanceof HTMLElement ? document.activeElement.blur() : undefined));
  await page.keyboard.press('Escape');
  await page.evaluate(() => {
    document.querySelectorAll('.toast').forEach((t) => t.remove());
    document.scrollingElement?.scrollTo(0, 0);
  });
  await page.mouse.move(0, 0);
  await page.waitForTimeout(500);
  const shot = await page.screenshot({ animations: 'disabled' });

  // 2. The card.
  const logo = readFileSync('public/favicon.svg', 'utf8').replace('<svg ', '<svg width="56" height="56" ');
  const ate = dataUri('scripts/assets/ate-logo.png', 'image/png');
  const card = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await card.setContent(`<!doctype html><html lang="es"><head><meta charset="utf-8"><style>
    * { box-sizing: border-box; margin: 0; }
    body { width: 1200px; height: 630px; overflow: hidden; position: relative; color: #fff;
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background: radial-gradient(circle at 85% 15%, #e8642f 0, transparent 55%), linear-gradient(135deg, #a83c0d 0%, #8a2f0a 100%); }
    .text { position: absolute; left: 72px; top: 68px; width: 540px; }
    .mark { display: inline-grid; place-items: center; width: 80px; height: 80px; border-radius: 20px; background: #fff;
      box-shadow: 0 10px 24px rgb(40 10 0 / .25); }
    h1 { font-size: 112px; font-weight: 800; line-height: 1; letter-spacing: -0.035em; margin-top: 30px; }
    h2 { font-size: 38px; font-weight: 500; margin-top: 8px; opacity: .95; }
    p { font-size: 26px; line-height: 1.38; margin-top: 26px; opacity: .9; }
    .ate { position: absolute; left: 72px; bottom: 54px; display: flex; align-items: center; gap: 16px; font-size: 21px; opacity: .92; }
    .ate img { height: 46px; filter: brightness(0) invert(1); }
    .shot { position: absolute; left: 650px; top: 78px; width: 680px; border-radius: 16px; overflow: hidden;
      box-shadow: 0 30px 60px rgb(40 10 0 / .45); transform: rotate(-2.5deg); background: #fff; }
    .shot img { display: block; width: 100%; }
  </style></head><body>
    <div class="text">
      <span class="mark">${logo}</span>
      <h1>Tonga</h1>
      <h2>Dibujo para el aula</h2>
      <p>Software libre con más de 1.600 ilustraciones educativas para crear láminas y carteles en el navegador, sin registro y sin subir nada.</p>
    </div>
    <div class="ate"><img src="${ate}" alt=""><span>Área de Tecnología Educativa · Gobierno de Canarias</span></div>
    <div class="shot"><img src="data:image/png;base64,${shot.toString('base64')}" alt=""></div>
  </body></html>`);
  await card.evaluate(() => document.fonts.ready);
  await card.screenshot({ path: 'public/og-image.jpg', type: 'jpeg', quality: 85 });
  console.log(`public/og-image.jpg: ${statSync('public/og-image.jpg').size} bytes`);
} finally {
  await browser.close();
  server.kill();
}
