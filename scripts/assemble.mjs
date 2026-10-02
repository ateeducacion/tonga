// Puts the legacy app (site root) and the shared collections next to the new app (dist/next/).
// Removed at the cutover, when the rebuilt app moves to the root.
import { cpSync, rmSync } from 'node:fs';

const skip = (src) => !/(^|\/)(\.DS_Store|.*\.BridgeSort)$/.test(src);
for (const entry of ['index.html', 'creditos.html', 'css', 'dist', 'img', 'js', 'sounds', 'webfonts']) {
  rmSync(`dist/${entry}`, { recursive: true, force: true });
  cpSync(`legacy-app/${entry}`, `dist/${entry}`, { recursive: true, filter: skip });
}
cpSync('repositorios', 'dist/repositorios', { recursive: true, filter: skip });
console.log('assembled dist/: legacy at /, rebuilt app at /next/');
