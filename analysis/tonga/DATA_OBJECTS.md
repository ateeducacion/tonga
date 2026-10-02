# Data Objects — tonga

## ImageEditorOptions (constructor options / includeUI config)
Source: `dist/tui-image-editor.js:686`

| Field | Type | Note |
|---|---|---|
| includeUI | boolean/Object | default false (line 688); Tonga passes object at index.html:258 |
| usageStatistics | boolean | forced default false, line 690 (hostname ping disabled) |
| cssMaxWidth | number | passed to Graphics, line 719; Graphics fallback DEFAULT_CSS_MAX_WIDTH=1000 (line 14541) |
| cssMaxHeight | number | fallback DEFAULT_CSS_MAX_HEIGHT=800 (line 14542) |
| selectionStyle | Object | cornerStyle/cornerSize/cornerColor/borderColor/...; documented lines 647-655 |
| applyCropSelectionStyle | boolean |  |
| applyGroupSelectionStyle | boolean |  |

Used by: Default editor configuration and enabled tool menus, Third-party usage statistics are disabled, Default object selection style in built-in UI mode, Group selection inherits configured selection style, Canvas size equals image size (no CSS max cap), Editor display size capped by container maximum

## UiOptions (includeUI sub-object, normalised by Ui._initializeOption)
Source: `dist/tui-image-editor.js:5995`

| Field | Type | Note |
|---|---|---|
| loadImage.path | string | default ''; Tonga: img/Tonga_pantalla_inicio_v2.jpg (index.html:266) |
| loadImage.name | string | Tonga: 'ImagenInicial' (index.html:267) |
| locale | Object<string,string> | Tonga passes locale_es (index.html:146,269) |
| theme | Object<string,string> | blackTheme, js/theme/black-theme.js:1 |
| menuIconPath | string |  |
| menu | string[] | default 10 menus incl. mask; Tonga passes 9 (no mask/load) index.html:273-283 |
| initMenu | string | default '' |
| uiSize | {width:string,height:string} | default 100%/100% |
| menuBarPosition | 'top'/'bottom'/'left'/'right' | default bottom; Tonga 'left' (index.html:284) |

Used by: Default editor configuration and enabled tool menus, Editor exposes a fixed set of nine editing tools; mask and load are excluded, Editor starts on the Tonga welcome image, Spanish user interface labels, Menu name must map to a registered tool component, Editor offset to make room for open submenu, Resize editor and compact header for narrow top-bar layouts, Tonga header toolbar composition, Initial image load gates toolbar activation

## ImageEditor session state (Tonga-added fields on ImageEditor instance)
Source: `dist/tui-image-editor.js:695`

| Field | Type | Note |
|---|---|---|
| mode | string/null | line 695 |
| activeObjectId | number/null | line 697 |
| _invoker | Invoker |  |
| _graphics | Graphics |  |
| _imagenBinario | string (data URL) | setter line 922 |
| _fondoTransparenteFalso | boolean | line 949; placeholder transparent background flag |
| _fondoTransparente | boolean | line 975; set false by repositorio.js:126 cargarFondo |
| _factorZoom | number | get/set lines 988-1001; zoom factor (defaults to 1 per rule list) |
| _tamanoWidthFondo | number | original background width, line 1019 |
| _tamanoHeightFondo | number | original background height, line 1030 |

Used by: Zoom factor defaults to 1, Rotation preserves current zoom factor, Crop requires a crop zone and keeps zoom afterwards, Zoom-in step and maximum zoom, Zoom-out step and minimum zoom, Initial fit-to-screen zoom for the background, Reset zoom to original image size, Window resize keeps the current canvas zoom, Start new blank (transparent) project, Recognize the app's own transparent background on re-import, Background handling at export (transparent / rotated / format), Export with real background, then restore the placeholder background without to…, Hot background reload keeps floating objects and the current rotation, Loading a repository background resets transparency and unlocks the editor, Opening a new file resets the editor session, Reload last file or reset editor, Destroy editor teardown, Undo/redo of a rotation re-fits the editor preserving zoom

## Invoker (undo/redo history)
Source: `dist/tui-image-editor.js:4515`

| Field | Type | Note |
|---|---|---|
| _undoStack | Command[] |  |
| _redoStack | Command[] |  |
| _isLocked | boolean | execution lock; forcibly reset by js/repositorio.js:139 |
| _isSilent | boolean | silent execution skips history |

Used by: Undoable vs silent command execution, New edit is recorded in undo history and wipes redo history, Only one command may run at a time (execution lock), Undo moves the last edit to redo history, Redo re-executes the last undone edit and returns it to undo history, Silent execution bypasses undo history, Undo/redo availability follows stack depth, Undo/redo only when history exists, and leaving crop mode first, Edit-history and delete button enablement, Loading a repository background resets transparency and unlocks the editor, Export with real background, then restore the placeholder background without to…

## Command (+ command registry)
Source: `dist/tui-image-editor.js:5034`

| Field | Type | Note |
|---|---|---|
| name | string | one of consts.commandNames (line 5439) |
| args | Array |  |
| execute | function(graphics,...args):Promise |  |
| undo | function(graphics,...args):Promise |  |
| executeCallback | function/null |  |
| undoCallback | function/null |  |
| undoData | Object | per-command shape, see CommandUndoData |

Used by: Commands must be registered by name before use, Undoable vs silent command execution, New edit is recorded in undo history and wipes redo history, Undo moves the last edit to redo history, Redo re-executes the last undone edit and returns it to undo history

## CommandUndoData (per-command undo snapshots)
Source: `dist/tui-image-editor.js:51623`

| Field | Type | Note |
|---|---|---|
| object | fabric.Object | addIcon/addImageObject/addShape/addText (51623,51685), changeShape/changeText/changeTextStyle/changeIconColor, applyFilter(mask) |
| objects | fabric.Object[] | clearObjects, removeObject, loadImage |
| name, image | string, fabric.Image | loadImage previous background, line 52518 |
| setting | {flipX:boolean,flipY:boolean} | flip |
| angle | number | rotate |
| size | {width,height} | resizeCanvasDimension |
| color | string | changeIconColor |
| text / styles / options / props | string / Object | changeText / changeTextStyle / changeShape,filter / setObjectProperties |
| objectId | number | setObjectPosition |

Used by: Undo/redo of image rotation, Undo of image flip restores prior flip setting, Change icon colour guard and undo are broken, Clear objects and resize canvas are reversible, Loading a new background image keeps overlays and supports undo, Mask filter requires an image object and consumes it, Target object must exist for object-modifying commands, Add object only if not already on canvas, Filter toggle applies or removes only if present, Set object position by an origin anchor

## ImageSizeChange (loadImage command result)
Source: `dist/tui-image-editor.js:52524`

| Field | Type | Note |
|---|---|---|
| oldWidth | number |  |
| oldHeight | number |  |
| newWidth | number |  |
| newHeight | number |  |

Used by: Loading a new background image keeps overlays and supports undo, Canvas and editor resized to the image bounds on every menu change, Initial fit-to-screen zoom for the background, Crop reloads the cropped region as the new base image

## Graphics (canvas model and object registry)
Source: `dist/tui-image-editor.js:14567`

| Field | Type | Note |
|---|---|---|
| canvasImage | fabric.Image/null | background image |
| cssMaxWidth / cssMaxHeight | number |  |
| useItext / useDragAddIcon / useDragAddImagen | boolean |  |
| cropSelectionStyle | Object |  |
| targetObjectForCopyPaste | fabric.Object/null | Tonga copy/paste source |
| imageName | string |  |
| _objects | Object<number,fabric.Object> | id->object registry via stamp() (line 16095) |
| _canvas | fabric.Canvas |  |
| _drawingMode | drawingModes enum | default NORMAL |
| _drawingModeMap / _componentMap | Object |  |

Used by: Object registry lifecycle and delete-by-id, Drawing mode state machine, Copy-paste offset and canvas-edge flip, Paste source tracking (chained pastes), Delete eligibility and multi-selection delete, New objects default to canvas centre, Raise or lower the selected object one layer, Activate drawing mode on demand (icons excluded), Selecting an object does not change its layer order, Object property lookup returns null for unknown id

## ObjectProps (createObjectProperties result)
Source: `dist/tui-image-editor.js:16055`

| Field | Type | Note |
|---|---|---|
| id | number | stamp(obj) |
| type | string | fabric type |
| left, top, width, height | number |  |
| fill, stroke | string |  |
| strokeWidth, opacity | number |  |
| text, fontFamily, fontSize, fontStyle, textAlign, textDecoration | string/number | only for i-text/text, line 16076 |

Used by: Object property lookup returns null for unknown id, Object registry lifecycle and delete-by-id, Selected object type drives active menu and shape stroke limit, Default new text object, Inserted image placement and tagging, Copy-paste offset and canvas-edge flip, Set object position by an origin anchor

## Tonga fabric.Object extensions (tipo / nombre / nuevoObjeto)
Source: `dist/tui-image-editor.js:15859`

| Field | Type | Note |
|---|---|---|
| tipo | 'IMAGEN'/'PATH'/'LINE'/'TEXT'/'ICON'/'SHAPE' | set at 15866, 24759, 48265, 48648, 49275, 50333; added to fabric.SHARED_ATTRIBUTES (16295) and emitted in toSVG (e.g. 33113, 35354) |
| nombre | string | image file name; 'data-background' marks the background (12161, 12169); emitted at 35354 |
| nuevoObjeto | boolean | true for newly inserted image/path (15865, 24758) vs SVG-loaded objects |
| crossOrigin | 'Anonymous' |  |

Used by: Inserted image placement and tagging, Freehand drawings flagged as newly created PATH objects, Object type and image name persisted in SVG export, SVG export embeds the background and tags it data-background, SVG import: the 'data-background' image becomes the canvas background, Mirror overlay objects across the canvas on flip, Image rotation angle normalization and overlay object rotation, Inserting a repository image adds it as a named custom image object, Path transform cache key uses top-left origin

## Consts: commandNames / eventNames / drawingModes / keyCodes
Source: `dist/tui-image-editor.js:5439`

| Field | Type | Note |
|---|---|---|
| commandNames | Object<string,string> | 21 commands incl. Tonga ADD_IMAGEN, CHANGE_IMAGEN_COLOR (5439-5461) |
| eventNames | Object<string,string> | incl. IMAGEN_CREATE_RESIZE/END, UNDO/REDO_STACK_CHANGED (5467) |
| drawingModes | enum | NORMAL, CROPPER, FREE_DRAWING, LINE_DRAWING, TEXT, SHAPE (5495) |
| keyCodes | Object<string,number> | Z90 Y89 SHIFT16 BACKSPACE8 DEL46 C67 V86 (5501) |

Used by: Keyboard shortcuts for copy, paste, undo, redo and delete, Keyboard shortcuts and selection appearance, Commands must be registered by name before use, Drawing mode state machine, Menu-to-editor mode mapping

## SelectionStyle (fObjectOptions.SELECTION_STYLE)
Source: `dist/tui-image-editor.js:5516`

| Field | Type | Note |
|---|---|---|
| borderColor | string | 'red' |
| cornerColor | string | 'green' |
| cornerSize | number | 10 |
| originX / originY | string | 'center' |
| transparentCorners | boolean | false |

Used by: Keyboard shortcuts and selection appearance, Default object selection style in built-in UI mode, Group selection inherits configured selection style, Copy-paste offset and canvas-edge flip, Inserted image placement and tagging

## RejectMessages (Spanish promise rejection reasons)
Source: `dist/tui-image-editor.js:5531`

| Field | Type | Note |
|---|---|---|
| addedObject, flip, invalidDrawingMode, invalidParameters, isLock, loadImage, lo… | string | Spanish text, English originals kept as comments |

Used by: User-facing rejection reasons (Spanish), Required-parameter guards on image loading and resize, Flip request must change at least one axis, Target object must exist for object-modifying commands, Add object only if not already on canvas, Only one command may run at a time (execution lock), Undo/redo only when history exists, and leaving crop mode first

## Tool default ranges (default*RangeValus)
Source: `dist/tui-image-editor.js:5588`

| Field | Type | Note |
|---|---|---|
| defaultRotateRangeValus | {realTimeEvent,min,max,value} | -360..360, 0 |
| defaultDrawRangeValus | {min,max,value} | 5..30, 12 |
| defaultShapeStrokeValus | {realTimeEvent,min,max,value} | 2..300, 3 |
| defaultTextRangeValus | {realTimeEvent,min,max,value} | 10..100, 50 |
| defaultFilterRangeValus | Object<string,{min,max,value}> | tintOpacity, removewhiteDistance, brightness, noise, pixelate, colorfilterThreshold (5615) |
| defaultIconPath | Object<string,svgPath> | line 5566 |
| defaultImagenPath | Object<string,string> | placeholder values 'direccion repo 1/2' (unused stub) |

Used by: Default ranges for editing tool sliders, Rotation step and +/-360 degree limit, Shape stroke clamped when object shrinks, Range slider value from pointer position, Filter option building per filter type, Value clamping within a range

## FlipSetting
Source: `dist/tui-image-editor.js:47463`

| Field | Type | Note |
|---|---|---|
| flipX | boolean |  |
| flipY | boolean |  |

Used by: Flip image horizontally, vertically, or reset, Flip state and reset guard, Flip request must change at least one axis, Image angle sign inversion on flip, Undo of image flip restores prior flip setting, Mirror overlay objects across the canvas on flip

## CropRect / CroppedImageData
Source: `dist/tui-image-editor.js:46751`

| Field | Type | Note |
|---|---|---|
| left, top, width, height | number | getCropzoneRect, null if cropzone invalid (46780) |
| imageName | string | CroppedImageData |
| url | string (data URL) | canvas.toDataURL(cropRect) |

Used by: Crop requires a crop zone and keeps zoom afterwards, Crop reloads the cropped region as the new base image, Crop aspect-ratio presets, Crop apply/cancel and preset selection

## Shape / Text default style objects
Source: `dist/tui-image-editor.js:50145`

| Field | Type | Note |
|---|---|---|
| Shape DEFAULT_OPTIONS | Object | strokeWidth 1, stroke #000000, fill #ffffff, rx/ry 0, lockSkewing, isRegular false; DEFAULT_TYPE 'rect' (50141) |
| SHAPE_DEFAULT_OPTION (UI) | Object | stroke #ffbb3b, fill '', strokeWidth 3 (7377) |
| Text defaultStyles | Object | fill #000000, left 0, top 0 (48400) |
| Text resetStyles | Object | fontFamily 'Noto Sans', fontWeight/Style normal, textAlign left; typo key 'textDecoraiton' (48405-48411) |

Used by: Empty text defaults, Default new text object, Text style toggles and font-size change guard, Shape tool selection toggle and stroke/fill updates, Shape stroke clamped when object shrinks

## Repository catalogue line (repositorios/lista.txt)
Source: `dist/tui-image-editor.js:53308`

| Field | Type | Note |
|---|---|---|
| repo | string | folder name, or sentinel 'tongaappcabecera' = section header (53321) |
| desc | string | display label; '/' separated |

Used by: Library catalogue is grouped into titled sections by header lines

## Collection item line (repositorios/<repo>/lista.txt)
Source: `js/repositorio.js:45`

| Field | Type | Note |
|---|---|---|
| element | string | file name; thumbnail at thumbnails/<element> |
| tooltip | string | defaults to element (line 46) |
| fondo | string | 'tongaappfondo' => background, else insertable image (lines 47, 61) |

Used by: Collection item list format and defaults, Item classification: background vs. insertable image, Thumbnails are always encoded as JPEG, Loading a repository background resets transparency and unlocks the editor, Inserting a repository image adds it as a named custom image object

## Export request (download tipo + file name)
Source: `dist/tui-image-editor.js:11771`

| Field | Type | Note |
|---|---|---|
| tipo | 'PDF'/'JPG'/'PNG'/'SVG' | read from button attribute, line 6168; buttons 6579-6591 |
| imageName | string | forced 'imagen' + _YYYYMMDD_HHMMSS (11774-11787) |
| usarObjetoFondoEditor | boolean | true when background angle != 0 and PDF/JPG (11795) |

Used by: Download file name is a fixed prefix plus timestamp, Export result in PDF, JPG, PNG or SVG, Background handling at export (transparent / rotated / format), PDF export fits the image to an A4 portrait page, keeping aspect ratio, Generic image download: file extension follows the actual image format, SVG export embeds the background and tags it data-background, SVG export ignores the current zoom, Export with real background, then restore the placeholder background without to…

## Theme map (blackTheme)
Source: `js/theme/black-theme.js:1`

| Field | Type | Note |
|---|---|---|
| common.* / header.* / submenu.* / checkbox.* / range.* / colorpicker.* | Object<string,string> | flat CSS-key map incl. Tonga logos common.bi.image, common.bi.imageC |

Used by: Tonga header toolbar composition, Default editor configuration and enabled tool menus
