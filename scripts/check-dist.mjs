// Sanity checks on the built dist/: entry points exist, relative URLs only, no source maps or dev files.
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const failures = [];
const must = ['dist/index.html', 'dist/next/index.html', 'dist/repositorios/lista.txt'];
for (const f of must) if (!existsSync(f)) failures.push(`missing ${f}`);

const html = existsSync('dist/next/index.html') ? readFileSync('dist/next/index.html', 'utf8') : '';
if (/(src|href)="\//.test(html)) failures.push('dist/next/index.html uses root-absolute URLs (breaks subdirectory hosting)');
if (/<script(?![^>]*\bsrc=)[^>]*>/.test(html)) failures.push('dist/next/index.html has an inline script (blocks a strict CSP)');

const walk = (dir) => readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(dir, e.name)) : [join(dir, e.name)]));
for (const f of walk('dist/next')) if (f.endsWith('.map') || f.endsWith('.ts')) failures.push(`dev file shipped: ${f}`);

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('dist/ ok');
