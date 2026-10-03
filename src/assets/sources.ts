// Resolves canonical image sources to loadable URLs (and to self-contained data: URLs for SVG).
import { LIBRARY_ROOT } from '../config';
import { UserError } from '../errors';
import { getAsset } from '../persistence/store';
import { isSafeImageSrc } from '../project/schema';

const objectUrls = new Map<string, string>();
/** Library path -> content revision, from the catalogue. */
const revisions = new Map<string, string>();

/** Remembers the revisions of a catalogue, so library images resolve to versioned URLs. */
export function setRevisions(assets: { file: string; revision?: string; thumbnail: string; thumbnailRevision?: string }[]): void {
  for (const a of assets) {
    if (a.revision) revisions.set(a.file, a.revision);
    if (a.thumbnailRevision) revisions.set(a.thumbnail, a.thumbnailRevision);
  }
}

/**
 * URL of a library file. With a known revision it is "…/Cuervo.png?v=80abd5…": the service worker
 * caches it for good, and a changed image gets a new URL. Without one, the worker asks the network.
 */
export function libraryUrl(path: string): string {
  const clean = path.replace(/^\.\//, '');
  const rev = revisions.get(clean);
  return LIBRARY_ROOT + clean + (rev ? `?v=${rev}` : '');
}

export async function resolveSource(canonical: string): Promise<string> {
  if (!isSafeImageSrc(canonical)) throw new UserError('Origen de imagen no permitido.');
  if (canonical.startsWith('data:')) return canonical;
  if (canonical.startsWith('asset:')) {
    const cached = objectUrls.get(canonical);
    if (cached) return cached;
    const blob = await getAsset(canonical);
    if (!blob) throw new UserError('Falta una imagen del proyecto en este navegador.');
    const url = URL.createObjectURL(blob);
    objectUrls.set(canonical, url);
    return url;
  }
  return libraryUrl(canonical);
}

export async function sourceBlob(canonical: string): Promise<Blob> {
  if (canonical.startsWith('asset:')) {
    const blob = await getAsset(canonical);
    if (blob) return blob;
    throw new UserError('Falta una imagen del proyecto en este navegador.');
  }
  const res = await fetch(await resolveSource(canonical));
  if (!res.ok) throw new UserError(`No se pudo cargar una imagen (${res.status}).`);
  return res.blob();
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer la imagen.'));
    reader.readAsDataURL(blob);
  });
}

/** Self-contained source: the original bytes as a data: URL (for SVG export and .tonga files). */
export async function resolveToDataUrl(canonical: string): Promise<string> {
  return canonical.startsWith('data:') ? canonical : blobToDataUrl(await sourceBlob(canonical));
}
