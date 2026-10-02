import { beforeEach, describe, expect, it } from 'vitest';
import { Editor } from '../src/canvas/editor';
import { newProject } from '../src/project/schema';

let editor: Editor;

beforeEach(async () => {
  document.body.innerHTML = '<canvas id="c"></canvas>';
  editor = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
  await editor.open(newProject(800, 600));
});

const names = () => editor.layers().map((l) => l.name);

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
