// The interactive editor: a Fabric canvas plus Tonga's document rules (ids, names, lock,
// background, snapshot history). The UI talks to this class only.
import {
  ActiveSelection, Canvas, Ellipse, FabricImage, FabricObject, Group, Line, PencilBrush, Point, Rect, Textbox, Triangle, util,
} from 'fabric';
import { History } from '../history/history';
import { LAYER_LABEL } from '../i18n/es';
import type { Background, Layer, LayerType, Project } from '../project/schema';
import { newProject, parseProject, serializeProject } from '../project/schema';
import { applyBackground, layerType, readProject, setLocked, writeProject, type SourceResolver } from './document';
import './controls';
import { applyAdjustments, applyCrop, isImage, readAdjustments, readCrop, type ImageAdjustments, type ImageCrop } from './image';

export type ShapeKind = 'rect' | 'ellipse' | 'triangle' | 'line';
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
  text?: { text: string; fontFamily: string; fontSize: number; bold: boolean; italic: boolean; textAlign: string };
  image?: { adjustments: ImageAdjustments; crop: ImageCrop };
}

export const DEFAULT_FILL = '#f28c28';
export const DEFAULT_STROKE = '#1f2937';
const PASTE_OFFSET = 20;

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

  constructor(
    element: HTMLCanvasElement,
    private readonly resolve: SourceResolver,
  ) {
    this.canvas = new Canvas(element, { preserveObjectStacking: true, selectionKey: 'shiftKey', fireRightClick: true, stopContextMenu: false });
    this.canvas.freeDrawingBrush = new PencilBrush(this.canvas);
    const changed = () => this.emit();
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
    return this.canvas.getObjects().map((o) => ({
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
      fill: multi ? null : colour(o.fill),
      stroke: multi ? null : colour(o.stroke),
      strokeWidth: o.strokeWidth,
    };
    if (isImage(o)) info.image = { adjustments: readAdjustments(o), crop: readCrop(o) };
    if (o instanceof Textbox) {
      info.text = {
        text: o.text, fontFamily: o.fontFamily, fontSize: o.fontSize, bold: o.fontWeight === 'bold' || Number(o.fontWeight) >= 600,
        italic: o.fontStyle === 'italic', textAlign: o.textAlign,
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
  private identify(obj: FabricObject, type: LayerType, name?: string): void {
    if (name?.trim()) {
      obj.set({ id: newId(), name: name.trim().slice(0, 200) });
      return;
    }
    const label = LAYER_LABEL[type];
    const used = this.canvas.getObjects().map((o) => o.name ?? '').map((n) => (n.startsWith(`${label} `) ? Number(n.slice(label.length + 1)) : 0));
    obj.set({ id: newId(), name: `${label} ${Math.max(0, ...used.filter(Number.isFinite)) + 1}` });
  }

  private place(obj: FabricObject, type: LayerType, name?: string): void {
    this.identify(obj, type, name);
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
    this.place(new Textbox(text, { width: this.unit() * 2, fontSize: size, fontFamily: 'Arial', fill: DEFAULT_STROKE, textAlign: 'center' }), 'text');
  }

  addShape(kind: ShapeKind): void {
    const u = this.unit();
    const style = { fill: DEFAULT_FILL, stroke: DEFAULT_STROKE, strokeWidth: 2, strokeUniform: true };
    if (kind === 'rect') this.place(new Rect({ width: u, height: u, ...style }), 'rect');
    else if (kind === 'ellipse') this.place(new Ellipse({ rx: u / 2, ry: u / 2, ...style }), 'ellipse');
    else if (kind === 'triangle') this.place(new Triangle({ width: u, height: u, ...style }), 'triangle');
    else this.place(new Line([-u / 2, 0, u / 2, 0], { stroke: DEFAULT_STROKE, strokeWidth: 4, strokeUniform: true }), 'line');
  }

  /** Adds an image from a canonical source, scaled down to fit inside the canvas. */
  async addImage(canonical: string, name?: string): Promise<void> {
    const img = await FabricImage.fromURL(await this.resolve(canonical));
    img.set({ assetSrc: canonical });
    const scale = Math.min(1, (this.width * 0.8) / (img.width || 1), (this.height * 0.8) / (img.height || 1));
    img.scale(scale);
    this.place(img, 'image', name);
  }

  setDrawing(on: boolean, color = DEFAULT_STROKE, width = 4): void {
    this.canvas.isDrawingMode = on;
    const brush = this.canvas.freeDrawingBrush;
    if (brush) {
      brush.color = color;
      brush.width = width;
    }
    if (on) this.canvas.discardActiveObject();
    this.emit();
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
    for (const o of targets) o.set(props).setCoords();
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

/** Union of the objects' axis-aligned boxes, in canvas units. */
function boundsOf(objs: FabricObject[]): { left: number; top: number; width: number; height: number } {
  const pts = objs.flatMap((o) => o.getCoords());
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return { left, top, width: Math.max(...xs) - left, height: Math.max(...ys) - top };
}
