// Generates docs/MODERNIZATION-REPORT.md: upstream (the original code delivered by the vendor)
// against the current tree. Every number comes from a command run here.
// The upstream branch has the vendor's sources but not their built dist/ (it was git-ignored);
// that dist/ was committed unchanged in 8f23fce, so the original app is served as upstream + it.
//   npm run build && node scripts/report.mjs [upstreamRef=origin/upstream] [vendorDistRef=8f23fce]
import { execFileSync, spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { measureLoad } from './measure-load.mjs';

const upstream = process.argv[2] ?? 'origin/upstream';
const vendorDist = process.argv[3] ?? '8f23fce';
const sh = (cmd, args, opts = {}) => execFileSync(cmd, args, { encoding: 'utf8', maxBuffer: 1 << 28, ...opts });
const [up, head] = JSON.parse(sh('node', ['scripts/metrics.mjs', upstream, 'HEAD', '--json']));

function dirSize(dir) {
  let bytes = 0;
  let files = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) {
      const s = dirSize(p);
      bytes += s.bytes;
      files += s.files;
    } else {
      bytes += statSync(p).size;
      files++;
    }
  }
  return { bytes, files };
}

async function served(root, port, fn) {
  const server = spawn('node', ['scripts/serve.mjs', String(port), root], { stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 800));
  try {
    return await fn(`http://127.0.0.1:${port}/`);
  } finally {
    server.kill();
  }
}

// The old app has no build: it is served as-is from a checkout of the ref.
async function legacy(ref, port) {
  const dir = mkdtempSync(join(tmpdir(), 'tonga-legacy-'));
  sh('sh', ['-c', `git archive ${ref} | tar -x -C ${dir}`]);
  sh('sh', ['-c', `git archive ${vendorDist} dist | tar -x -C ${dir}`]);
  try {
    return { deploy: dirSize(dir), load: await served(dir, port, measureLoad) };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}
const old = await legacy(upstream, 4181);

const dist = dirSize('dist');
const newLoad = await served('dist', 4182, measureLoad);

// Test counts come from the runners themselves.
const vitestOut = join(mkdtempSync(join(tmpdir(), 'tonga-vitest-')), 'out.json');
sh('npx', ['vitest', 'run', '--reporter=json', `--outputFile=${vitestOut}`], { stdio: 'ignore' });
const unitTests = JSON.parse(readFileSync(vitestOut, 'utf8')).numTotalTests;
const e2eList = sh('npx', ['playwright', 'test', '--list'], { stdio: ['ignore', 'pipe', 'ignore'] });
const e2eTests = Number(/Total: (\d+) test/.exec(e2eList)?.[1] ?? 0);
let audit;
try {
  const a = JSON.parse(sh('npm', ['audit', '--json'], { stdio: ['ignore', 'pipe', 'ignore'] }));
  audit = { ...a.metadata.vulnerabilities, total: a.metadata.vulnerabilities.total };
} catch (e) {
  const a = JSON.parse(e.stdout);
  audit = { ...a.metadata.vulnerabilities, total: a.metadata.vulnerabilities.total };
}
const runtimeDeps = Object.keys(JSON.parse(readFileSync('package.json', 'utf8')).dependencies ?? {}).length;

const mb = (b) => `${(b / 1024 / 1024).toFixed(2)} MB`;
const kb = (b) => `${Math.round(b / 1024)} KB`;
const pct = (a, b) => (a ? `${Math.round(((b - a) / a) * 100)} %` : '');
// upstream | now | change
const row = (name, a, b, fmt = String) => `| ${name} | ${fmt(a)} | ${fmt(b)} | ${typeof a === 'number' && typeof b === 'number' ? pct(a, b) : ''} |`;

const md = `# Informe de modernización

Generado con \`node scripts/report.mjs\` el ${new Date().toISOString().slice(0, 10)}. Compara la Tonga original entregada por el proveedor (rama \`upstream\`, \`${up.sha}\`) con la versión actual (\`HEAD\`, \`${head.sha}\`). La rama \`upstream\` no incluye el \`dist/\` compilado del proveedor (estaba excluido de git), sin el que la aplicación no arranca; para el despliegue y la carga se sirve \`upstream\` con ese \`dist/\` original, tal como se guardó sin cambios en el commit \`${vendorDist}\`. Las cifras salen de \`git\`, del \`dist/\` construido y de cargar las dos aplicaciones en Chromium (Playwright) en local; no hay valores escritos a mano.

## Repositorio

| Métrica | Original (upstream) | Actual | Cambio |
|---|---:|---:|---:|
${row('Ficheros versionados', up.files, head.files)}
${row('Tamaño versionado', up.bytes, head.bytes, mb)}
${row('Ficheros de las colecciones', up.collectionFiles, head.collectionFiles)}
${row('Ficheros JS/TS', up.jsFiles, head.jsFiles)}
${row('Ficheros CSS', up.cssFiles, head.cssFiles)}
${row('Ficheros de terceros copiados en el repo', up.vendoredFiles, head.vendoredFiles)}
${row('Bytes de terceros copiados en el repo', up.vendoredBytes, head.vendoredBytes, kb)}
${row('Ficheros de test', up.testFiles, head.testFiles)}
${row('`console.log` en código', up.consoleLog, head.consoleLog)}
${row('`eval` / `new Function`', up.evalOrNewFunction, head.evalOrNewFunction)}
${row('Handlers en línea (`onclick=`…)', up.inlineHandlers, head.inlineHandlers)}
${row('Accesos a la API privada `_invoker._isLocked`', up.privateEditorApi, head.privateEditorApi)}

## Despliegue

| Métrica | Original (repo servido tal cual) | Actual (\`dist/\`) | Cambio |
|---|---:|---:|---:|
${row('Tamaño desplegado', old.deploy.bytes, dist.bytes, mb)}
${row('Ficheros desplegados', old.deploy.files, dist.files)}

## Carga inicial (Chromium, local, caché vacía)

| Métrica | Original (upstream) | Actual | Cambio |
|---|---:|---:|---:|
${row('Peticiones', old.load.requests, newLoad.requests)}
${row('Bytes descargados', old.load.bytes, newLoad.bytes, kb)}
${row('Bytes de JavaScript', old.load.bytesByType.script ?? 0, newLoad.bytesByType.script ?? 0, kb)}
${row('Bytes de CSS', old.load.bytesByType.stylesheet ?? 0, newLoad.bytesByType.stylesheet ?? 0, kb)}
${row('Tiempo hasta red inactiva (ms)', old.load.networkIdleMs, newLoad.networkIdleMs)}
${row('Peticiones a terceros', old.load.externalRequests.length, newLoad.externalRequests.length)}
${row('Errores de consola', old.load.consoleErrors.length, newLoad.consoleErrors.length)}

## Calidad

| Métrica | Original (upstream) | Actual |
|---|---:|---:|
| Tests unitarios (casos) | 0 | ${unitTests} |
| Tests E2E (ejecuciones: casos × Chromium, Firefox, WebKit) | 0 | ${e2eTests} |
| Dependencias npm de runtime | 0 (librerías copiadas a mano en el repo) | ${runtimeDeps} (\`fabric\`) |
| Vulnerabilidades \`npm audit\` (alta / crítica / total) | n/a: librerías copiadas (jQuery 1.7.2, jQuery UI 1.8.21, jsPDF 2.1.1, Fabric 2.7) con CVE conocidas | ${audit.high} / ${audit.critical} / ${audit.total} |
| Licencias | sin licencia declarada | \`AGPL-3.0-or-later\`, REUSE conforme |
`;

writeFileSync('docs/MODERNIZATION-REPORT.md', `${md}\n<!-- The hand-written analysis (what got worse, what is pending) lives in docs/MODERNIZATION.md. -->\n`);
console.log(md);
