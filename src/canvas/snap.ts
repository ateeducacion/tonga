// Snapping while dragging: to the grid and to the edges and centres of other objects and of the
// canvas. Plain geometry (no Fabric), so it can be tested on its own.

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** A guide line to draw: a vertical line at x = `at`, or a horizontal one at y = `at`. */
export interface Guide {
  axis: 'x' | 'y';
  at: number;
}

export interface SnapResult {
  dx: number;
  dy: number;
  guides: Guide[];
}

const lines = (start: number, size: number) => [start, start + size / 2, start + size];

/** The shift (≤ threshold) that lines up one of `moving` with one of `targets`, or null. */
function nearest(moving: number[], targets: number[], threshold: number): { shift: number; at: number } | null {
  let best: { shift: number; at: number } | null = null;
  for (const m of moving) {
    for (const t of targets) {
      const shift = t - m;
      if (Math.abs(shift) <= threshold && (!best || Math.abs(shift) < Math.abs(best.shift))) best = { shift, at: t };
    }
  }
  return best;
}

/** Lines up the box's edges or centre with those of the other boxes (canvas included). */
export function snapToObjects(box: Box, others: Box[], threshold: number): SnapResult {
  const x = nearest(lines(box.left, box.width), others.flatMap((o) => lines(o.left, o.width)), threshold);
  const y = nearest(lines(box.top, box.height), others.flatMap((o) => lines(o.top, o.height)), threshold);
  const guides: Guide[] = [];
  if (x) guides.push({ axis: 'x', at: x.at });
  if (y) guides.push({ axis: 'y', at: y.at });
  return { dx: x?.shift ?? 0, dy: y?.shift ?? 0, guides };
}

/** Moves the box's top-left corner onto the nearest grid crossing. */
export function snapToGrid(box: Box, size: number): { dx: number; dy: number } {
  const to = (v: number) => Math.round(v / size) * size - v;
  return { dx: to(box.left), dy: to(box.top) };
}
