# Tests

| Nivel | Herramienta | Dónde | Comando |
|---|---|---|---|
| Unitarios | Vitest 5 + jsdom (+ `canvas` para Fabric) | `test/*.test.ts` | `npm test` / `npm run coverage` |
| End-to-end | Playwright 1.63 en Chromium, Firefox y WebKit | `e2e/app/*.spec.ts` | `npm run e2e` (necesita `npm run build`) |
| Galería visual | Playwright, cuatro tamaños de pantalla | `e2e/visual/` | `npm run visual` → `docs/screenshots/` |
| Accesibilidad automática | axe-core (`@axe-core/playwright`) | `e2e/app/a11y.spec.ts` | dentro de `npm run e2e` |
| Licencias | `scripts/licenses.mjs`, `reuse lint` | | `npm run licenses`, `reuse lint` |

## Unitarios

Cubren la lógica sin DOM o con un DOM mínimo:

- **formato `.tonga`**: ida y vuelta, migraciones, ficheros malformados o con versión desconocida, orígenes de imagen no permitidos;
- **historial**: deshacer, rehacer, agrupación de pasos, límites por número y por bytes;
- **editor**: nombres automáticos, colocación, copiar y pegar, agrupar y desagrupar sin mover, alinear un objeto girado, bloqueo y visibilidad, fondo, tamaño exacto con trazo uniforme, revisiones;
- **exportación**: nombres de fichero, fondo blanco en JPEG/PDF, SVG vectorial a tamaño de documento y con el texto escapado;
- **escritor de PDF**: tabla `xref` válida, página A4 con la orientación del dibujo;
- **importación**: tipo por bytes, límites, saneado de SVG (scripts, handlers, URL externas, entidades) y SVG de Tonga 1;
- **catálogo**: el catálogo real se construye sin errores, búsqueda sin acentos;
- **atajos**: combinaciones, y que no actúen mientras se escribe.

`npm run coverage` exige umbrales sobre esos módulos de lógica (líneas ≥ 85 %, funciones ≥ 85 %, sentencias ≥ 80 %, ramas ≥ 65 %). La conexión con el DOM (`src/app`, los componentes de `src/ui`, `main.ts`, IndexedDB) no se mide con tests unitarios: la cubren los E2E en tres navegadores.

## End-to-end

`e2e/app/fixtures.ts` hace que **todo test falle** si aparece un error de consola, una excepción de página o una petición fuera de la aplicación.

- `critical.spec.ts`: crear, editar desde el inspector, deshacer y rehacer, biblioteca (búsqueda, filtro, botón explícito), fondo de biblioteca, exportar PNG/JPEG/SVG/PDF comprobando firma, dimensiones y estructura, guardar y abrir `.tonga`, subir un PNG real (`setInputFiles`), abrir un SVG de Tonga 1, flujo solo con teclado, recuperación del autoguardado y panel en móvil.
- `security.spec.ts`: SVG con script y URL de rastreo, entidades XML, proyecto de una versión futura, proyecto con imagen remota y PNG falso. La app falla de forma controlada, sin diálogos ni peticiones.
- `a11y.spec.ts`: axe (WCAG 2.0/2.1/2.2 A y AA) en el inicio, el editor, la biblioteca, los diálogos y el móvil con tema oscuro.
- `pwa.spec.ts`: manifest y shell sin conexión (Chromium y Firefox; Playwright no ejecuta service workers en WebKit).

Las descargas se esperan registrando `page.waitForEvent('download')` **antes** del clic. Los ficheros se validan por estructura (firma, tamaño en píxeles, `MediaBox`, contenido del SVG), nunca píxel a píxel.

## Fixtures

- `test/fixtures/legacy/`: ficheros exportados por Tonga 1 (SVG, PNG, JPEG, PDF). Son el contrato de compatibilidad.
- `test/fixtures/import/`: entradas hostiles.

## Visual

`npm run visual` genera capturas de escritorio, portátil, tablet y móvil (inicio, biblioteca, editor y tema oscuro) para revisarlas a mano. No bloquea el CI. Cuando la interfaz se estabilice se pueden convertir las zonas deterministas en `toHaveScreenshot`, con tolerancia: el render del canvas varía entre motores.

## En CI

`.github/workflows/ci.yml` ejecuta, en este orden: `npm ci`, audit, licencias, REUSE, lint, typecheck, cobertura, build, check y E2E en los tres navegadores. Cada suite se ejecuta una sola vez. Si falla un E2E, el informe de Playwright (con trazas) queda como artifact.
