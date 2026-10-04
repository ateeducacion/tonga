import { beforeEach, describe, expect, it } from 'vitest';
import { Point } from 'fabric';
import { dashFor, DEFAULT_SHADOW, Editor, snapAngle } from '../src/canvas/editor';
import { exportProject } from '../src/export/export';
import { newProject } from '../src/project/schema';

let editor: Editor;

beforeEach(async () => {
  document.body.innerHTML = '<canvas id="c"></canvas>';
  editor = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
  await editor.open(newProject(800, 600));
});

const names = () => editor.layers().map((l) => l.name);

describe('Pencil', () => {
  const pointer = (type: 'mouse:down' | 'mouse:move' | 'mouse:up', x: number, y: number, shiftKey = false) =>
    editor.canvas.fire(type, { e: new MouseEvent('mousemove', { shiftKey }), scenePoint: new Point(x, y) } as never);

  it('keeps its colour, width and mode between uses', () => {
    editor.setPencil({ color: '#2563eb', width: 16 });
    editor.setDrawing(true);
    editor.setDrawing(false);
    editor.setDrawing(true);
    expect(editor.pencil).toEqual({ color: '#2563eb', width: 16, straight: false });
    expect(editor.canvas.freeDrawingBrush).toMatchObject({ color: '#2563eb', width: 16 });
    expect(editor.canvas.skipTargetFind).toBe(true);
  });

  it('draws one undoable straight line per drag in «Recta» mode, nothing for a click', async () => {
    editor.setPencil({ straight: true, color: '#e11d48', width: 8 });
    editor.setDrawing(true);
    expect(editor.canvas.isDrawingMode).toBe(false);
    pointer('mouse:down', 100, 100);
    pointer('mouse:move', 150, 120);
    pointer('mouse:move', 300, 100);
    pointer('mouse:up', 300, 100);
    expect(names()).toEqual(['Línea 1']);
    expect(editor.toProject().layers[0]?.object).toMatchObject({ stroke: '#e11d48', strokeWidth: 8, left: 200, top: 100 });
    pointer('mouse:down', 50, 50);
    pointer('mouse:up', 50, 50);
    pointer('mouse:move', 60, 60); // moving after release draws nothing
    expect(names()).toEqual(['Línea 1']);
    await editor.undo();
    expect(names()).toEqual([]);
  });

  it('keeps a straight line at 45° steps with Shift', () => {
    editor.setPencil({ straight: true });
    editor.setDrawing(true);
    pointer('mouse:down', 0, 0);
    pointer('mouse:move', 100, 90, true);
    pointer('mouse:up', 100, 90);
    const line = editor.toProject().layers[0]?.object as { x1: number; y1: number; x2: number; y2: number };
    expect(Math.abs(line.x2 - line.x1)).toBeCloseTo(Math.abs(line.y2 - line.y1), 3);
    expect(snapAngle({ x: 0, y: 0 }, { x: 10, y: 1 })).toMatchObject({ x: 10.05, y: 0 });
  });

  it('a click without the pencil draws nothing', () => {
    pointer('mouse:down', 0, 0);
    pointer('mouse:up', 0, 0);
    expect(names()).toEqual([]);
  });
});

describe('Styles', () => {
  const object = (i = 0) => editor.toProject().layers[i]?.object as Record<string, unknown>;

  it('a new shape, line or text reuses the style last chosen for its kind', () => {
    editor.addShape('rect');
    editor.setProps({ fill: '#2563eb', stroke: '#16a34a', strokeWidth: 8, left: 10 });
    editor.addShape('star');
    expect(object(1)).toMatchObject({ fill: '#2563eb', stroke: '#16a34a', strokeWidth: 8 });
    expect(object(1).left).not.toBe(10); // position is not a style

    editor.addShape('line');
    expect(object(2)).toMatchObject({ stroke: '#1f2937', strokeWidth: 4 }); // lines have their own style
    editor.setProps({ stroke: '#e11d48' });
    editor.addShape('line');
    expect(object(3)).toMatchObject({ stroke: '#e11d48' });

    editor.addText();
    editor.setProps({ fill: '#7c3aed', fontFamily: 'Georgia', underline: true });
    editor.addText();
    expect(object(5)).toMatchObject({ fill: '#7c3aed', fontFamily: 'Georgia', underline: true });
    expect(editor.inspect()?.text?.underline).toBe(true);
    editor.addShape('ellipse');
    expect(object(6)).toMatchObject({ fill: '#2563eb' }); // the text colour is not a shape fill
  });

  it('adds, changes and removes a shadow, kept in the project, undoable and remembered', async () => {
    editor.addShape('rect');
    expect(editor.inspect()?.shadow).toBeNull();
    editor.setShadow({ color: '#e11d48', blur: 20, offsetX: -5, offsetY: 8 });
    expect(editor.inspect()?.shadow).toEqual({ color: '#e11d48', blur: 20, offsetX: -5, offsetY: 8 });
    await editor.open(editor.toProject());
    expect(object()).toMatchObject({ shadow: { color: '#e11d48', blur: 20, offsetX: -5, offsetY: 8 } });
    editor.select([editor.layers()[0]?.id ?? '']);
    editor.addShape('triangle');
    expect(editor.inspect()?.shadow).toMatchObject({ blur: 20 });
    editor.setShadow(null);
    expect(editor.inspect()?.shadow).toBeNull();
    editor.addShape('triangle');
    expect(editor.inspect()?.shadow).toBeNull();
    await editor.undo();
    await editor.undo();
    editor.select([editor.layers()[0]?.id ?? '']);
    expect(editor.inspect()?.shadow).toMatchObject({ blur: 20 });
  });

  it('exports the shadow to SVG as a filter', async () => {
    editor.addShape('rect');
    editor.setShadow({ ...DEFAULT_SHADOW });
    const blob = await exportProject(editor.toProject(), { format: 'svg', scale: 1, quality: 1, transparent: true }, (s) => s, (s) => s);
    expect(await blob.text()).toMatch(/<filter id="SVGID_\d+"[\s\S]*feGaussianBlur/);
  });

  it('shows the first object’s shadow for a multiple selection and sets it on all; nothing selected does nothing', () => {
    editor.setShadow({ ...DEFAULT_SHADOW });
    expect(editor.layers()).toEqual([]);
    editor.addShape('rect');
    editor.addShape('ellipse');
    editor.selectAll();
    editor.setShadow({ ...DEFAULT_SHADOW, blur: 3 });
    expect(editor.inspect()?.shadow).toMatchObject({ blur: 3 });
    expect(editor.toProject().layers.every((l) => (l.object.shadow as { blur: number }).blur === 3)).toBe(true);
  });

  it('images and groups do not change the remembered styles', () => {
    editor.addShape('rect');
    editor.addShape('rect');
    editor.selectAll();
    editor.group();
    editor.setProps({ opacity: 0.5, fill: '#16a34a' });
    editor.addShape('rect');
    expect(object(1)).toMatchObject({ fill: '#f28c28' });
  });
});

describe('Line styles, arrow lines and distribution', () => {
  const object = (i = 0) => editor.toProject().layers[i]?.object as Record<string, unknown>;

  it('dashes and dots grow with the width, follow width changes and are remembered', () => {
    expect(dashFor('solid', 4)).toBeNull();
    expect(dashFor('dashed', 0)).toEqual([4, 2]);
    editor.addShape('rect');
    editor.setLineStyle('dashed');
    expect(editor.inspect()?.lineStyle).toBe('dashed');
    expect(object()).toMatchObject({ strokeDashArray: [8, 4], strokeLineCap: 'butt' });
    editor.setProps({ strokeWidth: 10 });
    expect(object()).toMatchObject({ strokeDashArray: [40, 20] });
    editor.setLineStyle('dotted');
    expect(object()).toMatchObject({ strokeDashArray: [0, 25], strokeLineCap: 'round' });
    editor.addShape('hexagon');
    expect(editor.inspect()?.lineStyle).toBe('dotted');
    editor.setLineStyle('solid');
    expect(object(1)).toMatchObject({ strokeDashArray: null });
    editor.setProps({ strokeWidth: 3 }); // solid stays solid
    expect(object(1)).toMatchObject({ strokeDashArray: null });
  });

  it('adds arrow lines and braces as strokes only, and filled diagram shapes', () => {
    editor.addShape('arrowLine');
    expect(object()).toMatchObject({ fill: null, stroke: '#1f2937', strokeWidth: 4, strokeLineCap: 'round' });
    expect(editor.inspect()?.fill).toBeNull();
    editor.setLineStyle('dashed');
    editor.addShape('line');
    expect(object(1)).toMatchObject({ strokeLineCap: 'round', strokeDashArray: [16, 8] });
    for (const kind of ['doubleArrowLine', 'brace', 'bracket'] as const) {
      editor.addShape(kind);
      expect(editor.inspect()?.fill).toBeNull();
    }
    for (const kind of ['terminator', 'document', 'database'] as const) {
      editor.addShape(kind);
      expect(editor.inspect()?.fill).toBe('#f28c28');
    }
    expect(names().slice(0, 3)).toEqual(['Base de datos 1', 'Documento 1', 'Inicio o fin 1']);
  });

  it('spreads three or more objects with equal gaps, as one undo step', async () => {
    const xs = [100, 150, 600];
    for (const x of xs) {
      editor.addShape('rect');
      editor.setProps({ left: x, top: 100 + x });
    }
    const centres = () => editor.toProject().layers.map((l) => Math.round(l.object.left as number));
    editor.selectAll();
    editor.distribute('x');
    const [a, b, c] = centres();
    expect([a, c]).toEqual([100, 600]);
    expect(b).toBe(350);
    expect(editor.selected()).toHaveLength(3);
    editor.distribute('y');
    expect(editor.toProject().layers.map((l) => Math.round(l.object.top as number))).toEqual([200, 450, 700]);
    await editor.undo();
    expect(centres()).toEqual([100, 350, 600]);
    editor.select([editor.layers()[0]?.id ?? '', editor.layers()[1]?.id ?? '']);
    editor.distribute('x'); // two objects: nothing to spread
    expect(centres()).toEqual([100, 350, 600]);
  });
});

describe('Editor', () => {
  it('starts empty with nothing to undo (RULE-068)', () => {
    expect(editor.layers()).toEqual([]);
    expect(editor.canUndo).toBe(false);
  });

  it('names objects automatically per type and places them at the centre (RULE-007)', () => {
    editor.addText();
    editor.addShape('rect');
    editor.addShape('rect');
    expect(names()).toEqual(['Rectángulo 2', 'Rectángulo 1', 'Texto 1']);
    const rect = editor.toProject().layers[1]?.object;
    expect(rect).toMatchObject({ left: 400, top: 300, originX: 'center' });
  });

  it('undoes and redoes additions, keeping the redo branch until a new edit (RULE-070/071/072)', async () => {
    editor.addShape('ellipse');
    editor.addShape('triangle');
    await editor.undo();
    expect(names()).toEqual(['Elipse 1']);
    await editor.redo();
    expect(names()).toEqual(['Triángulo 1', 'Elipse 1']);
    await editor.undo();
    editor.addShape('line');
    expect(editor.canRedo).toBe(false);
  });

  it('coalesces repeated nudges into one undo step', async () => {
    editor.addShape('rect');
    for (let i = 0; i < 5; i++) editor.nudge(1, 0);
    expect(editor.toProject().layers[0]?.object.left).toBe(405);
    await editor.undo();
    expect(editor.toProject().layers[0]?.object.left).toBe(400);
  });

  it('copies and pastes with an offset and new ids; chained pastes keep moving (RULE-065)', async () => {
    editor.addShape('rect');
    editor.copy();
    await editor.paste();
    await editor.paste();
    const lefts = editor.toProject().layers.map((l) => l.object.left);
    expect(lefts).toEqual([400, 420, 440]);
    expect(new Set(editor.layers().map((l) => l.id)).size).toBe(3);
  });

  it('deletes the selection and reorders layers', () => {
    editor.addShape('rect');
    editor.addShape('ellipse');
    editor.order('back');
    expect(names()).toEqual(['Rectángulo 1', 'Elipse 1']);
    editor.removeSelected();
    expect(names()).toEqual(['Rectángulo 1']);
  });

  it('groups and ungroups without moving the objects', () => {
    editor.addShape('rect');
    editor.nudge(-100, 0);
    editor.addShape('ellipse');
    editor.selectAll();
    editor.group();
    expect(editor.layers().map((l) => l.type)).toEqual(['group']);
    editor.ungroup();
    const xs = editor.toProject().layers.map((l) => Math.round(l.object.left as number));
    expect(xs).toEqual([300, 400]);
  });

  it('aligns a single object to the canvas edge using its rotated bounding box', () => {
    editor.addShape('rect'); // 150 x 150
    editor.setProps({ angle: 45 });
    editor.align('left');
    const obj = editor.canvas.getActiveObject();
    expect(obj?.getBoundingRect().left).toBeCloseTo(0, 6);
  });

  it('hides and locks layers; locked layers cannot be selected', () => {
    editor.addShape('rect');
    const id = editor.layers()[0]?.id ?? '';
    editor.setLocked(id, true);
    editor.select([id]);
    expect(editor.selected()).toHaveLength(0);
    editor.setVisible(id, false);
    expect(editor.toProject().layers[0]).toMatchObject({ locked: true, visible: false });
  });

  it('keeps objects centred when the canvas is resized', async () => {
    editor.addShape('rect');
    await editor.resizeCanvas(1000, 1000);
    expect(editor.toProject().layers[0]?.object).toMatchObject({ left: 500, top: 500 });
    expect(editor.size).toEqual({ width: 1000, height: 1000 });
  });

  it('a colour background is part of the document and undoable', async () => {
    await editor.setBackground({ kind: 'color', color: '#ffffff' });
    expect(editor.toProject().canvas.background).toEqual({ kind: 'color', color: '#ffffff' });
    await editor.undo();
    expect(editor.toProject().canvas.background).toEqual({ kind: 'transparent' });
  });
});

describe('Editor sizing', () => {
  it('sets the visible size exactly, uniform stroke included', async () => {
    document.body.innerHTML = '<canvas id="c"></canvas>';
    const ed = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
    await ed.open(newProject(800, 600));
    ed.addShape('rect');
    ed.setSize(400, 300);
    expect(ed.inspect()).toMatchObject({ width: 400, height: 300 });
  });
});
