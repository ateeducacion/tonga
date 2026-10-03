import { readFileSync, readdirSync } from 'node:fs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FabricImage, Group, Rect, StaticCanvas, Textbox } from 'fabric';
import { readProject } from '../src/canvas/document';
import { contentXml, exportElpx, odeId, slideScale } from '../src/export/elpx';
import { exportFileName } from '../src/export/export';
import { crc32, zip } from '../src/export/zip';

/** Reads a stored (uncompressed) ZIP, checking every CRC. */
function unzip(bytes: Uint8Array): Record<string, Uint8Array> {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const files: Record<string, Uint8Array> = {};
  let at = 0;
  while (v.getUint32(at, true) === 0x04034b50) {
    expect(v.getUint16(at + 8, true)).toBe(0); // stored
    const size = v.getUint32(at + 18, true);
    const nameLen = v.getUint16(at + 26, true);
    const name = new TextDecoder().decode(bytes.subarray(at + 30, at + 30 + nameLen));
    const data = bytes.subarray(at + 30 + nameLen, at + 30 + nameLen + size);
    expect(crc32(data)).toBe(v.getUint32(at + 14, true));
    files[name] = data;
    at += 30 + nameLen + size;
  }
  expect(v.getUint32(at, true)).toBe(0x02014b50); // central directory follows
  return files;
}

function pngDataUrl(width: number, height: number, color: string): string {
  const el = document.createElement('canvas');
  el.width = width;
  el.height = height;
  const ctx = el.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, width, height);
  return el.toDataURL('image/png');
}

const text = (b: Uint8Array) => new TextDecoder().decode(b);
const STATIC = async () => ({ 'content.dtd': new TextEncoder().encode('<!ELEMENT ode ANY>'), 'theme/config.xml': new TextEncoder().encode('<theme/>'), 'theme/style.css': new Uint8Array([1]) });

describe('zip', () => {
  it('computes the standard CRC-32', () => {
    expect(crc32(new TextEncoder().encode('123456789'))).toBe(0xcbf43926);
  });

  it('stores files with UTF-8 names', () => {
    const files = unzip(zip({ 'a.txt': 'hola', 'carpeta/ñ.bin': new Uint8Array([1, 2, 3]) }));
    expect(text(files['a.txt'] as Uint8Array)).toBe('hola');
    expect([...(files['carpeta/ñ.bin'] as Uint8Array)]).toEqual([1, 2, 3]);
  });
});

describe('eXeLearning export', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('ships content.dtd and every file of the base theme, byte for byte', async () => {
    vi.stubGlobal('fetch', async (url: string) => new Response(readFileSync(`.${url}`)));
    const project = readProject(new StaticCanvas(undefined, { width: 400, height: 200 }), { width: 400, height: 200 }, { kind: 'transparent' });
    const files = unzip(new Uint8Array(await (await exportElpx(project, (s) => s)).arrayBuffer()));
    const theme = readdirSync('vendor/exelearning/theme', { recursive: true, withFileTypes: true }).filter((e) => e.isFile());
    expect(theme.length).toBeGreaterThan(50);
    for (const e of theme) {
      const rel = `${e.parentPath}/${e.name}`.replace('vendor/exelearning/', '');
      expect(files[rel], rel).toEqual(new Uint8Array(readFileSync(`vendor/exelearning/${rel}`)));
    }
    expect(files['content.dtd']).toEqual(new Uint8Array(readFileSync('vendor/exelearning/content.dtd')));
  });

  it('fails clearly when a packaged file cannot be fetched', async () => {
    vi.stubGlobal('fetch', async () => new Response(null, { status: 404 }));
    const project = readProject(new StaticCanvas(undefined, { width: 400, height: 200 }), { width: 400, height: 200 }, { kind: 'transparent' });
    await expect(exportElpx(project, (s) => s)).rejects.toThrow(/No se pudo cargar/);
  });

  it('fits the canvas inside the Slide iDevice limits (400–1920 × 200–1200)', () => {
    expect(slideScale(1280, 720)).toBe(1);
    expect(slideScale(3840, 2160)).toBe(0.5);
    expect(slideScale(1000, 3000)).toBe(0.4);
    expect(slideScale(200, 100)).toBe(2);
    expect(slideScale(300, 1000)).toBe(1.2);
  });

  it('makes eXeLearning identifiers', () => {
    expect(odeId(new Date(2026, 9, 3, 8, 5, 9))).toMatch(/^20261003080509[A-Z0-9]{6}$/);
  });

  it('names the file .elpx', () => {
    expect(exportFileName('Mi dibujo', 'elpx')).toBe('Mi dibujo.elpx');
  });

  it('escapes the title and protects CDATA', () => {
    const doc = contentXml({ width: 400, height: 200, background: '#ffffff', scene: { objects: [{ text: 'a]]>b' }] }, svg: '<svg width="400" height="200"></svg>' }, 'A & <B>');
    const parsed = new DOMParser().parseFromString(doc, 'application/xml');
    expect(parsed.querySelector('parsererror')).toBeNull();
    expect(parsed.querySelector('pageName')?.textContent).toBe('A & <B>');
    const payload = JSON.parse(parsed.querySelector('jsonProperties')?.textContent ?? '');
    expect(payload.fabric.objects[0].text).toBe('a]]>b');
    expect(parsed.querySelector('htmlView')?.textContent).toContain('<svg width="100%">');
  });

  it('packages one editable Slide with the images, the screenshot and the theme', async () => {
    const photo = pngDataUrl(40, 20, '#00ff00');
    const backdrop = pngDataUrl(8, 8, '#0000ff');
    const sources: Record<string, string> = { 'asset:photo': photo, 'repositorios/fondo.png': backdrop };
    const resolve = (s: string) => sources[s] ?? s;

    const c = new StaticCanvas(undefined, { width: 3840, height: 2160 });
    const img = await FabricImage.fromURL(photo, {}, { left: 1000, top: 1000, assetSrc: 'asset:photo' });
    c.add(
      new Rect({ id: 'r1', name: 'Rojo', left: 400, top: 200, width: 100, height: 50, fill: '#ff0000' }),
      new Group([new Rect({ left: 900, top: 1000, width: 10, height: 10 }), img], { id: 'g1' }),
      new Textbox('oculto', { id: 't1', visible: false }),
    );
    const project = readProject(c, { width: 3840, height: 2160 }, { kind: 'image', src: 'repositorios/fondo.png' }, 'Mi dibujo');

    const files = unzip(new Uint8Array(await (await exportElpx(project, resolve, STATIC)).arrayBuffer()));
    expect(Object.keys(files).sort()).toEqual(
      ['content.dtd', 'content.xml', 'content/resources/imagen-1.png', 'content/resources/imagen-2.png', 'screenshot.png', 'theme/config.xml', 'theme/style.css'],
    );
    expect(files['content/resources/imagen-2.png']).toEqual(Uint8Array.from(atob(photo.split(',')[1] as string), (ch) => ch.charCodeAt(0)));
    const shot = files['screenshot.png'] as Uint8Array;
    const ihdr = new DataView(shot.buffer, shot.byteOffset + 16, 8);
    expect([ihdr.getUint32(0), ihdr.getUint32(4)]).toEqual([1280, 720]);

    const doc = new DOMParser().parseFromString(text(files['content.xml'] as Uint8Array), 'application/xml');
    expect(doc.querySelector('odeIdeviceTypeName')?.textContent).toBe('slide');
    expect(doc.querySelector('userPreference value')?.textContent).toBe('base');
    const payload = JSON.parse(doc.querySelector('jsonProperties')?.textContent ?? '');
    expect(payload).toMatchObject({ version: 3, engine: 'fabric', width: 1920, height: 1080, background: '#ffffff' });
    const objects = payload.fabric.objects as Record<string, unknown>[];
    // Background image at the bottom, the group dissolved (its image now top-level), hidden layer left out.
    expect(objects.map((o) => o.type)).toEqual(['Image', 'Rect', 'Rect', 'Image']);
    expect(objects[0]?.src).toBe('{{context_path}}/content/resources/imagen-1.png');
    expect(objects[3]?.src).toBe('{{context_path}}/content/resources/imagen-2.png');
    expect(objects[1]).toMatchObject({ left: 200, top: 100, scaleX: 0.5, fill: '#ff0000' });
    expect(objects[3]).toMatchObject({ left: 500, top: 500, scaleX: 0.5 });
    expect(JSON.stringify(objects)).not.toMatch(/"(id|name|assetSrc)"|data:image/);
    expect(payload.svg.match(/xlink:href="([^"]+)"/g)).toEqual([
      'xlink:href="{{context_path}}/content/resources/imagen-1.png"',
      'xlink:href="{{context_path}}/content/resources/imagen-2.png"',
    ]);
  });
});
