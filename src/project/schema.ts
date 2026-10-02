import { UserError } from '../errors';

// The Tonga project format (.tonga). It is Tonga's own document, not a dump of Fabric's canvas:
// order, visibility, lock and names belong to Tonga; each layer carries the Fabric object data
// of that single object. Migrations upgrade older documents step by step.

export const FORMAT = 'tonga';
export const CURRENT_VERSION = 1;

export type LayerType = 'image' | 'text' | 'rect' | 'ellipse' | 'triangle' | 'line' | 'path' | 'group';
export const LAYER_TYPES: readonly LayerType[] = ['image', 'text', 'rect', 'ellipse', 'triangle', 'line', 'path', 'group'];

export type Background = { kind: 'transparent' } | { kind: 'color'; color: string } | { kind: 'image'; src: string };

export interface Layer {
  id: string;
  type: LayerType;
  name: string;
  visible: boolean;
  locked: boolean;
  /** Fabric toObject() output for this object. Positions use originX/originY = 'center'. */
  object: Record<string, unknown>;
}

export interface Project {
  format: typeof FORMAT;
  version: typeof CURRENT_VERSION;
  title: string;
  canvas: { width: number; height: number; background: Background };
  layers: Layer[];
  /** Embedded image bytes as data: URLs, keyed by "asset:<sha256>" (only in downloaded files). */
  assets?: Record<string, string>;
}

export const MAX_CANVAS_SIDE = 8192;
export const HEX_COLOR = /^#[0-9a-f]{6}$/i;

export class ProjectError extends UserError {}

export type Migration = (doc: Record<string, unknown>) => Record<string, unknown>;
// MIGRATIONS[n] upgrades a version-n document to version n+1. Add v1 -> v2 here when v2 exists.
const MIGRATIONS: Record<number, Migration> = {};

export function newProject(width: number, height: number, background: Background = { kind: 'transparent' }): Project {
  return { format: FORMAT, version: CURRENT_VERSION, title: '', canvas: { width, height, background }, layers: [] };
}

/** Parses and validates untrusted JSON text into a current-version project. Throws ProjectError. */
export function parseProject(text: string): Project {
  let doc: unknown;
  try {
    doc = JSON.parse(text);
  } catch {
    throw new ProjectError('El fichero no es un proyecto de Tonga válido (JSON incorrecto).');
  }
  return migrate(doc);
}

/**
 * Upgrades a parsed document to the current version and validates it. `migrations` and `current`
 * are parameters only so the upgrade path can be tested before a version 2 exists.
 */
export function migrate(input: unknown, migrations: Record<number, Migration> = MIGRATIONS, current: number = CURRENT_VERSION): Project {
  if (!isRecord(input) || input.format !== FORMAT) throw new ProjectError('El fichero no es un proyecto de Tonga.');
  let doc = input;
  let version = doc.version;
  if (!Number.isInteger(version) || (version as number) < 1) throw new ProjectError('La versión del proyecto no es válida.');
  if ((version as number) > current) {
    throw new ProjectError('Este proyecto se creó con una versión más nueva de Tonga. Actualiza la aplicación para abrirlo.');
  }
  while ((version as number) < current) {
    const step = migrations[version as number];
    if (!step) throw new ProjectError(`No hay migración desde la versión ${String(version)}.`);
    doc = step(doc);
    version = doc.version;
  }
  return validate(doc);
}

function validate(doc: Record<string, unknown>): Project {
  const canvas = doc.canvas;
  if (!isRecord(canvas)) throw new ProjectError('Falta el lienzo del proyecto.');
  const width = canvas.width;
  const height = canvas.height;
  if (!isSide(width) || !isSide(height)) throw new ProjectError(`El tamaño del lienzo debe estar entre 1 y ${MAX_CANVAS_SIDE} px.`);
  const background = validateBackground(canvas.background);
  if (!Array.isArray(doc.layers)) throw new ProjectError('Faltan las capas del proyecto.');
  const ids = new Set<string>();
  const layers = doc.layers.map((l, i) => {
    const layer = validateLayer(l, i);
    if (ids.has(layer.id)) throw new ProjectError(`Hay dos capas con el mismo identificador (${layer.id}).`);
    ids.add(layer.id);
    return layer;
  });
  const project: Project = {
    format: FORMAT,
    version: CURRENT_VERSION,
    title: typeof doc.title === 'string' ? doc.title : '',
    canvas: { width, height, background },
    layers,
  };
  if (doc.assets !== undefined) {
    if (!isRecord(doc.assets)) throw new ProjectError('Los recursos del proyecto no son válidos.');
    const assets: Record<string, string> = {};
    for (const [key, value] of Object.entries(doc.assets)) {
      if (!/^asset:[0-9a-f]{64}$/.test(key) || typeof value !== 'string' || !/^data:image\/(png|jpeg|webp|svg\+xml);base64,/.test(value)) {
        throw new ProjectError('Un recurso del proyecto no es una imagen válida.');
      }
      assets[key] = value;
    }
    project.assets = assets;
  }
  return project;
}

function validateBackground(bg: unknown): Background {
  if (bg === undefined) return { kind: 'transparent' };
  if (!isRecord(bg)) throw new ProjectError('El fondo del proyecto no es válido.');
  if (bg.kind === 'transparent') return { kind: 'transparent' };
  if (bg.kind === 'color' && typeof bg.color === 'string' && HEX_COLOR.test(bg.color)) return { kind: 'color', color: bg.color };
  if (bg.kind === 'image' && typeof bg.src === 'string' && isSafeImageSrc(bg.src)) return { kind: 'image', src: bg.src };
  throw new ProjectError('El fondo del proyecto no es válido.');
}

function validateLayer(l: unknown, index: number): Layer {
  const where = `capa ${index + 1}`;
  if (!isRecord(l)) throw new ProjectError(`La ${where} no es válida.`);
  if (typeof l.id !== 'string' || !/^[\w-]{1,64}$/.test(l.id)) throw new ProjectError(`La ${where} no tiene un identificador válido.`);
  if (!LAYER_TYPES.includes(l.type as LayerType)) throw new ProjectError(`La ${where} tiene un tipo desconocido.`);
  if (!isRecord(l.object)) throw new ProjectError(`La ${where} no tiene datos de objeto.`);
  checkObjectSources(l.object, where);
  return {
    id: l.id,
    type: l.type as LayerType,
    name: typeof l.name === 'string' ? l.name.slice(0, 200) : '',
    visible: l.visible !== false,
    locked: l.locked === true,
    object: l.object,
  };
}

// Every image source inside a layer (including nested group members) must be local.
function checkObjectSources(obj: Record<string, unknown>, where: string): void {
  if ('src' in obj && (typeof obj.src !== 'string' || !isSafeImageSrc(obj.src))) {
    throw new ProjectError(`La ${where} contiene una imagen con un origen no permitido.`);
  }
  if (Array.isArray(obj.objects)) for (const child of obj.objects) if (isRecord(child)) checkObjectSources(child, where);
}

/** Local sources only: content-addressed assets, data: images or same-origin relative paths. */
export function isSafeImageSrc(src: string): boolean {
  if (/^asset:[0-9a-f]{64}$/.test(src)) return true;
  if (/^data:image\/(png|jpeg|webp|svg\+xml);base64,[a-z0-9+/=]+$/i.test(src)) return true;
  return /^(\.\/)?repositorios\/[\w\-./ %()áéíóúñüÁÉÍÓÚÑÜ]+$/.test(src) && !src.includes('..');
}

const isSide = (n: unknown): n is number => typeof n === 'number' && Number.isInteger(n) && n >= 1 && n <= MAX_CANVAS_SIDE;

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

export function serializeProject(project: Project): string {
  return JSON.stringify(project);
}
