import { describe, expect, it } from 'vitest';
import type { FabricObject } from 'fabric';
import { Editor } from '../src/canvas/editor';
import { snapToGrid, snapToObjects } from '../src/canvas/snap';
import { newProject } from '../src/project/schema';

describe('snap geometry', () => {
  const box = { left: 103, top: 47, width: 40, height: 20 };

  it('lines up the nearest edge within the threshold, with a short guide across both boxes', () => {
    expect(snapToObjects(box, [{ left: 0, top: 0, width: 100, height: 50 }], 6)).toEqual({
      dx: -3, dy: 3,
      guides: [{ axis: 'x', at: 100, from: 0, to: 70 }, { axis: 'y', at: 50, from: 0, to: 140 }],
    });
  });

  it('lines up centre with centre', () => {
    expect(snapToObjects(box, [{ left: 99, top: 300, width: 50, height: 10 }], 6)).toMatchObject({ dx: 1, guides: [{ axis: 'x', at: 124, from: 47, to: 310 }] });
  });

  it('never pulls an edge onto a centre, nor anything too far', () => {
    expect(snapToObjects(box, [{ left: 54, top: 500, width: 100, height: 10 }], 6)).toEqual({ dx: 0, dy: 0, guides: [] }); // its centre (104) is 1 px from our left edge
    expect(snapToObjects(box, [{ left: 500, top: 500, width: 10, height: 10 }], 6)).toEqual({ dx: 0, dy: 0, guides: [] });
  });

  it('pulls the top-left corner onto a grid line only when it is close (a magnet, not steps)', () => {
    expect(snapToGrid(box, 20, 5)).toEqual({ dx: -3, dy: 0 }); // 103 → 100; 47 is 7 px from 40 or 60: free
    expect(snapToGrid({ ...box, top: 58 }, 20, 5)).toEqual({ dx: -3, dy: 2 });
  });

  it('stays on the line it snapped to until the box moves twice the threshold away', () => {
    const other = [{ left: 0, top: 300, width: 100, height: 50 }];
    const at = (left: number, stuck = {}) => snapToObjects({ ...box, left }, other, 6, stuck).dx;
    expect(at(108)).toBe(0); // 8 px from the edge at 100: too far to catch…
    expect(at(108, { x: 100 })).toBe(-8); // …but enough to hold on once caught
    expect(at(113, { x: 100 })).toBe(0); // 13 px: let go
    expect(at(108, { x: 999 })).toBe(0); // a line that is no longer there holds nothing
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
  const drag = (ed: Editor, target: FabricObject, left: number, top: number, altKey = false) => {
    target.set({ left, top }).setCoords();
    ed.canvas.fire('object:moving', { target, e: new MouseEvent('mousemove', { altKey }) } as never);
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

  it('moves freely with Alt held', async () => {
    const { ed, moving } = await setup();
    drag(ed, moving, 555, 417, true);
    expect(moving.left).toBe(555);
  });

  it('snaps to the grid when asked (drawn while dragging), and not at all when both are off', async () => {
    const { ed, moving } = await setup();
    ed.setSnapping({ grid: true, objects: false });
    expect(ed.snapping).toEqual({ grid: true, objects: false });
    drag(ed, moving, 793, 397); // corner (717, 321) near the grid crossing (720, 320)
    const r = moving.getBoundingRect();
    expect([r.left % 40, r.top % 40].map((v) => Math.round(Math.min(v, 40 - v) * 1000) / 1000)).toEqual([0, 0]);
    ed.canvas.renderAll(); // draws the grid
    drag(ed, moving, 803, 407); // corner 7 and 11 px from the lines: moves freely
    expect(moving.left).toBe(803);
    ed.canvas.fire('mouse:up', {} as never);
    ed.setSnapping({ grid: false });
    drag(ed, moving, 793, 397); // corner (717, 321) near the grid crossing (720, 320)
    expect(moving.left).toBe(793); // both off: no snapping at all
  });

  it('a multiple selection snaps as one box, against the canvas edges', async () => {
    const { ed } = await setup();
    ed.setSnapping({ grid: true });
    ed.selectAll();
    const selection = ed.canvas.getActiveObject() as FabricObject;
    drag(ed, selection, 79, 300); // its left edge (3) comes close to the canvas edge (0)
    expect(selection.getBoundingRect().left).toBeCloseTo(0, 5);
  });
});
