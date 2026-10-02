# Changelog

Todos los cambios relevantes se documentan aquí, con el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [SemVer](https://semver.org/lang/es/).

## [2.0.0] - 2026-10-02

Reescritura completa: Tonga deja de ser un fork de TOAST UI Image Editor. Detalle en [docs/MODERNIZATION.md](docs/MODERNIZATION.md).

### Añadido

- Interfaz nueva, accesible y responsive (escritorio, tablet y móvil), con temas claro y oscuro.
- Panel de capas (seleccionar, ordenar, ocultar, bloquear) e inspector de propiedades contextual.
- Biblioteca con búsqueda, filtro por colección, miniaturas perezosas, navegación con teclado y botón «Añadir al lienzo».
- Proyectos `.tonga` (guardar y abrir) con imágenes incluidas, y autoguardado en el navegador con recuperación.
- Importar PNG, JPEG, WebP y SVG (saneado). Los SVG de Tonga 1 se abren con su fondo.
- Exportar a PNG y JPEG (escala y calidad), SVG autocontenido y PDF A4 con la orientación del dibujo.
- Atajos de teclado documentados en *Ayuda*.
- Instalable como PWA y usable sin conexión una vez cargada.
- Tests unitarios y end-to-end en Chromium, Firefox y WebKit; auditoría automática de accesibilidad.
- REUSE/SPDX, inventario de licencias, SBOM y workflow de release.

### Cambiado

- Motor: Fabric.js 7.4 (antes, un Fabric 2.7 embebido en TOAST UI). TypeScript y Vite.
- La descarga se llama `tonga-AAAAMMDD-HHMMSS` y se puede renombrar.
- GitHub Pages se publica con artifacts y solo después de un CI correcto.
- El catálogo de la biblioteca se genera y valida en el build. Se corrigieron entradas de `lista.txt` rotas.

### Eliminado

- TOAST UI Image Editor, jQuery, jQuery UI, jquery-modal, axios, FileSaver, X2JS, jsPDF, tui-code-snippet, tui-color-picker, image-picker y las copias de Fabric 2.7/3.0.
- Máscaras, vectorizar iconos (ImageTracer), modos de fusión, recorte destructivo, filtros de imagen (pendientes de reimplementar), sonido y botón «Recargar página».

### Seguridad

- Sin APIs privadas, `eval`, `new Function`, scripts ni handlers en línea; preparada para una CSP estricta.
- SVG exportado escapado (Fabric ≥ 7.4) e importación saneada sin peticiones externas.

## [1.1.3] - 2025-05-30

### Eliminado

* Referencia a Google Analytics en `js/tui-code-snippet.js`.

### Cambiado

* Actualizado el número de versión mostrado en la aplicación.

## [1.1.1] - 2024

### Corregido

* Evita que el lienzo se superponga a los botones superiores en pantallas de baja resolución.

## [1.1.0] - 2024

### Añadido

* Nuevas colecciones, descarga en PDF, fondo transparente al inicio, copiar y pegar, deshacer y rehacer.

## [1.0.0] - 2023

### Añadido

* Versión inicial. Editor SVG con exportación a SVG, JPG y PNG.
