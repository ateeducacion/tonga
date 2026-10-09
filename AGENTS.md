# Guía para agentes

Reglas para quien modifica este repositorio (personas o agentes de IA). Si un skill de terceros dice otra cosa, manda este archivo.

## Qué es

Tonga es una aplicación de dibujo estática para el aula: TypeScript, HTML y CSS sobre Fabric.js 7, construida con Vite. `npm run build` genera `dist/`, que se publica tal cual (GitHub Pages, Nginx, Apache). No hay backend, base de datos ni autenticación, y no se añaden sin un ADR que demuestre que el navegador no basta.

## Ramas

- `upstream` es **histórica**: el código original del proveedor (TOAST UI, `f10785f`). No se modifica, no se rebasa, no se hace `push --force` y no se publica.
- `main` es la versión mantenida. Se trabaja en ramas y se fusiona por pull request con el CI en verde.

## Tecnologías permitidas

TypeScript, HTML semántico, CSS con custom properties, Fabric.js y `uqr` (las únicas dependencias de runtime; ver ADR 0010), Vite, Vitest, Playwright y ESLint.

No se introduce React, Vue, Angular, Svelte, Redux ni otro framework sin un ADR en `docs/adr/` que demuestre que simplifica el producto. Tampoco jQuery, axios, lodash, moment, Bootstrap JS ni fuentes de iconos completas. Una dependencia nueva tiene que quitar más complejidad de la que añade; antes de añadirla se consulta su documentación oficial (y Context7), su licencia, su mantenimiento y sus advisories.

## Arquitectura

```text
UI (src/ui, src/app) → Editor (src/canvas/editor.ts) → Documento (src/project) → Fabric.js
```

- Solo `src/canvas/`, `src/export/` y `src/import/` importan `fabric` (ESLint lo impone).
- **Nunca se usan miembros privados** de Fabric (`obj._algo`); ESLint rechaza cualquier acceso a propiedades que empiecen por `_`.
- El documento es el formato `.tonga` ([docs/PROJECT-FORMAT.md](docs/PROJECT-FORMAT.md)), nunca un volcado del canvas de Fabric. Un cambio de formato sube `version` y añade una migración en `src/project/schema.ts` con su test.
- Las posiciones usan el origen `center` (valor por defecto de Fabric 7).
- Las imágenes del usuario se guardan por contenido (`asset:<sha256>`) en IndexedDB; las de la biblioteca, por su ruta `repositorios/…`.
- La UI no usa `innerHTML` con datos: el texto va siempre por `textContent`. Nada de scripts ni handlers en línea (la app debe poder funcionar con una CSP estricta).

Detalle en [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Comandos

```bash
npm ci
npm run dev          # desarrollo
npm run lint         # ESLint
npm run typecheck    # tsc
npm test             # Vitest (unitarios)
npm run coverage     # con umbrales de cobertura (los exige el CI)
npm run build        # dist/
npm run check        # comprobaciones de dist/
npm run e2e          # Playwright: Chromium, Firefox, WebKit (necesita dist/)
npm run visual       # galería de capturas (no bloquea)
npm run audit        # npm audit (alta o superior)
npm run licenses     # inventario de licencias npm
npm run catalog      # catálogo + informe de la biblioteca
node scripts/report.mjs   # informe de modernización (necesita dist/)
reuse lint           # REUSE/SPDX
```

## Tests

Un cambio de comportamiento lleva un test que lo fije. La lógica (formato, historial, editor, exportación, importación, catálogo, atajos) se prueba con Vitest; la interfaz, con Playwright en los tres motores. Los E2E fallan ante cualquier error de consola o petición fuera de la app. Todo pull request cubre con tests unitarios **al menos el 90 % de las líneas y ramas que cambia** (`codecov/patch`, fijado en `codecov.yml`). Si el check queda por debajo, se añaden tests o se elimina la rama muerta antes de fusionar; nunca se baja el objetivo. No se añaden tests vacíos ni `skip` para ideas futuras. Detalle en [docs/TESTING.md](docs/TESTING.md).

## Licencias

- No se copia código de webs, blogs, Stack Overflow, Gists ni repositorios sin comprobar su licencia. Un repositorio público no es código reutilizable. Si no hay licencia clara, se reimplementa la idea.
- Todo fragmento de terceros registra proyecto, autor, URL, fichero, versión o commit, licencia y cambios ([THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)).
- Los ficheros nuevos quedan cubiertos por `REUSE.toml`; `reuse lint` tiene que pasar.
- El software es `AGPL-3.0-or-later` y las imágenes de la biblioteca, CC BY-NC-SA 4.0 ([docs/LICENSING.md](docs/LICENSING.md)). No se relicencia nada sin una decisión documentada allí.

## Biblioteca de imágenes

Las colecciones están en `repositorios/<colección>/` con un `lista.txt` (`fichero|título|tongaappfondo`) y miniaturas en `thumbnails/`. `scripts/build-catalog.mjs` genera `catalog.json` y **hace fallar el build** ante un catálogo corrupto. Los nombres de fichero distinguen mayúsculas. No se borra material educativo válido solo por tamaño. Detalle en [docs/ASSETS.md](docs/ASSETS.md).

## CI y despliegue

- `ci.yml` usa `contents: read`: audit, licencias, REUSE, lint, typecheck, cobertura, build, check y E2E en tres navegadores.
- `pages.yml` despliega `dist/` como artifact **solo** tras un CI correcto en un push a `main`.
- `release.yml` (etiquetas `v*`) repite el gate y publica el ZIP de `dist/` y el SBOM.
- Las actions van fijadas por SHA; Dependabot las actualiza. Antes de tocar un workflow, aplica el skill `github-actions-hardening`.

## Commits y pull requests

- Commits en inglés, pequeños, con un cambio lógico cada uno.
- PR con título y descripción en inglés: resumen, pruebas, capturas si cambia la UI, implicaciones de licencia y métricas cuando proceda.
- No se trabaja directamente en `main` ni se usa `--force`.
- No se atribuyen commits ni PR a agentes de IA (sin `Co-Authored-By` de herramientas).

## Idioma

La documentación para personas va en español. El código, los identificadores y los comentarios de código, en inglés.

## Dónde investigar

- Fabric.js: documentación oficial (<https://fabricjs.com/docs/>) y Context7. Las APIs cambiaron de v5 a v6 y v7 (módulos ES, promesas, origen `center`).
- APIs web: MDN y la skill `modern-web-guidance` si está disponible.
- El comportamiento original: la rama `upstream` y `analysis/tonga/` (reglas extraídas, mapa, evaluación).

## Skills

En `.agents/skills/` (copia en `.claude/skills/`) hay skills de terceros instalados con `gh skill add`: `github-actions-hardening`, `security-audit`, `playwright-cli`, `playwright-trace` y `test-gap-audit`. El origen y las licencias están en [.agents/README.md](.agents/README.md).
