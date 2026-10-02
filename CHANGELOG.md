# Changelog

Todos los cambios relevantes se documentan aquí, con el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [SemVer](https://semver.org/lang/es/).

## [Unreleased]

### Añadido

- Colección «Fondos de mar» en la biblioteca (5 fondos).

### Cambiado

- Licencia del software declarada como `AGPL-3.0-or-later` (GNU AGPL v3 o posterior).
- La Ayuda reúne los atajos, «Acerca de», las licencias, el aviso legal, la privacidad y el enlace al código en GitHub. Desaparece el pie fijo con los enlaces legales, que quitaba sitio en móvil.
- Las descripciones para compartir dicen «software libre» en lugar de «gratis».

## [2.1.0] - 2026-10-02

### Añadido

- Recorte de imágenes no destructivo, por porcentaje de cada lado.
- Ajustes de imagen: escala de grises, sepia, negativo, brillo, contraste, saturación y desenfoque.
- Vista previa al compartir el enlace (Open Graph) en WhatsApp, Telegram y redes.
- Auditoría Lighthouse informativa tras cada despliegue.

### Corregido

- Los avisos ya no tapan la barra de herramientas en móvil.
- Un dibujo en blanco ya no se marca como «sin guardar».
- El lienzo ya no salta al arrancar (CLS 0,175 → 0,051).
- Los avisos tienen contraste completo desde que aparecen.

### Cambiado

- El despliegue manual de Pages solo se permite desde `main`.
- Dependabot no propone TypeScript ≥ 6.1 ni versiones mayores de `@types/node`.
- Eliminada la rama `gh-pages`, que ya no se usaba.

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
- Máscaras, vectorizar iconos (ImageTracer), modos de fusión, recorte destructivo, filtros de imagen (recuperados en 2.1.0), sonido y botón «Recargar página».

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
