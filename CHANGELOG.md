# Changelog

Todos los cambios relevantes se documentan aquí, con el formato de [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/) y [SemVer](https://semver.org/lang/es/).

## [Unreleased]

## [2.3.2] - 2026-10-04

### Añadido

- «Quitar fondo» en el panel de imagen: hace transparente el fondo liso que toca los bordes (el blanco de un logo, por ejemplo) y conserva ese mismo color dentro del dibujo. Funciona sin conexión, se puede deshacer y mantiene el recorte y los ajustes. Si la imagen no tiene un fondo liso (una foto), avisa y no la cambia. El modo con un modelo de IA para fotos queda como propuesta en el ADR 0009.

### Cambiado

- Exportar con «Fondo transparente», como en Canva: en PNG y SVG quita el fondo del lienzo aunque sea un color o una imagen. La casilla aparece marcada solo si el lienzo ya es transparente.

## [2.3.1] - 2026-10-03

### Cambiado

- Panel de propiedades más sencillo: primero lo que más se cambia (texto o colores) y la posición, el tamaño, la alineación y el recorte plegados.
- Colores como en la mayoría de editores: 8 muestras de un toque, la muestra «Transparente» (relleno, trazo y fondo del lienzo) y el selector del navegador para cualquier otro color, que queda como una muestra más para volver a él. El color actual se marca con un anillo y una ✓. Sin campo hexadecimal. La casilla «Fondo transparente» del lienzo pasa a ser esa muestra.
- Grosor del trazo con cinco botones que dibujan la línea (ninguno, fino, medio, grueso, muy grueso), además del valor exacto.
- Opacidad con deslizador. Los ajustes de imagen muestran el valor junto al nombre en lugar de una caja de número repetida.
- Texto: tamaño con − y +, negrita y cursiva como botones y alineación con iconos.
- Capas: cada capa muestra un icono de su tipo, y las flechas para subir y bajar solo aparecen en la capa seleccionada.
- Móvil: Nuevo, Abrir, Guardar, tema, ayuda e información pasan a un menú «Más acciones» (⋯). Las pestañas «Propiedades» y «Capas» están siempre visibles encima de la barra de herramientas: una pestaña despliega el panel entre el lienzo y la barra, sin taparlos, y la pestaña abierta, «Ocultar panel» o Escape lo recogen. Desaparece el botón del panel de la barra, que quedaba medio oculto.

### Corregido

- Móvil: el botón «Exportar» se salía por la derecha y el zoom («30 %») se partía en dos líneas.

## [2.3.0] - 2026-10-03

### Añadido

- Menú «Formas» en la barra de herramientas, agrupado como en eXeLearning: rectángulo, rectángulo redondeado, círculo, elipse, triángulo, rombo, pentágono, hexágono, estrella, paralelogramo, corazón y línea; flechas en las cuatro direcciones; bocadillo de diálogo y de pensamiento. Las formas nuevas tienen color de relleno y se guardan sin cambiar el formato `.tonga`.
- Capas: cambiar el nombre en el propio panel (doble clic o F2; Intro guarda, Escape cancela) y reordenar arrastrando el asa que aparece con ratón.

### Cambiado

- Actions: una etiqueta `v*` ya no repite CI ni redespliega Pages (ni Lighthouse); solo lanza Release, que ahora exige también los umbrales de cobertura y que la etiqueta coincida con `package.json`. La versión que muestra la app sale de `package.json` y el texto emergente muestra el commit («2.x.y+abc1234»).
- La «Elipse» se crea ovalada, para distinguirla del nuevo «Círculo».

### Corregido

- Las cajas de texto tenían el tirador de giro cuadrado en lugar de redondo.
- En el panel de capas, un nombre largo empujaba el candado fuera del panel; ahora se recorta con «…».
- PWA: una imagen de la biblioteca sustituida con el mismo nombre podía seguir saliendo de la caché para siempre. Ahora el catálogo lleva la revisión (hash del contenido) de cada imagen y miniatura, y la app las pide con `?v=<revisión>`; las URL sin revisión se piden a la red y la caché solo se usa sin conexión.

## [2.2.0] - 2026-10-03

### Añadido

- Exportar a eXeLearning (`.elpx`): un proyecto con una página que contiene el dibujo en una diapositiva (iDevice «slide») editable en eXeLearning. Incluye `content.xml`, `content.dtd`, la captura `screenshot.png`, las imágenes y el estilo `base`. El lienzo se ajusta a los límites de la diapositiva, las capas ocultas no se exportan y los grupos con imágenes se desagrupan.

### Corregido

- El diálogo de exportar mostraba la escala, la calidad JPEG y el fondo transparente aunque el formato elegido (PDF) no los usara.

## [2.1.2] - 2026-10-03

### Añadido

- Menú contextual en el lienzo (botón derecho, tecla Menú o Mayús+F10): cortar, copiar, pegar, duplicar, orden de capas, agrupar o desagrupar, bloquear, seleccionar todo y borrar.
- Cortar con Ctrl/⌘+X.

### Corregido

- El menú contextual aparecía y desaparecía al pulsar en el lienzo vacío, y sobre un objeto se mostraba también el menú del navegador.

### Cambiado

- El asa de giro es redonda, y las asas de selección usan el color de Tonga con un tamaño cómodo para pantallas táctiles.
- La versión que muestra la aplicación sale de la última etiqueta de git (`v2.1.2` → «2.1.2»); el build exacto solo aparece como texto emergente. Al publicar una etiqueta `v*` se vuelve a desplegar la web con esa versión, y la PWA ofrece actualizarse.

## [2.1.1] - 2026-10-03

### Añadido

- Colección «Fondos de mar» en la biblioteca (5 fondos).

### Cambiado

- Licencia del software declarada como `AGPL-3.0-or-later` (GNU AGPL v3 o posterior).
- «Ayuda» muestra solo la explicación y los atajos. El botón Información abre «Acerca de» con el enlace al código en GitHub, el aviso legal, la privacidad y un enlace que abre el panel de Licencias. Desaparece el pie fijo con los enlaces legales, que quitaba sitio en móvil.
- La cobertura de tests se publica en Codecov (badge en el README).
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
