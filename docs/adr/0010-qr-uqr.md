# 0010: Códigos QR con `uqr`

Estado: aceptada (2026-10-09)

## Contexto

En el aula se pide añadir a una composición un código QR que lleve a un enlace (idea de Alfredo Arnaiz Yanes). Codificar un QR no es trivial: segmentación, Reed-Solomon, máscaras y elección de versión. Escribirlo a mano son varios cientos de líneas difíciles de probar.

## Decisión

Se añade `uqr` 0.1.3 (MIT, de UnJS) como segunda dependencia de runtime. Es un puerto en TypeScript del generador de Project Nayuki, sin dependencias, en módulos ES y con tree-shaking: Tonga solo usa `encode()`, que devuelve la matriz de módulos. `src/canvas/qr.ts` convierte esa matriz en un grupo de Fabric (un cuadrado claro con la zona de silencio y un trazado con los módulos oscuros), así que el código es vectorial, se escala sin perder nitidez y se exporta a PNG, SVG y PDF como cualquier otra forma. Corrección de errores fija en nivel M.

## Alternativas

- `qrcode` (MIT): arrastra `pngjs`, `yargs` y `dijkstrajs`, pensados para Node.
- `qrcode-generator` (MIT): sin dependencias, pero 550 KB desempaquetado y sin módulos ES.
- `lean-qr` (MIT): pequeño y mantenido, pero con una API orientada a dibujar en `<canvas>` o a componentes.
- Copiar el código de Nayuki: obliga a mantener y cubrir con tests ~1000 líneas ajenas.

## Consecuencias

- Unos 5 KB gzip más en el bundle. `npm run audit` y `npm run licenses` vigilan la nueva dependencia.
- El texto codificado se guarda en la propiedad `qr` del grupo ([PROJECT-FORMAT](../PROJECT-FORMAT.md)): el código se puede regenerar con otro enlace o colores sin perder su posición ni su tamaño.
- `test/qr.test.ts` y el E2E «generates a QR code…» fijan el comportamiento.
