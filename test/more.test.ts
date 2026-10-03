import { afterEach, describe, expect, it, vi } from 'vitest';
import { Editor } from '../src/canvas/editor';
import { exportProject } from '../src/export/export';
import { loadCatalog } from '../src/assets/catalog';
import { assetRefs } from '../src/project/file';
import { newProject, parseProject } from '../src/project/schema';

const identity = (s: string) => s;

async function editor(): Promise<Editor> {
  document.body.innerHTML = '<canvas id="c"></canvas>';
  const ed = new Editor(document.getElementById('c') as HTMLCanvasElement, identity);
  await ed.open(newProject(400, 300));
  return ed;
}

afterEach(() => vi.unstubAllGlobals());

describe('SVG export (RULE-086/102/114)', () => {
  it('writes vector shapes at document size, ignoring the editor zoom', async () => {
    const ed = await editor();
    ed.setZoom(2.5);
    ed.addShape('ellipse');
    ed.addText('Hola <b>&</b>');
    const blob = await exportProject(ed.toProject(), { format: 'svg', scale: 1, quality: 1, transparent: true }, identity, identity);
    const svg = await blob.text();
    expect(blob.type).toBe('image/svg+xml');
    expect(svg).toMatch(/<svg[^>]+width="400"[^>]+height="300"[^>]+viewBox="0 0 400 300"/);
    expect(svg).toContain('<ellipse');
    expect(svg).toContain('Hola &lt;b&gt;&amp;&lt;/b&gt;'); // text is escaped
  });

  it('adds a white background to an opaque export of a transparent drawing', async () => {
    const ed = await editor();
    const svg = await (await exportProject(ed.toProject(), { format: 'svg', scale: 1, quality: 1, transparent: false }, identity, identity)).text();
    expect(svg).toMatch(/fill="#ffffff"|fill: ?#ffffff|rgb\(255,255,255\)/);
  });
});

describe('.tonga assets', () => {
  it('lists every local image a project uses, nested and background included', () => {
    const a = 'asset:' + 'a'.repeat(64);
    const b = 'asset:' + 'b'.repeat(64);
    const p = parseProject(JSON.stringify({
      format: 'tonga', version: 1, canvas: { width: 10, height: 10, background: { kind: 'image', src: b } },
      layers: [
        { id: 'g', type: 'group', object: { objects: [{ type: 'Image', src: a }, { type: 'Image', src: 'repositorios/aves/x.png' }] } },
        { id: 'i', type: 'image', object: { src: a } },
      ],
    }));
    expect(assetRefs(p).sort()).toEqual([a, b]);
  });
});

describe('catalogue loading', () => {
  it('rejects a broken or unreachable catalogue with a readable message', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('nope', { status: 404 })));
    await expect(loadCatalog('catalog.json')).rejects.toThrow('No se pudo cargar la biblioteca (404).');
    vi.stubGlobal('fetch', vi.fn(async () => Response.json({ version: 2 })));
    await expect(loadCatalog('catalog.json')).rejects.toThrow('no es válido');
  });
});

describe('Editor (more operations)', () => {
  it('reports the selection for the inspector, text included', async () => {
    const ed = await editor();
    ed.addText('Hola');
    expect(ed.inspect()).toMatchObject({ type: 'text', name: 'Texto 1', x: 200, y: 150, angle: 0, text: { text: 'Hola', fontFamily: 'Arial', bold: false } });
    ed.setProps({ fontWeight: 'bold', text: 'Adiós' }, 'text');
    expect(ed.inspect()?.text).toMatchObject({ text: 'Adiós', bold: true });
    expect(ed.isEditingText()).toBe(false);
  });

  it('flips, renames and duplicates the selection', async () => {
    const ed = await editor();
    ed.addShape('triangle');
    ed.flip('x');
    ed.flip('y');
    expect(ed.toProject().layers[0]?.object).toMatchObject({ flipX: true, flipY: true });
    ed.rename(ed.layers()[0]?.id ?? '', '  Montaña  ');
    expect(ed.layers()[0]?.name).toBe('Montaña');
    await ed.duplicate();
    expect(ed.layers().map((l) => l.name)).toEqual(['Triángulo 1', 'Montaña']);
  });

  it('moves a layer to a position of the layers panel, never a locked one', async () => {
    const ed = await editor();
    ed.addShape('rect');
    ed.addShape('ellipse');
    ed.addShape('triangle');
    const names = () => ed.layers().map((l) => l.name);
    const id = (name: string) => ed.layers().find((l) => l.name === name)?.id ?? '';
    ed.moveLayer(id('Rectángulo 1'), 0);
    expect(names()).toEqual(['Rectángulo 1', 'Triángulo 1', 'Elipse 1']);
    ed.moveLayer(id('Rectángulo 1'), 99);
    expect(names()).toEqual(['Triángulo 1', 'Elipse 1', 'Rectángulo 1']);
    await ed.undo();
    expect(names()).toEqual(['Rectángulo 1', 'Triángulo 1', 'Elipse 1']);
    ed.setLocked(id('Elipse 1'), true);
    ed.moveLayer(id('Elipse 1'), 0);
    expect(names()).toEqual(['Rectángulo 1', 'Triángulo 1', 'Elipse 1']);
  });

  it('switches free drawing on and off and fits the zoom to a box', async () => {
    const ed = await editor();
    ed.setDrawing(true, '#ff0000', 8);
    expect(ed.canvas.isDrawingMode).toBe(true);
    expect(ed.canvas.freeDrawingBrush).toMatchObject({ color: '#ff0000', width: 8 });
    ed.setDrawing(false);
    expect(ed.canvas.isDrawingMode).toBe(false);
    expect(ed.fitZoom(200, 300)).toBe(0.5);
    ed.setZoom(100);
    expect(ed.zoomLevel).toBe(8);
  });

  it('aligns several objects to the selection box', async () => {
    const ed = await editor();
    ed.addShape('rect');
    ed.nudge(-100, 0);
    ed.addShape('rect');
    ed.nudge(50, 40);
    ed.selectAll();
    ed.align('top');
    const tops = ed.toProject().layers.map((l) => Math.round(l.object.top as number));
    expect(tops[0]).toBe(tops[1]);
  });

  it('counts a revision for every change of the document and none for selection changes', async () => {
    const ed = await editor();
    const r0 = ed.revision;
    ed.addShape('rect');
    const r1 = ed.revision;
    ed.select([]);
    ed.selectAll();
    expect(ed.revision).toBe(r1);
    await ed.undo();
    expect(ed.revision).toBeGreaterThan(r1);
    expect(r1).toBeGreaterThan(r0);
  });
});
