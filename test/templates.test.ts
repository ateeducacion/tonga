import { describe, expect, it } from 'vitest';
import { Editor } from '../src/canvas/editor';
import { buildTemplate, TEMPLATES } from '../src/canvas/templates';
import { parseProject, serializeProject } from '../src/project/schema';

const SIZES: [number, number][] = [[1123, 794], [794, 1123], [1920, 1080]];

describe('templates', () => {
  it.each(TEMPLATES.map((t) => [t.label, t.kind] as const))('%s is a valid, editable project at every size', async (_label, kind) => {
    for (const [w, h] of SIZES) {
      const project = buildTemplate(kind, w, h, { kind: 'color', color: '#ffffff' }, 'Ficha');
      expect(parseProject(serializeProject(project))).toEqual(JSON.parse(serializeProject(project))); // passes the format's own validation
      expect(project.title).toBe('Ficha');
      expect(project.layers.length).toBeGreaterThan(2);
      const ids = new Set(project.layers.map((l) => l.id));
      expect(ids.size).toBe(project.layers.length);
      for (const { object: o } of project.layers) {
        if (typeof o.connectFrom === 'string') expect([ids.has(o.connectFrom), ids.has(o.connectTo as string)]).toEqual([true, true]);
        if (typeof o.attachedTo === 'string') expect(ids.has(o.attachedTo)).toBe(true);
        // Every object is on the canvas.
        expect(o.left as number).toBeGreaterThanOrEqual(0);
        expect(o.left as number).toBeLessThanOrEqual(w);
        expect(o.top as number).toBeGreaterThanOrEqual(0);
        expect(o.top as number).toBeLessThanOrEqual(h);
      }
    }
  });

  it('a resource cover has editable placeholder texts, a logo and a library image', () => {
    for (const kind of ['cover-panel', 'cover-band'] as const) {
      const project = buildTemplate(kind, 1280, 720, { kind: 'transparent' });
      const byName = (n: string) => project.layers.find((l) => l.name === n);
      expect(byName('Título')).toMatchObject({ type: 'text', object: { text: 'Título del recurso', fontWeight: 'bold' } });
      expect(byName('Subtítulo')?.object).toMatchObject({ fontStyle: 'italic' });
      expect(byName('Imagen')).toMatchObject({ type: 'image', object: { src: 'repositorios/iconosescuela/book-open.svg' } });
      expect(byName('Logo')?.type).toBe('path');
      expect(project.layers[0]).toMatchObject({ name: 'Fondo', locked: true }); // covers the canvas, so it starts locked
    }
  });

  it('opens in the editor with its ties working, as a fresh document', async () => {
    document.body.innerHTML = '<canvas id="c"></canvas>';
    const editor = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
    await editor.open(buildTemplate('concept-map', 1123, 794, { kind: 'transparent' }));
    expect(editor.canUndo).toBe(false);
    const before = serializeProject(editor.toProject());
    editor.commit(); // re-drawing the ties changes nothing: they were built in place
    expect(serializeProject(editor.toProject())).toBe(before);
    editor.select([editor.layers().find((l) => l.name === 'Idea principal')?.id ?? '']);
    editor.removeSelected();
    expect(editor.layers().filter((l) => l.name === 'Conector')).toHaveLength(0); // its connectors went with it
  });
});
