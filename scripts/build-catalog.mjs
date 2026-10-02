// Builds public/catalog.json from repositorios/**/lista.txt and fails on a corrupt catalogue.
// lista.txt stays the source of truth during the transition; the app only reads catalog.json.
//
//   node scripts/build-catalog.mjs            write public/catalog.json
//   node scripts/build-catalog.mjs --report   also print a measured report (sizes, dimensions, duplicates, orphans)
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { basename, extname, join } from 'node:path';

const ROOT = 'repositorios';
const HEADER = 'tongaappcabecera';
const BACKGROUND = 'tongaappfondo';
const IMAGE = /\.(png|jpe?g|webp|svg)$/i;
// Evidence: legacy-app/creditos.html states all content belongs to the Gobierno de Canarias
// under CC BY-NC-SA 4.0. No per-image attribution exists in the repository.
const DEFAULT_RIGHTS = {
  license: 'CC-BY-NC-SA-4.0',
  creator: 'Gobierno de Canarias',
  source: 'legacy-app/creditos.html',
};

/** Splits a lista.txt into trimmed fields per non-empty line (BOM, CRLF and trailing blanks tolerated). */
export function parseLines(text) {
  return text.replace(/^\uFEFF/, '').split(/\r?\n/).map((l) => l.trim()).map((l) => (l ? l.split('|').map((f) => f.trim()) : null));
}

// Exact, case-sensitive existence (macOS ignores case; Linux and GitHub Pages do not).
const listing = new Map();
function existsExact(path) {
  const i = path.lastIndexOf('/');
  const dir = path.slice(0, i);
  if (!listing.has(dir)) listing.set(dir, new Set(existsSync(dir) ? readdirSync(dir) : []));
  return listing.get(dir).has(path.slice(i + 1));
}

const slug = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export function buildCatalog(root = ROOT) {
  const errors = [];
  const categories = [];
  const collections = [];
  const assets = [];
  const ids = new Set();
  let category = null;

  for (const fields of parseLines(readFileSync(join(root, 'lista.txt'), 'utf8'))) {
    if (!fields) continue; // a blank line only separates sections
    const [key, title] = fields;
    if (key === HEADER) {
      if (!title) errors.push(`${root}/lista.txt: section header without a title`);
      category = { id: slug(title ?? ''), title, collections: [] };
      categories.push(category);
      continue;
    }
    if (!category) {
      errors.push(`${root}/lista.txt: collection "${key}" before any ${HEADER} line`);
      continue;
    }
    const dir = join(root, key);
    if (!existsSync(join(dir, 'lista.txt'))) {
      errors.push(`${root}/lista.txt: collection "${key}" has no ${dir}/lista.txt`);
      continue;
    }
    if (collections.some((c) => c.id === key)) errors.push(`${root}/lista.txt: collection "${key}" listed twice`);
    collections.push({ id: key, title: title || key, category: category.id });
    category.collections.push(key);

    parseLines(readFileSync(join(dir, 'lista.txt'), 'utf8')).forEach((f, i) => {
      if (!f) return;
      const where = `${dir}/lista.txt:${i + 1}`;
      const [file, tooltip, flag] = f;
      if (!file || !IMAGE.test(file) || file.includes('/') || file.includes('..')) return void errors.push(`${where}: invalid file name "${file}"`);
      if (flag && flag !== BACKGROUND) errors.push(`${where}: unknown flag "${flag}"`);
      const id = `${key}/${file}`;
      if (ids.has(id)) errors.push(`${where}: duplicate item ${id}`);
      ids.add(id);
      const path = `${dir}/${file}`;
      const thumb = `${dir}/thumbnails/${file}`;
      if (!existsExact(path)) errors.push(`${where}: missing image ${path} (names are case-sensitive)`);
      if (!existsExact(thumb)) errors.push(`${where}: missing thumbnail ${thumb} (names are case-sensitive)`);
      assets.push({
        id,
        title: tooltip || basename(file, extname(file)).replace(/[_-]+/g, ' '),
        collection: key,
        category: category.id,
        file: path,
        thumbnail: thumb,
        background: flag === BACKGROUND,
        ...DEFAULT_RIGHTS,
      });
    });
  }
  for (const c of categories) if (!c.collections.length) errors.push(`${root}/lista.txt: section "${c.title}" has no collections`);
  return { catalog: { version: 1, categories, collections, assets }, errors };
}

function pngSize(buf) {
  return buf.subarray(1, 4).toString('latin1') === 'PNG' ? [buf.readUInt32BE(16), buf.readUInt32BE(20)] : null;
}

function report(catalog, root = ROOT) {
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
  const files = walk(root).filter((f) => IMAGE.test(f));
  const referenced = new Set(catalog.assets.flatMap((a) => [a.file, a.thumbnail]));
  const orphans = files.filter((f) => !referenced.has(f));
  const byHash = new Map();
  let bytes = 0;
  let maxSide = 0;
  const big = [];
  for (const a of catalog.assets) {
    if (!existsSync(a.file)) continue;
    const buf = readFileSync(a.file);
    bytes += buf.length;
    const h = createHash('sha256').update(buf).digest('hex');
    byHash.set(h, [...(byHash.get(h) ?? []), a.id]);
    const size = pngSize(buf);
    if (size) maxSide = Math.max(maxSide, ...size);
    if (size && Math.max(...size) > 2048) big.push(`${a.id} ${size.join('x')} ${(buf.length / 1e6).toFixed(1)} MB`);
  }
  const dupes = [...byHash.values()].filter((v) => v.length > 1);
  console.log(JSON.stringify({
    assets: catalog.assets.length,
    collections: catalog.collections.length,
    imageBytes: bytes,
    imageFilesOnDisk: files.length,
    unreferencedFiles: orphans.length,
    unreferencedSample: orphans.slice(0, 20),
    duplicateGroups: dupes.length,
    duplicateSample: dupes.slice(0, 10),
    largestSidePx: maxSide,
    over2048px: big.length,
    over2048Sample: big.slice(0, 15),
  }, null, 2));
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const { catalog, errors } = buildCatalog();
  if (errors.length) {
    console.error(`Catalogue has ${errors.length} error(s):\n${errors.join('\n')}`);
    process.exit(1);
  }
  mkdirSync('public', { recursive: true });
  writeFileSync('public/catalog.json', JSON.stringify(catalog));
  console.log(`public/catalog.json: ${catalog.assets.length} assets in ${catalog.collections.length} collections, ${statSync('public/catalog.json').size} bytes`);
  if (process.argv.includes('--report')) report(catalog);
}
