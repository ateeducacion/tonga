# 0006: Escritor de PDF propio en lugar de jsPDF

Estado: aceptada (2026-10-02)

## Contexto

Tonga necesita una cosa: imprimir el dibujo en una hoja A4. Tonga 1 usaba jsPDF 2.1.1. jsPDF ≤ 4.2.0 tiene una decena de advisories en 2025-2026 (inyección en AcroForm y `addJS`, HTML injection, DoS con BMP/GIF…). La 4.2.1 los corrige, pero añade unos 350 KB y mucha superficie que Tonga no usa.

## Decisión

`src/export/pdf.ts` (unas 60 líneas) escribe un PDF 1.4 válido (ISO 32000-1) con una página A4, cuya orientación sigue a la del dibujo. La página contiene una imagen JPEG (`/DCTDecode`) ajustada y centrada, y una tabla `xref` correcta. El JPEG lo genera el navegador con `canvas.toBlob`, a unos 150 ppp.

## Consecuencias

- Ninguna dependencia, y nada que cargar hasta que se exporta.
- El PDF es una imagen: el texto no se puede seleccionar. Un PDF vectorial necesitaría una librería; se reevaluará si aparece esa necesidad.
- `test/pdf.test.ts` comprueba la estructura (`xref`, `MediaBox`, una página).
