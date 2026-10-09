# Formato de proyecto `.tonga`

Un fichero `.tonga` es JSON en UTF-8. Guarda el dibujo para continuarlo otro día, en el mismo equipo o en otro.

```json
{
  "format": "tonga",
  "version": 1,
  "title": "",
  "canvas": {
    "width": 1123,
    "height": 794,
    "background": { "kind": "transparent" }
  },
  "layers": [
    {
      "id": "6f1c…",
      "type": "text",
      "name": "Texto 1",
      "visible": true,
      "locked": false,
      "object": { "type": "Textbox", "left": 561.5, "top": 397, "originX": "center", "originY": "center", "text": "Hola", "…": "…" }
    }
  ],
  "assets": {
    "asset:9f86d0…": "data:image/png;base64,…"
  }
}
```

## Campos

| Campo | Tipo | Notas |
|---|---|---|
| `format` | `"tonga"` | Obligatorio. |
| `version` | entero ≥ 1 | Versión del formato. La actual es `1`. |
| `title` | texto | Opcional. |
| `canvas.width`, `canvas.height` | entero, 1–8192 | Tamaño del lienzo en px. |
| `canvas.background` | objeto | `{kind:"transparent"}`, `{kind:"color", color:"#rrggbb"}` o `{kind:"image", src}`. |
| `layers` | lista | De abajo arriba (la primera es la más profunda). |
| `layers[].id` | texto `[\w-]{1,64}` | Único dentro del proyecto. |
| `layers[].type` | `image`, `text`, `rect`, `ellipse`, `triangle`, `line`, `path` o `group` | |
| `layers[].name`, `visible`, `locked` | | Pertenecen a Tonga, no a Fabric. |
| `layers[].object` | objeto | Datos de Fabric de **ese** objeto (`toObject()`); posiciones con origen `center`. |
| `assets` | mapa | Solo en ficheros descargados: los bytes de cada imagen local, como `data:`. |

### Vínculos entre capas (2.3.3)

Dentro de `layers[].object`, dos propiedades propias de Tonga atan una capa a otras por su `id`. Son opcionales y aditivas: no cambian `version`, y una versión anterior de Tonga las ignora (los objetos quedan donde estaban).

| Propiedad | En | Significado |
|---|---|---|
| `connectFrom`, `connectTo`, `connectArrow` | un trazado (`path`) | Conector entre las capas `connectFrom` y `connectTo`, con punta de flecha si `connectArrow` es `true`. Tonga lo vuelve a dibujar cuando se mueven y lo borra si falta una de las dos. |
| `attachedTo` | un texto (`text`) | Texto escrito dentro de la forma `attachedTo`: va en su centro y desaparece con ella. |
| `qr` | un grupo (`group`) | Código QR: el texto o enlace que codifica. El grupo tiene un rectángulo (fondo) y un trazado (módulos); Tonga lo regenera al cambiar el enlace o los colores. Una versión anterior lo muestra como un grupo normal. |

Sombra (`shadow`), discontinuo (`strokeDashArray`), degradado (`fill` con un `Gradient` lineal) y subrayado (`underline`) son propiedades normales de Fabric.

## Imágenes

Una imagen se referencia con `src`:

- `asset:<sha256>`: imagen importada por la persona. Sus bytes viajan en `assets` y, al abrir el proyecto, se comprueba que el hash coincide.
- `repositorios/<colección>/<fichero>`: imagen de la biblioteca, que se lee de la propia aplicación.
- `data:image/(png|jpeg|webp|svg+xml);base64,…`: admitido por compatibilidad.

Cualquier otro origen (`http:`, `https:`, `javascript:`, `blob:`, rutas con `..`) se rechaza al abrir el proyecto. Así un proyecto no puede hacer que el navegador pida recursos externos.

## Validación y errores

`parseProject` (en `src/project/schema.ts`) valida todo fichero recibido y devuelve mensajes en español: JSON incorrecto, otro formato, versión más nueva («Actualiza la aplicación»), tamaño fuera de rango, tipo de capa desconocido, ids duplicados, orígenes no permitidos y recursos que no son imágenes.

## Migraciones

`MIGRATIONS[n]` transforma un documento de la versión `n` en uno de la versión `n + 1`. Para crear la versión 2:

1. Sube `CURRENT_VERSION` a `2`.
2. Añade `MIGRATIONS[1] = (doc) => ({ ...doc, version: 2, /* cambios */ })`.
3. Añade un test que abra un fichero v1 y obtenga el documento v2 equivalente.

Un fichero de una versión mayor que la conocida se rechaza con un mensaje claro; nunca se interpreta a medias.

## Ida y vuelta

Los tests (`test/schema.test.ts`, `test/document.test.ts` y el E2E «saves a .tonga project and opens it again») comprueban que `proyecto → serializar → abrir` da un proyecto equivalente.

## Compatibilidad con Tonga 1

Tonga 1 no tenía formato de proyecto: guardaba SVG con el fondo marcado `nombre="data-background"`. Esos SVG se pueden abrir con *Añadir imagen*: se reconocen, el lienzo toma su tamaño y el fondo se recupera.
