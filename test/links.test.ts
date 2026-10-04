import { beforeEach, describe, expect, it } from 'vitest';
import { Point, Textbox, type FabricObject } from 'fabric';
import { Editor } from '../src/canvas/editor';
import { connectorPath, exitPoint } from '../src/canvas/links';
import { newProject } from '../src/project/schema';

let editor: Editor;

beforeEach(async () => {
  document.body.innerHTML = '<canvas id="c"></canvas>';
  editor = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
  await editor.open(newProject(800, 600));
});

const names = () => editor.layers().map((l) => l.name);
const byName = (name: string) => editor.canvas.getObjects().find((o) => o.name === name) as FabricObject;

/** Two rectangles, the second moved to the right, both selected. */
function twoShapes(): void {
  editor.addShape('rect');
  editor.addShape('rect');
  editor.setProps({ left: 650 });
  editor.selectAll();
}

describe('connector geometry', () => {
  const box = { left: 0, top: 0, width: 100, height: 50 };

  it('leaves a box through the side facing the target', () => {
    expect(exitPoint(box, { x: 500, y: 25 })).toEqual({ x: 100, y: 25 });
    expect(exitPoint(box, { x: 50, y: -400 })).toEqual({ x: 50, y: 0 });
    expect(exitPoint(box, { x: 50, y: 25 })).toEqual({ x: 50, y: 25 });
    expect(exitPoint(box, { x: 60, y: 30 })).toEqual({ x: 60, y: 30 }); // target inside: stops there
  });

  it('ends on the ellipse itself when the object is round', () => {
    const p = exitPoint({ ...box, round: true }, { x: 150, y: 75 }); // diagonal from the centre (50, 25)
    expect(((p.x - 50) / 50) ** 2 + ((p.y - 25) / 25) ** 2).toBeCloseTo(1, 6);
    expect(exitPoint({ ...box, round: true }, { x: 500, y: 25 })).toEqual({ x: 100, y: 25 });
    expect(exitPoint({ ...box, round: true }, { x: 60, y: 27 })).toEqual({ x: 60, y: 27 });
  });

  it('draws a straight segment, with an arrow head at the end when asked', () => {
    const to = { left: 300, top: 0, width: 100, height: 50 };
    expect(connectorPath(box, to, false, 2)).toBe('M 100 25 L 300 25');
    expect(connectorPath(box, to, true, 2)).toMatch(/^M 100 25 L 300 25 M 287\.88 18 L 300 25 L 287\.88 32$/);
    expect(connectorPath(box, box, true, 2)).toBe('M 50 25 L 50 25'); // no length, no head
  });
});

describe('Connectors', () => {
  it('joins two selected objects behind them, and follows them when one moves', async () => {
    twoShapes();
    expect(editor.connect(true)).toBe(true);
    expect(names()).toEqual(['Rectángulo 2', 'Rectángulo 1', 'Conector 1']);
    expect(editor.inspect()?.connector).toEqual({ arrow: true });
    const before = editor.toProject().layers[0]?.object;
    expect(before).toMatchObject({ connectArrow: true, fill: null });
    expect(byName('Conector 1').lockMovementX).toBe(true); // moved only through its objects

    const moving = byName('Rectángulo 2');
    moving.set({ top: 100 }).setCoords();
    editor.canvas.fire('object:moving', { target: moving } as never);
    editor.canvas.fire('object:modified', { target: moving } as never);
    const after = editor.toProject().layers[0];
    expect(after?.id).toBe(editor.layers()[2]?.id);
    expect(after?.object.top).not.toBe(before?.top);

    await editor.open(editor.toProject()); // saved and opened again, still tied
    expect(editor.toProject().layers[0]?.object).toMatchObject({ connectFrom: expect.any(String), connectTo: expect.any(String) });
  });

  it('turns the arrow head off and on, and only with exactly two objects selected', () => {
    twoShapes();
    editor.connect(false);
    expect(editor.inspect()?.connector).toEqual({ arrow: false });
    editor.setConnectorArrow(true);
    expect(editor.inspect()?.connector).toEqual({ arrow: true });
    editor.selectAll();
    expect(editor.connect(true)).toBe(false);
    editor.select([editor.layers()[0]?.id ?? '']);
    editor.setConnectorArrow(false); // a rectangle: nothing to do
    expect(editor.inspect()?.connector).toBeUndefined();
  });

  it('goes when one of its objects is deleted, and keeps a grouped object connected', async () => {
    twoShapes();
    editor.connect(true);
    editor.addShape('ellipse');
    editor.select([editor.layers().find((l) => l.name === 'Elipse 1')?.id ?? '', editor.layers().find((l) => l.name === 'Rectángulo 1')?.id ?? '']);
    editor.group();
    expect(names()).toContain('Conector 1');
    await editor.undo();
    editor.select([editor.layers().find((l) => l.name === 'Rectángulo 2')?.id ?? '']);
    editor.removeSelected();
    expect(names()).toEqual(['Elipse 1', 'Rectángulo 1']);
  });
});

describe('Text inside shapes', () => {
  it('writes inside a shape, follows it, moves it when dragged and goes with it', () => {
    editor.addShape('rect');
    const shape = editor.canvas.getActiveObject() as FabricObject;
    editor.writeInside();
    const text = editor.canvas.getActiveObject() as Textbox;
    expect(text).toBeInstanceOf(Textbox);
    expect(text.isEditing).toBe(true);
    expect(names()).toEqual(['Texto 1', 'Rectángulo 1']);
    text.exitEditing();

    editor.select([shape.id ?? '']);
    editor.setProps({ left: 200, angle: 30 });
    expect(text.getCenterPoint().x).toBeCloseTo(200, 5);
    expect(text.angle).toBe(30);

    text.setPositionByOrigin(new Point(500, 300), 'center', 'center');
    editor.canvas.fire('object:moving', { target: text } as never);
    expect(shape.getCenterPoint().x).toBeCloseTo(500, 5);

    editor.writeInside(shape); // a second time edits the same text
    expect(names()).toEqual(['Texto 1', 'Rectángulo 1']);
    (editor.canvas.getActiveObject() as Textbox).exitEditing();
    editor.select([shape.id ?? '']);
    editor.removeSelected();
    expect(names()).toEqual([]);
  });

  it('makes the letters smaller until a long word fits inside the shape', () => {
    editor.addShape('rect');
    const shape = editor.canvas.getActiveObject() as FabricObject;
    editor.writeInside();
    const text = editor.canvas.getActiveObject() as Textbox;
    const before = text.fontSize;
    text.exitEditing();
    editor.select([text.id ?? '']);
    editor.setProps({ text: 'Fotosíntesis Fotosíntesis Fotosíntesis Fotosíntesis' });
    expect(text.fontSize).toBeLessThan(before);
    expect(text.dynamicMinWidth).toBeLessThanOrEqual(shape.getScaledWidth() * 0.8 + 0.5);
    expect(text.height).toBeLessThanOrEqual(shape.getScaledHeight() * 0.9);
  });

  it('a double click on a shape writes inside; not on lines, texts or while drawing', () => {
    editor.addShape('ellipse');
    const shape = editor.canvas.getActiveObject() as FabricObject;
    editor.addShape('line');
    const line = editor.canvas.getActiveObject() as FabricObject;
    editor.canvas.fire('mouse:dblclick', { target: line } as never);
    editor.canvas.fire('mouse:dblclick', {} as never);
    editor.setDrawing(true);
    editor.canvas.fire('mouse:dblclick', { target: shape } as never);
    editor.setDrawing(false);
    expect(names()).toEqual(['Línea 1', 'Elipse 1']);
    editor.canvas.fire('mouse:dblclick', { target: shape } as never);
    expect(names()).toEqual(['Línea 1', 'Texto 1', 'Elipse 1']);
    editor.writeInside(line); // not a shape
    expect(names()).toHaveLength(3);
  });

  it('inside a group with its shape it stays put; an orphan inside text is removed', async () => {
    editor.addShape('rect');
    editor.writeInside();
    (editor.canvas.getActiveObject() as Textbox).exitEditing();
    editor.selectAll();
    editor.group();
    expect(names()).toEqual(['Grupo 1']);
    const project = editor.toProject();
    const layer = project.layers[0];
    if (!layer) throw new Error('no layer');
    const text = (layer.object.objects as Record<string, unknown>[]).find((o) => o.attachedTo) as Record<string, unknown>;
    project.layers = [{ ...layer, id: 'orphan', object: { ...text } }];
    await editor.open(project);
    editor.commit();
    expect(names()).toEqual([]);
  });
});

describe('Eraser', () => {
  const pointer = (type: 'mouse:down' | 'mouse:move' | 'mouse:up', x: number, y: number) =>
    editor.canvas.fire(type, { e: new MouseEvent('mousemove'), scenePoint: new Point(x, y), viewportPoint: new Point(x, y) } as never);

  it('removes the strokes it passes over, in one undo step, and leaves shapes alone', async () => {
    editor.addShape('rect');
    editor.addShape('line'); // horizontal, through the centre (400, 300)
    editor.addShape('arrowLine');
    editor.setProps({ top: 500 });
    editor.setErasing(true);
    expect(editor.isErasing).toBe(true);
    expect(editor.canvas.skipTargetFind).toBe(true);
    pointer('mouse:down', 10, 10); // nothing there
    pointer('mouse:move', 400, 300);
    pointer('mouse:move', 400, 500);
    pointer('mouse:up', 400, 500);
    expect(names()).toEqual(['Rectángulo 1']);
    await editor.undo();
    expect(names()).toEqual(['Línea con flecha 1', 'Línea 1', 'Rectángulo 1']);
    pointer('mouse:move', 400, 300); // not pressed: nothing
    pointer('mouse:up', 400, 300);
    expect(names()).toHaveLength(3);
    editor.setErasing(false);
    expect(editor.canvas.defaultCursor).toBe('default');
  });
});
