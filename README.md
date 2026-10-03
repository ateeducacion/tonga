# Tonga

[![CI](https://github.com/ateeducacion/tonga/actions/workflows/ci.yml/badge.svg)](https://github.com/ateeducacion/tonga/actions/workflows/ci.yml)
[![Pages](https://github.com/ateeducacion/tonga/actions/workflows/pages.yml/badge.svg)](https://ateeducacion.github.io/tonga/)
[![codecov](https://codecov.io/gh/ateeducacion/tonga/graph/badge.svg)](https://codecov.io/gh/ateeducacion/tonga)
[![REUSE](https://img.shields.io/badge/REUSE-conforme-green)](docs/LICENSING.md)

**Tonga** es una aplicación de dibujo para el aula que funciona en el navegador. Permite crear un lienzo, añadir textos, formas, dibujo libre e imágenes de una biblioteca de más de 1.600 ilustraciones educativas, y exportar el resultado a PNG, JPEG, SVG, PDF o eXeLearning.

**Demo:** <https://ateeducacion.github.io/tonga/>

Tonga es software estático: no tiene servidor, base de datos ni cuentas. **Tus dibujos se procesan y se guardan solo en tu navegador**; no se envía nada a ningún sitio y no hay analítica.

## Qué puedes hacer

- Empezar un dibujo en A4 (horizontal o vertical), 16:9, cuadrado o a medida, con fondo transparente o de color.
- Añadir texto, rectángulos, elipses, triángulos, líneas y dibujo libre; mover, redimensionar, girar, voltear, alinear, agrupar, ordenar capas, duplicar, copiar y pegar.
- Buscar en la **biblioteca** por nombre o colección y añadir imágenes al lienzo o usarlas como fondo.
- Añadir tus propias imágenes (PNG, JPEG, WebP, SVG), recortarlas y ajustarlas: escala de grises, sepia, negativo, brillo, contraste, saturación y desenfoque.
- Deshacer y rehacer, con atajos de teclado (ver *Ayuda* dentro de la aplicación).
- Guardar el trabajo como proyecto `.tonga` para continuar otro día. Hay además un autoguardado en el navegador que se ofrece recuperar tras un cierre accidental.
- Exportar a PNG, JPEG, SVG (vectorial y autocontenido), PDF (A4) o eXeLearning (`.elpx`, con el dibujo en una diapositiva editable).
- Instalarla como aplicación (PWA) y usarla sin conexión una vez cargada.
- Usarla con teclado y lector de pantalla: el panel *Capas* describe el dibujo y *Propiedades* permite editarlo sin ratón. Temas claro y oscuro.

## Instalación y despliegue

Hace falta Node.js 24 o superior **solo para construir**. El resultado es una carpeta estática.

```bash
npm ci
npm run build                 # genera dist/
cp -R dist/* /var/www/tonga/  # cualquier servidor web estático
```

Funciona en la raíz de un dominio o en un subdirectorio (todas las rutas son relativas), en GitHub Pages, Nginx o Apache. Las cabeceras de seguridad recomendadas están en [docs/SECURITY.md](docs/SECURITY.md).

Cada etiqueta `v*` publica en *Releases* un ZIP de `dist/` listo para desplegar, con su SBOM SPDX.

## Desarrollo

```bash
npm ci
npm run dev        # servidor de desarrollo
npm test           # tests unitarios
npm run e2e        # tests end-to-end (necesita npm run build)
make help          # atajos
```

Toda la información para desarrollar está en [developers.md](developers.md). Las reglas para agentes de IA, en [AGENTS.md](AGENTS.md).

## Documentación

| Documento | Contenido |
|---|---|
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | Cómo está hecha la aplicación |
| [docs/PROJECT-FORMAT.md](docs/PROJECT-FORMAT.md) | El formato `.tonga` |
| [docs/ASSETS.md](docs/ASSETS.md) | La biblioteca de imágenes y su catálogo |
| [docs/TESTING.md](docs/TESTING.md) | Tests y cómo ejecutarlos |
| [docs/ACCESSIBILITY.md](docs/ACCESSIBILITY.md) | Accesibilidad |
| [docs/SECURITY.md](docs/SECURITY.md) | Seguridad y privacidad |
| [docs/LICENSING.md](docs/LICENSING.md) | Licencias del software y de los contenidos |
| [docs/MODERNIZATION.md](docs/MODERNIZATION.md) | Cómo se modernizó y qué queda pendiente |
| [docs/MODERNIZATION-REPORT.md](docs/MODERNIZATION-REPORT.md) | Métricas reproducibles: original frente a actual |
| [docs/adr/](docs/adr/) | Decisiones técnicas |
| [CHANGELOG.md](CHANGELOG.md) | Cambios por versión |

## Historia

Tonga fue desarrollada por Altia para el Gobierno de Canarias sobre TOAST UI Image Editor. Hoy la mantiene el Área de Tecnología Educativa (ATE). La versión 2.0 se reescribió sobre Fabric.js 7 y TypeScript, sin TOAST UI ni jQuery. El código original se conserva intacto en la rama [`upstream`](https://github.com/ateeducacion/tonga/tree/upstream).

## Licencias

- **Software:** GNU Affero General Public License, versión 3 o posterior (`AGPL-3.0-or-later`, [LICENSE](LICENSE)).
- **Imágenes de la biblioteca** (`repositorios/`): © Gobierno de Canarias, [CC BY-NC-SA 4.0](LICENSES/CC-BY-NC-SA-4.0.txt). Permite reutilizarlas con atribución y la misma licencia, **pero no con fines comerciales**.
- **Componentes de terceros:** [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

El detalle y las dudas abiertas están en [docs/LICENSING.md](docs/LICENSING.md).
