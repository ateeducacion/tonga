// Converts between a Tonga project and Fabric objects on a (Static)Canvas.
// Shared by the interactive editor and the off-screen export renderer.
import { FabricImage, FabricObject, StaticCanvas, util } from 'fabric';
import type { Background, Layer, LayerType, Project } from '../project/schema';
import { newProject } from '../project/schema';

declare module 'fabric' {
  interface FabricObject {
    id?: string;
    name?: string;
    /** Canonical image source ("asset:<sha256>", "repositorios/…" or data:) behind a blob:/http URL. */
    assetSrc?: string;
    /** A connector joins the objects with these ids (see links.ts). */
    connectFrom?: string;
    connectTo?: string;
    connectArrow?: boolean;
    /** A text written inside the shape with this id (see links.ts). */
    attachedTo?: string;
  }
  interface SerializedObjectProps {
    id?: string;
    name?: string;
    assetSrc?: string;
    connectFrom?: string;
    connectTo?: string;
    connectArrow?: boolean;
    attachedTo?: string;
  }
}

// Serialized with every object (Fabric's documented custom-property hook).
FabricObject.customProperties = ['id', 'name', 'assetSrc', 'connectFrom', 'connectTo', 'connectArrow', 'attachedTo'];
// Fabric 7 default, stated explicitly: every position in Tonga is the object's centre.
FabricObject.ownDefaults.originX = 'center';
FabricObject.ownDefaults.originY = 'center';

/** Maps a canonical source to a URL the browser can load. */
export type SourceResolver = (canonical: string) => string | Promise<string>;

const TYPE_MAP: Record<string, LayerType> = {
  image: 'image', textbox: 'text', 'i-text': 'text', text: 'text', rect: 'rect', ellipse: 'ellipse', circle: 'ellipse',
  triangle: 'triangle', line: 'line', path: 'path', group: 'group',
};

export function layerType(obj: FabricObject): LayerType {
  return TYPE_MAP[obj.type.toLowerCase()] ?? 'path';
}

export function isLocked(obj: FabricObject): boolean {
  return obj.selectable === false;
}

export function setLocked(obj: FabricObject, locked: boolean): void {
  obj.set({
    selectable: !locked, evented: !locked, lockMovementX: locked, lockMovementY: locked,
    lockRotation: locked, lockScalingX: locked, lockScalingY: locked,
  });
}

/**
 * Serializes one object into its layer. Image sources are written back in canonical form.
 * Pass `serialized` from canvas.toObject() for objects inside an active selection: the canvas
 * puts them back in canvas coordinates, a plain obj.toObject() would not.
 */
export function toLayer(obj: FabricObject, serialized?: Record<string, unknown>): Layer {
  const object = structuredClone(serialized ?? (obj.toObject() as Record<string, unknown>));
  canonicalizeSources(object);
  delete object.selectable;
  delete object.evented;
  return {
    id: obj.id ?? '',
    type: layerType(obj),
    name: obj.name ?? '',
    visible: obj.visible !== false,
    locked: isLocked(obj),
    object,
  };
}

function canonicalizeSources(o: Record<string, unknown>): void {
  if (typeof o.assetSrc === 'string') o.src = o.assetSrc;
  delete o.crossOrigin;
  if (Array.isArray(o.objects)) for (const c of o.objects) canonicalizeSources(c as Record<string, unknown>);
}

async function resolveSources(o: Record<string, unknown>, resolve: SourceResolver): Promise<Record<string, unknown>> {
  const copy: Record<string, unknown> = { ...o };
  if (typeof copy.src === 'string') {
    copy.assetSrc = copy.assetSrc ?? copy.src;
    copy.src = await resolve(copy.assetSrc as string);
  }
  if (Array.isArray(copy.objects)) {
    copy.objects = await Promise.all(copy.objects.map((c) => resolveSources(c as Record<string, unknown>, resolve)));
  }
  return copy;
}

export function readProject(canvas: StaticCanvas, size: { width: number; height: number }, background: Background, title = ''): Project {
  const project = newProject(size.width, size.height, background);
  project.title = title;
  const serialized = (canvas.toObject() as { objects: Record<string, unknown>[] }).objects;
  project.layers = canvas.getObjects().map((o, i) => toLayer(o, serialized[i]));
  return project;
}

/** Replaces the canvas content with the project's layers and background (zoom untouched). */
export async function writeProject(canvas: StaticCanvas, project: Project, resolve: SourceResolver): Promise<void> {
  const prepared = await Promise.all(project.layers.map((l) => resolveSources(l.object, resolve)));
  const objects = await util.enlivenObjects<FabricObject>(prepared);
  canvas.remove(...canvas.getObjects());
  objects.forEach((obj, i) => {
    const layer = project.layers[i] as Layer;
    obj.set({ id: layer.id, name: layer.name, visible: layer.visible });
    setLocked(obj, layer.locked);
  });
  canvas.add(...objects);
  await applyBackground(canvas, project.canvas, resolve);
  canvas.requestRenderAll();
}

/** Colour background, or an image that covers the whole canvas (centred, aspect kept). */
export async function applyBackground(
  canvas: StaticCanvas,
  { width, height, background }: Project['canvas'],
  resolve: SourceResolver,
): Promise<void> {
  canvas.backgroundColor = background.kind === 'color' ? background.color : '';
  canvas.backgroundImage = undefined;
  if (background.kind === 'image') {
    const img = await FabricImage.fromURL(await resolve(background.src));
    const scale = Math.max(width / (img.width || 1), height / (img.height || 1));
    img.set({ originX: 'center', originY: 'center', left: width / 2, top: height / 2, scaleX: scale, scaleY: scale });
    canvas.backgroundImage = img;
  }
}

/** An off-screen canvas holding the project at 1:1, for exports. */
export async function renderOffscreen(project: Project, resolve: SourceResolver): Promise<StaticCanvas> {
  const el = document.createElement('canvas');
  const canvas = new StaticCanvas(el, { width: project.canvas.width, height: project.canvas.height, enableRetinaScaling: false, renderOnAddRemove: false });
  await writeProject(canvas, project, resolve);
  canvas.renderAll();
  return canvas;
}
