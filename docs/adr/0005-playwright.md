# 0005: Playwright para E2E en Chromium, Firefox y WebKit

Estado: aceptada (2026-10-02)

## Decisión

**@playwright/test 1.63** (Apache-2.0) con proyectos para Chromium, Firefox y WebKit, servidor estático propio (`scripts/serve.mjs`) sobre `dist/`, `setInputFiles` para subir ficheros reales y `waitForEvent('download')` registrado antes del clic. axe-core (`@axe-core/playwright`, MPL-2.0, solo en desarrollo) para la auditoría automática de accesibilidad.

Antes de sustituir el editor, Playwright sirvió también para caracterizar la versión original. Los ficheros que exportaba quedan como fixtures en `test/fixtures/legacy/`.

## Consecuencias

- Cada test falla ante errores de consola o peticiones externas (`e2e/app/fixtures.ts`).
- La galería visual (`npm run visual`) no bloquea.
- Playwright no ejecuta service workers en WebKit: la prueba de la PWA se omite allí.
