import { describe, expect, it } from 'vitest';
import { Editor } from '../src/canvas/editor';
import { buildTemplate, DIAGRAMS, TEMPLATES } from '../src/canvas/templates';
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

  it('a template opens in the editor as a fresh document', async () => {
    document.body.innerHTML = '<canvas id="c"></canvas>';
    const editor = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
    await editor.open(buildTemplate('storyboard', 1123, 794, { kind: 'transparent' }));
    expect(editor.canUndo).toBe(false);
  });

  it('a diagram keeps its ties working: deleting a shape takes its connectors', async () => {
    document.body.innerHTML = '<canvas id="c"></canvas>';
    const editor = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
    await editor.open(buildTemplate('comic', 1123, 794, { kind: 'transparent' }));
    editor.addDiagram('concept-map');
    expect(editor.layers().filter((l) => l.name === 'Conector')).toHaveLength(4);
    editor.select([editor.layers().find((l) => l.name === 'Idea principal')?.id ?? '']);
    editor.removeSelected();
    expect(editor.layers().filter((l) => l.name === 'Conector')).toHaveLength(0);
  });

  it('«Nuevo» offers only the whole-page templates; the diagrams live in «Formas»', () => {
    expect(TEMPLATES.map((t) => t.kind)).toEqual(['cover-panel', 'cover-band', 'comic', 'storyboard']);
    expect(DIAGRAMS.map((d) => d.kind)).toEqual(['concept-map', 'venn', 'timeline', 'axes', 'cycle', 'org-chart']);
  });

  it.each(DIAGRAMS.map((d) => [d.label, d.kind] as const))('%s is added to the current drawing, selected, in one undo step', async (_label, kind) => {
    document.body.innerHTML = '<canvas id="c"></canvas>';
    const editor = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
    await editor.open(buildTemplate('comic', 1123, 794, { kind: 'transparent' }));
    const before = editor.layers().length;
    const state = serializeProject(editor.toProject());

    editor.addDiagram(kind);
    const project = editor.toProject();
    const added = project.layers.slice(before);
    expect(project.layers.length).toBeGreaterThan(before + 2); // what was there stays
    expect(editor.selected().map((o) => o.id).sort()).toEqual(added.map((l) => l.id).sort());
    const ids = new Set(project.layers.map((l) => l.id));
    expect(ids.size).toBe(project.layers.length);
    for (const { object: o } of added) {
      if (typeof o.connectFrom === 'string') expect([ids.has(o.connectFrom), ids.has(o.connectTo as string)]).toEqual([true, true]);
      if (typeof o.attachedTo === 'string') expect(ids.has(o.attachedTo)).toBe(true);
      // Centred on the canvas, leaving a margin around it.
      expect(o.left as number).toBeGreaterThan(1123 * 0.1);
      expect(o.left as number).toBeLessThan(1123 * 0.9);
      expect(o.top as number).toBeGreaterThan(794 * 0.1);
      expect(o.top as number).toBeLessThan(794 * 0.9);
    }
    const saved = serializeProject(project);
    editor.commit(); // the ties were built in place
    expect(serializeProject(editor.toProject())).toBe(saved);

    await editor.undo();
    expect(serializeProject(editor.toProject())).toBe(state);
  });

  it('a diagram keeps its meaningful layer names', async () => {
    document.body.innerHTML = '<canvas id="c"></canvas>';
    const editor = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
    await editor.open(buildTemplate('comic', 1123, 794, { kind: 'transparent' }));
    editor.addDiagram('venn');
    editor.addDiagram('venn');
    expect(editor.layers().filter((l) => l.name === 'Conjunto A')).toHaveLength(2);
  });
});
