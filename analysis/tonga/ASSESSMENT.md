# Assessment — tonga

Fecha: 2026-10-02 · Código: `legacy/tonga` → `/Users/ernesto/Dropbox/Trabajo/ate/tonga` (rama `main`, desciende de `upstream` `f10785f`).
Fuentes: `scc` 4.1.0, tres análisis en paralelo (estructura, deuda técnica, seguridad) y `PREFLIGHT.md`.

## Executive Summary

Tonga es un editor de dibujo web estático para uso educativo. **No es una aplicación propia sobre una librería, sino un fork de TOAST UI Image Editor 3.6.0** (`dist/tui-image-editor.js`, 53.654 líneas, 271 ediciones manuales «JBD» de 2018-2020) que lleva dentro un **Fabric 2.7.0** modificado. Alrededor solo hay unas 600 líneas propias (`js/repositorio.js`, la configuración en `index.html`) y una biblioteca de 3.398 PNG en 59 colecciones. El riesgo es alto en mantenibilidad: el código fuente del fork no existe, la librería original está archivada, se usan APIs privadas y se cargan jQuery 1.7.2 y jQuery UI 1.8.21 (2012), con CVEs conocidas. En seguridad es medio: XSS en el SVG exportado y en la galería, y un CI que publica PRs sin revisar. **Recomendación: Rebuild** de la aplicación sobre Fabric 7 + Vite + TypeScript, fijando antes el comportamiento actual con pruebas Playwright sobre el legacy. Ruta: `reimagine`.

## System Inventory

| Medida | Valor |
|---|---|
| Ficheros/código (scc, sin `legacy/`, `analysis/` ni `node_modules/`) | 144 ficheros · 82.761 líneas de código · complejidad 11.860 |
| JavaScript | 26 ficheros, 58.038 líneas. **El 98 % es código de terceros**: `dist/tui-image-editor.js` (34.076, complejidad 5.018), `js/fabric.js` (17.243, complejidad 3.490), jsPDF, jQuery, axios… |
| Código propio | `js/repositorio.js` (121), configuración y `locale_es` en `index.html` (~170), parches «JBD» dentro del fork |
| CSS | 19 ficheros, 10.015 líneas (muchos sin usar) |
| Biblioteca | `repositorios/`: 3.398 PNG (1.709 thumbnails), 6 JPG, 21 ficheros `.BridgeSort` (basura de Adobe Bridge), 57 `lista.txt` + uno raíz, 306 MB |
| Repositorio | `.git` 615 MB, 8 commits en `main` |
| Ficheros más complejos | `dist/tui-image-editor.js` (5.018), `js/fabric.js` (3.490), `js/jspdf.min.js` (1.304), `js/jquery-ui.min.js` (396), `js/tui-code-snippet.js` (342) |

### Huella tecnológica

| Elemento | Versión cargada | Evidencia | Declarada en `package.json` |
|---|---|---|---|
| TOAST UI Image Editor (fork) | 3.6.0 + 271 JBD | `dist/tui-image-editor.js:3` | — (archivado upstream) |
| Fabric (el que ejecuta) | **2.7.0** embebido | `dist/tui-image-editor.js:16252`, sobrescribe `window.fabric` en `:16410` | ^6.6.6 |
| Fabric (cargado y sombreado) | 3.0.0 | `js/fabric.js:4`, `index.html:134` | |
| jQuery / jQuery UI | **1.7.2 / 1.8.21** | `js/jquery.min.js:1`, `js/jquery-ui.min.js:1` | ^3.7.1 / ^1.13.3 |
| jsPDF | 2.1.1 | `js/jspdf.min.js:5` | ^3.0.1 |
| axios | 1.9.0 (cargado); 0.19.0 (sin cargar) | `index.html:35` | ^1.9.0 |
| tui-color-picker / code-snippet | 2.2.0 / — | `js/tui-color-picker.min.js` | |
| X2JS (xml2json) | 2011-2013 (Apache-2.0) | `js/xml2json.js:1` | `xml2json` npm (otra librería) |
| customiseControls (pixolith, MIT) | 2016 | `js/customiseControls.js:1-5` | — |
| image-picker | cargado, nunca llamado | `index.html:10,140` | — |

- Build: no tiene. Se sirve tal cual. `npm run update` copia ficheros `.min` que no coinciden con lo que se carga.
- Datos: no hay base de datos. Catálogo en `lista.txt` con el formato `fichero|tooltip|tongaappfondo` y el centinela `tongaappcabecera` en la raíz.
- Integraciones: ninguna en runtime. Todas las URLs externas de `index.html` están comentadas (`:23,29-30,34`). Hay enlaces legales a gobiernodecanarias.org.
- Tests: **ninguno**. CI: despliega a `gh-pages` sin tests (y Pages está configurado como `workflow`).

## Architecture at a Glance

Diagrama: `analysis/tonga/ARCHITECTURE.mmd`.

| # | Dominio | Ficheros | Papel |
|---|---|---|---|
| D1 | Shell / bootstrap | `index.html`, `js/theme/black-theme.js`, fuentes, `sounds/button-22.mp3` | Crea el global `imageEditor`, el locale `locale_es` y el menú de 9 herramientas |
| D2 | Núcleo del editor (fork) | `dist/tui-image-editor.js` (módulos 2, 68, 73, 103, 105) | Comandos, undo, API añadida (`comenzar`, `recargar`, `cargarFondo`, z-index, zoom, fondo transparente), copiar y pegar, atajos |
| D3 | Motor de render | Fabric 2.7 embebido (módulo 106), `js/fabric.js` 3.0 sombreado, `js/customiseControls.js` | Parches propios: atributos `tipo`/`nombre` en SVG, fuente Noto Sans, icono de rotación |
| D4 | UI / menús | Módulos 74, 76 y submenús; `dist/tui-image-editor.css`; `dist/svg/*` | Cabecera con 14 botones; undo/redo ocultos en el menú (solo por teclado) |
| D5 | Biblioteca («colecciones») | `js/repositorio.js`, módulos 161-162, `repositorios/**`, jquery.modal | Acordeón de colecciones; miniaturas en base64; doble clic para insertar como objeto o como fondo |
| D6 | Importar / exportar | `load` L11425, `download` L11771, jsPDF, FileSaver, X2JS, ImageTracer | SVG con fondo embebido (`_nombre="data-background"`), PDF A4, JPG/PNG con fondo blanco si gira |
| D7 | Créditos | `creditos.html`, `css/4.css`, `css/5.css`, logos | Diálogo jQuery UI con `.load()` |
| D8 | Build / deploy | `package.json`, `Makefile`, `ci.yml`, `dependabot.yml` | Ninguno funciona como se espera |
| D9 | Código muerto | `js/service-*.js`, `dist/esquema*.js`, `*.min` duplicados, `axios.js`, 10 CSS, `creditos_completo.html` | Se puede borrar |

Estado global compartido: `window.imageEditor` (usado por nombre dentro del fork), `bleep`, `$dialog`, `mensaje` (global implícito por id del DOM), `imgUrl` (fuga de variable implícita), y escrituras en `imageEditor._invoker._isLocked`.

## Production Runtime Profile

No hay telemetría disponible (es una app estática sin APM ni logs). No aplica.

## Technical Debt (top 10)

| # | Deuda | Evidencia | Dirección |
|---|---|---|---|
| 1 | jQuery 1.7.2 y jQuery UI 1.8.21 con CVEs de XSS | `js/jquery.min.js:1`, `js/jquery-ui.min.js:1`, `index.html:26-27` | Eliminar jQuery por completo en la reescritura (`<dialog>`, `fetch`) |
| 2 | Dos copias de Fabric; ~929 KB descargados sin usar | `index.html:134`; `dist/tui-image-editor.js:16251,16410` | Un único Fabric 7 vía npm |
| 3 | `package.json` y `npm run update` no corresponden a lo que se ejecuta | `package.json` scripts y devDependencies | Las dependencias reales vienen de npm y se empaquetan con Vite |
| 4 | API privada `_invoker._isLocked` forzada en 8 sitios (fuga de bloqueo de comandos) | `js/repositorio.js:143`; `dist/tui-image-editor.js:2398,11639-11642,11847,11948,11952,12334` | Historial propio, sin internals |
| 5 | El fork del proveedor actúa como god object: sin código fuente, 271 ediciones, llamadas HTTP de la app, exportación, globals | `dist/tui-image-editor.js` | Extraer requisitos, no código |
| 6 | El CI publica todo el repo, también en PRs; sin `permissions`, sin lint ni tests | `.github/workflows/ci.yml:3-23` | CI nuevo + Pages vía artifact |
| 7 | Dependabot inválido (`package-ecosystem: ""`) | `.github/dependabot.yml:8` | npm + github-actions |
| 8 | Makefile `package` roto: VERSION vacío, `cp -R *` se copia dentro de sí mismo, `.PHONY` incorrecto | `Makefile:1-20` | Makefile pequeño que llama a npm |
| 9 | Ficheros muertos o duplicados (ver D9), bloques comentados en `index.html` | `index.html:23,29-30,34,100-120,309-316` | Borrar |
| 10 | Cargador de la biblioteca frágil: una petición por miniatura, `innerHTML +=` (O(n²)), base64 a mano, mal etiquetado como `image/jpeg`, sin manejo de errores, `ondblclick` en línea | `js/repositorio.js:13,50,65-87,109-150` | Catálogo JSON + `<img loading=lazy>` + DOM seguro |

Otros: claves duplicadas y la errata «Coor de texto» en `locale_es` (`index.html:144-260`). `new Function` en el fork impide una CSP estricta (`dist/tui-image-editor.js:16751,22292`). Datos: 24 `lista.txt` con BOM UTF-8 (el primer elemento probablemente falla), 26 con CRLF, `repositorios/FondosMar/` inaccesible, 3 ficheros de `laboratorio` sin imagen principal, `img/LogoCanarias.png` con mayúsculas distintas a las del fichero en disco.

## Security Findings

No se han encontrado credenciales (por eso no hay `SECRETS.local.md`). El ping a Google Analytics está desactivado de facto.

| ID | CWE | Severidad | Ubicación | Resumen |
|---|---|---|---|---|
| SEC-001 | CWE-284/829 | **High** | `ci.yml:6-7,17-22` | El workflow despliega en `gh-pages` también en `pull_request`: código sin revisar llega a producción |
| SEC-002 | CWE-829 | Medium | `ci.yml:15,18` | Actions con tags móviles (incluida una de terceros con token de escritura) |
| SEC-005 | CWE-79/116 | Medium | `dist/tui-image-editor.js:31332,31374,35349-35354` | El SVG exportado no escapa `id`, `font-family`, `nombre`, `tipo`, `href` (misma clase que GHSA-hfvx-25r5-qc3w) |
| SEC-006 | CWE-79/83 | Medium | `js/repositorio.js:44-81`; `dist/tui-image-editor.js:53319-53355` | `lista.txt` y nombres de fichero concatenados en `innerHTML` y `onclick` |
| SEC-007 | CWE-1104 | Medium | `js/jquery.min.js` 1.7.2 | CVE-2015-9251, CVE-2019-11358, CVE-2020-11022/11023 (hoy sin sink alcanzable) |
| SEC-003 | CWE-250 | Low | `ci.yml` | Sin `permissions:` |
| SEC-004 | CWE-538 | Low | `ci.yml:20` | Publica `.vscode/`, el prompt, librerías muertas |
| SEC-008 | CWE-1104 | Low | `js/jquery-ui.min.js` 1.8.21 | CVE-2016-7103, CVE-2021-41182/3/4, CVE-2022-31160 |
| SEC-009 | CWE-1104 | Low | `js/jspdf.min.js` 2.1.1 | Advisories de jsPDF ≤4.2.0 (DoS con imágenes; entrada actual = canvas) |
| SEC-010 | CWE-1104 | Low | `js/axios.js` 0.19.0 publicado | CVE-2020-28168, CVE-2021-3749, CVE-2023-45857 |
| SEC-011 | CWE-94/502 | Low (latente) | `dist/tui-image-editor.js:16751,22292` | Fabric 2.x ejecuta `clipTo` de un JSON con `new Function`: no hay que añadir importación de proyectos sobre este motor |
| SEC-012 | CWE-441/200 | Low | `:11469`, `:35758` | Un SVG importado puede cargar URLs externas (rastreo; contamina el canvas y rompe la exportación). `<script>` y `javascript:` **no** se ejecutan |
| SEC-013 | CWE-20/400 | Low | `:11447-11449`, `:6705` | Tipo deducido de `name.split('.')[1]`; sin límite de tamaño ni de dimensiones; sin `accept` |
| SEC-014 | CWE-693 | Low | `index.html` | Sin CSP; handlers en línea la impiden |
| SEC-015 | CWE-1022 | Low | `index.html:89-90` | `target="_new"` sin `rel="noopener"` |
| SEC-016 | CWE-1104 | Low | `dependabot.yml:8` | Configuración inválida |
| SEC-017 | CWE-359 | Info | `index.html:259`, `js/tui-color-picker.min.js` | Beacon GA latente en el color picker (desactivado hoy) |

`npm audit` del lockfile de desarrollo: fabric ≤7.3.1 (High, XSS en exportación SVG: GHSA-hfvx-25r5-qc3w y GHSA-w22m-hvvm-xmwx), jspdf ≤4.2.0 (Critical) y axios (High). **Consecuencia para el destino: Fabric ≥ 7.4.0 obligatorio.**

## Documentation Gaps (top 5)

1. **Que Tonga es un fork de TOAST UI.** El README habla de un «editor SVG integrado» y no dice que la lógica está en las 271 ediciones JBD de un `dist/` sin código fuente.
2. **El formato de `lista.txt`** (`tongaappcabecera`, `tongaappfondo`, thumbnails obligatorios, BOM y CRLF tolerados a medias) no está documentado en ningún sitio.
3. **El formato SVG «round-trip»** (imagen de fondo embebida con `_nombre="data-background"` y atributos `tipo`/`nombre`) del que depende «Recargar fichero».
4. **Qué funciona de verdad.** Undo/redo existe solo por teclado (está oculto en el menú), las máscaras están desactivadas, el doble clic es la única forma de insertar desde la biblioteca, y la copia de Fabric que ejecuta es la 2.7, no la 3.0 ni la 6.
5. **Licencias.** El README dice «AGPL» para todo y «Creative Commons» para las imágenes sin indicar la variante. `creditos.html` menciona CC BY-NC-SA. El código vendorizado es MIT, Apache-2.0 o MIT/GPL. No hay inventario.

## Relative Scale

- KSLOC: 82,8 (de las cuales ~0,6 son propias). Complejidad por KSLOC: 143. Fichero más complejo: `dist/tui-image-editor.js`.
- Índice COCOMO (`2.94 × KSLOC^1.10`): **378**. Es una medida **relativa de tamaño** para ordenar sistemas entre sí; **no es un plazo ni un coste**, y aquí está muy inflada por el código vendorizado.

## Recommended Modernization Pattern

**Rebuild** → `/code-modernization:modernize-reimagine`.

Una transformación «pieza a pieza» (`transform`) presupone módulos propios que traducir. Aquí no los hay: el 98 % del código es de terceros, y lo propio está repartido en 271 parches de un bundle webpack sin fuente, atado a Fabric 2.7 y a TOAST UI archivado. Subir versiones (`uplift`) tampoco sirve, porque TOAST UI no tiene futuro y el prompt lo prohíbe explícitamente (§7). Lo correcto es **extraer los requisitos** (lo que `extract-rules` convierte en criterios de aceptación), **fijar el comportamiento actual con pruebas Playwright sobre el legacy servido estáticamente** y construir una aplicación nueva y pequeña: Vite + TypeScript + Fabric ≥ 7.4.0, un `CanvasAdapter`, formato `.tonga` propio, catálogo JSON generado en build y UI accesible. El legacy sigue publicado hasta que la nueva versión supere esas pruebas (§60 del prompt). Destino final: GitHub Pages desplegado desde `main` mediante CI.
