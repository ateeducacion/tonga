import { describe, expect, it } from 'vitest';
import type { FabricObject } from 'fabric';
import { Editor } from '../src/canvas/editor';
import { snapToObjects } from '../src/canvas/snap';
import { newProject } from '../src/project/schema';

describe('snap geometry', () => {
  const box = { left: 103, top: 47, width: 40, height: 20 };

  it('lines up the nearest edge or centre within the threshold, with a guide per axis', () => {
    expect(snapToObjects(box, [{ left: 0, top: 0, width: 100, height: 50 }], 6)).toEqual({ dx: -3, dy: 3, guides: [{ axis: 'x', at: 100 }, { axis: 'y', at: 50 }] });
    // The centre of one against the centre of the other.
    expect(snapToObjects(box, [{ left: 102, top: 200, width: 44, height: 10 }], 6)).toMatchObject({ dx: -1, guides: [{ axis: 'x', at: 102 }] });
  });

  it('does nothing when everything is too far', () => {
    expect(snapToObjects(box, [{ left: 500, top: 500, width: 10, height: 10 }], 6)).toEqual({ dx: 0, dy: 0, guides: [] });
  });
});

describe('Editor snapping while dragging', () => {
  async function setup(): Promise<{ ed: Editor; moving: FabricObject }> {
    document.body.innerHTML = '<canvas id="c"></canvas>';
    const ed = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
    await ed.open(newProject(800, 600));
    ed.addShape('rect'); // 150×150 (+2 stroke) at the centre: 324..476
    ed.addShape('rect');
    const moving = ed.canvas.getActiveObject() as FabricObject;
    return { ed, moving };
  }
  const drag = (ed: Editor, target: FabricObject, left: number, top: number) => {
    target.set({ left, top }).setCoords();
    ed.canvas.fire('object:moving', { target } as never);
  };

  it('snaps to another object’s edge and draws a guide until the mouse is released', async () => {
    const { ed, moving } = await setup();
    drag(ed, moving, 555, 417); // its left edge (479) comes near the other's right edge (476)
    const edge = ed.canvas.getObjects()[0]?.getBoundingRect();
    expect(moving.getBoundingRect().left).toBeCloseTo((edge?.left ?? 0) + (edge?.width ?? 0), 5);
    expect(moving.top).toBe(417); // no vertical line close enough
    ed.canvas.renderAll(); // draws the guide
    ed.canvas.fire('mouse:up', {} as never);
    ed.canvas.fire('mouse:up', {} as never); // nothing left to clear
  });

  it('does not snap when switched off', async () => {
    const { ed, moving } = await setup();
    ed.setSnapping({ objects: false });
    expect(ed.snapping).toEqual({ objects: false });
    drag(ed, moving, 555, 417);
    expect(moving.left).toBe(555);
  });

  it('a multiple selection snaps as one box, against the canvas edges', async () => {
    const { ed } = await setup();
    ed.selectAll();
    const selection = ed.canvas.getActiveObject() as FabricObject;
    drag(ed, selection, 79, 300); // its left edge (3) comes close to the canvas edge (0)
    expect(selection.getBoundingRect().left).toBeCloseTo(0, 5);
  });
});
