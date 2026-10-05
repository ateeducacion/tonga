import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { FabricImage, StaticCanvas, Textbox } from 'fabric';
import { readProject } from '../src/canvas/document';
import { Editor } from '../src/canvas/editor';
import { exportElpx } from '../src/export/elpx';
import { zip } from '../src/export/zip';
import { findSlides, slideToProject, type SlideChoice } from '../src/import/exe';
import { sniff } from '../src/import/sniff';
import { isZip, openZip } from '../src/import/unzip';

const fixture = (name: string) => new Uint8Array(readFileSync(`test/fixtures/import/${name}`));
const unzip = (bytes: Uint8Array) => openZip(new Blob([bytes as BlobPart]));
/** A real ZIP with the given files, opened. */
const archive = (files: Record<string, string | Uint8Array>) => unzip(zip(files));
/** Every file of an archive, read. */
const readAll = async (bytes: Uint8Array) => {
  const files = await unzip(bytes);
  return new Map(await Promise.all(files.names.map(async (n) => [n, await files.read(n)] as const)));
};
const enc = (s: string) => new TextEncoder().encode(s);
const STATIC = async () => ({ 'content.dtd': enc('<!ELEMENT ode ANY>'), 'theme/config.xml': enc('<theme/>') });
/** A store that only remembers what it got and returns a fake canonical source. */
function memoryStore() {
  const blobs: Blob[] = [];
  return { blobs, store: async (b: Blob) => (blobs.push(b), `asset:${String(blobs.length).padStart(64, '0')}`) };
}

/** A content.xml with the given components: [pageId, type, json]. */
function contentXml(pages: Record<string, string>, components: [string, string, string][]): string {
  const nav = Object.entries(pages).map(([id, name]) => `<odeNavStructure><odePageId>${id}</odePageId><pageName>${name}</pageName></odeNavStructure>`).join('');
  const comps = components.map(([page, type, json], i) =>
    `<odeComponent><odeIdeviceId>i${i}</odeIdeviceId><odePageId>${page}</odePageId><odeIdeviceTypeName>${type}</odeIdeviceTypeName><jsonProperties><![CDATA[${json}]]></jsonProperties></odeComponent>`).join('');
  return `<?xml version="1.0"?><ode><odeNavStructures>${nav}</odeNavStructures><odeComponents>${comps}</odeComponents></ode>`;
}
const scene = (objects: unknown[], extra = {}) => JSON.stringify({ engine: 'fabric', width: 800, height: 450, background: '#ABCDEF', fabric: { objects }, svg: '<svg/>', ...extra });

describe('unzip', () => {
  it('reads the deflated content.xml of a real eXeLearning block and iDevice', async () => {
    for (const name of ['portada-volcan.block', 'portada-volcan.idevice']) {
      const bytes = fixture(name);
      expect(isZip(bytes)).toBe(true);
      const files = await readAll(bytes);
      expect([...files.keys()]).toEqual(['content.xml']);
      expect(new TextDecoder().decode(files.get('content.xml')).startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    }
  });

  it('reads stored entries and skips folders and unsafe paths', async () => {
    const files = await readAll(zip({ 'a.txt': 'hola', 'dir/': '', '../evil.txt': 'x', '/abs.txt': 'y', 'c/d.png': new Uint8Array([1, 2, 3]) }));
    expect([...files.keys()]).toEqual(['a.txt', 'c/d.png']);
    expect(files.get('c/d.png')).toEqual(new Uint8Array([1, 2, 3]));
  });

  it('rejects what is not a ZIP, a broken one, an encrypted entry or an unknown compression', async () => {
    await expect(unzip(enc('not a zip at all, just text'))).rejects.toThrow('no es un ZIP válido');
    const good = zip({ 'a.txt': 'hola' });
    const broken = good.slice();
    broken[broken.length - 6] = 0x05; // central directory offset points to the wrong place
    await expect(unzip(broken)).rejects.toThrow('no es un ZIP válido');
    const patch = (offsetInCentral: number, value: number) => {
      const b = good.slice();
      const central = b.length - 22 - (46 + 5);
      b[central + offsetInCentral] = value;
      return b;
    };
    await expect(unzip(patch(8, 1))).rejects.toThrow('cifrado');
    await expect(unzip(patch(10, 9))).rejects.toThrow('compresión');
    const local = good.slice();
    local[0] = 0; // the local header signature is gone
    await expect((await unzip(local)).read('a.txt')).rejects.toThrow('no es un ZIP válido');
  });
});

/** Writes a 32-bit field of the n-th central directory entry of a ZIP (a copy). */
function patchCentral(bytes: Uint8Array, n: number, field: number, value: number): Uint8Array {
  const b = bytes.slice();
  const view = new DataView(b.buffer);
  const end = b.length - 22;
  let at = view.getUint32(end + 16, true);
  for (let i = 0; i < n; i++) at += 46 + view.getUint16(at + 28, true) + view.getUint16(at + 30, true) + view.getUint16(at + 32, true);
  view.setUint32(at + field, value, true);
  return b;
}

describe('reading large ZIPs by parts', () => {
  it('reads only the directory and the entries asked for, not the whole file', async () => {
    const big = new Uint8Array(5 * 1024 * 1024);
    const blob = new Blob([zip({ 'content/video.mp4': big, 'content.xml': '<ode/>' }) as BlobPart]);
    let read = 0;
    const slice = blob.slice.bind(blob);
    vi.spyOn(blob, 'slice').mockImplementation((from = 0, to = blob.size) => {
      read += Math.min(to, blob.size) - from;
      return slice(from, to);
    });
    const files = await openZip(blob);
    expect(files.names).toEqual(['content/video.mp4', 'content.xml']);
    expect(new TextDecoder().decode(await files.read('content.xml'))).toBe('<ode/>');
    expect(await files.read('nada.txt')).toBeUndefined();
    expect(read).toBeLessThan(100 * 1024);
  });

  it('refuses entries, or a sum of them, too large to inflate in memory', async () => {
    const one = await unzip(patchCentral(zip({ 'a.bin': 'x' }), 0, 24, 101 * 1024 * 1024));
    await expect(one.read('a.bin')).rejects.toThrow('«a.bin» pesa más de 100 MB');
    let three = zip({ a: 'x', b: 'y', c: 'z' });
    for (const n of [0, 1, 2]) three = patchCentral(three, n, 24, 90 * 1024 * 1024);
    const files = await unzip(three);
    await files.read('a');
    await files.read('b');
    await expect(files.read('c')).rejects.toThrow('demasiado grande');
  });

  it('stops inflating an entry that grows past its declared size, and rejects a truncated one', async () => {
    const liar = await unzip(patchCentral(fixture('portada-volcan.block'), 0, 24, 10));
    await expect(liar.read('content.xml')).rejects.toThrow('no es un ZIP válido');
    const truncated = await unzip(patchCentral(zip({ 'a.txt': 'hola' }), 0, 20, 1000));
    const crowded = zip({ 'a.txt': 'hola' });
    new DataView(crowded.buffer).setUint16(crowded.length - 12, 20001, true);
    await expect(unzip(crowded)).rejects.toThrow('demasiados elementos');
    const outside = zip({ 'a.txt': 'hola' });
    new DataView(outside.buffer).setUint32(outside.length - 6, 0x7fffffff, true); // directory past the end
    await expect(unzip(outside)).rejects.toThrow('no es un ZIP válido');
    await expect(truncated.read('a.txt')).rejects.toThrow('no es un ZIP válido');
  });
});

describe('finding Slide iDevices', () => {
  it('finds the slide of the real cover, titled «Diapositiva» when there is no page', async () => {
    const slides = await findSlides(await unzip(fixture('portada-volcan.block')));
    expect(slides).toHaveLength(1);
    expect(slides[0]).toMatchObject({ id: 'idevice-1785308366307-7z9j80piq', title: 'Diapositiva', width: 1280, height: 720, background: '#ffffff' });
    expect(slides[0]?.objects).toHaveLength(41);
    expect(slides[0]?.svg).toMatch(/^<\?xml/);
  });

  it('names slides by page, numbers several on one page and skips broken or other iDevices', async () => {
    const xml = contentXml({ p1: 'Volcanes', p2: 'Ríos' }, [
      ['p1', 'slide', scene([])],
      ['p1', 'text', '{}'],
      ['p1', 'slide', scene([], { width: 99999, height: 'x' })],
      ['p2', 'slide', scene([], { engine: 'other' })],
      ['p2', 'slide', '{not json'],
      ['p2', 'slide', scene([], { background: 3, svg: 4 })],
    ]);
    const slides = await findSlides(await archive({ 'content.xml': xml }));
    expect(slides.map((s) => s.title)).toEqual(['Volcanes (1)', 'Volcanes (2)', 'Ríos']);
    expect(slides[1]).toMatchObject({ width: 1280, height: 720 }); // out-of-range sizes fall back
    expect(slides[2]).toMatchObject({ background: '#ffffff', svg: '' });
  });

  it('explains what is wrong with a file that is not eXeLearning', async () => {
    await expect(findSlides(await archive({ 'a.txt': 'x' }))).rejects.toThrow('content.xml');
    await expect(findSlides(await archive({ 'content.xml': '<ode><unclosed>' }))).rejects.toThrow('dañado');
  });

  it('is told apart from other files by its bytes and its name', () => {
    const bytes = fixture('portada-volcan.block');
    expect(sniff(bytes, 'x.block')).toBe('exe');
    expect(sniff(bytes, 'proyecto.elpx')).toBe('exe');
    expect(() => sniff(bytes, 'x.zip')).toThrow('eXeLearning');
  });
});

describe('opening a slide as a project', () => {
  it('turns the real cover into editable layers that open in the editor', async () => {
    const [slide] = await findSlides(await unzip(fixture('portada-volcan.block'))) as [SlideChoice];
    const { project, missing } = await slideToProject(slide, await archive({}), memoryStore().store);
    expect(missing).toBe(0);
    expect(project.canvas).toEqual({ width: 1280, height: 720, background: { kind: 'color', color: '#ffffff' } });
    expect(project.title).toBe('Diapositiva');
    expect(project.layers).toHaveLength(41);
    const types = new Set(project.layers.map((l) => l.type));
    expect(types).toEqual(new Set(['rect', 'ellipse', 'path', 'text']));
    expect(project.layers.filter((l) => l.type === 'text').map((l) => l.name)).toEqual(['Texto 1', 'Texto 2', 'Texto 3', 'Texto 4']);

    document.body.innerHTML = '<canvas id="c"></canvas>';
    const editor = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
    await editor.open(project);
    expect(editor.layers()).toHaveLength(41);
    expect(editor.toProject().layers.find((l) => l.name === 'Texto 1')?.object.text).toBe('¿Qué es un volcán?');
    // The caption was a single-line IText: it opens as a Textbox, editable in the inspector.
    editor.select([editor.layers().find((l) => l.name === 'Texto 4')?.id ?? '']);
    expect(editor.inspect()?.text?.text).toBe('Ilustración: volcán en erupción (esquema).');
  });

  it('round-trips Tonga → .elpx → Tonga, with the images taken from the package', async () => {
    const photo = (() => {
      const el = document.createElement('canvas');
      el.width = el.height = 8;
      return el.toDataURL('image/png');
    })();
    const canvas = new StaticCanvas(undefined, { width: 800, height: 450 });
    canvas.add(await FabricImage.fromURL(photo, {}, { left: 100, top: 100, assetSrc: 'asset:photo' }), new Textbox('Hola', { left: 400, top: 200, width: 200 }));
    const original = readProject(canvas, { width: 800, height: 450 }, { kind: 'color', color: '#123456' }, 'Mi portada');
    const elpx = await exportElpx(original, (s) => (s === 'asset:photo' ? photo : s), STATIC);

    const files = await unzip(new Uint8Array(await elpx.arrayBuffer()));
    const [slide] = (await findSlides(files)) as [SlideChoice];
    expect(slide.title).toBe('Mi portada');
    const { blobs, store } = memoryStore();
    const { project, missing } = await slideToProject(slide, files, store);
    expect(missing).toBe(0);
    expect(blobs.map((b) => b.type)).toEqual(['image/png']);
    expect(project.canvas.background).toEqual({ kind: 'color', color: '#123456' });
    expect(project.layers.map((l) => [l.type, l.name])).toEqual([['image', 'Imagen 1'], ['text', 'Texto 1']]);
    expect(project.layers[0]?.object.src).toBe(`asset:${'1'.padStart(64, '0')}`);
    expect(project.layers[1]?.object.text).toBe('Hola');
  });

  it('leaves out images that are not in the package, also inside groups, and shares one copy per file', async () => {
    const img = (src: string) => ({ type: 'Image', src, left: 0, top: 0, width: 1, height: 1 });
    const slide = (await findSlides(await archive({ 'content.xml': contentXml({}, [['p', 'slide', scene([
      img('{{context_path}}/content/resources/a.png'),
      img('content/resources/a.png?x=1'),
      img('content/resources/100%.png'),
      img('https://example.com/remote.png'),
      { type: 'Group', objects: [img('./content/resources/b%20c.jpg'), img('content/resources/missing.png'), { type: 'Rect' }] },
      { type: 'Polyline', points: [] },
      { type: 'Mystery', visible: false },
    ], { background: 'transparent' })]]) })))[0] as SlideChoice;
    const files = await archive({ 'content/resources/a.png': new Uint8Array([1]), 'content/resources/b c.jpg': new Uint8Array([2]) });
    const { blobs, store } = memoryStore();
    const { project, missing } = await slideToProject(slide, files, store);
    expect(missing).toBe(3); // the remote image, a malformed path and the missing one in the group
    expect(blobs.map((b) => b.type)).toEqual(['image/png', 'image/jpeg']);
    expect(project.canvas.background).toEqual({ kind: 'transparent' });
    expect(project.layers.map((l) => l.type)).toEqual(['image', 'image', 'group', 'path', 'path']);
    expect(project.layers[0]?.object.src).toBe(project.layers[1]?.object.src);
    expect((project.layers[2]?.object.objects as unknown[]).length).toBe(2);
    expect(project.layers[4]?.visible).toBe(false);
  });
});
