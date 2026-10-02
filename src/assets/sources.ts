// Resolves canonical image sources to loadable URLs (and to self-contained data: URLs for SVG).
import { LIBRARY_ROOT } from '../config';
import { UserError } from '../errors';
import { getAsset } from '../persistence/store';
import { isSafeImageSrc } from '../project/schema';

const objectUrls = new Map<string, string>();

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
  return LIBRARY_ROOT + canonical.replace(/^\.\//, '');
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
