// Licence inventory of the npm dependencies. Fails if a runtime dependency (the code that can end
// up in dist/) has a licence outside the permissive allow-list. Dev tools are reported only.
//   node scripts/licenses.mjs [--json]
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ALLOWED = new Set(['MIT', 'MIT-0', 'ISC', 'Apache-2.0', 'BSD-2-Clause', 'BSD-3-Clause', '0BSD', 'CC0-1.0', 'BlueOak-1.0.0', 'Unlicense']);

function inventory(omitDev) {
  const args = ['ls', '--all', '--json', '--long', ...(omitDev ? ['--omit=dev'] : [])];
  const tree = JSON.parse(execFileSync('npm', args, { encoding: 'utf8', maxBuffer: 1 << 26 }));
  const found = new Map();
  const walk = (deps) => {
    for (const [name, info] of Object.entries(deps ?? {})) {
      if (!info.path || found.has(`${name}@${info.version}`)) continue;
      let license = 'UNKNOWN';
      try {
        const pkg = JSON.parse(readFileSync(join(info.path, 'package.json'), 'utf8'));
        license = typeof pkg.license === 'string' ? pkg.license : (pkg.license?.type ?? 'UNKNOWN');
      } catch {
        /* optional dependency not installed on this platform */
      }
      found.set(`${name}@${info.version}`, license);
      walk(info.dependencies);
    }
  };
  walk(tree.dependencies);
  return found;
}

const allowed = (expr) => expr.replace(/[()]/g, '').split(/\s+OR\s+/).some((l) => ALLOWED.has(l.trim()));
const runtime = inventory(true);
const all = inventory(false);
const count = (m) => [...m.values()].reduce((acc, l) => ({ ...acc, [l]: (acc[l] ?? 0) + 1 }), {});
const bad = [...runtime].filter(([, l]) => !allowed(l));

if (process.argv.includes('--json')) {
  console.log(JSON.stringify({ runtime: Object.fromEntries(runtime), all: count(all) }, null, 2));
} else {
  console.log(`Runtime packages: ${runtime.size}`, count(runtime));
  console.log(`All packages (incl. dev tools): ${all.size}`, count(all));
}
if (bad.length) {
  console.error(`Runtime dependencies with a licence outside the allow-list:\n${bad.map(([p, l]) => `  ${p}: ${l}`).join('\n')}`);
  process.exit(1);
}
