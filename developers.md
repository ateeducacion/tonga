# Desarrollo

## Requisitos

- Node.js 24 o superior y npm.
- Para los E2E: navegadores de Playwright (`npx playwright install chromium firefox webkit`).
- Para las licencias: [`reuse`](https://reuse.software/) (`pipx install reuse` o `brew install reuse`).

`npm ci` instala las dependencias exactas del lockfile. Solo se permiten dos scripts de instalación (`allowScripts` en `package.json`): `canvas` descarga su binario precompilado, que Fabric usa en los tests unitarios bajo Node. No se distribuye: en el navegador se usa el canvas nativo. `fsevents` está denegado.

## Estructura

```text
index.html             interfaz (HTML semántico; los diálogos están aquí)
public/                ficheros que se copian tal cual (iconos, manifest, theme-init.js)
src/
  main.ts              arranque, errores globales, service worker
  app/app.ts           conecta la interfaz con el editor
  canvas/              editor y conversión proyecto ⇄ Fabric
  history/             historial de deshacer (snapshots)
  project/             formato .tonga, validación, migraciones, ficheros
  assets/              catálogo de la biblioteca y resolución de imágenes
  import/              importación segura (tipo por bytes, SVG saneado)
  export/              PNG, JPEG, SVG y PDF
  persistence/         IndexedDB (imágenes, autoguardado) y preferencias
  ui/                  componentes de la interfaz, atajos, iconos
  i18n/                textos
  styles/              tokens y estilos
  sw.js                plantilla del service worker
repositorios/          colecciones de imágenes (lista.txt + imágenes + thumbnails/)
scripts/               catálogo, servidor estático, métricas, informe, licencias
test/                  tests unitarios (Vitest) y fixtures
e2e/                   tests end-to-end (Playwright) y galería visual
docs/                  documentación y ADR
analysis/tonga/        análisis de la modernización (evaluación, mapa, reglas, plan)
```

## Ciclo de trabajo

```bash
git switch -c feat/mi-cambio
npm run dev                     # http://localhost:5173/
npm run lint && npm run typecheck && npm test
npm run build && npm run check && npm run e2e
```

El `Makefile` repite lo mismo con atajos: `make up`, `make build`, `make test`, `make lint`, `make fix`, `make e2e`, `make check`, `make package` y `make clean`.

## Añadir imágenes a la biblioteca

1. Copia la imagen en `repositorios/<colección>/` y su miniatura (unos 200 px) en `repositorios/<colección>/thumbnails/` **con el mismo nombre**, mayúsculas incluidas.
2. Añade una línea al `lista.txt` de la colección: `fichero.png|Título visible`, o `fichero.png|Título|tongaappfondo` si es un fondo.
3. Para una colección nueva, añádela al `repositorios/lista.txt` raíz dentro de su sección (`tongaappcabecera|Sección`).
4. `npm run catalog` valida el catálogo e informa de tamaños y duplicados.
5. Comprueba la licencia: si la imagen no es del Gobierno de Canarias bajo CC BY-NC-SA 4.0, añade su anotación en `REUSE.toml` y documéntala en [docs/ASSETS.md](docs/ASSETS.md).

## Publicar una versión

1. Actualiza `version` en `package.json` y `CHANGELOG.md`.
2. Fusiona en `main`.
3. `git tag v2.x.y && git push origin v2.x.y`. El workflow `release.yml` crea la release con el ZIP de `dist/` y el SBOM.

## Vista previa al compartir (WhatsApp, Telegram, redes)

`index.html` lleva etiquetas Open Graph y Twitter. La imagen `public/og-image.jpg` (1200 × 630, menos de 300 KB) es una captura de una escena real de la app y se regenera con:

```bash
npm run build && node scripts/make-og-image.mjs
```

Las URL de las vistas previas tienen que ser absolutas; salen de `VITE_SITE_URL` (por defecto, la demo de GitHub Pages; ver `vite.config.ts`). Para otro despliegue: `VITE_SITE_URL=https://ejemplo.org/tonga/ npm run build`. WhatsApp guarda la vista previa en caché: para comprobar un cambio, comparte la URL con un parámetro nuevo (por ejemplo `?v=2`).

## Métricas

- `node scripts/metrics.mjs origin/upstream HEAD`: métricas del repositorio entre dos refs.
- `node scripts/measure-load.mjs <url>`: carga inicial de una página servida.
- `npm run build && node scripts/report.mjs`: regenera [docs/MODERNIZATION-REPORT.md](docs/MODERNIZATION-REPORT.md).
