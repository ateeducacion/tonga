import { describe, expect, it } from 'vitest';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { normalize, searchAssets, type Catalog } from '../src/assets/catalog';
// @ts-expect-error plain ESM build script without types
import { buildCatalog, parseLines } from '../scripts/build-catalog.mjs';

const asset = (id: string, title: string, collection: string) => ({
  id, title, collection, category: 'c', file: `repositorios/${id}`, thumbnail: '', background: false, license: '', creator: '', source: '',
});
const catalog: Catalog = {
  version: 1,
  categories: [],
  collections: [{ id: 'aves', title: 'Aves', category: 'fauna' }, { id: 'mapas', title: 'Mapas', category: 'fondos' }],
  assets: [asset('aves/aguila_real.png', 'Águila real', 'aves'), asset('aves/canario.png', 'Canario', 'aves'), asset('mapas/Mapa-Europa.png', 'Mapa Europa', 'mapas')],
};

describe('library search', () => {
  it('ignores accents, case and separators', () => {
    expect(normalize('  Águila_Real-1 ')).toBe('aguila real 1');
    expect(searchAssets(catalog, 'AGUILA').map((a) => a.id)).toEqual(['aves/aguila_real.png']);
  });

  it('requires every word and can match the collection title', () => {
    expect(searchAssets(catalog, 'mapa europa')).toHaveLength(1);
    expect(searchAssets(catalog, 'aves').map((a) => a.id)).toEqual(['aves/aguila_real.png', 'aves/canario.png']);
    expect(searchAssets(catalog, 'mapa aguila')).toHaveLength(0);
  });

  it('filters by collection', () => {
    expect(searchAssets(catalog, '', 'mapas')).toHaveLength(1);
  });
});

describe('catalogue builder (RULE-105/044/112)', () => {
  it('tolerates BOM, CRLF and blank lines', () => {
    expect(parseLines('\uFEFFa.png|A\r\n\r\nb.png|B|tongaappfondo\r\n')).toEqual([['a.png', 'A'], null, ['b.png', 'B', 'tongaappfondo'], null]);
  });

  it('builds the real catalogue without errors: sections, collections, background flag and rights', () => {
    const { catalog: real, errors } = buildCatalog();
    expect(errors).toEqual([]);
    expect(real.categories[0]).toMatchObject({ id: 'fauna', title: 'Fauna' });
    expect(real.collections.find((c: { id: string }) => c.id === 'aves')).toMatchObject({ title: 'Aves', category: 'fauna' });
    const bg = real.assets.find((a: { id: string }) => a.id === 'escenarios/Auditorio_fondo.png');
    expect(bg).toMatchObject({ title: 'Auditorio', background: true, license: 'CC-BY-NC-SA-4.0', creator: 'Gobierno de Canarias' });
    expect(new Set(real.assets.map((a: { id: string }) => a.id)).size).toBe(real.assets.length);
  });

  it('credits each icon to Lucide (ISC) through its collection’s rights.json', () => {
    const { catalog: real } = buildCatalog();
    const icons = real.assets.filter((a: { category: string }) => a.category === 'iconos-y-simbolos');
    expect(icons.length).toBeGreaterThan(100);
    for (const a of icons) expect(a).toMatchObject({ license: 'ISC', creator: 'Lucide Icons and Contributors', file: expect.stringMatching(/\.svg$/) });
    expect(icons.find((a: { id: string }) => a.id === 'iconosescuela/school.svg')).toMatchObject({ title: 'Colegio' });
  });

  it('fails on a rights.json without licence, author or source, or that is not JSON', () => {
    const root = mkdtempSync(join(tmpdir(), 'catalog-'));
    writeFileSync(join(root, 'lista.txt'), 'tongaappcabecera|Iconos\nbad|Mal\nbroken|Roto\n');
    for (const [dir, rights] of [['bad', '{"license":"MIT"}'], ['broken', '{']] as const) {
      mkdirSync(join(root, dir, 'thumbnails'), { recursive: true });
      writeFileSync(join(root, dir, 'lista.txt'), 'a.svg|A\n');
      writeFileSync(join(root, dir, 'a.svg'), '<svg/>');
      writeFileSync(join(root, dir, 'thumbnails', 'a.svg'), '<svg/>');
      writeFileSync(join(root, dir, 'rights.json'), rights);
    }
    const { errors } = buildCatalog(root);
    expect(errors).toEqual([
      `${root}/bad/rights.json: needs non-empty "license", "creator" and "source"`,
      `${root}/broken/rights.json: not valid JSON`,
    ]);
    rmSync(root, { recursive: true });
  });

  it('gives every image and thumbnail a content revision for cache busting', () => {
    const { catalog: real } = buildCatalog();
    for (const a of real.assets) expect(a).toMatchObject({ revision: expect.stringMatching(/^[0-9a-f]{12}$/), thumbnailRevision: expect.stringMatching(/^[0-9a-f]{12}$/) });
    expect(real.assets[0].revision).not.toBe(real.assets[0].thumbnailRevision);
  });
});

describe('library URLs', () => {
  it('carry the revision when the catalogue knows it, and are plain otherwise', async () => {
    const { resolveSource, setRevisions, libraryUrl } = await import('../src/assets/sources');
    setRevisions([{ file: 'repositorios/aves/Cuervo.png', revision: '80abd5000000', thumbnail: 'repositorios/aves/thumbnails/Cuervo.png' }]);
    await expect(resolveSource('repositorios/aves/Cuervo.png')).resolves.toBe('./repositorios/aves/Cuervo.png?v=80abd5000000');
    await expect(resolveSource('./repositorios/aves/Cuervo.png')).resolves.toBe('./repositorios/aves/Cuervo.png?v=80abd5000000');
    expect(libraryUrl('repositorios/aves/thumbnails/Cuervo.png')).toBe('./repositorios/aves/thumbnails/Cuervo.png');
  });
});
