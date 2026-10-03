import { UserError } from '../errors';

// The library catalogue generated at build time (scripts/build-catalog.mjs) and its search.

export interface CatalogAsset {
  id: string;
  title: string;
  collection: string;
  category: string;
  /** Canonical path, e.g. "repositorios/aves/aguila.png". */
  file: string;
  /** Content hash of file; the URL carries it (?v=) so a replaced image is never served stale. */
  revision?: string;
  thumbnail: string;
  thumbnailRevision?: string;
  background: boolean;
  license: string;
  creator: string;
  source: string;
}

export interface Catalog {
  version: 1;
  categories: { id: string; title: string; collections: string[] }[];
  collections: { id: string; title: string; category: string }[];
  assets: CatalogAsset[];
}

export async function loadCatalog(url: string): Promise<Catalog> {
  const res = await fetch(url, { cache: 'no-cache' });
  if (!res.ok) throw new UserError(`No se pudo cargar la biblioteca (${res.status}).`);
  const data = (await res.json()) as Catalog;
  if (data.version !== 1 || !Array.isArray(data.assets)) throw new UserError('El catálogo de la biblioteca no es válido.');
  return data;
}

/** Lower case, no accents, single spaces: "Águila  real" -> "aguila real". */
export function normalize(text: string): string {
  return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

/**
 * Assets whose title, file name or collection contains every word of the query
 * (accent- and case-insensitive), optionally limited to one collection.
 */
export function searchAssets(catalog: Catalog, query: string, collection = ''): CatalogAsset[] {
  const words = normalize(query).split(' ').filter(Boolean);
  const titles = new Map(catalog.collections.map((c) => [c.id, c.title]));
  return catalog.assets.filter((a) => {
    if (collection && a.collection !== collection) return false;
    if (!words.length) return true;
    const hay = normalize(`${a.title} ${a.file.split('/').pop() ?? ''} ${titles.get(a.collection) ?? ''}`);
    return words.every((w) => hay.includes(w));
  });
}
