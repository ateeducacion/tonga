// Reproducible repository metrics for a git ref (default: upstream vs HEAD).
// Usage: node scripts/metrics.mjs [refA] [refB] [--json]
// Counts come from the git tree, so the working copy (node_modules, dist) never skews them.
import { execFileSync } from 'node:child_process';

const git = (...args) => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 1 << 28 });
const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const refs = args.length ? args : ['origin/upstream', 'HEAD'];
const asJson = process.argv.includes('--json');

const VENDOR = /(^|\/)(dist\/tui-image-editor|js\/(fabric|jquery|jspdf|axios|FileSaver|xml2json|tui-|image-picker|customiseControls))/;
const CODE = /\.(m?js|ts|css|html)$/;

function grepCount(ref, pattern, pathspec) {
  try {
    return git('grep', '-c', '-E', pattern, ref, '--', ...pathspec)
      .trim().split('\n').filter(Boolean)
      .reduce((n, line) => n + Number(line.split(':').pop()), 0);
  } catch {
    return 0; // git grep exits 1 when nothing matches
  }
}

function measure(ref) {
  const rows = git('ls-tree', '-r', '-l', ref).trim().split('\n').map((l) => {
    const [meta, path] = l.split('\t');
    return { path, size: Number(meta.trim().split(/\s+/)[3]) || 0 };
  });
  const sum = (list) => list.reduce((n, r) => n + r.size, 0);
  const own = rows.filter((r) => CODE.test(r.path) && !VENDOR.test(r.path) && !r.path.startsWith('repositorios/') && !r.path.startsWith('analysis/'));
  const srcSpec = [':(glob)**/*.js', ':(glob)**/*.ts', ':(glob)**/*.html', ':!repositorios/**', ':!analysis/**'];
  return {
    ref,
    sha: git('rev-parse', '--short', ref).trim(),
    files: rows.length,
    bytes: sum(rows),
    collectionFiles: rows.filter((r) => r.path.startsWith('repositorios/')).length,
    collectionBytes: sum(rows.filter((r) => r.path.startsWith('repositorios/'))),
    jsFiles: rows.filter((r) => /\.(m?js|ts)$/.test(r.path)).length,
    cssFiles: rows.filter((r) => r.path.endsWith('.css')).length,
    vendoredFiles: rows.filter((r) => VENDOR.test(r.path)).length,
    vendoredBytes: sum(rows.filter((r) => VENDOR.test(r.path))),
    ownCodeFiles: own.length,
    ownCodeBytes: sum(own),
    testFiles: rows.filter((r) => /(^|\/)(test|e2e)\/.*\.(test|spec)\.[jt]s$/.test(r.path)).length,
    consoleLog: grepCount(ref, 'console\\.log\\(', srcSpec),
    evalOrNewFunction: grepCount(ref, '\\beval\\(|new Function\\(', srcSpec),
    inlineHandlers: grepCount(ref, ' on(click|load|dblclick|change|error)=', [':(glob)**/*.html', ':(glob)**/*.js', ':!repositorios/**']),
    privateEditorApi: grepCount(ref, '_invoker\\._isLocked', srcSpec),
  };
}

const results = refs.map(measure);
if (asJson) {
  console.log(JSON.stringify(results, null, 2));
} else {
  const keys = Object.keys(results[0]);
  console.log(`| Métrica | ${results.map((r) => r.ref).join(' | ')} |`);
  console.log(`|---|${results.map(() => '---:').join('|')}|`);
  for (const k of keys.filter((k) => k !== 'ref')) console.log(`| ${k} | ${results.map((r) => r[k]).join(' | ')} |`);
}
