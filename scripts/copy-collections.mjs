// Copies the shared image collections into dist/ (they are served as static files, not bundled).
import { cpSync } from 'node:fs';

cpSync('repositorios', 'dist/repositorios', { recursive: true, filter: (src) => !/(\.DS_Store|\.BridgeSort)$/.test(src) });
console.log('copied repositorios/ into dist/');
