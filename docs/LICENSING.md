# Licencias

Este documento separa **software**, **contenidos gráficos**, **iconos**, **fuentes**, **sonidos** y **documentación**, recoge la evidencia que hay en el repositorio y deja las dudas por escrito. No es asesoramiento jurídico.

## Resumen

| Elemento | Licencia aplicada | Evidencia | Estado |
|---|---|---|---|
| Código de Tonga (`src/`, `scripts/`, `index.html`, configuración) | GNU AGPL v3, como `LicenseRef-Tonga-AGPL-3.0` | `LICENSE` (texto AGPL v3) añadido a `main` en 2025; `package.json` | La cláusula de versión está **pendiente** (ver más abajo) |
| Imágenes de `repositorios/` | CC BY-NC-SA 4.0, © Gobierno de Canarias | `creditos.html` original (rama `upstream`): «Los contenidos y programas… son propiedad del Gobierno de Canarias… Licencia Creative Commons Atribución-NoComercial-CompartirIgual 4.0 Internacional» | Aplicada a todas las imágenes, sin atribución individual |
| Iconos de la interfaz (`src/ui/icons.ts`) | ISC (Lucide); algunos MIT (Feather) | Licencia de `lucide-static` 1.50.0 | Atribuido en `THIRD_PARTY_NOTICES.md` |
| Logo e iconos PWA (`public/favicon.svg`, `public/icons/`) | Igual que el código | Dibujados para Tonga 2.0 | — |
| Fabric.js 7.4.0 (en el bundle) | MIT | `node_modules/fabric/LICENSE` | Atribuido en `THIRD_PARTY_NOTICES.md` |
| Fuentes | — | Tonga 2.0 usa fuentes del sistema; no distribuye ninguna | — |
| Sonidos | — | Tonga 2.0 no distribuye sonidos (el `button-22.mp3` de Tonga 1 queda solo en `upstream`) | — |
| Documentación (`*.md`, `docs/`, `analysis/`) | Igual que el código | No hay una licencia de documentación declarada | **Duda** |
| Skills para agentes (`.agents/`, `.claude/`) | MIT o Apache-2.0 según el origen | `.agents/upstream-skills.txt`, `.agents/licenses/` | Verbatim desde su origen |

`REUSE.toml` asigna licencia y copyright a cada fichero. `reuse lint` pasa y lo comprueba el CI.

## El software: ¿AGPL «solo v3» o «v3 o posterior»?

- La rama histórica `upstream` (código entregado por el proveedor) **no tenía fichero de licencia**.
- `main` añadió `LICENSE` con el texto íntegro de la GNU AGPL v3, y `package.json` declaraba `"AGPL-3.0"`. Ese identificador SPDX está obsoleto porque no distingue entre `AGPL-3.0-only` y `AGPL-3.0-or-later`.
- El repositorio no documenta qué quiso el titular. Por eso no se ha elegido ninguno: REUSE usa `LicenseRef-Tonga-AGPL-3.0` (el texto AGPL v3 con una nota que explica la duda) y `package.json` dice `SEE LICENSE IN LICENSE`.
- **Para cerrarlo**, el Gobierno de Canarias (o quien tenga la titularidad) indica «solo v3» u «o posterior». Después se cambia `LicenseRef-Tonga-AGPL-3.0` por `AGPL-3.0-only` o `AGPL-3.0-or-later` en `REUSE.toml` y `package.json`, se sustituye el fichero de `LICENSES/` y se documenta la decisión aquí.

**Validez de la relicencia.** El código original lo desarrolló Altia por encargo. El repositorio no contiene el contrato ni una cesión de derechos que confirme que el Gobierno de Canarias pueda licenciarlo como AGPL. Se asume de buena fe, por la página de créditos («propiedad del Gobierno de Canarias»), pero **no se afirma que la relicencia sea jurídicamente válida**. Conviene archivar la evidencia (contrato o resolución) junto a esta decisión.

Tonga 2.0 es una reescritura: no contiene código de la versión original. El código nuevo lo escribe el ATE para el Gobierno de Canarias.

## Los contenidos: CC BY-NC-SA 4.0

- La cláusula **NC (NoComercial)** impide el uso comercial de las imágenes. Un centro educativo puede usarlas en clase; una editorial no puede venderlas.
- La cláusula **SA** obliga a compartir las obras derivadas con la misma licencia. Un dibujo hecho con imágenes de la biblioteca es, en principio, una obra derivada.
- No hay atribución por imagen. Si alguna imagen es de terceros (por ejemplo, adaptada de un banco), su licencia real podría ser otra. **Duda abierta**: revisar las colecciones con el equipo que las creó.

### Si se quiere permitir la reutilización sin restricción comercial

Propuesta (no aplicada):

1. Confirmar que el Gobierno de Canarias tiene derechos suficientes para relicenciar sus contenidos propios.
2. Relicenciarlos solo con esa autorización por escrito.
3. Sustituir los contenidos de terceros que no puedan relicenciarse.
4. Para recursos nuevos, preferir CC0, CC BY o CC BY-SA.

No se ha eliminado ningún contenido por este motivo.

## Terceros

- Lo que se **distribuye** (Fabric.js y los iconos de Lucide) está en [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md), que se copia también a `dist/`.
- Las dependencias npm se inventarían con `npm run licenses`. El script falla si una dependencia de runtime tiene una licencia fuera de la lista permitida: MIT, MIT-0, ISC, Apache-2.0, BSD, 0BSD, CC0, BlueOak y Unlicense. Las herramientas de desarrollo solo se listan; axe-core es MPL-2.0 y no se distribuye.
- `npm run sbom` genera un SBOM SPDX de las dependencias de runtime. El workflow de release lo adjunta a cada versión.

### Componentes que ya no se usan

Tonga 1 incluía copias de TOAST UI Image Editor 3.6.0 modificado (MIT, NHN), Fabric 2.7 y 3.0 (MIT), jQuery 1.7.2 y jQuery UI 1.8.21 (MIT/GPL), axios (MIT), FileSaver (MIT), X2JS (Apache-2.0), jsPDF 2.1.1 (MIT), tui-code-snippet y tui-color-picker (MIT), image-picker (MIT) y customiseControls (MIT), además de fuentes web y un sonido sin licencia documentada. Nada de eso está en `main`; sigue en la rama `upstream`.

## Reglas

- No se copia código sin comprobar su licencia. Un repositorio público no es permiso de reutilización.
- Todo fragmento de terceros registra proyecto, autor, URL, fichero, versión o commit, licencia y cambios.
- Los ficheros nuevos quedan cubiertos por `REUSE.toml`. Si un fichero tiene una procedencia distinta, se anota de forma explícita (o con un fichero `.license` junto a él).
