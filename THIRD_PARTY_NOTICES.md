# Avisos de terceros

Componentes de terceros que **se distribuyen** con Tonga (están dentro de `dist/`). Las herramientas de desarrollo (Vite, TypeScript, Vitest, Playwright, ESLint, axe-core…) no se distribuyen; su inventario lo da `npm run licenses`.

| Componente | Versión | Uso | Licencia | Origen |
|---|---|---|---|---|
| Fabric.js | 7.4.0 | Motor del lienzo (incluido en el bundle JS) | MIT | https://github.com/fabricjs/fabric.js |
| uqr | 0.1.3 | Codificación de los códigos QR (`src/canvas/qr.ts`, incluido en el bundle JS) | MIT, © Project Nayuki y Anthony Fu | https://github.com/unjs/uqr |
| Lucide | 1.50.0 (lucide-static) | Iconos de la interfaz copiados como SVG en `src/ui/icons.ts`; 143 iconos en la biblioteca «Iconos y símbolos» (`repositorios/iconos*/`, con `scripts/import-lucide-icons.mjs`: tamaño 256 px y trazo `#1f2937` en lugar de `currentColor`; cada fichero conserva su aviso de licencia) | ISC; parte derivada de Feather, MIT | https://github.com/lucide-icons/lucide |
| Fuentes para el aula | Andika 7.000 (SIL, oficial y sin cambios); OpenDyslexic (repositorio oficial, commit `1824da5`, sin cambios); Atkinson Hyperlegible, Lexend, Patrick Hand y Playwrite ES de Fontsource 5.3.0 (subconjunto `latin`) | Ficheros WOFF2 en `src/fonts/`; se cargan al usarlas y van incrustadas en los SVG y paquetes `.elpx` exportados | SIL Open Font License 1.1 | https://software.sil.org/andika/ · https://github.com/antijingoist/opendyslexic · https://fontsource.org |
| Primer Octicons | 19.38.0 | Icono `mark-github` en `src/ui/icons.ts` | MIT, © GitHub Inc. | https://github.com/primer/octicons |
| eXeLearning: `content.dtd` | commit `68d6cd5` | Copiado tal cual en `vendor/exelearning/`; va dentro de cada `.elpx` exportado | AGPL-3.0-or-later | https://github.com/exelearning/exelearning (`public/app/schemas/ode/content.dtd`) |
| eXeLearning: estilo `base` | 20260913 (commit `68d6cd5`) | Copiado tal cual en `vendor/exelearning/theme/`; va dentro de cada `.elpx` exportado | CC BY-SA 4.0: Ignacio Gros para eXeLearning; iconos de iDevice de Francisco Javier Pulido Cuadrado. Las insignias de `img/licenses.gif` son marcas de Creative Commons | https://github.com/exelearning/exelearning (`public/files/perm/themes/base/base/`) |
| Imágenes de `repositorios/` (salvo `iconos*/`) | — | Biblioteca de imágenes | CC BY-NC-SA 4.0, © Gobierno de Canarias | Créditos originales (rama `upstream`, `creditos.html`) |

Ningún código de TOAST UI Image Editor, jQuery, jQuery UI, axios, FileSaver, X2JS, jsPDF ni de la extensión `customiseControls` forma parte de esta versión: se usaron solo en la versión original (rama `upstream`).

## Fabric.js — MIT

```
MIT License

Copyright (c) 2008-2015 Printio (Juriy Zaytsev, Maxim Chernyak)
Copyright (c) 2016-present Andrea Bogazzi, Shachar Nen and Fabric.js contributors (https://github.com/fabricjs/fabric.js/graphs/contributors)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Fuentes para el aula — SIL Open Font License 1.1

- Andika: Copyright (c) 2004-2022 SIL International (http://www.sil.org/), with Reserved Font Names "Andika" and "SIL".
- Atkinson Hyperlegible: Copyright 2020 Braille Institute of America, Inc.
- Lexend: Copyright 2018 The Lexend Project Authors (https://github.com/googlefonts/lexend), with Reserved Font Name "RevReading Lexend".
- OpenDyslexic: Copyright (c) 2019-07-29, Abbie Gonzalez (https://abbiecod.es), with Reserved Font Name OpenDyslexic.
- Patrick Hand: Copyright (c) 2010-2012 Patrick Wagesreiter (mail@patrickwagesreiter.at).
- Playwrite ES: Copyright 2023 The Playwrite Project Authors (https://github.com/TypeTogether/Playwrite).

```
SIL OPEN FONT LICENSE

Version 1.1 - 26 February 2007

PREAMBLE

The goals of the Open Font License (OFL) are to stimulate worldwide development of collaborative font projects, to support the font creation efforts of academic and linguistic communities, and to provide a free and open framework in which fonts may be shared and improved in partnership with others.

The OFL allows the licensed fonts to be used, studied, modified and redistributed freely as long as they are not sold by themselves. The fonts, including any derivative works, can be bundled, embedded, redistributed and/or sold with any software provided that any reserved names are not used by derivative works. The fonts and derivatives, however, cannot be released under any other type of license. The requirement for fonts to remain under this license does not apply to any document created using the fonts or their derivatives.

DEFINITIONS

"Font Software" refers to the set of files released by the Copyright Holder(s) under this license and clearly marked as such. This may include source files, build scripts and documentation.

"Reserved Font Name" refers to any names specified as such after the copyright statement(s).

"Original Version" refers to the collection of Font Software components as distributed by the Copyright Holder(s).

"Modified Version" refers to any derivative made by adding to, deleting, or substituting — in part or in whole — any of the components of the Original Version, by changing formats or by porting the Font Software to a new environment.

"Author" refers to any designer, engineer, programmer, technical writer or other person who contributed to the Font Software.

PERMISSION & CONDITIONS

Permission is hereby granted, free of charge, to any person obtaining a copy of the Font Software, to use, study, copy, merge, embed, modify, redistribute, and sell modified and unmodified copies of the Font Software, subject to the following conditions:

1) Neither the Font Software nor any of its individual components, in Original or Modified Versions, may be sold by itself.

2) Original or Modified Versions of the Font Software may be bundled, redistributed and/or sold with any software, provided that each copy contains the above copyright notice and this license. These can be included either as stand-alone text files, human-readable headers or in the appropriate machine-readable metadata fields within text or binary files as long as those fields can be easily viewed by the user.

3) No Modified Version of the Font Software may use the Reserved Font Name(s) unless explicit written permission is granted by the corresponding Copyright Holder. This restriction only applies to the primary font name as presented to the users.

4) The name(s) of the Copyright Holder(s) or the Author(s) of the Font Software shall not be used to promote, endorse or advertise any Modified Version, except to acknowledge the contribution(s) of the Copyright Holder(s) and the Author(s) or with their explicit written permission.

5) The Font Software, modified or unmodified, in part or in whole, must be distributed entirely under this license, and must not be distributed under any other license. The requirement for fonts to remain under this license does not apply to any document created using the Font Software.

TERMINATION

This license becomes null and void if any of the above conditions are not met.

DISCLAIMER

THE FONT SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO ANY WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT OF COPYRIGHT, PATENT, TRADEMARK, OR OTHER RIGHT. IN NO EVENT SHALL THE COPYRIGHT HOLDER BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, INCLUDING ANY GENERAL, SPECIAL, INDIRECT, INCIDENTAL, OR CONSEQUENTIAL DAMAGES, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF THE USE OR INABILITY TO USE THE FONT SOFTWARE OR FROM OTHER DEALINGS IN THE FONT SOFTWARE.
## uqr — MIT

```
MIT License

Copyright (c) Project Nayuki
Copyright (c) 2023 Anthony Fu <https://github.com/antfu>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## Lucide (ISC) y Feather (MIT)

```
ISC License

Copyright (c) 2026 Lucide Icons and Contributors

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

---

The following Lucide icons are derived from the Feather project:

airplay, alert-circle, alert-octagon, alert-triangle, aperture, arrow-down-circle, arrow-down-left, arrow-down-right, arrow-down, arrow-left-circle, arrow-left, arrow-right-circle, arrow-right, arrow-up-circle, arrow-up-left, arrow-up-right, arrow-up, at-sign, calendar, cast, check, chevron-down, chevron-left, chevron-right, chevron-up, chevrons-down, chevrons-left, chevrons-right, chevrons-up, circle, clipboard, clock, code, columns, command, compass, corner-down-left, corner-down-right, corner-left-down, corner-left-up, corner-right-down, corner-right-up, corner-up-left, corner-up-right, crosshair, database, divide-circle, divide-square, dollar-sign, download, external-link, feather, frown, hash, headphones, help-circle, info, italic, key, layout, life-buoy, link-2, link, loader, lock, log-in, log-out, maximize, meh, minimize, minimize-2, minus-circle, minus-square, minus, monitor, moon, more-horizontal, more-vertical, move, music, navigation-2, navigation, octagon, pause-circle, percent, plus-circle, plus-square, plus, power, radio, rss, search, server, share, shopping-bag, sidebar, smartphone, smile, square, table-2, tablet, target, terminal, trash-2, trash, triangle, tv, type, upload, x-circle, x-octagon, x-square, x, zoom-in, zoom-out

The MIT License (MIT) (for the icons listed above)

Copyright (c) 2013-present Cole Bemis

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
