# Informe de modernización

Generado con `node scripts/report.mjs` el 2026-10-02. Compara la rama `upstream` (`f10785f`, código original entregado por el proveedor), `main` antes de modernizar (`91ca335`) y `HEAD` (`2319f1c`). El cambio se calcula frente a `main` antes de modernizar. Las cifras salen de `git`, del `dist/` construido y de cargar las dos aplicaciones en Chromium (Playwright) en local; no hay valores escritos a mano.

## Repositorio

| Métrica | upstream | main antes | main ahora | Cambio |
|---|---:|---:|---:|---:|
| Ficheros versionados | 3652 | 3678 | 3600 | -2 % |
| Tamaño versionado | 312.71 MB | 316.03 MB | 302.52 MB | -4 % |
| Ficheros de las colecciones | 3482 | 3482 | 3482 | 0 % |
| Ficheros JS/TS | 22 | 26 | 51 | 96 % |
| Ficheros CSS | 18 | 19 | 2 | -89 % |
| Ficheros de terceros copiados en el repo | 18 | 21 | 0 | -100 % |
| Bytes de terceros copiados en el repo | 2337 KB | 5185 KB | 0 KB | -100 % |
| Ficheros de test | 0 | 0 | 14 |  |
| `console.log` en código | 31 | 85 | 0 | -100 % |
| `eval` / `new Function` | 5 | 7 | 0 | -100 % |
| Handlers en línea (`onclick=`…) | 4 | 4 | 0 | -100 % |
| Accesos a la API privada `_invoker._isLocked` | 2 | 11 | 0 | -100 % |

## Despliegue

| Métrica | upstream (repo servido tal cual) | main antes (ídem) | main ahora (`dist/`) | Cambio |
|---|---:|---:|---:|---:|
| Tamaño desplegado | 312.71 MB | 316.03 MB | 299.72 MB | -5 % |
| Ficheros desplegados | 3652 | 3678 | 3475 | -6 % |

## Carga inicial (Chromium, local, caché vacía)

| Métrica | upstream | main antes | main ahora | Cambio |
|---|---:|---:|---:|---:|
| Peticiones | 24 | 57 | 5 | -91 % |
| Bytes descargados | 1861 KB | 6231 KB | 387 KB | -94 % |
| Bytes de JavaScript | 1810 KB | 4577 KB | 357 KB | -92 % |
| Bytes de CSS | 19 KB | 228 KB | 12 KB | -95 % |
| Tiempo hasta red inactiva (ms) | 592 | 747 | 530 | -29 % |
| Peticiones a terceros | 0 | 0 | 0 |  |
| Errores de consola | 3 | 0 | 0 |  |

## Calidad

| Métrica | upstream | main antes | main ahora |
|---|---:|---:|---:|
| Tests unitarios (casos) | 0 | 0 | 97 |
| Tests E2E (ejecuciones: casos × Chromium, Firefox, WebKit) | 0 | 0 | 63 |
| Dependencias npm de runtime | 0 (todo copiado a mano) | 0 (`package.json` solo con devDependencies que no se cargaban) | 1 (`fabric`) |
| Vulnerabilidades `npm audit` (alta / crítica / total) | n/a: librerías copiadas (jQuery 1.7.2, jQuery UI 1.8.21, jsPDF 2.1.1, Fabric 2.7) con CVE conocidas | ídem | 0 / 0 / 0 |
| Licencias (REUSE) | sin `LICENSE` | `LICENSE` AGPL, sin inventario | `reuse lint` conforme |

<!-- The hand-written analysis (what got worse, what is pending) lives in docs/MODERNIZATION.md. -->
