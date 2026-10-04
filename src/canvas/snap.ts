// Snapping while dragging: to the edges and centres of other objects and of the canvas, and to
// a grid. Plain geometry (no Fabric), so it can be tested on its own.

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * A guide to draw: a vertical line at x = `at` (or horizontal at y = `at`) running from `from`
 * to `to` along the other axis, just across the objects it lines up.
 */
export interface Guide {
  axis: 'x' | 'y';
  at: number;
  from: number;
  to: number;
}

export interface SnapResult {
  dx: number;
  dy: number;
  guides: Guide[];
}

type Axis = 'x' | 'y';
const span = (b: Box, axis: Axis) => (axis === 'x' ? [b.left, b.width] : [b.top, b.height]) as [number, number];

/**
 * The smallest shift (≤ threshold) along one axis that lines up an edge with an edge, or the
 * centre with a centre, of another box. Mixing them (an edge on a centre) snaps too eagerly.
 */
function nearest(box: Box, others: Box[], axis: Axis, threshold: number): { shift: number; at: number; other: Box } | null {
  const [s, size] = span(box, axis);
  let best: { shift: number; at: number; other: Box } | null = null;
  const consider = (mine: number, theirs: number, other: Box) => {
    const shift = theirs - mine;
    if (Math.abs(shift) <= threshold && (!best || Math.abs(shift) < Math.abs(best.shift))) best = { shift, at: theirs, other };
  };
  for (const other of others) {
    const [os, osize] = span(other, axis);
    for (const mine of [s, s + size]) for (const theirs of [os, os + osize]) consider(mine, theirs, other);
    consider(s + size / 2, os + osize / 2, other);
  }
  return best;
}

/** A guide across the moved box and the box it lines up with. */
function guide(axis: Axis, at: number, moved: Box, other: Box): Guide {
  const across: Axis = axis === 'x' ? 'y' : 'x';
  const [a, as] = span(moved, across);
  const [b, bs] = span(other, across);
  return { axis, at, from: Math.min(a, b), to: Math.max(a + as, b + bs) };
}

/** Lines up the box's edges or centre with those of the other boxes (canvas included). */
export function snapToObjects(box: Box, others: Box[], threshold: number): SnapResult {
  const x = nearest(box, others, 'x', threshold);
  const y = nearest(box, others, 'y', threshold);
  const dx = x?.shift ?? 0;
  const dy = y?.shift ?? 0;
  const moved = { ...box, left: box.left + dx, top: box.top + dy };
  const guides: Guide[] = [];
  if (x) guides.push(guide('x', x.at, moved, x.other));
  if (y) guides.push(guide('y', y.at, moved, y.other));
  return { dx, dy, guides };
}

/** Moves the box's top-left corner onto the nearest grid crossing. */
export function snapToGrid(box: Box, size: number): { dx: number; dy: number } {
  const to = (v: number) => Math.round(v / size) * size - v;
  return { dx: to(box.left), dy: to(box.top) };
}
