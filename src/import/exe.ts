// Opens the Slide iDevices of eXeLearning files (.elpx projects, exported .idevice and .block)
// as Tonga projects. The iDevice stores its Fabric scene as JSON (the format Tonga's own .elpx
// export writes, see src/export/elpx.ts), so each object becomes a layer; images come from the
// package's files. The result goes through the .tonga validation: the input is untrusted.
import { newProject, parseProject, type Background, type Layer, type LayerType, type Project } from '../project/schema';
import { ImportError } from './sniff';
import type { ZipArchive } from './unzip';

/** One Slide iDevice found in the package, ready to be shown in a chooser. */
export interface SlideChoice {
  id: string;
  /** Its page's name, numbered when the page has several slides. */
  title: string;
  width: number;
  height: number;
  background: string;
  objects: Record<string, unknown>[];
  /** The static preview the iDevice keeps (images inside may not show). */
  svg: string;
}

const CONTEXT = '{{context_path}}/';
const TYPES: Record<string, LayerType> = {
  textbox: 'text', 'i-text': 'text', itext: 'text', text: 'text', rect: 'rect', ellipse: 'ellipse', circle: 'ellipse', triangle: 'triangle',
  line: 'line', path: 'path', polygon: 'path', polyline: 'path', image: 'image', group: 'group',
};
const LABELS: Record<LayerType, string> = {
  text: 'Texto', rect: 'Rectángulo', ellipse: 'Elipse', triangle: 'Triángulo', line: 'Línea', path: 'Trazo', image: 'Imagen', group: 'Grupo',
};
const MIME: Record<string, string> = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml' };

const text = (el: Element | null | undefined, tag: string) => el?.getElementsByTagName(tag)[0]?.textContent?.trim() ?? '';
const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};
const isRecord = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Every Slide iDevice in the package's content.xml, in document order. */
export async function findSlides(files: ZipArchive): Promise<SlideChoice[]> {
  const xml = await files.read('content.xml');
  if (!xml) throw new ImportError('No es un fichero de eXeLearning: le falta content.xml.');
  const doc = new DOMParser().parseFromString(new TextDecoder().decode(xml), 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new ImportError('El content.xml de eXeLearning está dañado.');
  const pages = new Map<string, string>();
  for (const nav of Array.from(doc.getElementsByTagName('odeNavStructure'))) pages.set(text(nav, 'odePageId'), text(nav, 'pageName'));
  const slides: SlideChoice[] = [];
  const perPage = new Map<string, number>();
  for (const c of Array.from(doc.getElementsByTagName('odeComponent'))) {
    if (text(c, 'odeIdeviceTypeName') !== 'slide') continue;
    let data: unknown;
    try {
      data = JSON.parse(text(c, 'jsonProperties'));
    } catch {
      continue; // an empty or broken iDevice: nothing to open
    }
    if (!isRecord(data) || data.engine !== 'fabric' || !isRecord(data.fabric) || !Array.isArray(data.fabric.objects)) continue;
    const page = text(c, 'odePageId');
    const n = (perPage.get(page) ?? 0) + 1;
    perPage.set(page, n);
    const size = (v: unknown, d: number) => (typeof v === 'number' && v >= 1 && v <= 8192 ? Math.round(v) : d);
    slides.push({
      id: text(c, 'odeIdeviceId') || `slide-${slides.length + 1}`,
      title: pages.get(page) || 'Diapositiva',
      width: size(data.width, 1280),
      height: size(data.height, 720),
      background: typeof data.background === 'string' ? data.background : '#ffffff',
      objects: data.fabric.objects.filter(isRecord),
      svg: typeof data.svg === 'string' ? data.svg : '',
    });
  }
  // Number them only where a page has more than one (counted before any title changes).
  const totals = new Map<string, number>();
  for (const s of slides) totals.set(s.title, (totals.get(s.title) ?? 0) + 1);
  const seen = new Map<string, number>();
  for (const s of slides) {
    if ((totals.get(s.title) ?? 0) > 1) {
      const i = (seen.get(s.title) ?? 0) + 1;
      seen.set(s.title, i);
      s.title = `${s.title} (${i})`;
    }
  }
  return slides;
}

/**
 * The slide as a Tonga project. Package images are stored with `store` (bytes → canonical
 * source); objects whose image is not in the package are left out and counted in `missing`.
 */
export async function slideToProject(
  slide: SlideChoice,
  files: ZipArchive,
  store: (blob: Blob) => Promise<string>,
): Promise<{ project: Project; missing: number }> {
  let missing = 0;
  const stored = new Map<string, string>();
  // Images, also inside groups; false when its file is not in the package.
  const localise = async (o: Record<string, unknown>): Promise<boolean> => {
    if (typeof o.src === 'string') {
      const path = o.src.replace(CONTEXT, '').replace(/^\.?\//, '').split(/[?#]/)[0] ?? '';
      const bytes = (await files.read(path)) ?? (await files.read(safeDecode(path)));
      if (!bytes) return false;
      if (!stored.has(path)) {
        const ext = path.split('.').pop()?.toLowerCase() ?? '';
        stored.set(path, await store(new Blob([bytes as BlobPart], { type: MIME[ext] ?? 'application/octet-stream' })));
      }
      o.src = stored.get(path);
      delete o.crossOrigin;
    }
    if (Array.isArray(o.objects)) {
      const kept = [];
      for (const child of o.objects.filter(isRecord)) {
        if (await localise(child)) kept.push(child);
        else missing++;
      }
      o.objects = kept;
    }
    return true;
  };

  const background: Background = /^#[0-9a-f]{6}$/i.test(slide.background) ? { kind: 'color', color: slide.background.toLowerCase() } : { kind: 'transparent' };
  const project = newProject(slide.width, slide.height, background);
  project.title = slide.title;
  const counts = new Map<LayerType, number>();
  const layers: Layer[] = [];
  for (const raw of slide.objects) {
    const object = structuredClone(raw);
    if (!(await localise(object))) {
      missing++;
      continue;
    }
    const type = TYPES[String(object.type).toLowerCase()] ?? 'path';
    // Tonga edits text as a Textbox (wrapping, alignment): a single-line IText becomes one.
    if (type === 'text') object.type = 'Textbox';
    const n = (counts.get(type) ?? 0) + 1;
    counts.set(type, n);
    layers.push({ id: `exe-${layers.length + 1}-${Math.random().toString(36).slice(2, 8)}`, type, name: `${LABELS[type]} ${n}`, visible: object.visible !== false, locked: false, object });
  }
  project.layers = layers;
  // Untrusted input: the format's own validation rejects remote sources and malformed layers.
  return { project: parseProject(JSON.stringify(project)), missing };
}
