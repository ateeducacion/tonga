// Snapping while dragging: to the edges and centres of other objects and of the canvas, and to
// a grid. Plain geometry (no Fabric), so it can be tested on its own.
//
// It should feel like a gentle magnet, not like steps: a line only pulls when it is close, and
// once the object has snapped to a line it stays there until the pointer moves clearly away
// (hysteresis), so a shaky hand does not make it jump on and off or between near lines.

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

/** The lines the object was snapped to on the previous move, per axis. */
export interface Stuck {
  x?: number;
  y?: number;
}

type Axis = 'x' | 'y';
type Match = { shift: number; at: number; other: Box };
const span = (b: Box, axis: Axis) => (axis === 'x' ? [b.left, b.width] : [b.top, b.height]) as [number, number];
const linesOf = (b: Box, axis: Axis) => {
  const [s, size] = span(b, axis);
  return [s, s + size / 2, s + size];
};

/**
 * The smallest shift (≤ threshold) along one axis that lines up an edge with an edge, or the
 * centre with a centre, of another box. Mixing them (an edge on a centre) snaps too eagerly.
 */
function nearest(box: Box, others: Box[], axis: Axis, threshold: number): Match | null {
  const [s, size] = span(box, axis);
  let best: Match | null = null;
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

/** Keeps the line snapped to last time while one of the box's lines is within `release` of it. */
function keep(box: Box, others: Box[], axis: Axis, at: number | undefined, release: number): Match | null {
  if (at === undefined) return null;
  const other = others.find((o) => linesOf(o, axis).some((l) => Math.abs(l - at) < 0.5));
  if (!other) return null;
  const mine = linesOf(box, axis).reduce((a, b) => (Math.abs(b - at) < Math.abs(a - at) ? b : a));
  return Math.abs(at - mine) <= release ? { shift: at - mine, at, other } : null;
}

/** A guide across the moved box and the box it lines up with. */
function guide(axis: Axis, at: number, moved: Box, other: Box): Guide {
  const across: Axis = axis === 'x' ? 'y' : 'x';
  const [a, as] = span(moved, across);
  const [b, bs] = span(other, across);
  return { axis, at, from: Math.min(a, b), to: Math.max(a + as, b + bs) };
}

/**
 * Lines up the box's edges or centre with those of the other boxes (canvas included) when one
 * comes within `threshold`. `stuck` holds what it was snapped to on the previous move: that line
 * keeps it until it is more than `release` away, so it takes a clear pull to come off.
 */
export function snapToObjects(box: Box, others: Box[], threshold: number, stuck: Stuck = {}, release = threshold * 2): SnapResult {
  const x = keep(box, others, 'x', stuck.x, release) ?? nearest(box, others, 'x', threshold);
  const y = keep(box, others, 'y', stuck.y, release) ?? nearest(box, others, 'y', threshold);
  const dx = x?.shift ?? 0;
  const dy = y?.shift ?? 0;
  const moved = { ...box, left: box.left + dx, top: box.top + dy };
  const guides: Guide[] = [];
  if (x) guides.push(guide('x', x.at, moved, x.other));
  if (y) guides.push(guide('y', y.at, moved, y.other));
  return { dx, dy, guides };
}

/**
 * Pulls the box's top-left corner onto a grid line when it comes within `threshold` of one, and
 * keeps it on the line it is `stuck` to until it is more than `release` away. Returns the shift
 * and the lines it is on now (to pass back as `stuck` on the next move).
 */
export function snapToGrid(box: Box, size: number, threshold: number, stuck: Stuck = {}, release = threshold * 2): SnapResult & Stuck {
  const to = (v: number, held: number | undefined): [number, number | undefined] => {
    if (held !== undefined && Math.abs(held - v) <= release) return [held - v, held];
    const line = Math.round(v / size) * size;
    return Math.abs(line - v) <= threshold ? [line - v, line] : [0, undefined];
  };
  const [dx, x] = to(box.left, stuck.x);
  const [dy, y] = to(box.top, stuck.y);
  return { dx, dy, guides: [], x, y };
}
