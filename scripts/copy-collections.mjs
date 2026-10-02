// Copies the shared image collections into dist/ (served as static files, not bundled).
import { copyFileSync, cpSync } from 'node:fs';

cpSync('repositorios', 'dist/repositorios', { recursive: true, filter: (src) => !/(\.DS_Store|\.BridgeSort)$/.test(src) });
// The deployed app carries its licence and third-party notices.
for (const f of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) copyFileSync(f, `dist/${f}`);
console.log('copied repositorios/, LICENSE and THIRD_PARTY_NOTICES.md into dist/');
