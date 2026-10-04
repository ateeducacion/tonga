// The interactive editor: a Fabric canvas plus Tonga's document rules (ids, names, lock,
// background, snapshot history). The UI talks to this class only.
import {
  ActiveSelection, Canvas, Ellipse, FabricImage, FabricObject, type FabricObjectProps, Gradient, Group, Line, Path, PencilBrush, Point, Rect, Shadow, Textbox, Triangle, util,
} from 'fabric';
import { History } from '../history/history';
import { LAYER_LABEL } from '../i18n/es';
import type { Background, Layer, LayerType, Project } from '../project/schema';
import { newProject, parseProject, serializeProject } from '../project/schema';
import { applyBackground, layerType, readProject, setLocked, writeProject, type SourceResolver } from './document';
import './controls';
import { SHAPES, type ShapeDef, type ShapeKind } from './shapes';
import { snapToGrid, snapToObjects, type Guide, type SnapResult } from './snap';
import { followText, isConnector, makeConnector, refreshLinks } from './links';
import { applyAdjustments, applyCrop, cropFromFrame, isImage, readAdjustments, readCrop, removeBackground, type ImageAdjustments, type ImageCrop } from './image';

export type { ShapeKind } from './shapes';
export type AlignEdge = 'left' | 'center' | 'right' | 'top' | 'middle' | 'bottom';

export interface LayerInfo {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  selected: boolean;
}

/** What the inspector shows for the current selection. Numbers are in canvas pixels / degrees. */
export interface SelectionInfo {
  ids: string[];
  type: LayerType | 'selection';
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  angle: number;
  opacity: number;
  fill: string | null;
  stroke: string | null;
  strokeWidth: number;
  shadow: ShadowStyle | null;
  lineStyle: LineStyle;
  /** The fill gradient; `fill` then holds its first colour. */
  gradient: GradientFill | null;
  connector?: { arrow: boolean };
  text?: { text: string; fontFamily: string; fontSize: number; bold: boolean; italic: boolean; underline: boolean; textAlign: string };
  image?: { adjustments: ImageAdjustments; crop: ImageCrop };
}

export const DEFAULT_FILL = '#f28c28';
export const DEFAULT_STROKE = '#1f2937';
const PASTE_OFFSET = 20;

/** Grid spacing in canvas pixels; the visible grid uses the same size at every zoom. */
export const GRID_SIZE = 20;
/** How close (screen pixels) an edge must come to another to snap to it. */
const SNAP_DISTANCE = 6;

export interface Snapping {
  grid: boolean;
  objects: boolean;
}

export type LineStyle = 'solid' | 'dashed' | 'dotted';

/** Dashes and dots grow with the stroke, so they keep their look at any width. */
export function dashFor(style: LineStyle, width: number): number[] | null {
  const w = Math.max(1, width);
  if (style === 'dashed') return [w * 4, w * 2];
  return style === 'dotted' ? [0, w * 2.5] : null;
}

export function lineStyleOf(o: FabricObject): LineStyle {
  const dash = o.strokeDashArray;
  if (!dash?.length) return 'solid';
  return dash[0] === 0 ? 'dotted' : 'dashed';
}

export type GradientDirection = 'horizontal' | 'vertical' | 'diagonal';

/** A two-colour linear gradient across the object's box. */
export interface GradientFill {
  from: string;
  to: string;
  direction: GradientDirection;
}

const GRADIENT_COORDS: Record<GradientDirection, { x1: number; y1: number; x2: number; y2: number }> = {
  horizontal: { x1: 0, y1: 0, x2: 1, y2: 0 },
  vertical: { x1: 0, y1: 0, x2: 0, y2: 1 },
  diagonal: { x1: 0, y1: 0, x2: 1, y2: 1 },
};

export function makeGradient(g: GradientFill): Gradient<'linear'> {
  return new Gradient({
    type: 'linear', gradientUnits: 'percentage', coords: GRADIENT_COORDS[g.direction],
    colorStops: [{ offset: 0, color: g.from }, { offset: 1, color: g.to }],
  });
}

export function readGradient(fill: unknown): GradientFill | null {
  if (!(fill instanceof Gradient) || fill.type !== 'linear' || fill.colorStops.length < 2) return null;
  const { x1, y1, x2, y2 } = fill.coords;
  const direction: GradientDirection = x1 === x2 ? 'vertical' : y1 === y2 ? 'horizontal' : 'diagonal';
  const stops = [...fill.colorStops].sort((a, b) => a.offset - b.offset);
  return { from: (stops[0] as { color: string }).color, to: (stops[stops.length - 1] as { color: string }).color, direction };
}

/** A simple drop shadow, in canvas pixels. */
export interface ShadowStyle {
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
}

export const DEFAULT_SHADOW: ShadowStyle = { color: '#1f2937', blur: 12, offsetX: 4, offsetY: 6 };

/** New objects of each kind start with the style last chosen for that kind. */
type StyleKind = 'shape' | 'line' | 'text';
const STYLE_KEYS: Record<StyleKind, string[]> = {
  shape: ['fill', 'stroke', 'strokeWidth', 'strokeDashArray', 'strokeLineCap', 'shadow'],
  line: ['stroke', 'strokeWidth', 'strokeDashArray', 'strokeLineCap', 'shadow'],
  text: ['fill', 'fontFamily', 'fontWeight', 'fontStyle', 'underline', 'shadow'],
};

function styleKind(o: FabricObject): StyleKind | null {
  if (o instanceof Textbox) return 'text';
  const type = layerType(o);
  if (type === 'line' || (type === 'path' && !o.fill)) return 'line';
  return type === 'image' || type === 'group' ? null : 'shape';
}

/** The pencil: colour, width, and freehand or straight lines. */
export interface DrawStyle {
  color: string;
  width: number;
  straight: boolean;
}

export function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export class Editor {
  readonly canvas: Canvas;
  private width = 1;
  private height = 1;
  private background: Background = { kind: 'transparent' };
  private title = '';
  private zoom = 1;
  private history = new History(serializeProject(newProject(1, 1)));
  private restoring = false;
  private rev = 0;
  private clipboard: Layer[] = [];
  private pasteCount = 0;
  private listeners = new Set<() => void>();
  private drawing = false;
  private drawStyle: DrawStyle = { color: DEFAULT_STROKE, width: 4, straight: false };
  private lineStart: Point | null = null;
  private lineDraft: Line | null = null;
  private styles: Record<StyleKind, Record<string, unknown>> = { shape: {}, line: {}, text: {} };
  private snap: Snapping = { grid: false, objects: true };
  private erasing = false;
  private erasePressed = false;
  private erasedSome = false;
  private crop: { image: FabricImage; frame: Rect } | null = null;
  private guides: Guide[] = [];

  constructor(
    element: HTMLCanvasElement,
    private readonly resolve: SourceResolver,
  ) {
    this.canvas = new Canvas(element, { preserveObjectStacking: true, selectionKey: 'shiftKey', fireRightClick: true, stopContextMenu: false });
    this.canvas.freeDrawingBrush = new PencilBrush(this.canvas);
    const changed = () => {
      // Selecting something else while cropping leaves the image as it was.
      if (this.crop && this.canvas.getActiveObject() !== this.crop.frame) this.finishCrop(false);
      else this.emit();
    };
    this.canvas.on('selection:created', changed);
    this.canvas.on('selection:updated', changed);
    this.canvas.on('selection:cleared', changed);
    // A drag, scale or rotation ends with one object:modified: one undo step.
    this.canvas.on('object:modified', () => this.commit());
    this.canvas.on('text:changed', ({ target }) => this.commit(`text:${target.id ?? ''}`));
    this.canvas.on('text:editing:exited', () => this.history.seal());
    // Right click selects what is under the pointer (keeping a multiple selection). The menu
    // itself opens on the native contextmenu event, which comes after this (see App).
    this.canvas.on('mouse:down', ({ e, target }) => {
      if (!('button' in e) || e.button !== 2) return;
      if (target && target.selectable !== false && !this.selected().includes(target)) {
        this.canvas.setActiveObject(target);
        this.canvas.requestRenderAll();
        this.emit();
      }
    });
    this.canvas.on('path:created', ({ path }) => {
      this.identify(path, 'path');
      this.commit();
    });
    // Straight pencil: press, drag and release draws one line (Shift keeps it at 45° steps).
    this.canvas.on('mouse:down', ({ scenePoint }) => {
      if (this.drawing && this.drawStyle.straight) this.lineStart = scenePoint;
    });
    this.canvas.on('mouse:move', ({ e, scenePoint }) => {
      if (this.lineStart) this.draftLine(this.lineStart, scenePoint, e.shiftKey);
    });
    this.canvas.on('mouse:up', () => this.finishLine());
    this.canvas.on('object:moving', ({ target }) => {
      this.snapMoving(target);
      if (typeof target.attachedTo === 'string') followText(this.canvas, target); // dragging the text moves its shape
      refreshLinks(this.canvas);
    });
    this.canvas.on('object:scaling', () => refreshLinks(this.canvas));
    this.canvas.on('object:rotating', () => refreshLinks(this.canvas));
    this.canvas.on('mouse:dblclick', ({ target }) => {
      if (target && !this.drawing && !this.erasing && styleKind(target) === 'shape' && !(target instanceof Textbox)) this.writeInside(target);
    });
    // Eraser: everything drawn with a stroke (pencil strokes, lines, arrows) under the pointer
    // goes; one press-drag-release is one undo step.
    this.canvas.on('mouse:down', ({ scenePoint, viewportPoint }) => {
      if (!this.erasing) return;
      this.erasePressed = true;
      this.eraseAt(scenePoint, viewportPoint);
    });
    this.canvas.on('mouse:move', ({ scenePoint, viewportPoint }) => {
      if (this.erasePressed) this.eraseAt(scenePoint, viewportPoint);
    });
    this.canvas.on('mouse:up', () => {
      const erased = this.erasePressed && this.erasedSome;
      this.erasePressed = false;
      this.erasedSome = false;
      if (erased) this.commit();
    });
    this.canvas.on('mouse:up', () => this.clearGuides());
    this.canvas.on('after:render', ({ ctx }) => this.drawGuides(ctx));
  }

  get snapping(): Snapping {
    return { ...this.snap };
  }

  setSnapping(snap: Partial<Snapping>): void {
    this.snap = { ...this.snap, ...snap };
  }

  /** While dragging, pulls the object onto other objects' edges and centres, or onto the grid. */
  private snapMoving(target: FabricObject): void {
    if (!this.snap.grid && !this.snap.objects) return;
    const moving = target instanceof ActiveSelection ? target.getObjects() : [target];
    const box = target.getBoundingRect();
    let result: SnapResult = { dx: 0, dy: 0, guides: [] };
    if (this.snap.objects) {
      const others = this.canvas.getObjects().filter((o) => !moving.includes(o) && o.visible !== false).map((o) => o.getBoundingRect());
      others.push({ left: 0, top: 0, width: this.width, height: this.height });
      result = snapToObjects(box, others, SNAP_DISTANCE / this.zoom);
    }
    if (this.snap.grid) {
      const grid = snapToGrid(box, GRID_SIZE);
      if (!result.guides.some((g) => g.axis === 'x')) result.dx = grid.dx;
      if (!result.guides.some((g) => g.axis === 'y')) result.dy = grid.dy;
    }
    target.set({ left: target.left + result.dx, top: target.top + result.dy }).setCoords();
    this.guides = result.guides;
  }

  private clearGuides(): void {
    if (!this.guides.length) return;
    this.guides = [];
    this.canvas.requestRenderAll();
  }

  private drawGuides(ctx: CanvasRenderingContext2D): void {
    if (!this.guides.length) return;
    ctx.save();
    ctx.transform(...(this.canvas.viewportTransform as [number, number, number, number, number, number]));
    ctx.strokeStyle = '#e11d48';
    ctx.lineWidth = 1 / this.zoom;
    ctx.setLineDash([4 / this.zoom, 3 / this.zoom]);
    ctx.beginPath();
    for (const g of this.guides) {
      if (g.axis === 'x') {
        ctx.moveTo(g.at, 0);
        ctx.lineTo(g.at, this.height);
      } else {
        ctx.moveTo(0, g.at);
        ctx.lineTo(this.width, g.at);
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  private draftLine(from: Point, to: Point, snap: boolean): void {
    if (this.lineDraft) this.canvas.remove(this.lineDraft);
    const end = snap ? snapAngle(from, to) : to;
    this.lineDraft = new Line([from.x, from.y, end.x, end.y], {
      stroke: this.drawStyle.color, strokeWidth: this.drawStyle.width, strokeUniform: true, strokeLineCap: 'round',
    });
    this.canvas.add(this.lineDraft);
    this.canvas.requestRenderAll();
  }

  private finishLine(): void {
    const line = this.lineDraft;
    this.lineStart = null;
    this.lineDraft = null;
    if (!line) return;
    // A click without a drag leaves no dot behind.
    if (Math.hypot(line.x2 - line.x1, line.y2 - line.y1) < 2) {
      this.canvas.remove(line);
      return;
    }
    this.identify(line, 'line');
    line.setCoords();
    this.commit();
  }

  /** Called on every document or selection change. */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    for (const l of this.listeners) l();
  }

  get size(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  get currentBackground(): Background {
    return this.background;
  }

  get canUndo(): boolean {
    return this.history.canUndo;
  }

  get canRedo(): boolean {
    return this.history.canRedo;
  }

  /** Increases whenever the document changes (edit, undo, redo, open). */
  get revision(): number {
    return this.rev;
  }

  get hasClipboard(): boolean {
    return this.clipboard.length > 0;
  }

  get zoomLevel(): number {
    return this.zoom;
  }

  // ---- Document ---------------------------------------------------------------------------

  toProject(): Project {
    return readProject(this.canvas, this.size, this.background, this.title);
  }

  /** Replaces the document and starts a fresh history (new or opened project). */
  async open(project: Project): Promise<void> {
    await this.load(project);
    this.history.reset(serializeProject(this.toProject()));
    this.rev++;
    this.emit();
  }

  private async load(project: Project, selectIds: string[] = []): Promise<void> {
    this.restoring = true;
    try {
      this.crop = null; // the frame goes with the old content
      this.canvas.discardActiveObject();
      this.width = project.canvas.width;
      this.height = project.canvas.height;
      this.background = project.canvas.background;
      this.title = project.title;
      this.applySize();
      await writeProject(this.canvas, project, this.resolve);
      this.select(selectIds);
    } finally {
      this.restoring = false;
    }
  }

  /** Records the current state as an undo step. Same `key` in a row = one step. */
  commit(key: string | null = null): void {
    if (this.restoring) return;
    refreshLinks(this.canvas); // connectors and inside texts follow whatever changed
    const before = this.history.current;
    this.history.push(serializeProject(this.toProject()), key);
    if (this.history.current !== before) this.rev++;
    this.emit();
  }

  async undo(): Promise<void> {
    const state = this.history.undo();
    if (state !== null) await this.restore(state);
  }

  async redo(): Promise<void> {
    const state = this.history.redo();
    if (state !== null) await this.restore(state);
  }

  private async restore(state: string): Promise<void> {
    const ids = this.selected().map((o) => o.id ?? '');
    await this.load(parseProject(state), ids);
    this.rev++;
    this.emit();
  }

  async setBackground(background: Background): Promise<void> {
    this.background = background;
    await applyBackground(this.canvas, { width: this.width, height: this.height, background }, this.resolve);
    this.canvas.requestRenderAll();
    this.commit();
  }

  async resizeCanvas(width: number, height: number): Promise<void> {
    const dx = (width - this.width) / 2;
    const dy = (height - this.height) / 2;
    for (const o of this.canvas.getObjects()) o.set({ left: o.left + dx, top: o.top + dy }).setCoords();
    this.width = width;
    this.height = height;
    this.applySize();
    await applyBackground(this.canvas, { width, height, background: this.background }, this.resolve);
    this.commit();
  }

  // ---- View -------------------------------------------------------------------------------

  setZoom(zoom: number): void {
    this.zoom = Math.min(8, Math.max(0.05, zoom));
    this.applySize();
    this.emit();
  }

  /** Largest zoom at which the whole canvas fits in the given box. */
  fitZoom(boxWidth: number, boxHeight: number): number {
    return Math.min(boxWidth / this.width, boxHeight / this.height, 1);
  }

  private applySize(): void {
    this.canvas.setDimensions({ width: Math.round(this.width * this.zoom), height: Math.round(this.height * this.zoom) });
    this.canvas.setZoom(this.zoom);
    this.canvas.requestRenderAll();
  }

  // ---- Layers -----------------------------------------------------------------------------

  /** Layers top-most first, as a layers panel lists them. */
  layers(): LayerInfo[] {
    const selected = new Set(this.selected());
    return this.canvas.getObjects().filter((o) => !o.excludeFromExport).map((o) => ({
      id: o.id ?? '', type: layerType(o), name: o.name ?? '', visible: o.visible !== false, locked: o.selectable === false,
      selected: selected.has(o),
    })).reverse();
  }

  private byId(id: string): FabricObject | undefined {
    return this.canvas.getObjects().find((o) => o.id === id);
  }

  inspect(): SelectionInfo | null {
    const o = this.canvas.getActiveObject();
    if (!o) return null;
    const multi = o instanceof ActiveSelection;
    const type = multi ? 'selection' : layerType(o);
    const colour = (v: unknown) => (typeof v === 'string' && /^#[0-9a-f]{6}$/i.test(v) ? v : typeof v === 'string' && v ? v : null);
    const info: SelectionInfo = {
      ids: this.selected().map((x) => x.id ?? ''),
      type,
      name: multi ? '' : (o.name ?? ''),
      x: Math.round(o.left),
      y: Math.round(o.top),
      width: Math.round(o.getScaledWidth()),
      height: Math.round(o.getScaledHeight()),
      angle: Math.round(o.angle),
      opacity: o.opacity,
      fill: multi ? null : (readGradient(o.fill)?.from ?? colour(o.fill)),
      gradient: multi ? null : readGradient(o.fill),
      stroke: multi ? null : colour(o.stroke),
      strokeWidth: o.strokeWidth,
      shadow: readShadow(multi ? this.selected()[0] : o),
      lineStyle: lineStyleOf(multi ? (this.selected()[0] as FabricObject) : o),
    };
    if (isImage(o)) info.image = { adjustments: readAdjustments(o), crop: readCrop(o) };
    if (isConnector(o)) info.connector = { arrow: o.connectArrow === true };
    if (o instanceof Textbox) {
      info.text = {
        text: o.text, fontFamily: o.fontFamily, fontSize: o.fontSize, bold: o.fontWeight === 'bold' || Number(o.fontWeight) >= 600,
        italic: o.fontStyle === 'italic', underline: o.underline, textAlign: o.textAlign,
      };
    }
    return info;
  }

  /** True while the user types inside a text object on the canvas. */
  isEditingText(): boolean {
    const o = this.canvas.getActiveObject();
    return o instanceof Textbox && o.isEditing;
  }

  selected(): FabricObject[] {
    return this.canvas.getActiveObjects();
  }

  select(ids: string[]): void {
    const objects = ids.map((id) => this.byId(id)).filter((o): o is FabricObject => !!o && o.selectable !== false && o.visible !== false);
    this.canvas.discardActiveObject();
    if (objects.length === 1) this.canvas.setActiveObject(objects[0] as FabricObject);
    else if (objects.length > 1) this.canvas.setActiveObject(new ActiveSelection(objects, { canvas: this.canvas }));
    this.canvas.requestRenderAll();
    this.emit();
  }

  selectAll(): void {
    this.select(this.canvas.getObjects().map((o) => o.id ?? ''));
  }

  rename(id: string, name: string): void {
    this.byId(id)?.set({ name: name.trim().slice(0, 200) });
    this.commit();
  }

  setVisible(id: string, visible: boolean): void {
    const obj = this.byId(id);
    if (!obj) return;
    if (!visible && this.selected().includes(obj)) this.canvas.discardActiveObject();
    obj.set({ visible });
    this.canvas.requestRenderAll();
    this.commit();
  }

  setLocked(id: string, locked: boolean): void {
    const obj = this.byId(id);
    if (!obj) return;
    if (locked && this.selected().includes(obj)) this.canvas.discardActiveObject();
    setLocked(obj, locked);
    this.canvas.requestRenderAll();
    this.commit();
  }

  // ---- Creating objects -------------------------------------------------------------------

  /** Gives a new object an id and the next free automatic name ("Texto 3"). */
  private identify(obj: FabricObject, type: LayerType, name?: string, label = LAYER_LABEL[type]): void {
    if (name?.trim()) {
      obj.set({ id: newId(), name: name.trim().slice(0, 200) });
      return;
    }
    const used = this.canvas.getObjects().map((o) => o.name ?? '').map((n) => (n.startsWith(`${label} `) ? Number(n.slice(label.length + 1)) : 0));
    obj.set({ id: newId(), name: `${label} ${Math.max(0, ...used.filter(Number.isFinite)) + 1}` });
  }

  private place(obj: FabricObject, type: LayerType, name?: string, label?: string): void {
    this.identify(obj, type, name, label);
    // RULE-007: new objects start at the centre of the canvas.
    if (obj.left === 0 && obj.top === 0) obj.set({ left: this.width / 2, top: this.height / 2 });
    obj.setCoords();
    this.canvas.add(obj);
    this.canvas.setActiveObject(obj);
    this.commit();
  }

  /** Adds already-built objects (e.g. parsed from an SVG) as new layers and selects them. */
  addObjects(objects: FabricObject[], name?: string): void {
    if (!objects.length) return;
    this.restoring = true;
    try {
      for (const o of objects) {
        this.identify(o, layerType(o), objects.length === 1 ? name : undefined);
        o.setCoords();
        this.canvas.add(o);
      }
    } finally {
      this.restoring = false;
    }
    this.select(objects.map((o) => o.id ?? ''));
    this.commit();
  }

  private unit(): number {
    return Math.round(Math.min(this.width, this.height) / 4);
  }

  addText(text = 'Texto'): void {
    const size = Math.max(16, Math.round(this.unit() / 4));
    this.place(new Textbox(text, { width: this.unit() * 2, fontSize: size, fontFamily: 'Arial', fill: DEFAULT_STROKE, textAlign: 'center', ...this.styleFor('text') }), 'text');
  }

  addShape(kind: ShapeKind): void {
    const u = this.unit();
    const style = { fill: DEFAULT_FILL, stroke: DEFAULT_STROKE, strokeWidth: 2, strokeUniform: true, ...this.styleFor('shape') };
    const lineStyle = { stroke: DEFAULT_STROKE, strokeWidth: 4, strokeUniform: true, strokeLineCap: 'round' as const, strokeLineJoin: 'round' as const, ...this.styleFor('line') };
    // kind is a ShapeKind, so it is always in the catalogue.
    const shape = SHAPES.find((x) => x.kind === kind) as ShapeDef;
    if (kind === 'rect') this.place(new Rect({ width: u, height: u, ...style }), 'rect');
    else if (kind === 'roundRect') this.place(new Rect({ width: u, height: u * 0.7, rx: u / 8, ry: u / 8, ...style }), 'rect', undefined, shape.label);
    else if (kind === 'ellipse') this.place(new Ellipse({ rx: u / 2, ry: u / 3, ...style }), 'ellipse');
    else if (kind === 'circle') this.place(new Ellipse({ rx: u / 2, ry: u / 2, ...style }), 'ellipse', undefined, shape.label);
    else if (kind === 'triangle') this.place(new Triangle({ width: u, height: u, ...style }), 'triangle');
    else if (kind === 'line') this.place(new Line([-u / 2, 0, u / 2, 0], lineStyle), 'line');
    else {
      // Closed shapes have a fill, like any other shape; open ones (arrow lines) are only a stroke.
      const open = shape.open === true;
      const look: Partial<FabricObjectProps> = open ? { ...lineStyle, fill: null } : style;
      const path = new Path(shape.d, { ...look, scaleX: u / 100, scaleY: u / 100 });
      path.set({ left: this.width / 2, top: this.height / 2 });
      this.place(path, 'path', undefined, shape.label);
    }
  }

  /** The style last chosen for this kind of object, ready to give to a new one. */
  private styleFor(kind: StyleKind): Record<string, unknown> {
    const { shadow, ...rest } = this.styles[kind];
    // Each new object gets its own shadow and gradient, never one shared with another object.
    const gradient = readGradient(rest.fill);
    if (gradient) rest.fill = makeGradient(gradient);
    return shadow === undefined ? rest : { ...rest, shadow: shadow ? new Shadow(shadow as ShadowStyle) : null };
  }

  /** A gradient fill on every selected shape; null turns it back into its first colour. */
  setGradient(gradient: GradientFill | null): void {
    for (const o of this.selected()) {
      const current = readGradient(o.fill);
      const fill = gradient ? makeGradient(gradient) : current ? current.from : o.fill;
      o.set({ fill });
      this.remember(o, { fill });
    }
    this.canvas.requestRenderAll();
    this.commit();
  }

  /** Remembers the style properties the user just set on an object, for the next of its kind. */
  private remember(o: FabricObject, props: Record<string, unknown>): void {
    const kind = styleKind(o);
    if (!kind) return;
    for (const k of STYLE_KEYS[kind]) if (k in props) this.styles[kind][k] = props[k];
  }


  /** Adds an image from a canonical source, scaled down to fit inside the canvas. */
  async addImage(canonical: string, name?: string): Promise<void> {
    const img = await FabricImage.fromURL(await this.resolve(canonical));
    img.set({ assetSrc: canonical });
    const scale = Math.min(1, (this.width * 0.8) / (img.width || 1), (this.height * 0.8) / (img.height || 1));
    img.scale(scale);
    this.place(img, 'image', name);
  }

  // ---- Connectors, text inside shapes, eraser -------------------------------------------------

  /**
   * Joins the two selected objects with a connector (an arrow, or a plain line) that follows
   * them when they move. It goes behind both. False if the selection is not two objects.
   */
  connect(arrow: boolean): boolean {
    const objs = this.selected();
    if (objs.length !== 2) return false;
    const [from, to] = objs as [FabricObject, FabricObject];
    this.canvas.discardActiveObject();
    const look: Record<string, unknown> = { stroke: DEFAULT_STROKE, strokeWidth: 3, strokeLineCap: 'round', strokeLineJoin: 'round', ...this.styles.line };
    delete look.shadow; // a connector looks like a line, without the remembered shadow
    const connector = makeConnector(from, to, arrow, look);
    this.identify(connector, 'path', undefined, 'Conector');
    const objects = this.canvas.getObjects();
    this.canvas.insertAt(Math.min(objects.indexOf(from), objects.indexOf(to)), connector);
    this.canvas.setActiveObject(connector);
    this.commit();
    return true;
  }

  /** Arrow head on or off for the selected connector. */
  setConnectorArrow(arrow: boolean): void {
    const o = this.canvas.getActiveObject();
    if (!o || !isConnector(o)) return;
    o.set({ connectArrow: arrow, path: [] }); // forces the re-draw
    this.commit();
  }

  /** Text inside the given (or selected) shape: edits the one it has, or writes a new one. */
  writeInside(shape = this.canvas.getActiveObject()): void {
    if (!shape || styleKind(shape) !== 'shape') return;
    const existing = this.canvas.getObjects().find((o) => o.attachedTo === shape.id);
    const text = (existing as Textbox | undefined) ?? new Textbox('Texto', {
      fontSize: Math.max(14, Math.round(Math.min(shape.getScaledHeight() / 5, this.unit() / 6))), fontFamily: 'Arial',
      fill: DEFAULT_STROKE, textAlign: 'center', ...this.styleFor('text'),
    });
    if (!existing) {
      text.set({ attachedTo: shape.id });
      this.identify(text, 'text');
      this.canvas.insertAt(this.canvas.getObjects().indexOf(shape) + 1, text);
      refreshLinks(this.canvas);
      this.commit();
    }
    this.canvas.setActiveObject(text);
    text.enterEditing();
    text.selectAll();
    this.canvas.requestRenderAll();
    this.emit();
  }

  /** The eraser tool removes strokes and lines it passes over. */
  setErasing(on: boolean): void {
    this.erasing = on;
    this.canvas.defaultCursor = on ? 'crosshair' : 'default';
    if (on) {
      this.canvas.skipTargetFind = true;
      this.canvas.discardActiveObject();
    }
    this.emit();
  }

  get isErasing(): boolean {
    return this.erasing;
  }

  private eraseAt(scene: Point, viewport: Point): void {
    // The point and four around it, so a thin stroke is still easy to hit.
    const around = [[0, 0], [4, 0], [-4, 0], [0, 4], [0, -4]];
    for (const o of [...this.canvas.getObjects()].reverse()) {
      if (styleKind(o) !== 'line' || o.selectable === false || o.visible === false || !o.containsPoint(scene)) continue;
      if (around.every(([dx = 0, dy = 0]) => this.canvas.isTargetTransparent(o, viewport.x + dx, viewport.y + dy))) continue;
      this.canvas.remove(o);
      this.erasedSome = true;
    }
    this.canvas.requestRenderAll();
  }

  /** Turns the pencil on or off; it keeps its colour, width and mode between uses. */
  setDrawing(on: boolean): void {
    this.drawing = on;
    this.applyDrawStyle();
    if (on) this.canvas.discardActiveObject();
    this.emit();
  }

  get isDrawing(): boolean {
    return this.drawing;
  }

  get pencil(): DrawStyle {
    return { ...this.drawStyle };
  }

  setPencil(style: Partial<DrawStyle>): void {
    this.drawStyle = { ...this.drawStyle, ...style };
    this.applyDrawStyle();
    this.emit();
  }

  private applyDrawStyle(): void {
    // Straight lines are drawn by the mouse handlers, not by Fabric's free-drawing brush.
    this.canvas.isDrawingMode = this.drawing && !this.drawStyle.straight;
    this.canvas.skipTargetFind = this.drawing;
    const brush = this.canvas.freeDrawingBrush as PencilBrush;
    brush.color = this.drawStyle.color;
    brush.width = this.drawStyle.width;
    brush.strokeLineCap = 'round';
    brush.strokeLineJoin = 'round';
  }

  // ---- Operations on the selection ----------------------------------------------------------

  removeSelected(): void {
    const objs = this.selected();
    if (!objs.length) return;
    this.canvas.discardActiveObject();
    this.canvas.remove(...objs);
    this.commit();
  }

  cut(): void {
    this.copy();
    this.removeSelected();
  }

  copy(): void {
    const all = this.toProject().layers;
    const ids = new Set(this.selected().map((o) => o.id));
    this.clipboard = all.filter((l) => ids.has(l.id));
    this.pasteCount = 0;
  }

  async paste(): Promise<void> {
    if (!this.clipboard.length) return;
    this.pasteCount++;
    const offset = PASTE_OFFSET * this.pasteCount;
    const objs = await util.enlivenObjects<FabricObject>(await Promise.all(this.clipboard.map((l) => this.liveObject(l))));
    this.canvas.discardActiveObject();
    objs.forEach((o, i) => {
      const layer = this.clipboard[i] as Layer;
      this.identify(o, layer.type);
      o.set({ left: o.left + offset, top: o.top + offset }).setCoords();
      this.canvas.add(o);
    });
    this.select(objs.map((o) => o.id ?? ''));
    this.commit();
  }

  async duplicate(): Promise<void> {
    const keep = this.clipboard;
    const count = this.pasteCount;
    this.copy();
    await this.paste();
    this.clipboard = keep;
    this.pasteCount = count;
  }

  private async liveObject(layer: Layer): Promise<Record<string, unknown>> {
    const o = structuredClone(layer.object);
    const resolveIn = async (x: Record<string, unknown>): Promise<void> => {
      if (typeof x.src === 'string') {
        x.assetSrc = x.src;
        x.src = await this.resolve(x.src);
      }
      if (Array.isArray(x.objects)) for (const c of x.objects) await resolveIn(c as Record<string, unknown>);
    };
    await resolveIn(o);
    return o;
  }

  /** Moves the selection by (dx, dy) canvas pixels; repeated nudges are one undo step. */
  nudge(dx: number, dy: number): void {
    const active = this.canvas.getActiveObject();
    if (!active) return;
    active.set({ left: active.left + dx, top: active.top + dy }).setCoords();
    this.canvas.requestRenderAll();
    this.commit('nudge');
  }

  /** Sets properties on every selected object. Inspector edits pass a key to coalesce. */
  setProps(props: Partial<Record<string, unknown>>, key: string | null = null): void {
    const active = this.canvas.getActiveObject();
    if (!active) return;
    const targets = active instanceof ActiveSelection && !('left' in props || 'top' in props || 'angle' in props || 'scaleX' in props)
      ? active.getObjects()
      : [active];
    for (const o of targets) {
      o.set(props).setCoords();
      // A dashed or dotted stroke keeps its pattern in proportion to the new width.
      const own = 'strokeWidth' in props && lineStyleOf(o) !== 'solid' ? { strokeDashArray: dashFor(lineStyleOf(o), o.strokeWidth) } : {};
      o.set(own);
      this.remember(o, { ...props, ...own });
    }
    this.canvas.requestRenderAll();
    this.commit(key);
  }

  /** Solid, dashed or dotted stroke on every selected object. Remembered for new ones. */
  setLineStyle(style: LineStyle): void {
    for (const o of this.selected()) {
      const props = { strokeDashArray: dashFor(style, o.strokeWidth), strokeLineCap: style === 'dotted' || styleKind(o) === 'line' ? 'round' : 'butt' };
      o.set(props as Partial<FabricObjectProps>);
      this.remember(o, props);
    }
    this.canvas.requestRenderAll();
    this.commit();
  }

  /**
   * Spreads three or more selected objects evenly between the first and the last, leaving the
   * same gap between neighbours (as in Draw and Inkscape). Fewer than three: nothing to do.
   */
  distribute(axis: 'x' | 'y'): void {
    const objs = this.selected();
    if (objs.length < 3) return;
    this.canvas.discardActiveObject();
    const items = objs.map((o) => {
      const r = o.getBoundingRect();
      return { o, start: axis === 'x' ? r.left : r.top, size: axis === 'x' ? r.width : r.height };
    }).sort((a, b) => a.start - b.start);
    const first = items[0] as (typeof items)[number];
    const last = items[items.length - 1] as (typeof items)[number];
    const used = items.reduce((sum, i) => sum + i.size, 0);
    const gap = (last.start + last.size - first.start - used) / (items.length - 1);
    let at = first.start;
    for (const { o, size } of items) {
      const c = o.getCenterPoint();
      const centre = at + size / 2;
      o.setPositionByOrigin(new Point(axis === 'x' ? centre : c.x, axis === 'y' ? centre : c.y), 'center', 'center');
      o.setCoords();
      at += size + gap;
    }
    this.select(objs.map((o) => o.id ?? ''));
    this.commit();
  }

  /** A drop shadow on every selected object, or none. Remembered for new objects. */
  setShadow(shadow: ShadowStyle | null, key: string | null = null): void {
    const targets = this.selected();
    if (!targets.length) return;
    for (const o of targets) {
      o.set({ shadow: shadow ? new Shadow(shadow) : null });
      this.remember(o, { shadow: shadow && { ...shadow } });
    }
    this.canvas.requestRenderAll();
    this.commit(key);
  }

  /** Brightness, contrast, greyscale… on the selected image. Slider drags share `key`. */
  setImageAdjustments(adjustments: ImageAdjustments, key: string | null = null): void {
    const o = this.canvas.getActiveObject();
    if (!isImage(o)) return;
    applyAdjustments(o, adjustments);
    this.canvas.requestRenderAll();
    this.commit(key);
  }

  /** Non-destructive crop of the selected image (percentages of each side). */
  setImageCrop(crop: ImageCrop, key: string | null = null): void {
    const o = this.canvas.getActiveObject();
    if (!isImage(o)) return;
    applyCrop(o, crop);
    this.canvas.requestRenderAll();
    this.commit(key);
  }

  /**
   * Clears the uniform background of the selected image into a new PNG, stored by `save`, which
   * returns its canonical source. Crop, filters and placement stay. False if there was none.
   */
  async removeImageBackground(save: (png: Blob) => Promise<string>): Promise<boolean> {
    const o = this.canvas.getActiveObject();
    if (!isImage(o)) return false;
    const png = await removeBackground(await this.resolve(o.assetSrc as string)); // every image gets one when added or read
    if (!png) return false;
    const canonical = await save(png);
    // setSrc resets the size to the whole image; the pixels are the same size, so keep the crop.
    const { width, height } = o;
    await o.setSrc(await this.resolve(canonical));
    o.set({ assetSrc: canonical, width, height });
    this.canvas.requestRenderAll();
    this.commit();
    return true;
  }

  // ---- Visual crop ----------------------------------------------------------------------------

  /**
   * Shows a frame over the selected image to crop it with the mouse: resize the frame, then
   * finishCrop(true). The frame is a helper, never part of the document.
   */
  startCrop(): boolean {
    const img = this.canvas.getActiveObject();
    if (!isImage(img) || this.crop) return false;
    const c = img.getCenterPoint();
    const frame = new Rect({
      width: img.getScaledWidth(), height: img.getScaledHeight(), angle: img.angle,
      // No stroke, so the frame's corners are exactly the kept area; its outline is the
      // (always shown) selection border.
      fill: 'rgba(37, 99, 235, 0.12)', strokeWidth: 0, borderColor: '#2563eb', borderDashArray: [6, 4], borderScaleFactor: 2,
      lockRotation: true, excludeFromExport: true, transparentCorners: false, cornerColor: '#2563eb',
    });
    frame.setControlVisible('mtr', false);
    frame.setPositionByOrigin(c, 'center', 'center');
    this.crop = { image: img, frame };
    this.canvas.add(frame);
    this.canvas.setActiveObject(frame);
    this.canvas.requestRenderAll();
    this.emit();
    return true;
  }

  get isCropping(): boolean {
    return this.crop !== null;
  }

  /** Crops the image to the frame (apply) or leaves it as it was; the image ends selected. */
  finishCrop(apply: boolean): void {
    const crop = this.crop;
    if (!crop) return;
    this.crop = null;
    const corners = crop.frame.getCoords();
    this.canvas.remove(crop.frame);
    if (apply) applyCrop(crop.image, cropFromFrame(crop.image, corners));
    this.canvas.setActiveObject(crop.image);
    this.canvas.requestRenderAll();
    if (apply) this.commit();
    else this.emit();
  }

  /** Changes size by setting the scale so the object's own box becomes width x height. */
  setSize(width: number, height: number, key: string | null = null): void {
    const o = this.canvas.getActiveObject();
    if (!o || width <= 0 || height <= 0) return;
    // A uniform stroke keeps its width when the object scales, so only the rest is scaled.
    const sw = o.strokeUniform ? o.strokeWidth : 0;
    const baseW = (o.getScaledWidth() - sw) / o.scaleX;
    const baseH = (o.getScaledHeight() - sw) / o.scaleY;
    this.setProps({ scaleX: Math.max(1, width - sw) / (baseW || 1), scaleY: Math.max(1, height - sw) / (baseH || 1) }, key);
  }

  order(where: 'forward' | 'backward' | 'front' | 'back'): void {
    const objs = this.selected();
    if (!objs.length) return;
    const list = where === 'forward' || where === 'front' ? [...objs].reverse() : objs;
    for (const o of list) {
      if (where === 'forward') this.canvas.bringObjectForward(o);
      else if (where === 'backward') this.canvas.sendObjectBackwards(o);
      else if (where === 'front') this.canvas.bringObjectToFront(o);
      else this.canvas.sendObjectToBack(o);
    }
    this.canvas.requestRenderAll();
    this.commit();
  }

  /** Moves a layer to a position of the layers panel (0 = top-most). Locked layers stay put. */
  moveLayer(id: string, index: number): void {
    const obj = this.byId(id);
    const count = this.canvas.getObjects().length;
    if (!obj || obj.selectable === false) return;
    const target = count - 1 - Math.max(0, Math.min(index, count - 1));
    if (this.canvas.getObjects().indexOf(obj) === target) return;
    this.canvas.moveObjectTo(obj, target);
    this.canvas.requestRenderAll();
    this.commit();
  }

  group(): void {
    const objs = this.selected();
    if (objs.length < 2) return;
    this.canvas.discardActiveObject();
    const index = Math.min(...objs.map((o) => this.canvas.getObjects().indexOf(o)));
    this.canvas.remove(...objs);
    const group = new Group(objs);
    this.identify(group, 'group');
    this.canvas.insertAt(index, group);
    this.canvas.setActiveObject(group);
    this.commit();
  }

  ungroup(): void {
    const group = this.canvas.getActiveObject();
    if (!(group instanceof Group) || group instanceof ActiveSelection) return;
    const index = this.canvas.getObjects().indexOf(group);
    this.canvas.discardActiveObject();
    this.canvas.remove(group);
    const children = group.removeAll(); // returned in canvas coordinates
    this.canvas.insertAt(index, ...children);
    this.select(children.map((c) => c.id ?? ''));
    this.commit();
  }

  /** Aligns each selected object to the canvas (one object) or to the selection box (several). */
  align(edge: AlignEdge): void {
    const objs = this.selected();
    if (!objs.length) return;
    const active = this.canvas.getActiveObject() as FabricObject;
    const multi = objs.length > 1;
    this.canvas.discardActiveObject();
    const box = multi ? boundsOf(objs) : { left: 0, top: 0, width: this.width, height: this.height };
    for (const o of objs) {
      const { width: w, height: h } = o.getBoundingRect(); // scene (canvas) units
      const c = o.getCenterPoint();
      let x = c.x;
      let y = c.y;
      if (edge === 'left') x = box.left + w / 2;
      if (edge === 'center') x = box.left + box.width / 2;
      if (edge === 'right') x = box.left + box.width - w / 2;
      if (edge === 'top') y = box.top + h / 2;
      if (edge === 'middle') y = box.top + box.height / 2;
      if (edge === 'bottom') y = box.top + box.height - h / 2;
      o.setPositionByOrigin(new Point(x, y), 'center', 'center');
      o.setCoords();
    }
    this.select(multi ? objs.map((o) => o.id ?? '') : [active.id ?? '']);
    this.commit();
  }

  flip(axis: 'x' | 'y'): void {
    for (const o of this.selected()) o.set(axis === 'x' ? { flipX: !o.flipX } : { flipY: !o.flipY });
    this.canvas.requestRenderAll();
    this.commit();
  }

  dispose(): Promise<boolean> {
    this.listeners.clear();
    return this.canvas.dispose();
  }
}

function readShadow(o: FabricObject | undefined): ShadowStyle | null {
  const s = o?.shadow;
  return s ? { color: typeof s.color === 'string' ? s.color : DEFAULT_SHADOW.color, blur: s.blur, offsetX: s.offsetX, offsetY: s.offsetY } : null;
}

/** The end point moved to the nearest 45° direction from `from`, keeping the length. */
export function snapAngle(from: { x: number; y: number }, to: { x: number; y: number }): Point {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const step = Math.PI / 4;
  const angle = Math.round(Math.atan2(dy, dx) / step) * step;
  const length = Math.hypot(dx, dy);
  return new Point(from.x + Math.round(length * Math.cos(angle) * 1000) / 1000, from.y + Math.round(length * Math.sin(angle) * 1000) / 1000);
}

/** Union of the objects' axis-aligned boxes, in canvas units. */
function boundsOf(objs: FabricObject[]): { left: number; top: number; width: number; height: number } {
  const pts = objs.flatMap((o) => o.getCoords());
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return { left, top, width: Math.max(...xs) - left, height: Math.max(...ys) - top };
}
