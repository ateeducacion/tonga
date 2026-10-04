# Biblioteca de imágenes

## Estructura

```text
repositorios/
  lista.txt                    secciones y colecciones
  <colección>/
    lista.txt                  imágenes de la colección
    <imagen>.png               imagen original
    thumbnails/<imagen>.png    miniatura (mismo nombre)
```

`repositorios/lista.txt`:

```text
tongaappcabecera|Fauna        ← empieza una sección
aves|Aves                     ← colección: carpeta|título
faunamarina|Fauna Marina
                              ← una línea vacía separa secciones
```

`repositorios/<colección>/lista.txt`:

```text
Abubilla.png|Abubilla
Auditorio_fondo.png|Auditorio|tongaappfondo     ← fondo: con doble clic se usa como fondo del lienzo
```

Se toleran BOM UTF-8, finales de línea CRLF y líneas vacías.

### Colecciones de otros autores (`rights.json`)

Sin más, una colección es del Gobierno de Canarias con CC BY-NC-SA 4.0. Una colección de otro autor lleva en su carpeta un `rights.json` con su licencia, su autor y su fuente; la biblioteca los muestra en cada imagen:

```json
{ "license": "ISC", "creator": "Lucide Icons and Contributors", "source": "https://lucide.dev (lucide-static 1.50.0)" }
```

Además, la carpeta necesita su anotación en `REUSE.toml` y su entrada en `THIRD_PARTY_NOTICES.md`, y la licencia tiene que permitir redistribuir las imágenes. Así se añadieron los **Iconos y símbolos** (`repositorios/iconos*/`, 143 iconos de Lucide en SVG), con `scripts/import-lucide-icons.mjs`.

## Catálogo generado

`scripts/build-catalog.mjs` se ejecuta en `npm run build` y `npm run dev`, y genera `public/catalog.json` (no se versiona):

```json
{
  "id": "aves/Abubilla.png",
  "title": "Abubilla",
  "collection": "aves",
  "category": "fauna",
  "file": "repositorios/aves/Abubilla.png",
  "revision": "5150b8b428af",
  "thumbnail": "repositorios/aves/thumbnails/Abubilla.png",
  "thumbnailRevision": "a24e4a5ac33f",
  "background": false,
  "license": "CC-BY-NC-SA-4.0",
  "creator": "Gobierno de Canarias",
  "source": "https://github.com/ateeducacion/tonga/blob/upstream/creditos.html"
}
```

**El build falla** si el catálogo está corrupto:

- falta la imagen o la miniatura (los nombres distinguen mayúsculas, como en Linux y en GitHub Pages);
- hay un id duplicado o un nombre de fichero inválido;
- una marca es desconocida;
- una colección no tiene `lista.txt`;
- un `rights.json` no es JSON o le falta la licencia, el autor o la fuente;
- una sección está vacía.

`lista.txt` sigue siendo la fuente durante la transición. La aplicación solo lee `catalog.json`.

La licencia y el autor se aplican igual a todas las imágenes, porque la única evidencia del repositorio es la página de créditos original: contenido del Gobierno de Canarias bajo CC BY-NC-SA 4.0 (rama `upstream`, `creditos.html`). Si una colección tiene otra procedencia, se documenta aquí y en `REUSE.toml`.

## Carga en la aplicación

- **Al iniciar Tonga no se carga ninguna miniatura.** `catalog.json` (unos 600 KB) se pide al abrir la biblioteca.
- Las miniaturas se muestran en tandas de 120, con `loading="lazy"`.
- La imagen completa solo se descarga al añadirla al lienzo.
- Con la PWA instalada, las imágenes usadas quedan en una caché de como máximo 300 entradas.
- `revision` y `thumbnailRevision` son los 12 primeros caracteres del SHA-256 del fichero. La app pide `…/Abubilla.png?v=<revision>`: esa URL no cambia mientras la imagen no cambie, así que el service worker la sirve de la caché sin preguntar a la red. Si se sustituye una imagen con el mismo nombre, cambia su revisión y su URL, y se descarga la nueva; las que no cambian siguen en caché aunque salga otra versión de Tonga. Una URL sin `?v=` (por ejemplo, un dibujo abierto antes de cargar el catálogo) se pide a la red y la caché solo se usa sin conexión. Los documentos `.tonga` guardan siempre la ruta sin `?v=`.

## Estado medido (`npm run catalog`, 2026-10-02)

| Medida | Valor |
|---|---:|
| Imágenes en el catálogo | 1.695 |
| Colecciones | 56 en 7 secciones |
| Ficheros de imagen en disco | 3.404 (originales + miniaturas) |
| Bytes de las imágenes del catálogo | 292,7 MB |
| Lado máximo | 4.718 px |
| Imágenes con más de 2.048 px de lado | 31 |
| Grupos de imágenes idénticas (mismo SHA-256) | 7 |
| Ficheros sin referenciar | 14 |

## Cambios hechos en los datos

| Cambio | Motivo |
|---|---|
| Publicada la colección `FondosMar/` («Fondos de mar», sección Fondos): 5 fondos con título | Venía del código original con su `lista.txt`, pero nunca se registró en el catálogo raíz. El mantenedor decidió (2026-10-02) que tiene la misma licencia que el resto (CC BY-NC-SA 4.0, Gobierno de Canarias). `transparente.png` no se lista: es un PNG vacío. |
| Quitadas de `laboratorio/lista.txt` las entradas `esqueleto.png`, `profesora_laboratorio.png` y `sillin_02.png` | La imagen nunca estuvo en el repositorio (solo la miniatura). En Tonga 1 el doble clic fallaba. |
| Quitada de `espaciosCreativos/lista.txt` la entrada `mesa_06.png` | Duplicaba `Mesa_06.png`. En macOS era el mismo fichero y en un servidor Linux daba 404. |
| Corregido `iglesia_de_santa_maria_de_betancuria_interior.png` → `Iglesia_…` en `arquitectura/lista.txt` | El nombre no coincidía en mayúsculas con el fichero. |

## Pendiente (no se ha borrado nada)

- **14 ficheros sin referenciar** (`npm run catalog` los lista), entre ellos las variantes `-1` de `arquitectura` y `espaciosCreativos`, `tablet_05/06.png` y miniaturas huérfanas. Pueden ser material válido sin catalogar: hay que revisarlos antes de borrar nada.
- **7 grupos de imágenes idénticas** (`pisosvegetacion` repite plantas entre pisos; un mapa de Canarias aparece en dos colecciones). Se mantienen porque cada copia tiene sentido en su colección. Quitarlas solo ahorraría unos KB.
- **31 imágenes de más de 2.048 px.** Insertarlas en el lienzo funciona, pero pesan en memoria. Se valorará generar en el build derivados de 2.048 px conservando los originales. Por ahora no compensa: el mayor fichero pesa 3,1 MB.
- **Formatos.** Casi todo es PNG con transparencia, necesaria para recortar figuras sobre el lienzo. No se ha recomprimido nada para no alterar originales sin registrar su procedencia.
- **Historial de Git.** La carpeta `.git` pesa unos 615 MB por las imágenes. No se reescribe el historial ni se migra a Git LFS: el coste operativo (clones, Pages, colaboradores) supera el beneficio.
