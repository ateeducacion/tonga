import { describe, expect, it } from 'vitest';
import { Rect, StaticCanvas, Textbox } from 'fabric';
import { readProject, setLocked, toLayer, writeProject } from '../src/canvas/document';
import { newProject } from '../src/project/schema';

const identity = (s: string) => s;

describe('project <-> Fabric', () => {
  it('round-trips layers with id, name, visibility and lock', async () => {
    const a = new StaticCanvas(undefined, { width: 400, height: 300 });
    const rect = new Rect({ id: 'r1', name: 'Rectángulo 1', left: 200, top: 150, width: 50, height: 40, fill: '#ff0000', angle: 30 });
    const text = new Textbox('Hola', { id: 't1', name: 'Texto 1', left: 100, top: 50, visible: false });
    setLocked(text, true);
    a.add(rect, text);

    const project = readProject(a, { width: 400, height: 300 }, { kind: 'color', color: '#ffffff' });
    expect(project.layers.map((l) => [l.id, l.type, l.name, l.visible, l.locked])).toEqual([
      ['r1', 'rect', 'Rectángulo 1', true, false],
      ['t1', 'text', 'Texto 1', false, true],
    ]);
    expect(project.layers[0]?.object).toMatchObject({ originX: 'center', left: 200, angle: 30, fill: '#ff0000' });

    const b = new StaticCanvas(undefined, { width: 400, height: 300 });
    await writeProject(b, project, identity);
    expect(readProject(b, { width: 400, height: 300 }, project.canvas.background)).toEqual(project);
    expect(b.backgroundColor).toBe('#ffffff');
  });

  it('writes the canonical source of an image, not the URL it was loaded from', () => {
    const layer = toLayer(
      Object.assign(new Rect(), { type: 'image', toObject: () => ({ src: 'blob:http://x/1', assetSrc: 'asset:' + 'a'.repeat(64) }) }) as never,
    );
    expect(layer.object.src).toBe('asset:' + 'a'.repeat(64));
  });

  it('empties the canvas when loading an empty project (RULE-068)', async () => {
    const c = new StaticCanvas(undefined, { width: 10, height: 10 });
    c.add(new Rect());
    await writeProject(c, newProject(10, 10), identity);
    expect(c.getObjects()).toHaveLength(0);
    expect(c.backgroundColor).toBe('');
  });
});
