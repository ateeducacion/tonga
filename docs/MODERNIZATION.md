# Modernización de Tonga (2026)

## Punto de partida

- **Rama `upstream`**: `f10785f` («Initial commit: original vendor source»), el código entregado por el proveedor (TOAST UI Image Editor 3.6.0 modificado, Tonga 1.1.x). No se ha modificado.
- **`main` antes de modernizar**: `91ca335`. Desciende de `upstream` (`git merge-base --is-ancestor origin/upstream origin/main` es cierto) con 7 commits: README, CHANGELOG, `LICENSE` AGPL, `package.json`, un workflow que publicaba en `gh-pages` y el prompt de modernización.
- **Etiqueta**: no se ha creado ninguna para no tocar el historial. La foto original es la rama `upstream`.

El análisis completo está en [`analysis/tonga/`](../analysis/tonga/):

| Fichero | Contenido |
|---|---|
| `ASSESSMENT.md` | Inventario, deuda y seguridad |
| `TOPOLOGY.html` y `.mmd` | Mapa de dependencias |
| `BUSINESS_RULES.md` | 127 reglas extraídas con su cita `fichero:línea` |
| `MODERNIZATION_BRIEF.md` | Plan por fases y contrato de comportamiento |
| `REIMAGINED_ARCHITECTURE.md` | Arquitectura y su crítica |
| `BASELINE.md` | Caracterización de la versión original |

## Qué se encontró

- Tonga 1 no era una aplicación sobre una librería, sino un **fork de TOAST UI Image Editor** sin código fuente: un bundle webpack de 53.654 líneas con 271 ediciones manuales y un Fabric 2.7 embebido. Además se cargaba un `js/fabric.js` 3.0 que el bundle sobrescribía.
- jQuery 1.7.2 y jQuery UI 1.8.21 (2012), jsPDF 2.1.1 y axios con CVE conocidas.
- APIs privadas (`imageEditor._invoker._isLocked`, 11 accesos), `new Function`, handlers en línea construidos con datos de `lista.txt`, y un SVG exportado sin escapar.
- Ningún test, ni build. El `package.json` no correspondía con lo que se cargaba. El CI publicaba todo el repositorio en `gh-pages`, también desde pull requests.
- Licencias sin inventario: `LICENSE` AGPL, créditos con CC BY-NC-SA y librerías copiadas con sus propias licencias.

## Qué se hizo, por fases

| Fase | PR | Contenido |
|---|---|---|
| 1. Baseline e infraestructura | #9 | Caracterización Playwright de la versión original, con sus exportaciones como fixtures; Vite + TypeScript; CI con permisos mínimos y Pages solo después de un CI correcto; Dependabot; métricas reproducibles |
| 2. Núcleo | #10 | Formato `.tonga` con validación y migraciones, historial con snapshots, editor sobre Fabric 7 con solo APIs públicas |
| 3-4. Interfaz, biblioteca, importar/exportar | #13 | Interfaz nueva accesible y responsive, catálogo generado y validado, biblioteca con búsqueda, exportación PNG/JPEG/SVG/PDF sin jsPDF, importación saneada, autoguardado |
| 5. Cutover y hardening | #14 | La nueva app pasa a la raíz y se retira la versión original; PWA; REUSE/SPDX; documentación; ADR; skills; release; informe |

Métricas: [MODERNIZATION-REPORT.md](MODERNIZATION-REPORT.md) (generado por `scripts/report.mjs`).

## Desviaciones respecto al plan

- Las fases 3 y 4 se entregaron juntas, porque la interfaz no es usable sin importar y exportar.
- La crítica de arquitectura llevó a cambiar tres decisiones: escritor de PDF propio en lugar de jsPDF, historial con snapshots y PWA solo después del cutover. Los criterios del plan se ajustaron antes de empezar ([REIMAGINED_ARCHITECTURE](../analysis/tonga/REIMAGINED_ARCHITECTURE.md)).
- La caracterización de la versión original se hizo solo en Chromium: el contrato son sus ficheros exportados.
- El plan no se aprobó con firma: la persona responsable pidió ejecutar los pasos sin preguntar, con los valores por defecto del plan (§7). El bloque de aprobación sigue sin firmar.

## Qué cambia para quien usa Tonga

- Interfaz nueva: los botones tienen nombre y la biblioteca tiene buscador y un botón «Añadir al lienzo».
- Proyectos `.tonga` y autoguardado. Los SVG de Tonga 1 se siguen abriendo, con su fondo.
- El PDF es A4 con la orientación del dibujo, y no siempre vertical.
- La descarga se llama `tonga-AAAAMMDD-HHMMSS.<ext>` y se puede cambiar el nombre. Antes era `imagen_…`, y el JPG se descargaba con extensión `.jpeg`.
- **Se retiran**: máscaras (estaban desactivadas en el menú), vectorizar una imagen como icono (ImageTracer), los modos de fusión de color, el recorte destructivo de la imagen base, el sonido al insertar y el botón «Recargar página». Se puede recuperar cualquiera de ellas si el profesorado la echa en falta.

## Qué empeoró o queda pendiente (deuda explícita)

1. **Licencias**: el titular no ha decidido entre AGPL «solo v3» y «v3 o posterior», ni ha confirmado la cesión de derechos a la Administración (ver [LICENSING](LICENSING.md)). No hay atribución por imagen en la biblioteca.
2. ~~**Filtros de imagen**~~ → **resuelto en 2.1.0**: escala de grises, sepia, negativo, brillo, contraste, saturación y desenfoque, desde el inspector y con deshacer.
3. ~~**Recorte**~~ → **resuelto en 2.1.0**: recorte no destructivo por porcentaje de cada lado, también con teclado.
4. **`repositorios/FondosMar/`** no se publica (sin `lista.txt` ni procedencia), y hay 26 ficheros sin referenciar pendientes de revisar ([ASSETS](ASSETS.md)).
5. **Revisión manual de accesibilidad** con lectores de pantalla: pendiente ([ACCESSIBILITY](ACCESSIBILITY.md)). axe no basta.
6. **CSP en GitHub Pages**: Pages no permite cabeceras. La CSP solo se aplica en despliegues propios ([SECURITY](SECURITY.md)).
7. ~~**Lighthouse CI**~~ → **resuelto**: `lighthouse.yml` audita la web publicada tras cada despliegue. Es informativo: deja un resumen y avisa si baja del nivel medido, pero no bloquea.
8. **Capturas visuales** no bloqueantes: no hay comparación automática de píxeles.
9. ~~**Rama `gh-pages`**~~ → **borrada** (Pages se despliega con artifacts).
10. ~~**Pull requests de Dependabot anteriores**~~ → **cerrados**, con su explicación. Dependabot ya no propone TypeScript ≥ 6.1 (incompatible con typescript-eslint) ni versiones mayores de `@types/node` (Tonga apunta a Node 24 LTS).
11. **Imágenes grandes**: 31 imágenes de la biblioteca miden más de 2.048 px. Funcionan, pero se podrían generar derivados más ligeros en el build.
12. **El PDF es una imagen** (texto no seleccionable).
13. **Memoria con imágenes muy grandes**: el límite de 8.192 px por lado protege, pero una foto de 8.192² ocupa unos 256 MB decodificada.

## Mediciones puntuales

Lighthouse 13.5.0 (CLI, Chromium sin interfaz) sobre <https://ateeducacion.github.io/tonga/>, el 2026-10-02:

| Perfil | Rendimiento | Accesibilidad | Buenas prácticas | LCP | TBT | CLS |
|---|---:|---:|---:|---:|---:|---:|
| Escritorio (antes de corregir el salto del lienzo) | 92 | 100 | 100 | 0,5 s | 0 ms | 0,175 |
| Móvil | 100 | 100 | 100 | 1,5 s | 10 ms | 0,02 |
| Escritorio (tras la corrección, web publicada) | 100 | 100 | 100 | 0,5 s | — | 0,051 |

El CLS de escritorio venía del `<canvas>` (300 × 150 px por defecto), que saltaba al ajustarse a la pantalla. Ahora el lienzo se muestra cuando ya tiene su tamaño definitivo; en local, el CLS baja a 0,051 y el rendimiento sube a 99. Se repite con:

```bash
npx lighthouse https://ateeducacion.github.io/tonga/ --preset=desktop --only-categories=performance,accessibility,best-practices
```

Lighthouse no está en el CI (punto 7 de la deuda).
