// Behaviour not covered elsewhere: raster/PDF export, .tonga asset embedding, migrations,
// malformed inputs, image backgrounds, SVG edge cases and the remaining editor operations.
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { FabricImage, Group, Path, Rect, StaticCanvas } from 'fabric';

const store = new Map<string, Blob>();
vi.mock('../src/persistence/store', () => ({
  putAsset: async (blob: Blob) => {
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    const key = `asset:${[...digest].map((b) => b.toString(16).padStart(2, '0')).join('')}`;
    store.set(key, blob);
    return key;
  },
  getAsset: async (key: string) => store.get(key),
}));

const { exportProject } = await import('../src/export/export');
const { assetRefs, importEmbeddedAssets, toTongaFile } = await import('../src/project/file');
const { migrate, newProject, parseProject, ProjectError } = await import('../src/project/schema');
const { applyBackground, layerType, renderOffscreen } = await import('../src/canvas/document');
const { Editor, newId } = await import('../src/canvas/editor');
const { sanitizeSvg, checkImageSize } = await import('../src/import/svg');
const { commandFor, isTyping } = await import('../src/ui/shortcuts');
const { History } = await import('../src/history/history');
const { applyAdjustments, applyCrop, readAdjustments, readCrop, NO_ADJUSTMENTS } = await import('../src/canvas/image');
const { searchAssets } = await import('../src/assets/catalog');

const identity = (s: string) => s;
function pngDataUrl(w = 40, h = 20, colour = '#336699'): string {
  const el = document.createElement('canvas');
  el.width = w;
  el.height = h;
  const ctx = el.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = colour;
  ctx.fillRect(0, 0, w, h);
  return el.toDataURL('image/png');
}

beforeEach(() => store.clear());
afterEach(() => vi.unstubAllGlobals());

describe('raster and PDF export', () => {
  const project = () => {
    const p = newProject(300, 200);
    p.layers.push({ id: 'r', type: 'rect', name: 'R', visible: true, locked: false, object: new Rect({ left: 150, top: 100, width: 50, height: 50, fill: '#ff0000' }).toObject() as unknown as Record<string, unknown> });
    return p;
  };

  it('writes a PNG at the requested scale and a JPEG', async () => {
    const png = await exportProject(project(), { format: 'png', scale: 2, quality: 1, transparent: true }, identity, identity);
    const bytes = new Uint8Array(await png.arrayBuffer());
    expect(png.type).toBe('image/png');
    expect(new DataView(bytes.buffer).getUint32(16)).toBe(600);
    const jpeg = await exportProject(project(), { format: 'jpeg', scale: 1, quality: 0.8, transparent: true }, identity, identity);
    expect(jpeg.type).toBe('image/jpeg');
    expect([...new Uint8Array(await jpeg.arrayBuffer()).subarray(0, 2)]).toEqual([0xff, 0xd8]);
  });

  it('writes a one-page A4 PDF embedding a JPEG', async () => {
    const pdf = await exportProject(project(), { format: 'pdf', scale: 1, quality: 1, transparent: true }, identity, identity);
    const text = new TextDecoder('latin1').decode(await pdf.arrayBuffer());
    expect(pdf.type).toBe('application/pdf');
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text).toContain('/MediaBox [0 0 841.89 595.28]'); // landscape drawing, landscape page
    expect(text).toContain('/DCTDecode');
  });
});

describe('.tonga files with embedded images', () => {
  it('embeds the bytes of every local image and restores them, checking each hash', async () => {
    const key = (await (await import('../src/persistence/store')).putAsset(await (await fetch(pngDataUrl())).blob())) as string;
    const p = newProject(100, 100, { kind: 'image', src: key });
    p.layers.push({ id: 'i', type: 'image', name: 'Foto', visible: true, locked: false, object: { type: 'Image', src: key } });
    vi.stubGlobal('fetch', globalThis.fetch);
    const file = await toTongaFile(p);
    const saved = parseProject(await file.text());
    expect(Object.keys(saved.assets ?? {})).toEqual([key]);
    store.clear();
    const opened = await importEmbeddedAssets(saved);
    expect(opened.assets).toBeUndefined();
    expect(store.has(key)).toBe(true);
    expect(assetRefs(opened)).toEqual([key]);
  });

  it('rejects an embedded image whose bytes do not match its hash', async () => {
    const fake = 'asset:' + '0'.repeat(64);
    const p = parseProject(JSON.stringify({ ...newProject(10, 10), assets: { [fake]: pngDataUrl() } }));
    await expect(importEmbeddedAssets(p)).rejects.toThrow('no coincide su huella');
  });

  it('rejects a project that embeds some images but misses others', async () => {
    const a = 'asset:' + 'a'.repeat(64);
    const doc = { ...newProject(10, 10), layers: [{ id: 'i', type: 'image', object: { src: a } }], assets: {} as Record<string, string> };
    const real = (await (await import('../src/persistence/store')).putAsset(await (await fetch(pngDataUrl())).blob())) as string;
    doc.assets[real] = pngDataUrl();
    await expect(importEmbeddedAssets(parseProject(JSON.stringify(doc)))).rejects.toThrow('faltan imágenes');
  });
});

describe('project migrations and malformed files', () => {
  it('upgrades step by step through the migration table', () => {
    const v1 = { format: 'tonga', version: 1, canvas: { width: 10, height: 10 }, layers: [] };
    const toV2 = (d: Record<string, unknown>) => ({ ...d, version: 2, title: 'migrado' });
    expect(migrate(v1, { 1: toV2 }, 2)).toMatchObject({ version: 1, title: 'migrado' });
    expect(() => migrate(v1, {}, 2)).toThrowError('No hay migración desde la versión 1');
  });

  it.each([
    ['no canvas', { layers: [] }, /lienzo/],
    ['layers not a list', { canvas: { width: 10, height: 10 }, layers: {} }, /capas/],
    ['assets not an object', { canvas: { width: 10, height: 10 }, layers: [], assets: [] }, /recursos/],
    ['background not an object', { canvas: { width: 10, height: 10, background: 'red' }, layers: [] }, /fondo/],
    ['a layer that is not an object', { canvas: { width: 10, height: 10 }, layers: ['x'] }, /capa 1 no es válida/],
    ['a layer with a bad id', { canvas: { width: 10, height: 10 }, layers: [{ id: 'a b', type: 'rect', object: {} }] }, /identificador/],
    ['a layer without object data', { canvas: { width: 10, height: 10 }, layers: [{ id: 'a', type: 'rect' }] }, /datos de objeto/],
  ])('rejects %s', (_n, body, msg) => {
    expect(() => parseProject(JSON.stringify({ format: 'tonga', version: 1, ...body }))).toThrowError(msg);
    expect(() => parseProject(JSON.stringify({ format: 'tonga', version: 1, ...body }))).toThrowError(ProjectError);
  });

  it('keeps valid embedded assets and a missing background as transparent', () => {
    const key = 'asset:' + 'c'.repeat(64);
    const p = parseProject(JSON.stringify({ format: 'tonga', version: 1, canvas: { width: 10, height: 10 }, layers: [], assets: { [key]: 'data:image/png;base64,AAAA' } }));
    expect(p.assets).toEqual({ [key]: 'data:image/png;base64,AAAA' });
    expect(p.canvas.background).toEqual({ kind: 'transparent' });
  });
});

describe('document helpers', () => {
  it('maps Fabric types to layer types, defaulting to path', () => {
    expect(layerType(new Rect())).toBe('rect');
    expect(layerType(new Path('M 0 0 L 1 1'))).toBe('path');
    expect(layerType(new Group([]))).toBe('group');
    expect(layerType({ type: 'Unknown' } as never)).toBe('path');
  });

  it('covers the canvas with an image background, centred and keeping its ratio', async () => {
    const c = new StaticCanvas(undefined, { width: 200, height: 200 });
    await applyBackground(c, { width: 200, height: 200, background: { kind: 'image', src: pngDataUrl(40, 20) } }, identity);
    const bg = c.backgroundImage as FabricImage;
    expect(bg.scaleX).toBe(10); // 200 / 20: covers the height
    expect([bg.left, bg.top]).toEqual([100, 100]);
  });

  it('renders groups with images off-screen, resolving every nested source', async () => {
    const p = newProject(100, 100);
    const img = (await FabricImage.fromURL(pngDataUrl())).toObject();
    p.layers.push({ id: 'g', type: 'group', name: 'G', visible: true, locked: false, object: new Group([]).toObject() as unknown as Record<string, unknown> });
    (p.layers[0]!.object as { objects: unknown[] }).objects = [{ ...img, src: 'canonical' }];
    const seen: string[] = [];
    const canvas = await renderOffscreen(p, (s) => {
      seen.push(s);
      return pngDataUrl();
    });
    expect(seen).toEqual(['canonical']);
    expect(canvas.getObjects()).toHaveLength(1);
  });
});

describe('Editor (remaining operations)', () => {
  let ed: InstanceType<typeof Editor>;
  beforeEach(async () => {
    document.body.innerHTML = '<canvas id="c"></canvas>';
    ed = new Editor(document.getElementById('c') as HTMLCanvasElement, identity);
    await ed.open(newProject(800, 600));
  });

  it('notifies subscribers until they unsubscribe', () => {
    const seen: number[] = [];
    const off = ed.subscribe(() => seen.push(1));
    ed.addShape('rect');
    const n = seen.length;
    off();
    ed.addShape('rect');
    expect(n).toBeGreaterThan(0);
    expect(seen.length).toBe(n);
  });

  it('creates unique ids even without crypto.randomUUID', () => {
    vi.stubGlobal('crypto', {});
    const ids = new Set([newId(), newId(), newId()]);
    expect(ids.size).toBe(3);
    expect([...ids][0]).toMatch(/^id-/);
  });

  it('orders forward, backward, to the front and to the back', () => {
    ed.addShape('rect');
    ed.addShape('ellipse');
    ed.addShape('triangle');
    const names = () => ed.layers().map((l) => l.name);
    ed.select([ed.layers()[2]!.id]); // Rectángulo 1 (bottom)
    ed.order('forward');
    expect(names()).toEqual(['Triángulo 1', 'Rectángulo 1', 'Elipse 1']);
    ed.order('front');
    expect(names()[0]).toBe('Rectángulo 1');
    ed.order('backward');
    expect(names()[1]).toBe('Rectángulo 1');
    ed.order('back');
    expect(names()[2]).toBe('Rectángulo 1');
  });

  it('aligns to every edge of the canvas', () => {
    ed.addShape('rect');
    const box = () => ed.canvas.getActiveObject()!.getBoundingRect();
    ed.align('right');
    expect(box().left + box().width).toBeCloseTo(800, 6);
    ed.align('bottom');
    expect(box().top + box().height).toBeCloseTo(600, 6);
    ed.align('center');
    ed.align('middle');
    expect(ed.canvas.getActiveObject()!.getCenterPoint()).toMatchObject({ x: 400, y: 300 });
  });

  it('applies style changes to every object of a multiple selection, and moves it as a whole', () => {
    ed.addShape('rect');
    ed.addShape('ellipse');
    ed.selectAll();
    expect(ed.inspect()?.type).toBe('selection');
    ed.setProps({ fill: '#00ff00' });
    expect(ed.toProject().layers.map((l) => l.object.fill)).toEqual(['#00ff00', '#00ff00']);
    ed.setProps({ left: 100 });
    expect(ed.toProject().layers.map((l) => Math.round(l.object.left as number))).toEqual([100, 100]);
  });

  it('hides or locks the selected object and drops it from the selection', () => {
    ed.addShape('rect');
    const id = ed.layers()[0]!.id;
    ed.setVisible(id, false);
    expect(ed.selected()).toHaveLength(0);
    ed.setVisible(id, true);
    ed.select([id]);
    ed.setLocked(id, true);
    expect(ed.selected()).toHaveLength(0);
    ed.setVisible('missing', false);
    ed.setLocked('missing', true);
    expect(ed.layers()).toHaveLength(1);
  });

  it('ignores operations that need a selection when there is none', async () => {
    ed.addShape('rect');
    ed.canvas.discardActiveObject();
    const before = ed.revision;
    ed.removeSelected();
    ed.nudge(5, 5);
    ed.setProps({ fill: '#000000' });
    ed.setSize(10, 10);
    ed.order('front');
    ed.group();
    ed.ungroup();
    ed.align('left');
    ed.setImageAdjustments(NO_ADJUSTMENTS);
    ed.setImageCrop({ left: 1, top: 1, right: 1, bottom: 1 });
    await ed.paste(); // empty clipboard
    expect(ed.inspect()).toBeNull();
    expect(ed.revision).toBe(before);
  });

  it('records freehand paths as named layers', () => {
    const path = new Path('M 0 0 L 10 10', { left: 5, top: 5 });
    ed.canvas.add(path);
    ed.canvas.fire('path:created', { path });
    expect(ed.layers()[0]).toMatchObject({ type: 'path', name: 'Trazo 1' });
    expect(ed.canUndo).toBe(true);
  });

  it('commits text edits under one coalescing key', async () => {
    ed.addText('a');
    const text = ed.canvas.getActiveObject()!;
    for (const t of ['ab', 'abc']) {
      text.set({ text: t });
      ed.canvas.fire('text:changed', { target: text as never });
    }
    await ed.undo();
    expect(ed.toProject().layers[0]?.object.text).toBe('a');
  });

  it('adds parsed objects, naming a single one', () => {
    ed.addObjects([]);
    ed.addObjects([new Rect({ left: 1, top: 1 })], 'Importado');
    ed.addObjects([new Rect({ left: 2, top: 2 }), new Rect({ left: 3, top: 3 })]);
    expect(ed.layers().map((l) => l.name)).toEqual(['Rectángulo 2', 'Rectángulo 1', 'Importado']);
  });

  it('pastes images by resolving their canonical sources', async () => {
    const src = pngDataUrl();
    await ed.addImage(src, 'Foto');
    ed.copy();
    await ed.paste();
    expect(ed.toProject().layers.map((l) => l.object.src)).toEqual([src, src]);
  });

  it('cuts: copies to the clipboard and removes the selection, as one undo step', async () => {
    ed.addShape('rect');
    expect(ed.hasClipboard).toBe(false);
    ed.cut();
    expect(ed.layers()).toHaveLength(0);
    expect(ed.hasClipboard).toBe(true);
    await ed.paste();
    expect(ed.layers().map((l) => l.name)).toEqual(['Rectángulo 1']);
  });

  it('undo and redo do nothing at the ends of the history', async () => {
    const r = ed.revision;
    await ed.undo();
    await ed.redo();
    expect(ed.revision).toBe(r);
    expect(ed.currentBackground).toEqual({ kind: 'transparent' });
  });

  it('releases the canvas on dispose', async () => {
    await ed.dispose();
    expect(ed.canvas.getObjects()).toHaveLength(0);
  });
});

describe('image helpers on edge cases', () => {
  it('reads Fabric filter defaults and ignores an image without size', () => {
    const el = document.createElement('canvas');
    el.width = 0;
    el.height = 0;
    const empty = new FabricImage(el);
    expect(readCrop(empty)).toEqual({ left: 0, top: 0, right: 0, bottom: 0 });
    applyCrop(empty, { left: 10, top: 10, right: 10, bottom: 10 });
    expect(empty.cropX).toBe(0);
    const img = new FabricImage(document.createElement('canvas'));
    applyAdjustments(img, { ...NO_ADJUSTMENTS, brightness: Number.NaN, saturation: -20 });
    expect(readAdjustments(img)).toMatchObject({ brightness: 0, saturation: -20 });
  });
});

describe('SVG import edge cases', () => {
  const ns = 'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"';
  it('drops <style> blocks that import or fetch, and sizes from the viewBox', () => {
    const out = sanitizeSvg(`<svg ${ns} viewBox="0 0 640 480"><style>@import url(https://x.example/a.css);</style><rect width="1" height="1"/></svg>`);
    expect(out.svg).not.toContain('x.example');
    expect(out).toMatchObject({ width: 640, height: 480 });
  });

  it('falls back to the SVG default size and rejects zero sizes', () => {
    expect(sanitizeSvg(`<svg ${ns}><rect/></svg>`)).toMatchObject({ width: 300, height: 150 });
    expect(() => sanitizeSvg(`<svg ${ns} width="0" height="0" viewBox="0 0 0 0"/>`)).not.toThrow(); // falls back
    expect(() => checkImageSize(0, 10)).toThrowError('No se pudo leer');
  });

  it('reads a legacy background from href, keeps the group of other images, and refuses remote backgrounds', () => {
    const local = sanitizeSvg(`<svg ${ns} width="10" height="10"><g><image nombre="data-background" href="data:image/png;base64,AAAA"/><rect/></g></svg>`);
    expect(local.legacyBackground).toBe('data:image/png;base64,AAAA');
    expect(local.svg).toContain('<g>');
    const remote = sanitizeSvg(`<svg ${ns} width="10" height="10"><image nombre="data-background" xlink:href="https://x.example/bg.png"/></svg>`);
    expect(remote.legacyBackground).toBeUndefined();
  });
});

describe('shortcuts and helpers', () => {
  const key = (k: string, mods: Record<string, unknown> = {}) => ({ key: k, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, target: document.body, ...mods });
  it('maps the remaining keys', () => {
    expect(commandFor(key('ArrowRight'))).toEqual({ nudge: [1, 0] });
    expect(commandFor(key('ArrowUp'))).toEqual({ nudge: [0, -1] });
    expect(commandFor(key('='))).toBe('zoom-in');
    expect(commandFor(key('x', { ctrlKey: true }))).toBe('cut');
    expect(commandFor(key('j', { ctrlKey: true }))).toBeNull();
    expect(commandFor(key('ContextMenu'))).toBe('context-menu');
    expect(commandFor(key('F10', { shiftKey: true }))).toBe('context-menu');
    expect(commandFor(key('T', { shiftKey: true }))).toBeNull();
    expect(commandFor(key('q'))).toBeNull();
    expect(commandFor(key('z', { altKey: true }))).toBeNull();
    for (const [k, c] of [['v', 'tool-select'], ['h', 'tool-hand'], ['b', 'tool-draw'], ['r', 'add-rect'], ['e', 'add-ellipse'], ['l', 'add-line'], ['i', 'import']] as const) {
      expect(commandFor(key(k))).toBe(c);
    }
  });

  it('knows when the user is typing', () => {
    expect(isTyping(null)).toBe(false);
    expect(isTyping(document.createElement('select'))).toBe(true);
    const editable = document.createElement('div');
    editable.setAttribute('contenteditable', 'true');
    document.body.append(editable);
    expect(isTyping(editable)).toBe(true);
    expect(isTyping(Object.assign(document.createElement('input'), { type: 'checkbox' }))).toBe(false);
  });

  it('redo returns null when there is nothing to redo', () => {
    expect(new History('a').redo()).toBeNull();
  });

  it('searches without a catalogue collection title', () => {
    const cat = { version: 1 as const, categories: [], collections: [], assets: [{ id: 'x/a.png', title: 'Árbol', collection: 'x', category: 'c', file: 'repositorios/x/a.png', thumbnail: '', background: false, license: '', creator: '', source: '' }] };
    expect(searchAssets(cat, 'arbol')).toHaveLength(1);
  });
});

describe('catalogue loading (success)', () => {
  it('returns a valid catalogue as is', async () => {
    const cat = { version: 1, categories: [], collections: [], assets: [] };
    vi.stubGlobal('fetch', vi.fn(async () => Response.json(cat)));
    const { loadCatalog } = await import('../src/assets/catalog');
    await expect(loadCatalog('catalog.json')).resolves.toEqual(cat);
  });
});
