// Objects tied to others: connectors between two objects, and text written inside a shape.
// The ties are custom properties saved with each layer (connectFrom/connectTo/connectArrow,
// attachedTo; declared in document.ts), so the .tonga format keeps its version. refreshLinks()
// re-draws them after any change; the geometry helpers are plain functions, tested on their own.
import { Group, Path, Point, Textbox, type Canvas, type FabricObject } from 'fabric';
import type { Box } from './snap';

type XY = { x: number; y: number };

/** A box, round when it holds an ellipse (connectors then end on the ellipse itself). */
export type Outline = Box & { round?: boolean };

/** Where the segment from the box's centre towards `to` leaves the box (or its ellipse). */
export function exitPoint(box: Outline, to: XY): XY {
  const c = { x: box.left + box.width / 2, y: box.top + box.height / 2 };
  const dx = to.x - c.x;
  const dy = to.y - c.y;
  if (!dx && !dy) return c;
  const t = box.round
    ? Math.min(1 / Math.hypot(dx / (box.width / 2), dy / (box.height / 2)), 1)
    : Math.min(dx ? box.width / 2 / Math.abs(dx) : Infinity, dy ? box.height / 2 / Math.abs(dy) : Infinity, 1);
  return { x: c.x + dx * t, y: c.y + dy * t };
}

/** The outline a connector ends on: the object's box, round for an unrotated ellipse. */
export function outlineOf(o: FabricObject): Outline {
  return { ...o.getBoundingRect(), round: o.type === 'ellipse' && o.angle % 180 === 0 };
}

const r = (v: number) => Math.round(v * 100) / 100;

/** SVG path data of a connector between two boxes, with an arrow head at the end if asked. */
export function connectorPath(from: Outline, to: Outline, arrow: boolean, width: number): string {
  const centre = (b: Box) => ({ x: b.left + b.width / 2, y: b.top + b.height / 2 });
  const a = exitPoint(from, centre(to));
  const b = exitPoint(to, centre(from));
  let d = `M ${r(a.x)} ${r(a.y)} L ${r(b.x)} ${r(b.y)}`;
  const length = Math.hypot(b.x - a.x, b.y - a.y);
  if (arrow && length > 0) {
    const size = Math.min(length / 2, 10 + width * 2);
    const angle = Math.atan2(b.y - a.y, b.x - a.x);
    const wing = (side: number) => ({ x: b.x - size * Math.cos(angle + (side * Math.PI) / 6), y: b.y - size * Math.sin(angle + (side * Math.PI) / 6) });
    const [p, q] = [wing(1), wing(-1)];
    d += ` M ${r(p.x)} ${r(p.y)} L ${r(b.x)} ${r(b.y)} L ${r(q.x)} ${r(q.y)}`;
  }
  return d;
}

export function isConnector(o: FabricObject): boolean {
  return typeof o.connectFrom === 'string' && typeof o.connectTo === 'string';
}

/** The style a connector keeps when it is re-drawn. */
const LOOK = ['stroke', 'strokeWidth', 'strokeDashArray', 'strokeLineCap', 'strokeLineJoin', 'shadow', 'opacity', 'visible'] as const;

/** A new connector path between two objects, styled like `look`. */
export function makeConnector(from: FabricObject, to: FabricObject, arrow: boolean, look: Partial<Record<(typeof LOOK)[number], unknown>>): Path {
  const width = typeof look.strokeWidth === 'number' ? look.strokeWidth : 4;
  const path = new Path(connectorPath(outlineOf(from), outlineOf(to), arrow, width), { ...(look as object), fill: null, strokeUniform: true });
  path.set({ connectFrom: from.id, connectTo: to.id, connectArrow: arrow, lockMovementX: true, lockMovementY: true, hasControls: false });
  return path;
}

/** Top-level objects plus those inside groups, by id (a grouped object can still be connected). */
function index(canvas: Canvas): Map<string, FabricObject> {
  const map = new Map<string, FabricObject>();
  const walk = (list: FabricObject[]) => {
    for (const o of list) {
      if (o.id) map.set(o.id, o);
      if (o instanceof Group) walk(o.getObjects());
    }
  };
  walk(canvas.getObjects());
  return map;
}

function pathData(p: Path): string {
  return p.path.map((seg) => seg.map((v) => (typeof v === 'number' ? r(v) : v)).join(' ')).join(' ');
}

/**
 * Re-draws every connector between its two objects (removing those that lost one) and puts
 * every text written inside a shape back at the shape's centre (removing it with the shape).
 */
export function refreshLinks(canvas: Canvas): void {
  const byId = index(canvas);
  for (const o of [...canvas.getObjects()]) {
    if (isConnector(o)) refreshConnector(canvas, o as Path, byId);
    else if (typeof o.attachedTo === 'string') refreshInsideText(canvas, o, byId.get(o.attachedTo));
  }
}

function refreshConnector(canvas: Canvas, o: Path, byId: Map<string, FabricObject>): void {
  const from = byId.get(o.connectFrom as string);
  const to = byId.get(o.connectTo as string);
  if (!from || !to) {
    canvas.remove(o);
    return;
  }
  // Moved only through its two objects; still selectable, to style or delete it.
  o.set({ lockMovementX: true, lockMovementY: true, hasControls: false });
  const arrow = o.connectArrow === true;
  if (connectorPath(outlineOf(from), outlineOf(to), arrow, o.strokeWidth) === pathData(o)) return;
  const look = Object.fromEntries(LOOK.map((k) => [k, o[k]]));
  const next = makeConnector(from, to, arrow, look);
  next.set({ id: o.id, name: o.name });
  const wasActive = canvas.getActiveObject() === o;
  canvas.insertAt(canvas.getObjects().indexOf(o), next);
  canvas.remove(o);
  if (wasActive) canvas.setActiveObject(next);
}

function refreshInsideText(canvas: Canvas, text: FabricObject, shape: FabricObject | undefined): void {
  if (!shape) {
    canvas.remove(text);
    return;
  }
  // Inside a group together with its shape, the group moves both.
  if (!canvas.getObjects().includes(shape)) return;
  text.set({ hasControls: false, lockScalingX: true, lockScalingY: true });
  const c = shape.getCenterPoint();
  const width = Math.max(20, shape.getScaledWidth() * 0.8);
  if (text instanceof Textbox) fitInside(text, width, shape.getScaledHeight() * 0.9);
  const t = text.getCenterPoint();
  if (Math.abs(t.x - c.x) < 0.01 && Math.abs(t.y - c.y) < 0.01 && text.angle === shape.angle && Math.abs(text.width - width) < 0.01) return;
  text.set({ angle: shape.angle, width });
  text.setPositionByOrigin(new Point(c.x, c.y), 'center', 'center');
  text.setCoords();
}

/**
 * Makes the letters smaller until the text fits the shape: a Textbox otherwise widens itself to
 * its longest word and spills out. It never makes them bigger again (that size is the user's).
 */
function fitInside(text: Textbox, width: number, height: number): void {
  text.set({ width });
  text.initDimensions();
  for (let i = 0; i < 20 && text.fontSize > 8 && (text.dynamicMinWidth > width + 0.5 || text.height > height); i++) {
    text.set({ fontSize: Math.max(8, Math.floor(text.fontSize * 0.9)), width });
    text.initDimensions();
  }
}

/** Moves a shape so its centre is where its inside text was dragged to. */
export function followText(canvas: Canvas, text: FabricObject): void {
  const shape = canvas.getObjects().find((o) => o.id === text.attachedTo);
  if (!shape) return;
  const c = text.getCenterPoint();
  shape.setPositionByOrigin(new Point(c.x, c.y), 'center', 'center');
  shape.setCoords();
}
