# 0009: Quitar el fondo de fotos con un modelo de segmentación

Estado: propuesta (2026-10-04). No implementada.

## Contexto

El profesorado sube logos e imágenes con fondo blanco y los quiere sin fondo, como en Canva. Tonga ya tiene «Quitar fondo» en el panel de imagen (`clearBackground` en `src/canvas/image.ts`):

- Detecta el color dominante del borde y vuelve transparente, por relleno desde los bordes, ese color y los parecidos.
- El mismo color encerrado dentro del dibujo se conserva (el hueco de una «a»).
- Funciona sin conexión y sin dependencias. Guarda un PNG nuevo como `asset:<sha256>` y se puede deshacer.

Basta para logos, iconos, escaneos y dibujos sobre fondo liso. No sirve para fotos (una persona delante de un paisaje), porque el fondo no es de un solo color. Para eso hace falta un modelo de segmentación.

## Propuesta

Añadir, solo si hay demanda real con fotos, un segundo modo «Quitar fondo (foto)» con un modelo que se ejecute en el navegador, cargado **bajo demanda** (import dinámico) para que no pese en el arranque.

Candidata principal: `@imgly/background-removal` 1.7.0.

- Licencia AGPL-3.0 (comprobada en su `LICENSE.md`), compatible con Tonga.
- Usa onnxruntime-web (MIT) y modelos ISNet: pequeño (unos 40 MB, cuantizado), mediano (unos 80 MB, por defecto) y grande.
- Por defecto descarga el modelo y el WASM de `staticimgly.com`. Tonga **tendría que alojarlos** (`publicPath`), porque la app no hace peticiones fuera de su origen (lo exigen los E2E) y tiene que funcionar sin conexión.

## Alternativas

- **Transformers.js** (`@huggingface/transformers`, Apache-2.0) con un modelo de Hugging Face. Más flexible, pero hay que elegir el modelo y revisar su licencia. Los RMBG de BRIA (1.4 y 2.0) tienen licencias propias (`bria-rmbg-1.4`, `bria-rmbg-2.0`), no libres, y no se pueden usar sin revisarlas.
- **Servicio externo** (remove.bg y similares): descartado. Necesita backend o claves, envía las imágenes del alumnado a terceros y no funciona sin conexión.
- **No hacerlo**: el modo por color cubre el caso que motivó la petición (logos con fondo blanco).

## Consecuencias si se acepta

- `dist/` crece entre 40 y 80 MB por el modelo. Hay que decidir si el modelo se precachea en la PWA (ADR 0008) o se descarga la primera vez que se usa.
- Sin las cabeceras `Cross-Origin-Embedder-Policy` / `Cross-Origin-Opener-Policy`, que GitHub Pages no permite configurar, ONNX funciona en un solo hilo: tardará varios segundos por imagen en equipos modestos.
- Antes de aceptar hay que comprobar la licencia de los **pesos** ISNet que distribuye IMG.LY, no solo la del código, y registrarla en `THIRD_PARTY_NOTICES.md` y `REUSE.toml`.
- Hacen falta test unitario del modo y E2E con el modelo alojado en local.
