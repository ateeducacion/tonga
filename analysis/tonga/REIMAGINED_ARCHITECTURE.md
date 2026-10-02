# Reimagined architecture — Tonga

## Containers

Igual que el C4 del brief §2. Una sola aplicación estática; no hay «servicios».

## Módulos y fronteras

```text
src/
  main.ts              arranque: crea App, registra SW, maneja errores globales
  app/App.ts           cablea UI ↔ editor; único sitio con estado de sesión
  canvas/              montaje de Fabric, eventos, geometría (center), id de capa, caché de imágenes
  editor/commands.ts   operaciones de alto nivel (add, remove, duplicate, reorder, align, group…)
  history/history.ts   pila de snapshots del documento (JSON), límite 100 entradas y 20 MB, coalescencia por clave
  project/schema.ts    tipos Project/Layer, validación, migraciones, (de)serialización
  assets/catalog.ts    tipos + carga de catalog.json + búsqueda
  export/              png/jpeg (toDataURL/toBlob), svg (toSVG + escape), pdf (writer propio ~60 líneas)
  import/              sniff de tipo, límites, sanitizador SVG (DOMParser + allow-list)
  persistence/         IndexedDB autosave, prefs en localStorage
  ui/                  componentes DOM ligeros (sin framework): toolbar, inspector, layers, library, dialogs, toasts
  i18n/es.ts           textos de la UI
  styles/              tokens.css, app.css
scripts/
  build-catalog.ts     lista.txt → public/catalog.json + validación (falla el build)
  metrics.mjs          métricas reproducibles upstream vs main
```

| Regla o entidad | Dónde vive |
|---|---|
| Project, Layer, migraciones, RULE-068 | `project/` |
| RULE-070/071/072 (historial) | `history/` |
| RULE-100 (atajos) | `ui/shortcuts.ts` |
| RULE-105/044/112 (catálogo) | `scripts/build-catalog.ts`, `assets/` |
| RULE-083/084 (insertar/fondo) | `editor/commands.ts` |
| RULE-113/046/047 (importación) | `import/` |
| RULE-086/102/103/108/101/114/022 (exportación) | `export/` |

**Historial: snapshots en lugar de comandos.** El documento serializado de una ilustración escolar pesa del orden de KB, salvo las imágenes. Las imágenes se referencian por `src`, ya sea la URL de la biblioteca o un `data:` que se deduplica con una tabla de blobs en el proyecto. Con snapshots, undo/redo cubre cualquier operación sin escribir el inverso de cada comando. Esa es la opción más sencilla que permite el §18 del prompt. Una interacción continua (arrastre, slider) se coalesce en una sola entrada usando el evento `object:modified` de Fabric, que se emite al soltar, y una clave con debounce para los controles del inspector.

**Fondo.** El fondo es una propiedad del documento (`canvas.background`): o un color, o la referencia a un asset. No es una capa. Se dibuja con `backgroundColor` o `backgroundImage` de Fabric, así que la exportación con o sin transparencia (RULE-114) es directa.

## Tecnología (una línea por elección)

- **Fabric 7.4.0 (MIT):** motor maduro con SVG de entrada y salida y API pública con promesas; ≥ 7.4.0 corrige GHSA-hfvx-25r5-qc3w y GHSA-w22m-hvvm-xmwx.
- **Vite 8 (MIT):** dev server + build estático con `base: './'`, sin configurar bundler a mano.
- **TypeScript 6.0 (Apache-2.0):** el modelo, el historial y la serialización tienen formas que conviene tipar; la 7.x aún no está soportada por typescript-eslint (peer `<6.1`).
- **Vitest 5 + jsdom (MIT):** comparte la configuración de Vite; jsdom porque Fabric necesita DOM.
- **Playwright 1.63 (Apache-2.0):** E2E en Chromium, Firefox y WebKit; descargas y `setInputFiles`.
- **@axe-core/playwright (MPL-2.0):** solo en desarrollo, no se distribuye; MPL es compatible con su uso como herramienta.
- **Iconos Lucide (ISC), copiados como SVG inline en `src/ui/icons.ts`:** solo los usados, con atribución en `THIRD_PARTY_NOTICES.md`; sin dependencia npm.
- **PDF propio:** una página A4 con un JPEG (DCTDecode); ~60 líneas y un test. Evita jsPDF (10 advisories en 2025-2026).
- **Service worker propio:** precache del shell (la lista la genera un plugin de Vite de ~20 líneas) y cache runtime de `repositorios/`; versionado por hash del build.

## Migración de datos

- `repositorios/**`: se queda en su sitio y se copia tal cual a `dist/repositorios/`. `lista.txt` sigue siendo la fuente durante la transición, y `catalog.json` se genera a partir de ella.
- SVG legacy: se importan reconociendo `nombre="data-background"` (RULE-046).
- Strangler (brief, Fase 1): hasta el cutover de la Fase 5, el legacy se sigue sirviendo en la raíz de `dist/` y la nueva app en `dist/next/`. Para no mezclar los dos árboles, el legacy se mueve con `git mv` a `legacy-app/`, y un paso del build lo copia a la raíz de `dist/` (la carpeta `dist/` actual del legacy contiene `tui-image-editor.js` y choca con la salida de Vite).

## Critique (architecture-critic) e incorporación

Revisión del 2026-10-02. Se aplican estos cambios, que pasan a formar parte de la arquitectura:

1. **Docs coherentes.** El brief se ajusta a esta arquitectura: PDF propio, historial con snapshots y SW propio solo en la raíz después del cutover (Fase 5).
2. **Imágenes direccionadas por contenido.** Toda imagen importada se guarda como `Blob` en IndexedDB (store `assets`) con la clave `sha256` y se carga con `URL.createObjectURL`. En el documento y en el historial figura como `src: "asset:<hash>"`; las de la biblioteca guardan su URL relativa. Al restaurar se usa una caché `Map<src, HTMLImageElement>`. El historial se limita por bytes (20 MB) además de por número (100). Después de un undo se vuelve a seleccionar por id de capa. Las imágenes solo se incrustan como `data:` al descargar el `.tonga`.
3. **SVG exportado autocontenido.** Antes de `toSVG`, cada imagen pasa a `data:` con sus bytes originales. Un E2E abre el SVG en una página limpia y comprueba que no hace ninguna petición.
4. **Origen de coordenadas.** Se usa `center`, el valor por defecto de Fabric 7, y se escribe de forma explícita en cada capa del `.tonga` v1. Toda la geometría pasa por `getCenterPoint`, `setPositionByOrigin` y `getBoundingRect`; nunca se calcula a mano sobre `left`/`top`.
5. **Id de capa.** `FabricObject.customProperties = ['id', 'name']`. El bloqueo se vuelve a aplicar al cargar (`selectable`, `evented`, `lock*`). El fondo de un SVG legacy (`nombre="data-background"`) se detecta en el DOM antes de Fabric, se quita del SVG y se aplica como fondo.
6. **Amenazas en la importación SVG.** Se rechazan DOCTYPE y entidades. En `href` y en `url()` solo se admiten `data:` o `#frag`. Se eliminan `<script>`, `<foreignObject>`, `@import` y los atributos `on*`. Se aplican los límites (20 MB, 8192²) antes de parsear, y nunca se pinta un SVG mediante `<img>`.
7. **Peso de la biblioteca.** `scripts/build-catalog.ts` emite además un informe medido (bytes, dimensiones, duplicados por hash, ficheros no referenciados). Los derivados optimizados se deciden con esos datos (Fase 3).
8. **Service worker.** Solo en la raíz y después del cutover. Caché de assets FIFO de unas 300 entradas, `catalog.json` network-first, y un aviso «Hay una versión nueva» sin recarga silenciosa.
9. **Accesibilidad.** Las formas se insertan centradas sin arrastrar. Flechas para mover (Shift = 10 px). El inspector numérico cubre rotar y redimensionar. Una región `aria-live` anuncia la selección y el undo/redo. El dibujo libre queda como excepción documentada. Objetivos táctiles de al menos 24 px. La lista de capas es un `<ul>` de botones nativos.
10. **Autosave en equipos compartidos.** Nunca se restaura solo: la recuperación muestra miniatura y hora, y «Descartar» tiene el mismo peso que «Recuperar». `storage.persist()` solo tras una acción explícita. Se avisa de que el `.tonga` descargado es el guardado duradero.
11. **Sin envoltorio total de Fabric.** `fabric` se puede importar en `canvas/`, `export/` e `import/`. La regla que se mantiene es no acceder a miembros `_*` (lint). Se importa siempre desde la raíz `'fabric'`, para que `classRegistry` esté completo.
12. **Strangler más barato.** El legacy se caracteriza solo en Chromium, con aserciones de estado, y los ficheros exportados por el legacy forman el contrato. `legacy-app/` y el paso de copia desaparecen con el cutover.
