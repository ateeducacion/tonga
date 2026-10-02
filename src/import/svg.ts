// SVG import hardening. Fabric draws SVG as canvas objects (scripts never run there), so the real
// risks are external fetches (tracking, tainted canvas that breaks export), entity expansion and
// absurd sizes. The sanitizer keeps a safe subset and only local references.
import { MAX_IMAGE_SIDE } from '../config';
import { ImportError } from './sniff';

const DROP_ELEMENTS = new Set(['script', 'foreignobject', 'iframe', 'object', 'embed', 'audio', 'video', 'animate', 'animatemotion', 'animatetransform', 'set', 'handler', 'listener']);
const SAFE_URL = /^(#|data:image\/(png|jpeg|webp|gif);base64,)/i;

export interface SanitizedSvg {
  svg: string;
  width: number;
  height: number;
  /** A Tonga 1.x export: the background image marked nombre="data-background" (RULE-046). */
  legacyBackground?: string;
}

export function sanitizeSvg(text: string): SanitizedSvg {
  if (/<!DOCTYPE|<!ENTITY/i.test(text)) throw new ImportError('El SVG contiene declaraciones (DOCTYPE/ENTITY) que no se admiten.');
  const doc = new DOMParser().parseFromString(text, 'image/svg+xml');
  const root = doc.documentElement;
  if (doc.getElementsByTagName('parsererror').length || root.localName !== 'svg') throw new ImportError('El SVG no es válido.');

  const all = [root, ...Array.from(root.getElementsByTagName('*'))];
  for (const el of all) {
    if (DROP_ELEMENTS.has(el.localName.toLowerCase())) {
      el.remove();
      continue;
    }
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      const value = attr.value.trim();
      if (name.startsWith('on')) el.removeAttribute(attr.name);
      else if ((name === 'href' || name === 'xlink:href' || name === 'src') && !SAFE_URL.test(value)) el.removeAttribute(attr.name);
      // Any url() that is not a local #fragment (fill, filter, style…), and CSS imports.
      else if (/url\(\s*['"]?(?!#)|@import|expression\(/i.test(value)) el.removeAttribute(attr.name);
    }
    if (el.localName === 'style' && /@import|url\(\s*['"]?(?!#)/i.test(el.textContent ?? '')) el.remove();
  }

  const { width, height } = svgSize(root);
  if (width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE) throw new ImportError(`El SVG mide más de ${MAX_IMAGE_SIDE} px por lado.`);

  let legacyBackground: string | undefined;
  const bg = Array.from(root.getElementsByTagName('image')).find((img) => img.getAttribute('nombre') === 'data-background');
  if (bg) {
    legacyBackground = bg.getAttribute('xlink:href') ?? bg.getAttribute('href') ?? undefined;
    // The background becomes the canvas background, not a movable object.
    (bg.parentElement?.localName === 'g' && bg.parentElement.childElementCount === 1 ? bg.parentElement : bg).remove();
    if (legacyBackground && !SAFE_URL.test(legacyBackground)) legacyBackground = undefined;
  }
  return { svg: new XMLSerializer().serializeToString(doc), width, height, legacyBackground };
}

function svgSize(root: Element): { width: number; height: number } {
  const vb = (root.getAttribute('viewBox') ?? '').split(/[\s,]+/).map(Number);
  const num = (v: string | null) => (v && /^[\d.]+(px)?$/.test(v.trim()) ? parseFloat(v) : NaN);
  const width = num(root.getAttribute('width')) || vb[2] || 300;
  const height = num(root.getAttribute('height')) || vb[3] || 150;
  if (!(width > 0 && height > 0)) throw new ImportError('El SVG no tiene un tamaño válido.');
  return { width: Math.round(width), height: Math.round(height) };
}

/** Rejects decoded images that would exhaust memory. */
export function checkImageSize(width: number, height: number): void {
  if (!width || !height) throw new ImportError('No se pudo leer la imagen.');
  if (width > MAX_IMAGE_SIDE || height > MAX_IMAGE_SIDE) throw new ImportError(`La imagen mide ${width} × ${height} px; el máximo es ${MAX_IMAGE_SIDE} px por lado.`);
}
