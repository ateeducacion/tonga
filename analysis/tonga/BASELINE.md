# Baseline: legacy Tonga

Fecha: 2026-10-02 · Rama `modernize/phase-1-baseline`. Legacy en `legacy-app/`, servido en la raíz de `dist/`. Comandos:

```bash
npm run build && npm run preview &        # http://127.0.0.1:4173/
npx playwright test --project=legacy      # caracterización (Chromium)
RECORD_FIXTURES=1 npx playwright test --project=legacy -g records   # refresca test/fixtures/legacy/
node scripts/metrics.mjs origin/upstream HEAD
node scripts/measure-load.mjs http://127.0.0.1:4173/
```

## Flujos fijados (`e2e/legacy/baseline.spec.ts`, 7 tests en verde)

| Test | Reglas | Lo que fija |
|---|---|---|
| carga sin errores ni terceros | RULE-109 | 0 errores de consola; 0 peticiones fuera del origen |
| Comenzar | RULE-068 | historial vacío; lienzo de 2000×1335 (tamaño de `img/transparente_falso.png`) |
| biblioteca | RULE-105/044/083 | Imagen → sección «Fauna» → colección «Aves» → doble clic inserta (el historial deja de estar vacío) |
| exportar PNG/JPG/SVG/PDF | RULE-108/101/127/086 | nombre `imagen_YYYYMMDD_HHMMSS.<ext>`; **JPG se descarga como `.jpeg`**; firma del fichero; el SVG lleva `data-background` |

## Fixtures del contrato (`test/fixtures/legacy/`)

Exportados por el legacy con una imagen de «Aves» insertada:

- `export.svg`: 2000×1335. El fondo es `<image nombre='data-background' tipo=''>` con `data:image/jpeg;base64,` **que contiene bytes PNG** (RULE-047). Le sigue la imagen insertada como `data:image/png`. Los atributos van entre comillas simples.
- `export.png`: 2000×1335 · `export.jpeg` · `export.pdf`: una página con MediaBox A4 (595,28×841,89 pt).

## Carga inicial (`scripts/measure-load.mjs`, Chromium, local)

| Métrica | Legacy |
|---|---:|
| Peticiones | 57 |
| Bytes transferidos | 6.381.009 (scripts 4.686.731) |
| Peticiones a terceros | 0 |
| Errores de consola | 0 |

## Repositorio (`scripts/metrics.mjs origin/upstream HEAD`)

| Métrica | upstream `f10785f` | main + legacy movido `572fbf2` |
|---|---:|---:|
| Ficheros versionados | 3.652 | 3.678 |
| Bytes versionados | 327.903.730 | 331.376.393 |
| Ficheros de colecciones | 3.482 | 3.482 |
| JS / CSS | 22 / 18 | 26 / 19 |
| Ficheros vendorizados | 18 (2,39 MB) | 21 (5,31 MB) |
| Tests | 0 | 0 |
| `console.log` | 31 | 85 |
| `eval` / `new Function` | 5 | 7 |
| Handlers en línea | 4 | 4 |
| `_invoker._isLocked` | 2 | 11 |

`dist/` ensamblado (legacy + colecciones + esqueleto nuevo): 379 MB, 3.645 ficheros.
