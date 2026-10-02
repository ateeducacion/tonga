# Preflight — tonga

Fecha: 2026-10-02 · `legacy/tonga` → `/Users/ernesto/Dropbox/Trabajo/ate/tonga` (symlink a la raíz del propio repo; `legacy/` añadido a `.git/info/exclude`).
Objetivo stack (de `INTENT.md` / `1er-prompt.md`): Vite + TypeScript + Fabric.js 7, estático, GitHub Pages.

## Answers

1. **Scope** — ¿Sistema completo o una parte?
   > Es el sistema completo
2. **Build & test locally** — ¿Se puede construir/testear aquí? ¿Duración del CI?
   > Se sirve estático, sin tests
3. **Bespoke build infrastructure**
   > No
4. **Prior attempts**
   > No
   (Nota: hay restos de una sesión de aider en `.aider.*` y un `npm run update` que copia libs a `js/`; no constituyen un intento de modernización.)
5. **Off limits**
   > Solo la rama upstream

## Check 6 — Scope boundary

Repositorio independiente (`ateeducacion/tonga`, público). No hay raíz superior ni consumidores entrantes conocidos. Dependencias salientes en runtime: CDN externos (ver Check 4).

## Tabla

| # | Check | Estado | Hallazgo | Arreglo |
|---|---|---|---|---|
| 0 | Respuestas | ✅ | Las 5 respondidas | — |
| 1 | Stack | ✅ | HTML+JS (jQuery/TOAST UI) + CSS estáticos. scc: 26 JS (58k líneas de código, casi todo vendorizado), 19 CSS, 30 SVG, 3 HTML. `repositorios/`: 3.482 ficheros en 57 colecciones con `lista.txt` (306 MB). `.git`: 615 MB | — |
| 2 | Herramientas de análisis | ✅ | scc 4.1.0, python3 3.14.8, lizard 2.1.0, reuse (instalado después del preflight). Falta `cloc` (no hace falta) | — |
| 3a | Definición de build | ⚠️ | No hay build. `package.json`: `license: AGPL-3.0` (identificador SPDX obsoleto), devDeps (fabric ^6.6.6, jquery, axios…) que **no se usan en runtime**: `npm run update` copia ficheros `.min.js` a `js/`, pero `index.html` carga `js/fabric.js` (**Fabric 3.0.0**, sobrescrito en runtime por el **Fabric 2.7.0** embebido en `dist/tui-image-editor.js`, TOAST UI 3.6.0 con 269 ediciones «JBD» del proveedor). `node_modules/` está vacío. CI (`ci.yml`): sin `permissions`, `actions/checkout@v4`, despliega **todo el repo** a la rama `gh-pages` con JamesIves, sin tests; pero Pages está configurado con `build_type: workflow` (no sirve `gh-pages`). `dependabot.yml` tiene `package-ecosystem: ""` (inválido) | Lo sustituye la Fase 1 (CI nuevo + Pages vía artifact) |
| 3b | Smoke test del legacy | ✅ | Nivel 1/2 equivalente: `python3 -m http.server` sirve `/`, `dist/tui-image-editor.js`, `js/fabric.js` y `repositorios/aves/lista.txt` con 200. La baseline Playwright podrá ejecutarse sobre el legacy | — |
| 3c | Stack objetivo (proyecto de prueba desechable) | ✅ | Node 26.10 / npm 11.19 en local. Instalado y probado: **vite 8.3.2** (build OK), **typescript 7.0.2** (`tsc` OK), **vitest 5.0.3** + jsdom (round-trip JSON y `toSVG` de Fabric OK; en entorno `node` puro falla, así que hay que usar jsdom), **@playwright/test 1.63.0** con Chromium, Firefox y WebKit ya en caché, **fabric 7.4.0** (MIT, publicado 2026-05-18). En CI usar Node 24 LTS | Fijar `environment: 'jsdom'` en los tests de Vitest que usen Fabric |
| 4 | Completitud del código | ⚠️ | No falta ninguna referencia local de `index.html`. Los recursos externos (Google Fonts, cdnjs jquery-modal, unpkg axios) están **comentados** en `index.html:23,29-30,34`: hoy todo se sirve localmente. APIs privadas: `imageEditor._invoker._isLocked` (`js/repositorio.js:143`) y `_xlinkhref` (`js/service-basic.js:575`). `tui-code-snippet` incluye un ping a Google Analytics; está desactivado con `usageStatistics: false` (`index.html:259`). Código muerto probable: `js/fabric.min.js` (3.0.0), `axios.js`, `xml2json.js` sin minificar, `dist/esquema_comandos.js`, `dist/estudio_nuevos_comandos.js`, `dist/tui-image-editor_esquema.js`, `creditos_completo.html` | Lo cubren `assess` y `extract-rules` |
| 5 | Contexto opcional | ⚠️ | Sin telemetría (es una app estática). Git con poca historia útil: 8 commits. `upstream` = `f10785f` («Initial commit: original vendor source»), y `main` desciende de ella (+7 commits; el primero, `8f23fce`, repite el mismo mensaje). `gh` está autenticado con permisos de admin; Pages está activo en `https://ateeducacion.github.io/tonga/` | — |
| 6 | Límite de alcance | ✅ | Repo independiente | — |
| 7 | Protección del código fuente | ⚠️ | No hay regla `deny` de `Edit` para `legacy/`. **Caso especial**: la modernización se hará *in place* en este mismo repo (ramas + PRs sobre `main`). Si se negara la edición del destino del symlink, se bloquearía también la nueva app. La protección real es git: la rama `upstream` (SHA `f10785f`), no hacer commits en ella y no usar `--force` | Opcional: `{ "permissions": { "deny": ["Edit(/legacy/**)"] } }` en `.claude/settings.json` (solo cubre la ruta del link, no su destino). Una regla `deny` cubre las herramientas de Claude y los comandos de shell que reconoce, pero no scripts que abran ficheros por su cuenta. La garantía dura es el sistema operativo (montaje de solo lectura o sandbox) |

## Veredicto por comando

| Comando | Veredicto |
|---|---|
| `assess`, `map`, `extract-rules` | **Ready** |
| `brief` | **Ready** (tras el descubrimiento) |
| `transform` / `reimagine` | **Ready**. Stack objetivo probado. El legacy se sirve, así que la equivalencia puede usar Playwright sobre las dos versiones |
| `harden` | **Ready**; no hay SAST específico de JS (bastarán `npm audit` y revisión manual) |
| `uplift` | No aplica (no es un salto de versión del mismo stack) |

**Arreglo más importante:** ninguno pendiente.

Siguiente paso: `/code-modernization:modernize-assess tonga`
