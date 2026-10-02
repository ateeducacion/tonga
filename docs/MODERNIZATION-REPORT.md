# Informe de modernización

Generado con `node scripts/report.mjs` el 2026-10-02. Compara la Tonga original entregada por el proveedor (rama `upstream`, `f10785f`) con la versión actual (`HEAD`, `8aec6a1`). La rama `upstream` no incluye el `dist/` compilado del proveedor (estaba excluido de git), sin el que la aplicación no arranca; para el despliegue y la carga se sirve `upstream` con ese `dist/` original, tal como se guardó sin cambios en el commit `8f23fce`. Las cifras salen de `git`, del `dist/` construido y de cargar las dos aplicaciones en Chromium (Playwright) en local; no hay valores escritos a mano.

## Repositorio

| Métrica | Original (upstream) | Actual | Cambio |
|---|---:|---:|---:|
| Ficheros versionados | 3652 | 3725 | 2 % |
| Tamaño versionado | 312.71 MB | 303.68 MB | -3 % |
| Ficheros de las colecciones | 3482 | 3482 | 0 % |
| Ficheros JS/TS | 22 | 59 | 168 % |
| Ficheros CSS | 18 | 2 | -89 % |
| Ficheros de terceros copiados en el repo | 18 | 0 | -100 % |
| Bytes de terceros copiados en el repo | 2337 KB | 0 KB | -100 % |
| Ficheros de test | 0 | 17 |  |
| `console.log` en código | 31 | 0 | -100 % |
| `eval` / `new Function` | 5 | 0 | -100 % |
| Handlers en línea (`onclick=`…) | 4 | 0 | -100 % |
| Accesos a la API privada `_invoker._isLocked` | 2 | 0 | -100 % |

## Despliegue

| Métrica | Original (repo servido tal cual) | Actual (`dist/`) | Cambio |
|---|---:|---:|---:|
| Tamaño desplegado | 315.83 MB | 299.82 MB | -5 % |
| Ficheros desplegados | 3671 | 3477 | -5 % |

## Carga inicial (Chromium, local, caché vacía)

| Métrica | Original (upstream) | Actual | Cambio |
|---|---:|---:|---:|
| Peticiones | 57 | 6 | -89 % |
| Bytes descargados | 6192 KB | 401 KB | -94 % |
| Bytes de JavaScript | 4538 KB | 364 KB | -92 % |
| Bytes de CSS | 228 KB | 13 KB | -94 % |
| Tiempo hasta red inactiva (ms) | 794 | 529 | -33 % |
| Peticiones a terceros | 0 | 0 |  |
| Errores de consola | 0 | 0 |  |

## Calidad

| Métrica | Original (upstream) | Actual |
|---|---:|---:|
| Tests unitarios (casos) | 0 | 143 |
| Tests E2E (ejecuciones: casos × Chromium, Firefox, WebKit) | 0 | 84 |
| Dependencias npm de runtime | 0 (librerías copiadas a mano en el repo) | 1 (`fabric`) |
| Vulnerabilidades `npm audit` (alta / crítica / total) | n/a: librerías copiadas (jQuery 1.7.2, jQuery UI 1.8.21, jsPDF 2.1.1, Fabric 2.7) con CVE conocidas | 0 / 0 / 0 |
| Licencias | sin licencia declarada | `AGPL-3.0-or-later`, REUSE conforme |

<!-- The hand-written analysis (what got worse, what is pending) lives in docs/MODERNIZATION.md. -->
