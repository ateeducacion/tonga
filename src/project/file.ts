// .tonga files: the project plus the bytes of every local image it uses, so it opens anywhere.
import { blobToDataUrl, sourceBlob } from '../assets/sources';
import { putAsset } from '../persistence/store';
import { ProjectError, serializeProject, type Project } from './schema';

export function assetRefs(project: Project): string[] {
  const refs = new Set<string>();
  const walk = (o: Record<string, unknown>) => {
    if (typeof o.src === 'string' && o.src.startsWith('asset:')) refs.add(o.src);
    if (Array.isArray(o.objects)) o.objects.forEach((c) => walk(c as Record<string, unknown>));
  };
  project.layers.forEach((l) => walk(l.object));
  const bg = project.canvas.background;
  if (bg.kind === 'image' && bg.src.startsWith('asset:')) refs.add(bg.src);
  return [...refs];
}

export async function toTongaFile(project: Project): Promise<Blob> {
  const assets: Record<string, string> = {};
  for (const ref of assetRefs(project)) assets[ref] = await blobToDataUrl(await sourceBlob(ref));
  return new Blob([serializeProject({ ...project, assets })], { type: 'application/json' });
}

/** Stores the embedded images (checking that each matches its hash) and returns the bare project. */
export async function importEmbeddedAssets(project: Project): Promise<Project> {
  const { assets = {}, ...rest } = project;
  for (const [key, dataUrl] of Object.entries(assets)) {
    const stored = await putAsset(await (await fetch(dataUrl)).blob());
    if (stored !== key) throw new ProjectError('Una imagen del proyecto está dañada (no coincide su huella).');
  }
  const missing = assetRefs(rest).filter((r) => !(r in assets));
  if (missing.length && Object.keys(assets).length) throw new ProjectError('Al proyecto le faltan imágenes.');
  return rest;
}
