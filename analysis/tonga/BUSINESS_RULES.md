# Business Rules — tonga

At extraction: 127 confirmed rules (0 P0); later steps may add or correct rules below. Each citation was checked by a second agent that read the cited lines; 3 candidate rules were refuted and left out.

| ID | Name | Category | Priority | Source | Confidence |
|---|---|---|---|---|---|
| RULE-001 | Filter option building per filter type | Calculation | P1 | `dist/tui-image-editor.js:10811-10877` | High |
| RULE-002 | Rotation preserves current zoom factor | Calculation | P1 | `dist/tui-image-editor.js:12682-12775` | High |
| RULE-003 | Zoom-in step and maximum zoom | Calculation | P1 | `dist/tui-image-editor.js:15155-15194` | High |
| RULE-004 | Zoom-out step and minimum zoom | Calculation | P1 | `dist/tui-image-editor.js:15201-15242` | High |
| RULE-005 | Initial fit-to-screen zoom for the background | Calculation | P1 | `dist/tui-image-editor.js:15286-15309` | High |
| RULE-006 | Copy-paste offset and canvas-edge flip | Calculation | P1 | `dist/tui-image-editor.js:16198-16216` | Medium |
| RULE-007 | New objects default to canvas centre | Calculation | P1 | `dist/tui-image-editor.js:2598-2609` | High |
| RULE-008 | Imported text positioned by its first span offset | Calculation | P1 | `dist/tui-image-editor.js:29837-29842` | Medium |
| RULE-009 | Path transform cache key uses top-left origin | Calculation | P1 | `dist/tui-image-editor.js:31047-31057` | Low |
| RULE-010 | Colour blend filter modes (Spanish-named) | Calculation | P1 | `dist/tui-image-editor.js:37874-37925` | High |
| RULE-011 | Undo/redo of a rotation re-fits the editor preserving zoom | Calculation | P1 | `dist/tui-image-editor.js:4728-4765` | Medium |
| RULE-012 | Image angle sign inversion on flip | Calculation | P1 | `dist/tui-image-editor.js:47507-47519` | High |
| RULE-013 | Mirror overlay objects across the canvas on flip | Calculation | P1 | `dist/tui-image-editor.js:47528-47654` | Medium |
| RULE-014 | Image rotation: relative rotate vs absolute setAngle | Calculation | P1 | `dist/tui-image-editor.js:47801-47910` | Medium |
| RULE-015 | Image rotation angle normalization and overlay object rotation | Calculation | P1 | `dist/tui-image-editor.js:47816-47893` | Medium |
| RULE-016 | Incremental rotation rounds current angle to whole degrees | Calculation | P1 | `dist/tui-image-editor.js:47900-47909` | High |
| RULE-017 | Value clamping within a range | Calculation | P1 | `dist/tui-image-editor.js:5222-5231` | High |
| RULE-018 | Canvas and editor resized to the image bounds on every menu change | Calculation | P1 | `dist/tui-image-editor.js:6363-6384` | Medium |
| RULE-019 | Editor display size capped by container maximum | Calculation | P1 | `dist/tui-image-editor.js:6420-6432` | High |
| RULE-020 | Range slider value from pointer position | Calculation | P1 | `dist/tui-image-editor.js:8056-8124` | High |
| RULE-021 | SVG without a background: synthesize one sized to the largest element | Calculation | P1 | `legacy/tonga/dist/tui-image-editor.js:11482-11498` | Medium |
| RULE-022 | PDF export fits the image to an A4 portrait page, keeping aspect ratio | Calculation | P1 | `legacy/tonga/dist/tui-image-editor.js:11990-12052` | High |
| RULE-023 | Icon drag-to-size scaling | Calculation | P2 | `dist/tui-image-editor.js:12445-12475` | High |
| RULE-024 | Crop aspect-ratio presets | Calculation | P2 | `dist/tui-image-editor.js:12852-12877` | High |
| RULE-025 | Set object position by an origin anchor | Calculation | P2 | `dist/tui-image-editor.js:15651-15677` | High |
| RULE-026 | Hex colour to RGBA conversion | Calculation | P2 | `dist/tui-image-editor.js:5323-5333` | High |
| RULE-027 | Resize editor and compact header for narrow top-bar layouts | Calculation | P2 | `dist/tui-image-editor.js:5866-5903` | High |
| RULE-028 | Editor offset to make room for open submenu | Calculation | P2 | `dist/tui-image-editor.js:6441-6480` | High |
| RULE-029 | Zoom factor defaults to 1 | Calculation | P2 | `dist/tui-image-editor.js:988-1001` | High |
| RULE-030 | Thumbnails are always encoded as JPEG | Calculation | P2 | `js/repositorio.js:1-15` | High |
| RULE-031 | Crop requires a crop zone and keeps zoom afterwards | Validation | P1 | `dist/tui-image-editor.js:12808-12851` | High |
| RULE-032 | Delete eligibility and multi-selection delete | Validation | P1 | `dist/tui-image-editor.js:14879-14904` | High |
| RULE-033 | Required-parameter guards on image loading and resize | Validation | P1 | `dist/tui-image-editor.js:1520-1556` | High |
| RULE-034 | Generate IDs for unnamed SVG children on import | Validation | P1 | `dist/tui-image-editor.js:20186-20192` | Medium |
| RULE-035 | Only one command may run at a time (execution lock) | Validation | P1 | `dist/tui-image-editor.js:4679-4681` | High |
| RULE-036 | Flip request must change at least one axis | Validation | P1 | `dist/tui-image-editor.js:47480-47499` | High |
| RULE-037 | Add object only if not already on canvas | Validation | P1 | `dist/tui-image-editor.js:51743-51768` | High |
| RULE-038 | Mask filter requires an image object and consumes it | Validation | P1 | `dist/tui-image-editor.js:51967-52015` | High |
| RULE-039 | Change icon colour guard and undo are broken | Validation | P1 | `dist/tui-image-editor.js:52063-52094` | High |
| RULE-040 | Target object must exist for object-modifying commands | Validation | P1 | `dist/tui-image-editor.js:52153-52170` | High |
| RULE-041 | Menu name must map to a registered tool component | Validation | P1 | `dist/tui-image-editor.js:6036-6057` | High |
| RULE-042 | User file load takes only the first selected file | Validation | P1 | `dist/tui-image-editor.js:6180-6187` | High |
| RULE-043 | Rotation step and +/-360 degree limit | Validation | P1 | `dist/tui-image-editor.js:9102-9119` | High |
| RULE-044 | Collection item list format and defaults | Validation | P1 | `js/repositorio.js:34-57` | High |
| RULE-045 | Undo/redo only when history exists, and leaving crop mode first | Validation | P1 | `legacy/tonga/dist/tui-image-editor.js:11301-11353` | High |
| RULE-046 | SVG import: the 'data-background' image becomes the canvas background | Validation | P1 | `legacy/tonga/dist/tui-image-editor.js:11489-11555` | Medium |
| RULE-047 | Recognize the app's own transparent background on re-import | Validation | P1 | `legacy/tonga/dist/tui-image-editor.js:11707-11729` | Medium |
| RULE-048 | Filter toggle applies or removes only if present | Validation | P2 | `dist/tui-image-editor.js:12905-12911` | High |
| RULE-049 | Shape stroke clamped when object shrinks | Validation | P2 | `dist/tui-image-editor.js:13015-13031` | High |
| RULE-050 | Empty text defaults | Validation | P2 | `dist/tui-image-editor.js:1968-1990` | High |
| RULE-051 | Object property lookup returns null for unknown id | Validation | P2 | `dist/tui-image-editor.js:2672-2680` | High |
| RULE-052 | Commands must be registered by name before use | Validation | P2 | `dist/tui-image-editor.js:4952-4976` | High |
| RULE-053 | Custom image upload requires a selected file | Validation | P2 | `dist/tui-image-editor.js:53229-53243` | High |
| RULE-054 | Local image upload accepts image files only | Validation | P2 | `dist/tui-image-editor.js:53290-53303` | Medium |
| RULE-055 | User-facing rejection reasons (Spanish) | Validation | P2 | `dist/tui-image-editor.js:5531-5560` | High |
| RULE-056 | Text style toggles and font-size change guard | Validation | P2 | `dist/tui-image-editor.js:9347-9463` | Medium |
| RULE-057 | Free/line drawing mode lifecycle with fixed 70% opacity | Lifecycle | P1 | `dist/tui-image-editor.js:10436-10526` | High |
| RULE-058 | Export with real background, then restore the placeholder background without to… | Lifecycle | P1 | `dist/tui-image-editor.js:12269-12395` | Medium |
| RULE-059 | Hot background reload keeps floating objects and the current rotation | Lifecycle | P1 | `dist/tui-image-editor.js:12398-12426` | Medium |
| RULE-060 | Undo/redo availability follows stack depth | Lifecycle | P1 | `dist/tui-image-editor.js:12922-12954` | High |
| RULE-061 | Selected object type drives active menu and shape stroke limit | Lifecycle | P1 | `dist/tui-image-editor.js:12956-13039` | High |
| RULE-062 | Undoable vs silent command execution | Lifecycle | P1 | `dist/tui-image-editor.js:1428-1487` | Medium |
| RULE-063 | Object registry lifecycle and delete-by-id | Lifecycle | P1 | `dist/tui-image-editor.js:14820-14839` | High |
| RULE-064 | Drawing mode state machine | Lifecycle | P1 | `dist/tui-image-editor.js:14996-15030` | High |
| RULE-065 | Paste source tracking (chained pastes) | Lifecycle | P1 | `dist/tui-image-editor.js:16118-16155` | High |
| RULE-066 | Crop reloads the cropped region as the new base image | Lifecycle | P1 | `dist/tui-image-editor.js:1620-1628` | Medium |
| RULE-067 | Reload last file or reset editor | Lifecycle | P1 | `dist/tui-image-editor.js:2376-2399` | High |
| RULE-068 | Start new blank (transparent) project | Lifecycle | P1 | `dist/tui-image-editor.js:2409-2469` | High |
| RULE-069 | Freehand drawings flagged as newly created PATH objects | Lifecycle | P1 | `dist/tui-image-editor.js:24757-24759` | Medium |
| RULE-070 | New edit is recorded in undo history and wipes redo history | Lifecycle | P1 | `dist/tui-image-editor.js:4674-4698` | Medium |
| RULE-071 | Undo moves the last edit to redo history | Lifecycle | P1 | `dist/tui-image-editor.js:4704-4769` | Medium |
| RULE-072 | Redo re-executes the last undone edit and returns it to undo history | Lifecycle | P1 | `dist/tui-image-editor.js:4775-4840` | High |
| RULE-073 | Undo of image flip restores prior flip setting | Lifecycle | P1 | `dist/tui-image-editor.js:52445-52461` | High |
| RULE-074 | Loading a new background image keeps overlays and supports undo | Lifecycle | P1 | `dist/tui-image-editor.js:52505-52549` | Medium |
| RULE-075 | Undo/redo of image rotation | Lifecycle | P1 | `dist/tui-image-editor.js:52787-52833` | High |
| RULE-076 | Edit-history and delete button enablement | Lifecycle | P1 | `dist/tui-image-editor.js:5912-5981` | Medium |
| RULE-077 | One-time activation of menu and header actions | Lifecycle | P1 | `dist/tui-image-editor.js:6232-6272` | High |
| RULE-078 | Initial image load gates toolbar activation | Lifecycle | P1 | `dist/tui-image-editor.js:6280-6301` | Medium |
| RULE-079 | Tool submenu open/close state machine | Lifecycle | P1 | `dist/tui-image-editor.js:6323-6361` | Medium |
| RULE-080 | Shape tool selection toggle and stroke/fill updates | Lifecycle | P1 | `dist/tui-image-editor.js:7537-7604` | Medium |
| RULE-081 | Crop apply/cancel and preset selection | Lifecycle | P1 | `dist/tui-image-editor.js:8486-8562` | High |
| RULE-082 | Editor starts on the Tonga welcome image | Lifecycle | P1 | `index.html:258-268` | Medium |
| RULE-083 | Inserting a repository image adds it as a named custom image object | Lifecycle | P1 | `js/repositorio.js:106-125` | High |
| RULE-084 | Loading a repository background resets transparency and unlocks the editor | Lifecycle | P1 | `js/repositorio.js:128-151` | Medium |
| RULE-085 | Opening a new file resets the editor session | Lifecycle | P1 | `legacy/tonga/dist/tui-image-editor.js:11425-11462` | High |
| RULE-086 | SVG export embeds the background and tags it data-background | Lifecycle | P1 | `legacy/tonga/dist/tui-image-editor.js:12097-12192` | Medium |
| RULE-087 | Icon placement toggle and custom icon upload | Lifecycle | P2 | `dist/tui-image-editor.js:10075-10117` | High |
| RULE-088 | Menu-to-editor mode mapping | Lifecycle | P2 | `dist/tui-image-editor.js:13052-13067` | High |
| RULE-089 | Reset zoom to original image size | Lifecycle | P2 | `dist/tui-image-editor.js:15117-15148` | High |
| RULE-090 | Flip image horizontally, vertically, or reset | Lifecycle | P2 | `dist/tui-image-editor.js:1657-1715` | High |
| RULE-091 | Activate drawing mode on demand (icons excluded) | Lifecycle | P2 | `dist/tui-image-editor.js:2022-2026` | High |
| RULE-092 | Destroy editor teardown | Lifecycle | P2 | `dist/tui-image-editor.js:2578-2590` | High |
| RULE-093 | Clear objects and resize canvas are reversible | Lifecycle | P2 | `dist/tui-image-editor.js:52384-52401` | High |
| RULE-094 | Flip state and reset guard | Lifecycle | P2 | `dist/tui-image-editor.js:8825-8851` | High |
| RULE-095 | Mask image load then apply | Lifecycle | P2 | `dist/tui-image-editor.js:9795-9823` | High |
| RULE-096 | Window resize keeps the current canvas zoom | Lifecycle | P2 | `index.html:289-292` | Medium |
| RULE-097 | Credits dialog opens from the Créditos link and closes from its X icon | Lifecycle | P2 | `index.html:299-318` | High |
| RULE-098 | Delete and Delete-All button state after removal | Lifecycle | P2 | `legacy/tonga/dist/tui-image-editor.js:11365-11376` | High |
| RULE-099 | Licence, ownership and version of the work | Policy | P1 | `creditos.html:72-116` | High |
| RULE-100 | Keyboard shortcuts for copy, paste, undo, redo and delete | Policy | P1 | `dist/tui-image-editor.js:1144-1197` | High |
| RULE-101 | Generic image download: file extension follows the actual image format | Policy | P1 | `dist/tui-image-editor.js:12202-12219` | High |
| RULE-102 | SVG export ignores the current zoom | Policy | P1 | `dist/tui-image-editor.js:23847-23849` | High |
| RULE-103 | Object type and image name persisted in SVG export | Policy | P1 | `dist/tui-image-editor.js:35350-35356` | Medium |
| RULE-104 | Silent execution bypasses undo history | Policy | P1 | `dist/tui-image-editor.js:4650-4664` | Medium |
| RULE-105 | Library catalogue is grouped into titled sections by header lines | Policy | P1 | `dist/tui-image-editor.js:53308-53355` | High |
| RULE-106 | Default ranges for editing tool sliders | Policy | P1 | `dist/tui-image-editor.js:5588-5646` | High |
| RULE-107 | Default editor configuration and enabled tool menus | Policy | P1 | `dist/tui-image-editor.js:5995-6011` | High |
| RULE-108 | Export result in PDF, JPG, PNG or SVG | Policy | P1 | `dist/tui-image-editor.js:6162-6172` | Medium |
| RULE-109 | Third-party usage statistics are disabled | Policy | P1 | `dist/tui-image-editor.js:688-691` | Medium |
| RULE-110 | Editor exposes a fixed set of nine editing tools; mask and load are excluded | Policy | P1 | `index.html:273-284` | High |
| RULE-111 | Legal notice and privacy policy links always visible | Policy | P1 | `index.html:88-91` | High |
| RULE-112 | Item classification: background vs. insertable image | Policy | P1 | `js/repositorio.js:59-77` | Medium |
| RULE-113 | File type routing: SVG versus raster import | Policy | P1 | `legacy/tonga/dist/tui-image-editor.js:11463-11764` | High |
| RULE-114 | Background handling at export (transparent / rotated / format) | Policy | P1 | `legacy/tonga/dist/tui-image-editor.js:11792-11981` | Medium |
| RULE-115 | Custom icon from uploaded image via vector tracing | Policy | P2 | `dist/tui-image-editor.js:12497-12516` | High |
| RULE-116 | Default new text object | Policy | P2 | `dist/tui-image-editor.js:12995-13008` | Medium |
| RULE-117 | Canvas size equals image size (no CSS max cap) | Policy | P2 | `dist/tui-image-editor.js:15819-15848` | High |
| RULE-118 | Inserted image placement and tagging | Policy | P2 | `dist/tui-image-editor.js:15855-15870` | Medium |
| RULE-119 | Raise or lower the selected object one layer | Policy | P2 | `dist/tui-image-editor.js:2345-2366` | Medium |
| RULE-120 | Selecting an object does not change its layer order | Policy | P2 | `dist/tui-image-editor.js:25468-25469` | High |
| RULE-121 | Keyboard shortcuts and selection appearance | Policy | P2 | `dist/tui-image-editor.js:5501-5525` | Medium |
| RULE-122 | Default object selection style in built-in UI mode | Policy | P2 | `dist/tui-image-editor.js:5827-5841` | High |
| RULE-123 | Tonga header toolbar composition | Policy | P2 | `dist/tui-image-editor.js:6500-6625` | High |
| RULE-124 | Only one colour picker open at a time | Policy | P2 | `dist/tui-image-editor.js:7771-7796` | High |
| RULE-125 | Group selection inherits configured selection style | Policy | P2 | `dist/tui-image-editor.js:881-900` | High |
| RULE-126 | Spanish user interface labels | Policy | P2 | `index.html:146-252` | High |
| RULE-127 | Download file name is a fixed prefix plus timestamp | Policy | P2 | `legacy/tonga/dist/tui-image-editor.js:11771-11787` | High |

## Calculation

### RULE-001: Filter option building per filter type
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:10811-10877`
**Plain English:** Ticking or unticking a filter applies or removes it, using the matching engine filter and options read from that filter's controls.
**Specification:**
  Given The Pixelate checkbox is ticked and the pixelate slider is at 4.7
  When  The checkbox or slider changes
  Then  applyFilter(true, 'pixelate', {blocksize: 4}) is called and the slider group is enabled. When unticked, apply=false and the group is shown disabled.
**Parameters:** filterNameMap (10683-10705): sepia2 -> vintage, removeWhite and colorFilter -> removeColor, tint/multiply/blend -> blendColor. removeWhite: color #FFFFFF, useAlpha false, distance = slider. colorFilter: color #FFFFFF, distance = threshold. noise and blocksize are converted to integers. brightness is a float. tint: alpha = opacity slider.
**Edge cases handled:** Moving a slider while its checkbox is unticked calls applyFilter(false, ...), which removes or skips the filter; For blend, mode is first set to 'add' and then overwritten by the select-box value
**Confidence:** High

### RULE-002: Rotation preserves current zoom factor
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:12682-12775`
**Plain English:** On rotate (relative) or setAngle (absolute), the editor saves the zoom factor, rotates at native size, resizes the editor to the rotated bounding box, re-applies the zoom, and sets the wrapper to the integer bounding box times the zoom.
**Specification:**
  Given A 800x600 image at zoom 1.5
  When  It is rotated 90 degrees
  Then  The bounding box becomes 600x800 and the wrapper becomes parseInt(600*1.5)=900 by parseInt(800*1.5)=1200 px; canvas CSS max-width 900px, max-height 1200px
**Parameters:** newSize = parseInt(parseInt(bbox,10) * zoomFactor) (truncation, not rounding)
**Edge cases handled:** Non-right angles enlarge the bounding box; rotate also moves the UI range bar to the given angle; setAngle does not; The bounding box is truncated to an integer before the zoom multiply
**Confidence:** High

### RULE-003: Zoom-in step and maximum zoom
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:15155-15194`
**Plain English:** Each zoom-in raises the zoom factor by 0.1 as long as the current factor is 1.9 or less (so it tops out at about 2.0). The editor is then resized to the background image's natural size times the zoom factor, with the fractional part cut off.
**Specification:**
  Given A background image of 800x600 px and a current zoom factor of 1.0
  When  The user clicks zoom-in (bigger canvas)
  Then  The zoom factor becomes 1.1 and the editor wrapper and canvas CSS max size become 880x660 px (parseInt(800*1.1), parseInt(600*1.1)). At a factor of 2.0 nothing changes, but the size is applied again.
**Parameters:** Step = +0.1; upper guard: factor <= 1.9 (effective max about 2.0); truncation by parseInt, not rounding
**Edge cases handled:** If there is no canvas background image, the current wrapper (.tui-image-editor) width and height are used as the base instead of the image bounding box; Floating-point build-up can stop zoom-in one step early or let it overshoot slightly; Zoom factor is kept on the imageEditor object (getFactorZoom defaults to 1)
**Suspected defect:** The bound check uses unrounded floats that build up after repeated 0.1 steps, so the effective maximum is not exactly 2.0.
**Confidence:** High

### RULE-004: Zoom-out step and minimum zoom
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:15201-15242`
**Plain English:** Each zoom-out lowers the zoom factor by 0.1 as long as the current factor is 0.2 or more (so it bottoms out at about 0.1). The editor is then resized to the base size times the factor, with the fractional part cut off.
**Specification:**
  Given A background image of 800x600 px and a current zoom factor of 1.0
  When  The user clicks zoom-out (smaller canvas)
  Then  The zoom factor becomes 0.9 and the editor size becomes 720x540 px
**Parameters:** Step = -0.1; lower guard: factor >= 0.2 (effective min about 0.1)
**Edge cases handled:** If there is no background image, the base is the current wrapper size, which may already be zoomed, so zoom compounds; Float build-up decides whether the last step to 0.1 happens
**Suspected defect:** When there is no background image, the base is the already-zoomed wrapper size, so the factor gets applied on top of the previous zoom (compounding) instead of to the original size.
**Confidence:** High

### RULE-005: Initial fit-to-screen zoom for the background
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:15286-15309`
**Plain English:** When a background loads, the starting zoom is the largest one-decimal factor at which the whole background fits inside the editor container. On small screens (container shorter than 650 px), it is reduced by a further 0.1.
**Specification:**
  Given A container of 1200x700 px and a background of 2000x1000 px
  When  setFitFondo runs for the new background
  Then  The ratios are 0.6 (width) and 0.7 (height). The minimum is 0.6, floored to 1 decimal: 0.6. The container height of 700 is 650 or more, so the factor stays 0.6, and the canvas is sized to the image size x 0.6
**Parameters:** Precision: floor to 0.1; small-screen threshold: container clientHeight < 650 px; small-screen penalty: -0.1
**Edge cases handled:** Container height 600 with ratio 0.6 gives 0.5; The result is not clamped to the zoom-button bounds of 0.1-2.0, and small backgrounds can get factors above 2.0; A very large background (ratio < 0.1) gives a factor of 0, or -0.1 on small screens
**Suspected defect:** There is no lower clamp, so the factor can be 0 or negative for very large images or small containers. It can also go above the 2.0 maximum that the zoom buttons enforce.
**Confidence:** High

### RULE-006: Copy-paste offset and canvas-edge flip
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:16198-16216`
**Plain English:** A pasted copy is shifted 10 px right and 10 px down from the original. If that shift would push the copy's edge past the canvas, it is shifted 10 px the other way (left or up) instead.
**Specification:**
  Given A canvas image of 800x600 and a copied object at left=780, top=100, width=40, height=20
  When  Paste is invoked
  Then  The right edge 780+20=800 plus 10 is over 800, so left becomes 770. The bottom edge 110 plus 10 is not over 600, so top becomes 110. The selection style is applied
**Parameters:** EXTRA_PX_FOR_PASTE = 10 px (line 14544); edge = position + size/2 (assumes centre origin); canvas size = background image width/height, or 0 when there is no image
**Edge cases handled:** With no background image, the canvas size is 0, so every paste shifts by -10; Each axis is checked independently; Size is unscaled width/height, so scaleX/scaleY are ignored
**Suspected defect:** The edge test ignores object scaling. It also uses the background image size, which is 0 when there is no background, so pasted objects always move up and left.
**Confidence:** Medium — Should the edge check use the scaled object size and the actual canvas size instead of the unscaled size and the background image size?

### RULE-007: New objects default to canvas centre
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:2598-2609`
**Plain English:** If a new shape or icon is added without a position, it is placed at the centre of the canvas.
**Specification:**
  Given Canvas centre at (512, 384) and addShape('rect', {width:100}) with no left/top
  When  addShape or addIcon runs
  Then  options.left=512 and options.top=384 are filled in before the ADD_SHAPE/ADD_ICON command runs
**Parameters:** Centre comes from graphics.getCenter(); only undefined values are replaced (0 is kept)
**Edge cases handled:** left given and top omitted: only top is defaulted; Used by addShape (lines 1889-1896) and addIcon (lines 2203-2210)
**Confidence:** High

### RULE-008: Imported text positioned by its first span offset
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:29837-29842`
**Plain English:** When an SVG element with children (for example a text with a tspan) is loaded, its centre is shifted by the first child's x/y before the transform is applied, so the text keeps its saved position.
**Specification:**
  Given An SVG <text> whose first <tspan> has x=12 and y=30, and whose computed centre is (100,50)
  When  The SVG is loaded
  Then  The centre becomes (112,80) before the transform matrix is applied, and any preserveAspectRatio options are discarded
**Parameters:** Offsets come from el.children[0].x.baseVal[0] and el.children[0].y.baseVal[0] (set in createCallback at lines 20612-20619)
**Edge cases handled:** This applies to any element with a first child, not only text; Images with children lose their preserveAspectRatio scaling and cropping
**Suspected defect:** The check at line 20613 is 'el.children[0]' for any element. A first child that has no x/y SVGAnimatedLengthList (for example a <title>) throws on .x.baseVal, and the preserveAspectRatio options of images are overwritten.
**Confidence:** Medium — Should the span-offset adjustment apply only to <text> elements? Can an imported element have a first child without x/y lengths (for example <title> or <desc>)?

### RULE-009: Path transform cache key uses top-left origin
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:31047-31057`
**Plain English:** For path objects, the key used to cache the transform matrix records the origin as left/top instead of the object's actual origin.
**Specification:**
  Given A path object (it has its own pathOffset) with originX='center' and originY='center'
  When  Its transform matrix key is computed
  Then  The key contains 'left_top' instead of 'center_center'. Every other object uses its real originX/originY
**Parameters:** Applies when the object has its own pathOffset property
**Suspected defect:** Only the cache key changes. The comment claims the matrix becomes left-top relative, but the executable code does not do that. Because the key no longer reflects origin changes for paths, the cache could also go stale when a path's origin changes.
**Confidence:** Low — The comment says the matrix itself should be relative to left-top for PATHs, but the code changes only the cache key, not the matrix calculation. Does this patch actually fix the SVG save offset, or is the real fix elsewhere?

### RULE-010: Colour blend filter modes (Spanish-named)
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:37874-37925`
**Plain English:** When a colour is blended onto the image, each pixel's RGB channels are combined with the tint colour using the selected mode, and the mode names were translated to Spanish by Tonga.
**Specification:**
  Given A pixel with r=200,g=100,b=50 and a blend colour of tr=100,tg=100,tb=100
  When  The BlendColor filter is applied on the canvas2D path with mode 'pantalla' (screen)
  Then  The pixel becomes r=255-((55*155)/255)=221.6, g=255-(155*155/255)=160.8, b=255-(205*155/255)=130.4 (stored in a clamped byte array). 'oscurecer' would give min per channel (100,100,50), 'aligerar' max (200,100,100), 'restar' r-tr (100,0,-50 clamped to 0), 'añadir' r+tr (300 clamped to 255)
**Parameters:** Mode names: multiply, pantalla (screen), añadir (add), diferencia/difference, restar (subtract), oscurecer (darken), aligerar (lighten), overlay, exclusion, tint. Default mode 'multiply', default colour #F95C63, alpha 1. Overlay threshold: blend channel < 128. UI list BLEND_OPTIONS at line 10681 offers añadir, diferencia, restar, multiply, pantalla, aligerar, oscurecer. WebGL fragmentSource keys (37812-37866) use the same Spanish names.
**Edge cases handled:** 'diferencia' and the original English 'difference' are both accepted; other English names (screen, add, subtract, darken, lighten) no longer match and leave the pixel unchanged; An unknown mode leaves the pixel unchanged on canvas2D and finds no shader on WebGL; The BlendImage filter's default mode is 'Multiply' (capital M, line 38023), and only Multiply and mask shaders exist
**Suspected defect:** Renaming the mode values instead of only the display labels means saved or third-party filter settings that use the English Fabric names (screen, add, subtract, darken, lighten) silently stop working. Only 'difference' keeps an English alias.
**Confidence:** High

### RULE-011: Undo/redo of a rotation re-fits the editor preserving zoom
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:4728-4765`
**Plain English:** After undoing or redoing a rotation, the editor is resized to the image's new bounding box and the current zoom factor is reapplied to size the visible wrapper.
**Specification:**
  Given Zoom factor 1.5 and, after undoing a rotate, the image bounding rect is 800.6 x 600.2 px
  When  Undo (or redo, lines 4799-4836) of a command named 'rotate' is triggered
  Then  Editor UI is resized to image size 800.6x600.2, zoom 1.5 is restored, wrapper is set to 1200 x 900 px (parseInt(parseInt(w)*zoom)) and canvas CSS max-width/max-height set to those values
**Parameters:** Formula: newWidth = trunc(trunc(width) * zoomFactor); newHeight = trunc(trunc(height) * zoomFactor)
**Edge cases handled:** Truncation, not rounding: parseInt of width then parseInt of the product; Runs synchronously right after the undo/redo is started, before the asynchronous rotation actually completes; Image scale is forced to 1 before measuring; Depends on global 'imageEditor' and jQuery selector '.tui-image-editor'
**Suspected defect:** Layout is computed before the undo/redo promise resolves, so dimensions may reflect the pre-undo rotation; the same block is duplicated in undo and redo.
**Confidence:** Medium — Should the zoom-preserving resize run after the rotation undo/redo completes, and is truncation (vs rounding) of pixel sizes intended?

### RULE-012: Image angle sign inversion on flip
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:47507-47519`
**Plain English:** Flipping the image on one axis negates its rotation angle; flipping both axes at once leaves the angle unchanged.
**Specification:**
  Given The background image is rotated 30 degrees
  When  A horizontal flip is applied
  Then  The image angle becomes -30 (flipping X and Y together would give 30); -0 is normalized to 0
**Parameters:** multiplier -1 per changed axis
**Edge cases handled:** Both axes changing: angle × -1 × -1 = unchanged; Angle 0 stays 0 (parseFloat used to normalize -0)
**Confidence:** High

### RULE-013: Mirror overlay objects across the canvas on flip
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:47528-47654`
**Plain English:** When the image is flipped, every overlay object is mirrored: horizontal flip moves it to canvasWidth minus its x position, vertical flip to canvasHeight minus its y position, its own flip flag is toggled and its angle negated, all computed at zoom 1 then the user's zoom restored.
**Specification:**
  Given Canvas width 800 at zoom 2 (logical width 400) and a freshly inserted non-path object (nuevoObjeto=true) at left=100, top=50, angle=20
  When  A horizontal flip is applied
  Then  The object moves to left=300 (400-100), top stays 50, angle becomes -20, flipX toggles, and it is marked objetoFlipao=true
**Parameters:** logical canvas size = canvas.width/zoom, canvas.height/zoom; zoom temporarily forced to 1; type-specific anchors: PATH and LINE use oCoords control points (mb, br, ml) depending on whether the object was already flipped/rotated (objetoFlipao/objetoGirado)
**Edge cases handled:** New PATH not yet flipped/rotated: flipX left = W - oCoords.br.x, top = oCoords.mb.y; already flipped/rotated: left = W - oCoords.mb.x, top unchanged; New LINE: flipX left = W - oCoords.mb.x in both states; top = oCoords.mb.y only if not yet flipped; New PATH flipY not flipped: left = oCoords.br.x, top = H - oCoords.br.y; flipped: top = H - oCoords.ml.y; Objects loaded from SVG (nuevoObjeto false): flipX uses W - oCoords.br.x unless already rotated, then W - left; flipY keeps the original top unless already rotated (then H - top); Every processed object is permanently flagged objetoFlipao=true, which changes how later flips/rotations anchor it
**Suspected defect:** For SVG-loaded objects the objetoFlipao branch is identical in both arms (47574-47578), and for SVG-loaded non-rotated objects flipY leaves _top at canvasHeight - obj.top? No: _top is initialised to canvasHeight - obj.top at 47599 and only reassigned when rotated, so the commented-out override suggests unfinished logic. Anchor choices depend on undocumented flags (objetoFlipao/objetoGirado) that are never cleared, so repeated flip/unflip may not be idempotent.
**Confidence:** Medium — Is the expected outcome that flipping twice returns every overlay object (paths, lines, SVG-loaded images) to its exact original position? Different anchor points are used before/after the first flip, so confirm which positions are correct for each object type.

### RULE-014: Image rotation: relative rotate vs absolute setAngle
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:47801-47910`
**Also cited:** (Rotation.getCurrentAngle/setAngle/rotate) and dist/tui-image-editor.js:52782-52835 (ROTATE_IMAGE command execute/undo); dispatch remains at 1724-1781
**Plain English:** rotate(n) adds n degrees to the current angle, while setAngle(n) sets the angle to exactly n. Either one can run without being recorded in undo history.
**Specification:**
  Given Current image angle 10 degrees
  When  rotate(10) is called, then setAngle(5), then rotate(50)
  Then  The angle becomes 20, then 5, then 55. Each step is a ROTATE_IMAGE command, undoable unless isSilent=true
**Parameters:** type in {'rotate','setAngle'}; isSilent boolean selects executeSilent
**Edge cases handled:** The JSDoc example implies normalization (setAngle(5) then rotate(-95) gives -90). Wrapping or modulo is done in the rotation component, not here
**Confidence:** Medium — Does the ROTATE_IMAGE command normalize angles to a range (for example -360..360 or 0..359), and should silent rotations (slider drags) skip undo history by design?

### RULE-015: Image rotation angle normalization and overlay object rotation
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:47816-47893`
**Plain English:** Setting the image angle reduces it modulo 360, re-fits the canvas, and rotates every overlay object around the old image centre by the angle difference, then shifts it by how much the image centre moved.
**Specification:**
  Given Image angle 0, centre (400,300); an overlay object centred at (500,300) with angle 10
  When  setAngle(90) is applied and after canvas adjustment the new image centre is (300,400)
  Then  Object centre is rotated 90 degrees about (400,300) to (400,400), then offset by centreDiff (100,-100) giving left=300, top=500; object angle becomes (10+90)%360=100; object origin set to center
**Parameters:** modulo 360; angleDiff = newAngle%360 - oldAngle%360; rotation via degreesToRadians and rotatePoint
**Edge cases handled:** JS modulo keeps sign: setAngle(-450) gives -90, not 270; Object angle also uses %360 and can be negative; PATH objects not previously flipped/rotated get origin left/top before centre computation; others get center/center; All objects are flagged objetoGirado=true and left with originX/Y=center permanently (restore of original origin is commented out)
**Suspected defect:** Objects' original originX/originY are captured but never restored (restoration commented out at 47887-47888), permanently changing their positioning reference.
**Confidence:** Medium — Should overlay objects keep their original origin (left/top) after rotation, or is permanently switching them to center origin intended?

### RULE-016: Incremental rotation rounds current angle to whole degrees
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:47900-47909`
**Plain English:** A relative rotation first rounds the current image angle to the nearest whole degree, then adds the requested increment.
**Specification:**
  Given An SVG loaded with image angle 29.8
  When  rotate(30) is requested
  Then  The new angle is round(29.8)+30 = 60 (not 59.8)
**Parameters:** Math.round (half up to integer degree)
**Edge cases handled:** Comment claims result will be a multiple of 30 (or 20) but code only rounds to an integer; e.g. 44 + 30 = 74; Undo of a rotate command calls rotate(-angle), which re-rounds, so undo is not an exact inverse for fractional starting angles
**Suspected defect:** Comment (47905) says the rotation is calculated to be a multiple of 20/30, but the code only rounds to the nearest integer degree.
**Confidence:** High

### RULE-017: Value clamping within a range
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:5222-5231`
**Plain English:** Numeric settings are clamped between a minimum and maximum, with min and max swapped if given in reverse order.
**Specification:**
  Given value 450, min 360, max -360
  When  clamp is applied
  Then  Bounds are swapped to (-360, 360) and the result is 360
**Edge cases handled:** Value already in range is returned unchanged
**Confidence:** High

### RULE-018: Canvas and editor resized to the image bounds on every menu change
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:6363-6384`
**Plain English:** After any tool switch the canvas back-store and the editor UI are resized to the bounding rectangle of the background image at scale 1, so the canvas and editor frame stay in sync.
**Specification:**
  Given The background image bounding rect at scale 1 is 800 x 600
  When  The user switches from Crop to Text
  Then  The canvas back-store is set to 800 x 600 and resizeEditor is called with uiSize = imageSize = {width:800, height:600}
**Parameters:** Scale forced to 1 via canvasImage.scale(1)
**Edge cases handled:** Relies on the global variable imageEditor rather than this instance; a page with a different global name or two editors would break; imageSize passed has width/height but no newWidth/newHeight, so _getEditorDimension computes undefined dimensions on this path
**Suspected defect:** The JBD 09.09.2019 comment says the intent is to keep the current zoomed size, but canvasImage.scale(1) mutates the image scale back to 1, which appears to undo any zoom applied with the bigger/smaller buttons. Also imageSize is passed as {width,height} while _getEditorDimension reads newWidth/newHeight, yielding 'undefinedpx' styles.
**Confidence:** Medium — When a user zooms in (bigger/smaller) and then switches tool, should the zoom level be preserved or reset to 100%? The code currently forces scale 1.

### RULE-019: Editor display size capped by container maximum
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:6420-6432`
**Plain English:** The editor area is shown at the image's new size but never larger than the canvas container's CSS max-width / max-height.
**Specification:**
  Given imageSize.newWidth = 1200, newHeight = 900, container max-width 1000px, max-height 1146.86px
  When  Editor dimensions are computed
  Then  width = 1000 (capped), height = 900 (not capped)
**Parameters:** Caps read from .tui-image-editor-canvas-container style maxWidth/maxHeight
**Edge cases handled:** If maxWidth/maxHeight is unset, parseFloat gives NaN, the comparison is false and the uncapped image size is used; Aspect ratio is not preserved: each axis is capped independently
**Confidence:** High

### RULE-020: Range slider value from pointer position
**Category:** Calculation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:8056-8124`
**Plain English:** Every slider turns the pointer position into a value: min + (max - min) x position / bar width. The pointer is kept inside the bar.
**Specification:**
  Given A stroke slider with min 2, max 300 and a bar 200 px wide
  When  The user drags the pointer to 100 px
  Then  The value is 2 + 298 x 0.5 = 151. With realTimeEvent false, the change event fires only when the mouse is released.
**Parameters:** _absMax = max - min. Drag position is clamped to 0..rangeWidth. Setting a value clamps the pointer to rangeWidth but not below 0.
**Edge cases handled:** Click events fire with isLast=true (8012-8025); Changing max recomputes _absMax and moves the pointer again (8088-8093); The value setter does not clamp a value below min (the pointer can go negative) and stores the raw value even above max
**Suspected defect:** The value setter keeps out-of-range values unchanged. Only the pointer position is clamped, and only at the top end.
**Confidence:** High

### RULE-021: SVG without a background: synthesize one sized to the largest element
**Category:** Calculation
**Priority:** P1
**Source:** `legacy/tonga/dist/tui-image-editor.js:11482-11498`
**Plain English:** If an imported SVG has no marked background image, the canvas size is the maximum of the SVG's declared width/height and the width/height of every element. A blank background bitmap of that size is generated, and the objects are re-added on top of it.
**Specification:**
  Given An SVG declaring 500x400 with elements of width 620 and height 300
  When  It is imported and no 'data-background' image is present
  Then  The canvas becomes 620x400. A generated PNG background (pixels R255 G255 B0, alpha 0.5, which a byte array stores as 0, so it is fully transparent) is loaded as 'data-background'. Objects are re-added, rotate(0) runs with the invoker lock bypassed, the view is fitted and undo is cleared.
**Parameters:** Generated pixel RGBA = (255,255,0,0.5); the generation code is at lines 11558-11649
**Suspected defect:** Alpha 0.5 becomes 0 in the byte array, so the intent is unclear. Element width/height are compared without scale or position, so the size can be too small for offset or scaled elements.
**Confidence:** Medium — Was the generated background meant to be transparent or semi-transparent yellow? The code writes alpha 0.5 into an 8-bit channel, which stores 0, so it is fully transparent.

### RULE-022: PDF export fits the image to an A4 portrait page, keeping aspect ratio
**Category:** Calculation
**Priority:** P1
**Source:** `legacy/tonga/dist/tui-image-editor.js:11990-12052`
**Plain English:** A PDF export is a single A4 portrait page (points) with no margin. The JPEG of the canvas is scaled to fit the page while keeping its proportions, anchored at the top-left.
**Specification:**
  Given A canvas bounding box of 1200x800 (ratio 1.5) and an A4 page of 595.28x841.89 pt
  When  The user downloads a PDF
  Then  Landscape branch: width = 595.28, height = 595.28/1.5 = 396.85, placed at (0,0) and saved as 'imagen_<timestamp>.pdf'.
**Parameters:** Page 'a4' portrait, unit 'pt'; margins X=0, Y=0 (previously 40, removed at the client's request); image encoded as JPEG
**Edge cases handled:** Portrait image (height > width): height = page height and width = height*ratio. If that is wider than the page, width = page width and height = width/ratio; No File API or saveAs: the image opens in a new window instead
**Suspected defect:** In the landscape overflow branch, newWidth = newHeight / ratio should be newHeight * ratio. This branch only runs if the page's aspect differs, so for portrait A4 it is effectively unreachable. Also, the JPEG data is passed to addImage tagged as 'PNG'.
**Confidence:** High

### RULE-023: Icon drag-to-size scaling
**Category:** Calculation
**Priority:** P2
**Source:** `dist/tui-image-editor.js:12445-12475`
**Plain English:** When placing an icon, the user clicks to drop it and drags to size it. The scale is twice the drag distance divided by the icon's native size, in absolute value, because the icon grows from its centre.
**Specification:**
  Given An icon with native width 40 and height 20, dropped at (100,100)
  When  The pointer is dragged to (130,90)
  Then  scaleX = |2*(130-100)/40| = 1.5 and scaleY = |2*(90-100)/20| = 1.0, applied quietly (no undo entry)
**Parameters:** Multiplier 2 (centre-origin growth)
**Edge cases handled:** Dragging left or up still gives a positive scale (abs); Zero drag gives scale 0; The icon is added on a single mousedown only (once); iconCreateEnd clears the icon type and makes all objects selectable again
**Confidence:** High

### RULE-024: Crop aspect-ratio presets
**Category:** Calculation
**Priority:** P2
**Source:** `dist/tui-image-editor.js:12852-12877`
**Plain English:** Crop presets fix the crop zone ratio (width/height) to Square 1, 3:2, 4:3, 5:4, 7:5 or 16:9. Any other choice gives a free crop zone and disables the Apply button.
**Specification:**
  Given The user picks 'preset-16-9'
  When  The preset is applied
  Then  The crop zone ratio is 16/9 ≈ 1.778
**Parameters:** preset-square=1, preset-3-2=1.5, preset-4-3=1.333, preset-5-4=1.25, preset-7-5=1.4, preset-16-9=1.778
**Edge cases handled:** An unknown preset gives a free ratio and Apply disabled until a crop zone is activated (objectActivated with cropzone re-enables it)
**Confidence:** High

### RULE-025: Set object position by an origin anchor
**Category:** Calculation
**Priority:** P2
**Source:** `dist/tui-image-editor.js:15651-15677`
**Plain English:** Positioning an object at (x,y) using a chosen anchor (left/center/right x top/center/bottom) converts that anchor point into the object's centre-based coordinates.
**Specification:**
  Given An object 100x50 centred at (200,200)
  When  setObjectPosition is called with x=0, y=0, origin left/top
  Then  left = 0 + (200-150) = 50 and top = 0 + (200-175) = 25, so the object's top-left corner is at (0,0)
**Edge cases handled:** Unknown id returns false
**Confidence:** High

### RULE-026: Hex colour to RGBA conversion
**Category:** Calculation
**Priority:** P2
**Source:** `dist/tui-image-editor.js:5323-5333`
**Plain English:** Hex colours (short or long form) are converted to rgba strings, defaulting opacity to 1.
**Specification:**
  Given color '#f0a' and alpha undefined
  When  getRgb is called
  Then  Short form is expanded by appending its own digits ('#f0af0a', not '#ff00aa') and result is 'rgba(240, 175, 10, 1)'
**Edge cases handled:** alpha of 0 is treated as falsy and becomes 1
**Suspected defect:** Short hex expansion concatenates the 3 digits again instead of doubling each digit, so '#f0a' becomes rgb(240,175,10) instead of rgb(255,0,170); alpha 0 is turned into fully opaque.
**Confidence:** High

### RULE-027: Resize editor and compact header for narrow top-bar layouts
**Category:** Calculation
**Priority:** P2
**Source:** `dist/tui-image-editor.js:5866-5903`
**Plain English:** Resizing applies the capped image dimensions and submenu offset to the editor, stretches the wrapper full width, and switches to a compact 'top optimization' layout when the menu bar is on top and the container is narrower than 1300px.
**Specification:**
  Given menuBarPosition 'top' and container offsetWidth 1024
  When  resizeEditor runs
  Then  Class tui-image-editor-top-optimization is added; at width >= 1300 or any other bar position it is removed
**Parameters:** BI_EXPRESSION_MINSIZE_WHEN_TOP_POSITION = '1300' (string, coerced to number in comparison)
**Edge cases handled:** Called without arguments it reapplies the previously stored imageSize (responsive refresh); uiSize supplied replaces the container CSS width/height
**Confidence:** High

### RULE-028: Editor offset to make room for open submenu
**Category:** Calculation
**Priority:** P2
**Source:** `dist/tui-image-editor.js:6441-6480`
**Plain English:** When a tool submenu is open, the editor canvas is shifted to leave room for a 150px submenu panel (top/bottom bars) or a 248px panel (left/right bars); with no submenu open it sits at 0,0.
**Specification:**
  Given menuBarPosition 'bottom', a submenu is open, editor height 400, wrap scrollHeight 800
  When  Editor position is set
  Then  Because 400 <= 800-150, top = -75px and left = 0px
**Parameters:** Submenu panel height 150px (top/bottom); panel width 248px (left/right)
**Edge cases handled:** bottom & height > scrollHeight-150: top = (height - scrollHeight)/2; top: top = 75 - (height-(offsetHeight-150))/2 if image too tall, else 75; left: left = 124 - (width-(offsetWidth-248))/2 if too wide, else 124; right: left = (width - scrollWidth)/2 if too wide, else -124; No submenu open: top=0, left=0
**Confidence:** High

### RULE-029: Zoom factor defaults to 1
**Category:** Calculation
**Priority:** P2
**Source:** `dist/tui-image-editor.js:988-1001`
**Plain English:** The editor's zoom factor is 1 (no zoom) until something sets it.
**Specification:**
  Given No zoom factor has been set (or it was set to 0/null)
  When  getFactorZoom() is called
  Then  It returns 1
**Parameters:** default factor=1
**Edge cases handled:** Setting the factor to 0 also returns 1 because of the falsy fallback
**Confidence:** High

### RULE-030: Thumbnails are always encoded as JPEG
**Category:** Calculation
**Priority:** P2
**Source:** `js/repositorio.js:1-15`
**Plain English:** Thumbnail bytes are base64-encoded into a data URL whose MIME type is always 'image/jpeg', whatever the real file type.
**Specification:**
  Given a thumbnail file Aula01_fondo.png (PNG bytes)
  When  it is rendered in the collection list
  Then  its src is 'data:image/jpeg;base64,<PNG bytes>'
**Parameters:** mimetype = 'image/jpeg' hardcoded
**Suspected defect:** PNG thumbnails are mislabeled as JPEG; browsers usually sniff and render them, but strict consumers may fail.
**Confidence:** High

## Validation

### RULE-031: Crop requires a crop zone and keeps zoom afterwards
**Category:** Validation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:12808-12851`
**Plain English:** Crop applies only when a crop rectangle exists. Afterwards drawing mode stops, the editor is resized to the cropped bounding box times the current zoom, and the crop menu is toggled.
**Specification:**
  Given A crop zone of 400x300 at zoom 2
  When  The user applies crop
  Then  The image is cropped and the wrapper becomes 800x600 px. With no crop zone, nothing happens
**Parameters:** Wrapper size = parseInt(parseInt(bbox)*zoom)
**Edge cases handled:** A missing crop rect is ignored silently; Cancel stops drawing mode and toggles the crop menu; Crop failures are re-rejected to the caller
**Confidence:** High

### RULE-032: Delete eligibility and multi-selection delete
**Category:** Validation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:14879-14904`
**Plain English:** An object can only be deleted when something is selected and it is not a text being edited. A multi-selection is wrapped in a new group and registered, so it can be deleted as one unit by id.
**Specification:**
  Given A text object that is selected and being edited
  When  Delete is requested
  Then  isReadyRemoveObject returns false and nothing is deleted
**Edge cases handled:** Nothing selected: returns a falsy value; activeSelection: a new fabric.Group of its objects is registered and that group's id is returned
**Confidence:** High

### RULE-033: Required-parameter guards on image loading and resize
**Category:** Validation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:1520-1556`
**Plain English:** Loading an image needs both a URL and a name; loading from a file needs a file and defaults the name to the file's name. Adding an image object needs a URL, and resizing the canvas needs dimensions.
**Specification:**
  Given A call to loadImageFromURL(url, name), loadImageFromFile(file, name), addImageObject(url, nombre), getFileURL(file) or resizeCanvasDimension(dim)
  When  A required argument is missing or falsy
  Then  The call is rejected with rejectMessages.invalidParameters and no command runs. Otherwise LOAD_IMAGE, ADD_IMAGE_OBJECT or RESIZE_CANVAS_DIMENSION runs as an undoable command
**Parameters:** Image name defaults to imgFile.name when loading from a file; addImageObject takes the file name 'nombre' and stores it on the image object (23.08.2019 change, line 1570)
**Edge cases handled:** getFileURL returns a rejected Promise when invalid but a plain string URL when valid (mixed return types, lines 1497-1506); resizeCanvasDimension at lines 2565-2572; addImageObject at lines 1568-1576
**Suspected defect:** loadImageFromFile calls URL.revokeObjectURL(imgFile), passing the File instead of the created object URL (line 1531), so the blob URL is never released. getFileURL never revokes its URL either.
**Confidence:** High

### RULE-034: Generate IDs for unnamed SVG children on import
**Category:** Validation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:20186-20192`
**Plain English:** When an SVG (such as a map) is imported, any element without an id whose parent has one gets the id '<parentId>_<n>', so pieces keep their positions and are not shifted.
**Specification:**
  Given An imported SVG group with id 'provincias' that contains three unnamed paths
  When  The SVG is parsed
  Then  The paths get the ids provincias_0, provincias_1 and provincias_2
**Parameters:** Separator '_'. The counter starts at 0 and is shared across the whole document, not reset for each parent.
**Edge cases handled:** Elements whose parent also has no id remain without an id; Because the counter is global, the second group's children continue the numbering (for example groupB_3); Ids are assigned to all descendants, including defs and clipPath children
**Confidence:** Medium — Should generated ids be numbered per parent (parent_0, parent_1 for each group) or globally as now? Do any downstream features (map region lookup) rely on these generated ids?

### RULE-035: Only one command may run at a time (execution lock)
**Category:** Validation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:4679-4681`
**Plain English:** While a command, undo or redo is in progress the editor is locked and any new edit request is rejected.
**Specification:**
  Given A rotate command is still executing (invoker locked)
  When  Another execute() call arrives
  Then  It is rejected with 'El estado de ejecución está bloqueado' and nothing is recorded
  And   The lock is set at start of execute/undo/redo invocation and released on both success and failure (4554, 4566, 4573, 4590, 4600, 4607)
**Parameters:** rejectMessages.isLock = 'El estado de ejecución está bloqueado' (5541)
**Edge cases handled:** Undo while locked: the popped command is put back onto the undo stack silently (no event) and undo is rejected with 'Se ha rechazado la promesa del comando Deshacer Because El estado de ejecución est…; Redo while locked: same pattern for redo stack (4782-4796)
**Confidence:** High

### RULE-036: Flip request must change at least one axis
**Category:** Validation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:47480-47499`
**Plain English:** A flip is only applied if the requested horizontal or vertical flip state differs from the current state; otherwise it is rejected.
**Specification:**
  Given The background image currently has flipX=false, flipY=false
  When  set({flipX:false, flipY:false}) is requested (e.g. reset on an unflipped image)
  Then  The promise is rejected with rejectMessages.flip and nothing changes; if flipX is requested true instead, the image is flipped and {flipX:true, flipY:false, angle} is returned
**Parameters:** rejectMessages.flip (consts module 73)
**Edge cases handled:** reset() on an already unflipped image always rejects; flipX()/flipY() toggle the current value so they always pass the guard; Undo of FLIP_IMAGE calls set(previousSetting) which always differs from current, so it passes
**Confidence:** High

### RULE-037: Add object only if not already on canvas
**Category:** Validation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:51743-51768`
**Plain English:** An object can only be added if it is not already on the canvas, and its undo removal only succeeds if it is still present.
**Specification:**
  Given An object already contained on the canvas
  When  ADD_OBJECT is executed with it
  Then  Rejected with rejectMessages.addedObject; undo of an absent object rejects with noObject
**Parameters:** rejectMessages.addedObject, rejectMessages.noObject
**Edge cases handled:** ADD_IMAGE_OBJECT, ADD_SHAPE and ADD_TEXT undo by removing the created object recorded at execute time (51680-51699, 51825-51845, 51901-51921); ADD_IMAGE_OBJECT passes the file name (nombre) to tag the image
**Confidence:** High

### RULE-038: Mask filter requires an image object and consumes it
**Category:** Validation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:51967-52015`
**Plain English:** A mask filter is only applied when the mask id refers to an existing image object; the mask object is removed from the canvas and restored and reselected on undo, while other filters snapshot prior options so undo reverts to them or removes the filter.
**Specification:**
  Given maskObjId refers to a rectangle shape
  When  APPLY_FILTER('mask', {maskObjId}) executes
  Then  Rejected with rejectMessages.invalidParameters; with a valid image mask, the mask is removed and the filter applied
**Parameters:** rejectMessages.invalidParameters; type 'mask' special-cased
**Edge cases handled:** Non-mask undo: if previous options existed, re-add filter with them; otherwise remove filter; REMOVE_FILTER snapshots options and re-adds them on undo (52592-52610)
**Confidence:** High

### RULE-039: Change icon colour guard and undo are broken
**Category:** Validation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:52063-52094`
**Plain English:** Changing an icon colour should reject when the icon is missing and undo should restore the old colour.
**Specification:**
  Given An icon object with colour '#ffbb3b'
  When  CHANGE_ICON_COLOR(id,'#000') is executed then undone
  Then  Execute stores undoData.object and undoData.color, but undo reads undoData.object.object and undoData.object.color, so it calls setColor(undefined, undefined)
**Edge cases handled:** When the object is missing, reject is called without return, so execution continues and getColor(undefined) is attempted
**Suspected defect:** Undo destructures the wrong fields (52087-52089) so the previous colour is never restored; missing return after reject at 52070-52072.
**Confidence:** High

### RULE-040: Target object must exist for object-modifying commands
**Category:** Validation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:52153-52170`
**Plain English:** Changing a shape, text, text style, object properties, position, icon colour or removing an object is rejected with 'noObject' when the given object id is not on the canvas; otherwise the previous values of exactly the changed keys are snapshotted for undo.
**Specification:**
  Given No object with id 42 exists
  When  CHANGE_SHAPE(42, {fill:'#fff'}) is executed
  Then  The command rejects with rejectMessages.noObject; if the object existed with fill '#000', undoData.options={fill:'#000'} and undo reapplies it
**Parameters:** rejectMessages.noObject; applies to CHANGE_SHAPE (52153-52170), CHANGE_TEXT (52231-52243), CHANGE_TEXT_STYLE (52312-52329), SET_OBJECT_PROPERTIES (52887-52904), SET_OBJECT_POSITION (52966-52980, snapshots only left/top), REMOVE_OBJECT (52654-52665, rejects when zero objects removed), CHANGE_ICON_COLOR (52063-52079)
**Edge cases handled:** SET_OBJECT_POSITION undo restores left/top only, not origin; REMOVE_OBJECT undo re-adds all removed objects (group members included)
**Confidence:** High

### RULE-041: Menu name must map to a registered tool component
**Category:** Validation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:6036-6057`
**Plain English:** Each configured menu name is capitalised and looked up in a fixed list of ten tool components; each gets a toolbar button with id tie-btn-<name> and its own submenu panel.
**Specification:**
  Given options.menu contains 'imagen'
  When  The submenus are built
  Then  The first letter is upper-cased to 'Imagen', the Imagen component is instantiated on the submenu container with the locale, theme submenu icon style and menu bar position, and a button #tie-btn-imagen with tooltip localize('Imagen') is appended to the menu
**Parameters:** Registered components (SUB_UI_COMPONENT, lines 5730-5742): Shape, Crop, Flip, Rotate, Text, Mask, Imagen, Icon, Draw, Filter
**Edge cases handled:** An unknown menu name (e.g. 'blur') yields an undefined component and the constructor call throws, aborting editor start-up; there is no friendly validation; Lookup is case-sensitive on the remainder of the name: 'Crop' passed in works, 'CROP' fails
**Confidence:** High

### RULE-042: User file load takes only the first selected file
**Category:** Validation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:6180-6187`
**Plain English:** When the user picks a file in any 'Load' input, only the first selected file is handed to the editor's load action; no file-type check is made at this layer.
**Specification:**
  Given The user selects photo.jpg in the header 'Cargar imagen' input
  When  The input fires its change event
  Then  main.load(photo.jpg) is invoked
**Parameters:** Inputs matched: all .tui-image-editor-load-btn (header at line 6573 and legacy controls at line 6705)
**Edge cases handled:** Cancelling the dialog passes files[0] = undefined to load; Type/size validation, if any, is in main.load, outside this range
**Confidence:** High

### RULE-043: Rotation step and +/-360 degree limit
**Category:** Validation
**Priority:** P1
**Source:** `dist/tui-image-editor.js:9102-9119`
**Plain English:** The rotate buttons turn the image by 30 degrees clockwise or counterclockwise, but only when the new total angle stays between -360 and +360 degrees.
**Specification:**
  Given The rotate value box shows 340 degrees
  When  The user clicks the clockwise button (+30)
  Then  The new angle would be 370, which is over 360, so nothing rotates. From 330, the same click rotates the image to 360.
**Parameters:** CLOCKWISE = +30 and COUNTERCLOCKWISE = -30 (around line 8996). Rotate slider defaultRotateRangeValus: min -360, max 360, default 0, realTimeEvent true (dist/tui-image-editor.js:5588-5593).
**Edge cases handled:** The limits are inclusive: exactly -360 and 360 are allowed; Slider moves call setAngle(angle, !isLast) at 9088-9094. While dragging, the change is a preview without undo. On release it is final; setRangeBarAngle at 9043-9052 adds the value for type 'rotate' and sets it outright for other types; The JBD 16.09.2019 helper _inicializarRangeBar at 9058-9063 resets both the slider and the value box to a given angle. The caller at line 11436 passes 0
**Confidence:** High

### RULE-044: Collection item list format and defaults
**Category:** Validation
**Priority:** P1
**Source:** `js/repositorio.js:34-57`
**Plain English:** Each collection has its own lista.txt with 'filename/tooltip/flag' lines; blank lines are skipped, the tooltip defaults to the filename, a thumbnail is fetched from the collection's thumbnails folder, and an item is only shown if its thumbnail loads and its name is not 'lista.txt'.
**Specification:**
  Given repositorios/escenarios/lista.txt line 'Aula01_fondo.png|Aula|tongaappfondo' and a thumbnail at repositorios/escenarios/thumbnails/Aula01_fondo.png
  When  the user opens the 'Espacios creativos' (escenarios) collection
  Then  a thumbnail with tooltip 'Aula' is listed; a line 'foo.png' with no pipes would show tooltip 'foo.png'
**Parameters:** Item list path = ./repositorios/<repo>/lista.txt; thumbnail path = ./repositorios/<repo>/thumbnails/<file>; full image path = ./repositorios/<repo>/<file>; excluded name = 'lista.txt'
**Edge cases handled:** Empty lines skipped (escenarios/lista.txt:1 is blank); Item whose thumbnail fails to load is silently omitted (error message shown); Items appear in order of thumbnail response, not file order (parallel async requests); Display order of duplicates labels (several 'Aula') is not deduplicated
**Confidence:** High

### RULE-045: Undo/redo only when history exists, and leaving crop mode first
**Category:** Validation
**Priority:** P1
**Source:** `legacy/tonga/dist/tui-image-editor.js:11301-11353`
**Plain English:** Undo and redo only run when their stacks are not empty. Before either runs, any open crop session is closed, and afterwards the rotate slider is synced to the restored angle if the rotate submenu is open.
**Specification:**
  Given The user is in the crop submenu and the undo stack has 2 entries
  When  The user presses Undo
  Then  Drawing mode stops, the crop menu is toggled off, one step is undone, and if the rotate submenu is active its range bar is set to the returned angle. With an empty undo stack nothing happens.
**Edge cases handled:** Empty redo stack makes redo a no-op; exitCropOnAction also runs before delete, deleteAll, initLoadImage and every file load
**Confidence:** High

### RULE-046: SVG import: the 'data-background' image becomes the canvas background
**Category:** Validation
**Priority:** P1
**Source:** `legacy/tonga/dist/tui-image-editor.js:11489-11555`
**Plain English:** In an imported SVG, an image element whose 'nombre' attribute is 'data-background' becomes the locked background image. It sets the canvas size, rotation slider and cached background binary. All other images and shapes are added as movable objects.
**Specification:**
  Given An SVG with one image (nombre='data-background', 800x600, angle 29.6) and two paths
  When  It is imported
  Then  The canvas is resized to 800x600, the rotate slider is set to 30 (Math.round of the angle), the image becomes the background, its xlink:href is cached as the background binary, and both paths are added as objects.
**Edge cases handled:** Images without the marker are added as floating objects; If several images carry the marker, each one overwrites the background and the last one wins
**Confidence:** Medium — P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (Faithful. legacy/tonga/dist/tui-image-editor.js:11501-11552 does what the rule says. An image with xlink:href and nombre==='data-background' sets the canvas width and height and calls resizeEditor. The rotate slider gets Math.round(element.angle), so 29.6 becomes 30. The image becomes the background…

### RULE-047: Recognize the app's own transparent background on re-import
**Category:** Validation
**Priority:** P1
**Source:** `legacy/tonga/dist/tui-image-editor.js:11707-11729`
**Plain English:** If an imported SVG's background exactly matches the editor's own embedded 'transparent' data URL, it is swapped for the fake transparent (checkerboard) background before fitting. Otherwise the background is fitted as-is and undo history is cleared.
**Specification:**
  Given An SVG previously exported with the editor's transparent background
  When  It is re-imported
  Then  The background is replaced by 'transparente_falso.png', setFitFondo(width, height) runs, and the undo stack is cleared.
**Parameters:** Hardcoded base64 PNG of the transparent background (labelled data:image/jpeg) at line 11710
**Suspected defect:** Detection is an exact match on one hardcoded string, so any re-encoding of the background breaks it. The transparent flag (setFondoTransparente) is not set back to true here.
**Confidence:** Medium — Is an exact string match on the embedded data URL a reliable way to recognize the app's transparent background, given that the data URL prefix says jpeg but the content is a PNG?

### RULE-048: Filter toggle applies or removes only if present
**Category:** Validation
**Priority:** P2
**Source:** `dist/tui-image-editor.js:12905-12911`
**Plain English:** Checking a filter applies it with its options. Unchecking removes it only if that filter is currently applied.
**Specification:**
  Given The 'grayscale' filter is not applied
  When  The user unchecks grayscale
  Then  Nothing happens. If grayscale were applied, it would be removed
**Edge cases handled:** Mask filter: the current canvas is flattened as 'FilterImage', the mask image is added as an object, and applyFilter('mask') uses the active object id (12641-12652)
**Confidence:** High

### RULE-049: Shape stroke clamped when object shrinks
**Category:** Validation
**Priority:** P2
**Source:** `dist/tui-image-editor.js:13015-13031`
**Plain English:** After scaling a shape, if its width or height is smaller than the current stroke width, the stroke is reduced to that dimension. After scaling text, the UI font size is synced to the integer font size.
**Specification:**
  Given Stroke 20 and a rectangle scaled to width 10, height 15
  When  objectScaled fires
  Then  The stroke is first set to 10 (width), then also to 15 because the height check uses the original 20, so the final stroke is 15
**Parameters:** Compares against the stroke value read once before both checks
**Edge cases handled:** When both dimensions are smaller than the stroke, the height wins even if the width is smaller
**Suspected defect:** It should clamp to min(width,height); the sequential checks use the stale stroke value and can leave the stroke larger than the width.
**Confidence:** High

### RULE-050: Empty text defaults
**Category:** Validation
**Priority:** P2
**Source:** `dist/tui-image-editor.js:1968-1990`
**Plain English:** Adding or changing text with no content uses an empty string instead of failing.
**Specification:**
  Given addText() or changeText(id) is called with undefined text
  When  The command runs
  Then  The text is set to '' and the ADD_TEXT/CHANGE_TEXT command runs (undoable)
**Parameters:** default text=''
**Edge cases handled:** The options object defaults to {}
**Confidence:** High

### RULE-051: Object property lookup returns null for unknown id
**Category:** Validation
**Priority:** P2
**Source:** `dist/tui-image-editor.js:2672-2680`
**Plain English:** Asking for the properties of an object that does not exist returns nothing instead of an error.
**Specification:**
  Given No object with id 99 exists
  When  getObjectProperties(99, ['left','top']) is called
  Then  It returns null. For an existing id it returns the requested properties
**Parameters:** keys may be a string, an array, or an object template
**Edge cases handled:** setObjectProperties is undoable (SET_OBJECT_PROPERTIES), setObjectPropertiesQuietly is not (lines 2626-2648)
**Confidence:** High

### RULE-052: Commands must be registered by name before use
**Category:** Validation
**Priority:** P2
**Source:** `dist/tui-image-editor.js:4952-4976`
**Plain English:** A command can only be created if a command with that name has been registered; unknown names produce no command.
**Specification:**
  Given Registered commands include 'rotate' but not 'skew'
  When  create('skew', 90) is called
  Then  null is returned (and the invoker later fails on it)
**Parameters:** Command names list at 5439-5461 (clearObjects, loadImage, flip, rotate, addObject, removeObject, applyFilter, removeFilter, addIcon, changeIconColor, addImagen, changeImagenColor, addShape, changeShape, addText, changeText, changeTextStyle, addImageObject, resizeCanvasDimension, setObjectProperties, setObjectPosition)
**Edge cases handled:** Registering the same name twice overwrites the earlier definition; Commands carry name, execute, undo, optional executeCallback/undoCallback and an undoData store (5040-5084)
**Confidence:** High

### RULE-053: Custom image upload requires a selected file
**Category:** Validation
**Priority:** P2
**Source:** `dist/tui-image-editor.js:53229-53243`
**Plain English:** Registering a custom image from the image submenu creates a local object URL from the first chosen file and passes it with the file to registerCustomImagen; adding an image first clears selection and disables selectability of all objects.
**Specification:**
  Given The user picks file 'cangrejo.png'
  When  The file input change event fires
  Then  registerCustomImagen(blobUrl, file) is called; with no file nothing happens
**Edge cases handled:** Browser without File API: an alert is shown but execution continues anyway; _addImagenHandler (53202-53220) only discards selection and sets all objects non-selectable
**Suspected defect:** Missing return after the unsupported-File-API alert (53232-53234).
**Confidence:** High

### RULE-054: Local image upload accepts image files only
**Category:** Validation
**Priority:** P2
**Source:** `dist/tui-image-editor.js:53290-53303`
**Plain English:** Besides the library, the user can load their own picture via a 'Cargar Imagen' file picker restricted to image file types.
**Specification:**
  Given the Imagen submenu is open
  When  the user clicks 'Cargar Imagen'
  Then  the file dialog offers only files matching accept='image/*'
**Parameters:** accept = 'image/*' (browser-side filter only, no server or content check here)
**Confidence:** Medium — Is there any size or format limit on user-uploaded images enforced elsewhere, or is the browser accept filter the only check?

### RULE-055: User-facing rejection reasons (Spanish)
**Category:** Validation
**Priority:** P2
**Source:** `dist/tui-image-editor.js:5531-5560`
**Plain English:** Rejected operations report one of a fixed set of Spanish messages describing why the edit is not allowed.
**Specification:**
  Given An operation is refused (e.g. rotating to the same angle)
  When  The command rejects
  Then  The message 'Este ángulo es el mismo que el anterior' (or the relevant entry) is returned
**Parameters:** addedObject, flip (flipX/flipY unchanged), invalidDrawingMode, invalidParameters, isLock, loadImage (no background), loadingImageFailed, noActiveObject, noObject, redo, rotation, undo, unsupportedOperation, unsupportedType
**Edge cases handled:** Error-message factory (5183-5192) lowercases the type key while map keys are uppercase, so createMessage would throw instead of producing 'Should implement a method: ...'
**Suspected defect:** errorMessage.create lowercases the type but looks it up in an uppercase-keyed map, resulting in calling undefined.
**Confidence:** High

### RULE-056: Text style toggles and font-size change guard
**Category:** Validation
**Priority:** P2
**Source:** `dist/tui-image-editor.js:9347-9463`
**Plain English:** Text effects (bold, italic, underline) and font family are sent as style changes. Font size is sent only when the integer value really changes.
**Specification:**
  Given Font size box shows 50
  When  The slider produces 50.4
  Then  toInteger gives 50, which equals the current value, so no change is sent. 51 would send fontSize 51.
**Parameters:** Fonts: arial, courier, helvetica, Verdana, Open Sans, Roboto. Underline uses {underline: true} (JBD 22.08.2019 replaced textDecoration). Align: left, center, right.
**Edge cases handled:** The bold, italic and underline handlers always send the 'on' style (fontWeight bold and so on) and only flip local state and the button class. Whether turning a style off works depends on the downstr…; An empty colour becomes 'transparent'
**Confidence:** Medium — Does clicking Bold a second time remove the bold style? The handler always sends fontWeight 'bold'.

## Lifecycle

### RULE-057: Free/line drawing mode lifecycle with fixed 70% opacity
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:10436-10526`
**Plain English:** The draw menu starts in free-hand mode. Clicking the active line type again switches drawing off. Any colour or width change starts drawing if it is off, and every stroke uses 70% opacity.
**Specification:**
  Given Draw colour #00a9ff and width 12
  When  The draw menu opens
  Then  type = 'free' and setDrawMode('free', {width: 12, color: rgba(0,169,255,0.7)})
**Parameters:** DRAW_OPACITY = 0.7 (10375). Line types: free, line.
**Edge cases handled:** Standby resets type to null, stops drawing and makes all objects selectable; An empty colour becomes 'transparent'; The width is converted to an integer
**Confidence:** High

### RULE-058: Export with real background, then restore the placeholder background without touching undo history
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:12269-12395`
**Plain English:** Before a download, the editor swaps the on-screen placeholder background for the real background (transparent or white) fetched from the server, downloads using the teacher's rotation, then puts the placeholder back. Every intermediate rotation or removal is popped from the undo stack so the user's history is unchanged.
**Specification:**
  Given The canvas image is rotated 90 degrees and the real background URL returns HTTP 200
  When  sustituirFondo(imagen, 'PNG', 'ficha', eliminarObjetoFondoEditor) runs
  Then  Rotate by -90 (to 0) and pop undo; load the real background; rotate +90 and pop undo; download 'ficha' as PNG; if eliminarObjetoFondoEditor is true, remove the active object and pop undo; rotate -90 and pop undo; load the fake transparent background (getFondoTransparenteFalso); rotate +90 and pop undo
**Parameters:** Real background is fetched as an arraybuffer with axios and base64-encoded with _imageEncode; eliminarObjetoFondoEditor defaults to false; backgrounds are stored at angle 0 (landscape)
**Edge cases handled:** A non-200 response does nothing and gives no feedback; A network error writes 'Error de conexión <err>' into a global 'mensaje' element; eliminarObjetoFondoEditor=true removes whichever object is active (meant to be the JPG background object), after force-unlocking the invoker (_isLocked=false); The download fires before the placeholder is restored, so it captures the real background
**Suspected defect:** removeActiveObject deletes whatever is currently selected, which could be a user object. Undo pops assume each operation pushed exactly one entry; a no-op rotation (angle 0) may not push one, and the pop would then remove a real user undo entry.
**Confidence:** Medium — When eliminarObjetoFondoEditor is true, is the active object guaranteed to be the background object (for example the white JPG background)? Should a non-200 response or fetch error stop the download and tell the user?

### RULE-059: Hot background reload keeps floating objects and the current rotation
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:12398-12426`
**Plain English:** Loading a new background while editing keeps all overlaid objects. The canvas is turned back to 0 degrees, the landscape-stored background is loaded and its binary is stored as the current background, then the original angle is restored and the zoom is fitted to the new image size.
**Specification:**
  Given The canvas is rotated 180 degrees and has 5 overlaid objects
  When  cargarFondo('fondo.png', imgUrl) is called
  Then  Rotate -180, load the new background, setImagenBinario(imgUrl), rotate +180, then call setFitFondo(newImage.width, newImage.height). All 5 objects remain
**Parameters:** Backgrounds are assumed to be stored at angle 0
**Edge cases handled:** The rotations are not awaited (unlike sustituirFondo), so the load can race the first rotation; The rotations are NOT removed from the undo stack here, so the user sees two extra undo steps
**Suspected defect:** The rotations are not awaited and they leave entries in the undo stack, which is inconsistent with sustituirFondo.
**Confidence:** Medium — Should a hot background reload appear in the undo history? sustituirFondo removes its rotations from undo, but cargarFondo does not.

### RULE-060: Undo/redo availability follows stack depth
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:12922-12954`
**Plain English:** The Undo button is enabled whenever the undo stack is non-empty, and Redo whenever the redo stack is non-empty. Any redo-stack change also resizes the editor to the current image bounding box so the zoom stays in sync.
**Specification:**
  Given The undo stack has 3 entries and the redo stack has 0
  When  The stacks change
  Then  Undo is enabled and Redo is disabled; the editor UI and image size are set to the bbox at scale 1
**Edge cases handled:** Reset-button toggling is commented out; The resize uses the unzoomed bbox for both uiSize and imageSize
**Confidence:** High

### RULE-061: Selected object type drives active menu and shape stroke limit
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:12956-13039`
**Plain English:** Selecting an object records it as active, enables Delete/Delete All, and switches to the matching submenu: cropzone enables Apply; rect/circle/triangle go to Shape with max stroke = min(width,height); path/line go to Draw; text goes to Text; icon goes to Icon with its colour. Clearing the selection drops the active id and stops drawing unless the Draw or Crop menu is open.
**Specification:**
  Given The user selects a 50x30 rectangle while in the Text menu
  When  objectActivated fires
  Then  The menu switches to Shape, the stroke/fill status is loaded, and the max stroke slider is 30
**Parameters:** Shape types: rect, circle, triangle; text types: i-text, text
**Edge cases handled:** Selection cleared while in Text: the cursor becomes 'text'; Images and other types: only the delete buttons are enabled; addObjectAfter for new shapes also sets max stroke = min(w,h) and standby mode
**Confidence:** High

### RULE-062: Undoable vs silent command execution
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:1428-1487`
**Plain English:** Every editing operation goes through a command invoker that records it on the undo stack. Silent execution applies the change without recording history. Undo and redo replay that history.
**Specification:**
  Given An edit such as addShape, applyFilter, flip or rotate (non-silent)
  When  The edit is executed
  Then  The invoker runs the command with the Graphics instance injected as the first argument and pushes it onto the undo stack. Undo/redo stack-length changes are re-emitted as undoStackChanged/redoStackChanged events (lines 1061-1088)
**Parameters:** Silent path: executeSilent (used by rotate/setAngle when isSilent=true, and by setObjectPropertiesQuietly which bypasses the invoker entirely)
**Edge cases handled:** Objects created interactively on the canvas (addObject event) get an ADD_OBJECT command pushed directly onto the undo stack without re-executing it (lines 1282-1286, 2119-2123); Changing text in place fires textChanged, which runs a CHANGE_TEXT command so the edit is undoable (lines 2034-2037); clearUndoStack/clearRedoStack/isEmpty* expose the stack state (lines 2521-2557)
**Confidence:** Medium — P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (The rule card matches the code. Lines 1428-1462 add the Graphics instance as the first argument and pass the call to the invoker's execute or executeSilent. The invoker code outside the cited range confirms the rest. Around line 4562, _invokeExecution only pushes to the undo stack when _isSilent is…

### RULE-063: Object registry lifecycle and delete-by-id
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:14820-14839`
**Plain English:** Every object added to the canvas (except the crop zone) gets a unique id in a registry and is dropped from it on removal. Deleting by id removes all members of a non-empty group, or just the single object if it is on the canvas.
**Specification:**
  Given A group with id 42 that contains 3 shapes
  When  removeObjectById(42) is called
  Then  The active selection is discarded, the 3 shapes are removed from the canvas, and the 3 shapes are returned
**Parameters:** Crop zone objects are excluded from the registry (lines 15912-15920)
**Edge cases handled:** Empty group or id not on the canvas: nothing is removed and [] is returned; removeAll(true) also clears the background image; removeAll(false) keeps it (14801-14812)
**Confidence:** High

### RULE-064: Drawing mode state machine
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:14996-15030`
**Plain English:** The editor is in exactly one drawing mode at a time (NORMAL, CROPPER, FREE_DRAWING, LINE_DRAWING, SHAPE or TEXT). Starting a new mode first ends the current one and returns to NORMAL.
**Specification:**
  Given The editor is in FREE_DRAWING mode
  When  startDrawingMode('SHAPE') is called
  Then  The free-drawing end() hook runs, the mode resets to NORMAL, the shape start() hook runs and the mode becomes SHAPE. The call returns true
**Parameters:** Initial mode NORMAL; registered modes: cropper, freeDrawing, lineDrawing, shape, text (lines 15755-15762)
**Edge cases handled:** Requesting the current mode is a no-op that returns true; Unknown mode: the old mode is still stopped, the mode stays NORMAL and the call returns false; If an instance has no start(), the call returns true but the mode stays NORMAL; Stopping while already in NORMAL does nothing
**Suspected defect:** An unknown mode stops the active mode before failing, which is a side effect on a failed call.
**Confidence:** High

### RULE-065: Paste source tracking (chained pastes)
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:16118-16155`
**Plain English:** Copy remembers the selected object or multi-selection. Paste clones every member, adds each clone with an ADD_OBJECT event and selects the result. The new copy then becomes the next paste source, so repeated pastes step across the canvas.
**Specification:**
  Given A copied selection of 2 objects
  When  Paste is invoked twice
  Then  The first paste adds 2 clones offset by about 10 px and selects them as a group. The second paste clones those clones, offsetting by about 20 px from the original
**Edge cases handled:** Nothing copied: resolves to [] and does nothing; Copy with nothing selected keeps the previous paste source; Single clone: it is selected directly; several clones: an ActiveSelection is built
**Confidence:** High

### RULE-066: Crop reloads the cropped region as the new base image
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:1620-1628`
**Plain English:** Cropping takes the selected rectangle, turns it into new image data and loads it as the new working image. An invalid crop area is rejected.
**Specification:**
  Given A crop rectangle {left, top, width, height}, for example from getCropzoneRect()
  When  crop(rect) is called
  Then  If the graphics layer returns cropped image data, that data URL is loaded via LOAD_IMAGE under the same image name (undoable). If no data comes back, the promise rejects with invalidParameters
**Parameters:** Crop-zone presets passed to setCropzoneRect: ratios 1, 1.5, 1.3333, 1.25, 1.7778 (JSDoc line 1642)
**Edge cases handled:** An empty or invalid rectangle makes getCroppedImageData return falsy, so the crop is rejected
**Confidence:** Medium — Which rectangles make getCroppedImageData return no data (zero size, outside the canvas)? Is a minimum crop size enforced in the Graphics/Cropper component?

### RULE-067: Reload last file or reset editor
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:2376-2399`
**Plain English:** Reload clears the canvas and loads the last opened file again. If no file was loaded, it re-initialises the canvas and sets zoom back to 1. In both cases the command lock is released.
**Specification:**
  Given The user previously loaded file F through the UI
  When  recargar() is called
  Then  The canvas is cleared and F is loaded again. Otherwise (no file) the UI canvas is re-initialised and zoom is set to 1. Finally invoker._isLocked is forced to false
**Parameters:** Source of last file: ui._actions.main.ficheroCargado; reset zoom=1
**Edge cases handled:** The undo/redo stacks are not cleared here; The lock is force-cleared even if a command is still running
**Suspected defect:** this.ui._actions is dereferenced before the `if (this.ui)` check, so reload throws when the editor is created without includeUI. Forcing _isLocked=false hides a lock-leak bug instead of fixing it (24.09.2019 comment).
**Confidence:** High

### RULE-068: Start new blank (transparent) project
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:2409-2469`
**Plain English:** Starting a new project clears the canvas, resets rotation to 0 and zoom to 1, marks the background as transparent, and loads a placeholder transparent image as the background. The undo history is then emptied.
**Specification:**
  Given An editor with existing content
  When  comenzar() is called
  Then  The canvas is cleared, the rotation slider and angle are set to 0, fondoTransparente=true, and ./img/transparente_falso.png is fetched. On HTTP 200 it is encoded and stored as the fake-transparent background and the image binary, loaded via the image loader (not as a command), fitted to the canvas, and clearUndoStack() runs
**Parameters:** Placeholder asset './img/transparente_falso.png' (fetched by getTransparenteFicticioToDataURL, lines 2479-2485); success requires status==200; angle=0; zoom=1
**Edge cases handled:** A non-200 response silently does nothing more, but the canvas is already cleared and the transparent flag is already true; A fetch error writes 'Error de conexión <err>' to a global 'mensaje' element; setAngle(0) is recorded as an undoable command, then wiped by clearUndoStack
**Suspected defect:** Refers to the global 'imageEditor' instead of 'this', so it breaks with any other instance name or with several instances. It does not return the promise, so callers cannot await completion, and it depends on global 'axios', 'mensaje' and '_imageEncode'.
**Confidence:** High

### RULE-069: Freehand drawings flagged as newly created PATH objects
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:24757-24759`
**Plain English:** A freehand stroke drawn by the user is marked as a new object of type PATH. This tells it apart from objects loaded from an SVG, which flip and rotate around their centre instead of their left edge.
**Specification:**
  Given The user finishes a freehand brush stroke
  When  The path is added to the canvas
  Then  The path gets nuevoObjeto=true and tipo='PATH'. Flipping the canvas later (line 47539 onward) uses edge-based repositioning for new objects, while loaded SVG objects use centre-based repositioning
**Parameters:** nuevoObjeto=true; tipo='PATH'
**Edge cases handled:** Paths loaded from SVG have no nuevoObjeto flag, so it defaults to false; nuevoObjeto is not exported to SVG, so after save and reload a drawn path is treated as a loaded object
**Confidence:** Medium — After a save and reload, nuevoObjeto is lost and the object switches to centre-based flipping. Is that the intended behaviour?

### RULE-070: New edit is recorded in undo history and wipes redo history
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:4674-4698`
**Plain English:** Every successful new edit command is pushed onto the undo history and any pending redo history is discarded.
**Specification:**
  Given An editor with undo stack [addText] and redo stack [rotate] and the invoker unlocked
  When  The user performs a new edit, e.g. execute('flip', ...), and the command's promise resolves
  Then  Undo stack becomes [addText, flip] (undoStackChanged fired with 2), redo stack is cleared to [] (redoStackChanged fired with 0), then the command's executeCallback is invoked with the result
  And   If the command fails (promise rejects), nothing is pushed, the redo stack is left intact, the lock is released and the rejection is propagated
**Parameters:** Events: undoStackChanged, redoStackChanged (payload = stack length)
**Edge cases handled:** A string command name is resolved via the command factory (module 69); an unregistered name yields null and execution then throws on null.args; Missing args are treated as an empty argument list (4556-4560); Redo stack is only cleared after success (4693-4697)
**Confidence:** Medium — P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (Compliance lens: this is undo/redo bookkeeping in a client-side image editor. It moves no money, enforces no legal or regulatory requirement, and creates no audit trail a controller would rely on. Undo history lives in memory and is a UX convenience, not a record of business transactions. If it chan…

### RULE-071: Undo moves the last edit to redo history
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:4704-4769`
**Plain English:** Undo takes the most recent edit off the undo history, reverses it, and on success places it on the redo history.
**Specification:**
  Given Undo stack [addText, flip], redo stack [], unlocked
  When  The user presses undo
  Then  flip is popped, its undo action runs; on success redo stack becomes [flip] (redoStackChanged 1) and undoCallback fires
  And   undoStackChanged is fired only when the pop leaves the undo stack empty (event fired with 0 before the undo runs); otherwise no undo-change event is fired on pop
**Parameters:** rejectMessages.undo (5555)
**Edge cases handled:** Empty undo stack: intended to reject with 'Se ha rechazado la promesa del comando Deshacer', but see suspected defect; If the undo action fails, the command is lost from both stacks (not pushed back)
**Suspected defect:** Line 4728 reads command.name after command may be null/undefined (empty stack or locked case set command=null at 4713), so undo on an empty or locked stack throws a TypeError instead of returning the rejected promise. Also, undo failure drops the command from history entirely.
**Confidence:** Medium — Should an undo on an empty history silently no-op, and should a failed undo restore the command to the undo stack?

### RULE-072: Redo re-executes the last undone edit and returns it to undo history
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:4775-4840`
**Plain English:** Redo takes the most recently undone edit, re-executes it, and on success records it again in undo history without clearing remaining redo entries.
**Specification:**
  Given Undo stack [addText], redo stack [rotate, flip], unlocked
  When  The user presses redo
  Then  flip is popped and re-executed; on success undo stack becomes [addText, flip] and redo stack remains [rotate]
  And   redoStackChanged is fired only when the pop empties the redo stack
**Parameters:** rejectMessages.redo (5551)
**Edge cases handled:** Redo uses _invokeExecution directly, so (unlike a fresh edit) remaining redo entries are preserved; Empty or locked redo stack: same null command.name crash as undo (4799)
**Suspected defect:** Line 4799 dereferences command.name when command is null/undefined, throwing instead of rejecting when the redo stack is empty or the invoker is locked.
**Confidence:** High

### RULE-073: Undo of image flip restores prior flip setting
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:52445-52461`
**Plain English:** Before flipping (flipX, flipY or reset), the current flip state is saved and undo reapplies exactly that state.
**Specification:**
  Given Image state flipX=false, flipY=true
  When  FLIP_IMAGE('flipX') executes and then is undone
  Then  Undo calls set({flipX:false, flipY:true}), re-mirroring objects back
**Parameters:** type in {'flipX','flipY','reset'}
**Confidence:** High

### RULE-074: Loading a new background image keeps overlays and supports undo
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:52505-52549`
**Plain English:** Loading a new main image removes all objects (discarding any crop zone), re-enables events on them, remembers the previous image/name/objects for undo, and reports old and new image dimensions.
**Specification:**
  Given Current image 800x600 with two overlays and an active crop zone
  When  LOAD_IMAGE('new', url) loads a 1024x768 image
  Then  Result is {oldWidth:800, oldHeight:600, newWidth:1024, newHeight:768}; the crop zone is dropped; undo removes all and re-adds the two overlays and reloads the previous image
**Parameters:** cropzone type excluded; dimensions 0 when no previous image
**Edge cases handled:** No previous image: oldWidth/oldHeight = 0; Overlays are not re-added after execute (only on undo) per this code path
**Confidence:** Medium — After loading a new image, overlays are removed from the canvas and only re-added on undo; should overlays persist onto the new image?

### RULE-075: Undo/redo of image rotation
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:52787-52833`
**Plain English:** A rotate command records the prior angle (unless silent); undo restores the stored absolute angle for setAngle, or applies the opposite increment for a relative rotate.
**Specification:**
  Given Image angle 90 and the user runs ROTATE_IMAGE('rotate', 30)
  When  Undo is invoked
  Then  rotate(-30) is applied yielding 90; for ROTATE_IMAGE('setAngle', 45) undo calls setAngle(90) using the stored angle
**Parameters:** type in {'rotate','setAngle'}; isSilent flag suppresses capturing undo angle
**Edge cases handled:** Silent setAngle executions store no undoData.angle, so undoing them would call setAngle(undefined)
**Confidence:** High

### RULE-076: Edit-history and delete button enablement
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:5912-5981`
**Plain English:** Undo, Redo, Delete and Delete-all buttons are shown as enabled or disabled according to a boolean pushed by the editor (e.g. undo stack non-empty, an object selected); the Reset button was removed.
**Specification:**
  Given The undo stack becomes non-empty
  When  changeUndoButtonStatus(true) is called
  Then  \#tie-btn-undo gets class 'enabled'; when called with false the class is removed. Same pattern for redo, delete, delete-all
**Parameters:** Buttons: #tie-btn-undo, #tie-btn-redo, #tie-btn-delete, #tie-btn-delete-all; reset button and changeResetButtonStatus commented out (lines 5942-5951, 6673-6679)
**Edge cases handled:** The comment 'OCULTO-UNDO-REDO Quito el menú de undo-redo' claims undo/redo were removed, yet the code still renders (6659-6672), wires (6240-6241) and toggles them; behaviour follows the code; Enabled state is visual only (CSS class); the click handler is attached regardless and always invokes the action
**Suspected defect:** Comment/code mismatch: undo/redo are described as removed but are still active.
**Confidence:** Medium — Should undo/redo be available to Tonga users (the code keeps them) or hidden (as the 02.09.2019 comment says)? And should clicks on a disabled button be blocked rather than only styled?

### RULE-077: One-time activation of menu and header actions
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:6232-6272`
**Plain English:** The toolbar and header actions (undo, redo, delete, delete-all, zoom out/in, send backward/bring forward, reload last file, reload page, start with transparent background, downloads and every tool menu) are wired exactly once, after which the configured initial menu is opened and default icons registered.
**Specification:**
  Given Menu events have not yet been activated
  When  activeMenuEvent runs
  Then  Each header action is bound to the matching main action (smaller, bigger, zabajo, zarriba, recargar, reload, comenzar, etc.), download and menu/submenu events are bound, the initial menu is opened, and _initMenuEvent becomes true so later calls do nothing
**Parameters:** Header actions: undo, redo, delete, deleteAll, smaller, bigger, zabajo, zarriba, recargar, reload, comenzar; reset excluded
**Edge cases handled:** If options.initMenu is set, a synthetic click on its button opens that tool (lines 6394-6411); Default icons for the Icon tool are registered; the Imagen default registration is commented out as unused (13.09.2019); Second call is a no-op thanks to the _initMenuEvent guard
**Confidence:** High

### RULE-078: Initial image load gates toolbar activation
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:6280-6301`
**Plain English:** If a start image is configured, it is loaded first and the toolbar only becomes active once loading succeeds; without a start image the toolbar stays inactive until a user loads a file.
**Specification:**
  Given options.loadImage.path = 'img/fondo.png'
  When  initCanvas runs
  Then  initLoadImage(path, name) is called and on success activeMenuEvent is invoked; the file-load inputs are always wired and a 3x3 corner grid overlay is added to the canvas container
**Parameters:** loadImage.path / loadImage.name
**Edge cases handled:** Empty path: menus are not activated here; activation happens after a user file load (callers at lines 11699, 11738); If initLoadImage rejects, menus are never activated by this path (no error handling)
**Confidence:** Medium — Is it intended that with no start image every tool and header button (including download) is unusable until the user loads a file?

### RULE-079: Tool submenu open/close state machine
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:6323-6361`
**Plain English:** Only one tool submenu can be active at a time: opening a tool closes the previous one (putting it in standby, dropping the current object selection and making every object selectable again), and clicking the active tool again closes it.
**Specification:**
  Given The 'draw' submenu is active and the user clicks the 'text' menu button (toggle=true, discardSelection=true)
  When  changeMenu('text') runs
  Then  draw's button loses 'active', the main element loses class tui-image-editor-menu-draw, the current selection is discarded, all objects become selectable, draw enters standby mode; then text's button gets 'active', main gets tui-image-editor-menu-text, submenu = 'text' and text enters start mode
**Parameters:** States: submenu = null/false (none) or one menu name; toggle default true; discardSelection default true
**Edge cases handled:** Clicking the already-active tool with toggle=true sets submenu to null (no tool active) after putting it in standby; With toggle=false the same tool is re-entered (standby then start again) instead of closing; discardSelection=false keeps the selected object across the switch; Re-entrancy guard: a changeMenu call made while another menu change is in progress (_submenuChangeTransection = true) is silently ignored
**Confidence:** Medium — P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (The card describes the code accurately. In legacy/tonga/dist/tui-image-editor.js:6342-6361, _changeMenu does this when a submenu is already active: it removes 'active' from that submenu's button and removes the menu class from the main element. If discardSelection is set, it calls discardSelection.…

### RULE-080: Shape tool selection toggle and stroke/fill updates
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:7537-7604`
**Plain English:** Choosing a shape (circle, triangle or rect) puts the editor in shape-drawing mode and locks other objects. Choosing the same shape again goes back to standby.
**Specification:**
  Given The shape submenu is in standby (type null)
  When  The user clicks 'rect', then clicks 'rect' again
  Then  First click: drawing stops, the selection is cleared, type = rect, all objects become non-selectable, mode = 'shape'. Second click: standby, type = null, objects selectable again.
**Parameters:** Shape types: circle, triangle, rect. An empty colour becomes 'transparent'. Stroke width is converted to an integer for options and the display.
**Edge cases handled:** setMaxStrokeValue at 7501-7508: a max of 0 or less falls back to the default max of 300; setShapeStatus (JBD 11.03.2020 COPY-PASTE, 7455-7472) no longer fires the stroke change event. It calls setDrawingShape with only strokeWidth, so the stroke and fill colours of the copied shape are n…; changeShape receives the raw value while options get the integer (7566-7571)
**Suspected defect:** After copy-paste, setShapeStatus passes only strokeWidth to setDrawingShape. New shapes may not pick up the copied shape's colours.
**Confidence:** Medium — After a copy-paste, should new shapes take the pasted shape's stroke and fill colours as well as its stroke width?

### RULE-081: Crop apply/cancel and preset selection
**Category:** Lifecycle
**Priority:** P1
**Source:** `dist/tui-image-editor.js:8486-8562`
**Plain English:** The crop menu enters crop mode. Choosing a preset ratio draws a crop zone with that ratio. Apply crops and Cancel abandons, and both turn off the apply button. Standby goes back to the default 'Custom' preset.
**Specification:**
  Given Crop mode is active
  When  The user clicks the 4:3 preset and then Apply
  Then  preset('preset-4-3') draws the crop zone, and crop() is executed. The apply button loses its active state.
**Parameters:** Presets from the template (8590-8640): preset-none (Custom, active by default), preset-square, preset-3-2, preset-4-3, plus others further down
**Edge cases handled:** The apply button is made active from outside through changeApplyButtonStatus(true)
**Confidence:** High

### RULE-082: Editor starts on the Tonga welcome image
**Category:** Lifecycle
**Priority:** P1
**Source:** `index.html:258-268`
**Plain English:** When the app opens, the canvas is pre-loaded with the welcome image 'Tonga_pantalla_inicio_v2.jpg', named 'ImagenInicial', before the user starts a drawing.
**Specification:**
  Given A user opens index.html
  When  The editor finishes initialising
  Then  The canvas shows img/Tonga_pantalla_inicio_v2.jpg with the internal image name 'ImagenInicial' (initial state before editing)
**Parameters:** loadImage.path = img/Tonga_pantalla_inicio_v2.jpg; loadImage.name = ImagenInicial; earlier candidates commented out (sampleImage2.png, mar.jpeg, Home_Tonga-02.jpg, etc.)
**Edge cases handled:** The move from welcome image to empty transparent canvas happens in imageEditor.comenzar() (dist/tui-image-editor.js:2410), which clears the canvas, resets rotation to 0 and sets a transparent backgro…; index.html:124-126 defines lanzarComenzar() -> imageEditor.comenzar(), but its only caller (the central 'Comenzar' button, lines 94-96 and 101-123) is commented out, so the global wrapper is dead cod…
**Confidence:** Medium — Should a new session always open on the welcome image and require an explicit 'Comenzar' action to get a blank transparent canvas, or should it start on a blank canvas?

### RULE-083: Inserting a repository image adds it as a named custom image object
**Category:** Lifecycle
**Priority:** P1
**Source:** `js/repositorio.js:106-125`
**Plain English:** Choosing a non-background item downloads the full-size image (not the thumbnail) and registers it on the canvas as a custom image object labeled with its file name.
**Specification:**
  Given collection 'aves' and item 'canario.png'
  When  the user double-clicks the thumbnail
  Then  ./repositorios/aves/canario.png is fetched, converted to a data URL and passed to the 'imagen' action registerCustomImagen(dataURL, 'canario.png'); a beep plays
**Parameters:** Source path = ./repositorios/<repo>/<alt>
**Edge cases handled:** No error handling: failed download inserts nothing and gives no message; Beep plays before the download completes
**Confidence:** High

### RULE-084: Loading a repository background resets transparency and unlocks the editor
**Category:** Lifecycle
**Priority:** P1
**Source:** `js/repositorio.js:128-151`
**Plain English:** Choosing a background item turns off the transparent-background mode, downloads the full image, force-unlocks the editor's command invoker and loads the image as the canvas background named after the file.
**Specification:**
  Given the editor has a transparent background and its command invoker is locked
  When  the user double-clicks a background item 'Aula01_fondo.png'
  Then  transparent background is set to false, the invoker lock is cleared, and cargarFondo('Aula01_fondo.png', dataURL) is called; a beep sound plays
**Parameters:** setFondoTransparente(false); _invoker._isLocked forced to false; file name taken from the response URL after the last '/'
**Edge cases handled:** Transparency is switched off before the download finishes, even if the download later fails; Beep plays immediately regardless of download outcome
**Suspected defect:** Directly clearing the private _invoker._isLocked flag bypasses the undo/command lock and could interleave with an in-progress command.
**Confidence:** Medium — Is force-unlocking the invoker (comment says otherwise state shows 'locked') intended, or is it masking a lock left by an unfinished command that should be completed first?

### RULE-085: Opening a new file resets the editor session
**Category:** Lifecycle
**Priority:** P1
**Source:** `legacy/tonga/dist/tui-image-editor.js:11425-11462`
**Plain English:** When the user picks a file, the editor clears the transparent-background flag, shows the loading indicator, resets the rotation slider to 0, restores the original canvas size, resets zoom to 1 and sets the window title. Cancelling the file dialog does nothing.
**Specification:**
  Given A file is open at zoom 1.5 and rotation 30 degrees
  When  The user opens 'mapa.png'
  Then  Transparent flag = false, rotation slider = 0, zoom = 1, title = 'TongaApp | UCTICEE | Gobierno de Canarias', and the file is routed by extension. After the load the undo stack is cleared, the background size is stored for zoom reset, and the background binary is cached as JPEG.
**Parameters:** zoom reset value 1; rotation slider reset 0; fixed window title
**Edge cases handled:** No file (dialog cancelled): no action; Browser without File API: alert shown, but loading still continues; Raster load failure: loading indicator hidden and the error re-thrown
**Suspected defect:** The extension is taken as file.name.split('.')[1]. For 'my.map.svg' that gives 'MAP', so an SVG is treated as a raster image. A file with no extension makes toUpperCase() throw on undefined.
**Confidence:** High

### RULE-086: SVG export embeds the background and tags it data-background
**Category:** Lifecycle
**Priority:** P1
**Source:** `legacy/tonga/dist/tui-image-editor.js:12097-12192`
**Plain English:** An SVG export renders a secondary canvas sized to the rotated background's absolute bounding box, with the same objects. It removes 'stroke-width: 0;' and, if a background exists, replaces the first image's link with the background's actual source and marks it nombre='data-background', so re-import recognizes it as the background.
**Specification:**
  Given A canvas with a background image and 3 objects
  When  The user downloads SVG
  Then  An 'image/svg+xml' file 'imagen_<timestamp>.svg' is saved. Its first <image> has xlink:href = the background source and nombre='data-background', and the secondary canvas is emptied.
**Edge cases handled:** No background image: the raw SVG markup is saved unchanged; A single <g> (not an array) is handled separately
**Suspected defect:** String.replace('xlink:href', ...) only replaces the first occurrence, so other images' xlink:href survive while the JSON keys diverge. The fallback branch for no File API references an undefined dataURL.
**Confidence:** Medium — P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (The code at legacy/tonga/dist/tui-image-editor.js:12097-12192 matches the rule. It builds a secondary canvas (#segundocanvas) with the main canvas's background image and _objects. The canvas is sized to the absolute bounding rect of canvasImage, so a rotated background is covered. Export runs toSVG…

### RULE-087: Icon placement toggle and custom icon upload
**Category:** Lifecycle
**Priority:** P2
**Source:** `dist/tui-image-editor.js:10075-10117`
**Plain English:** Choosing an icon type starts placing that icon in the current colour. Choosing the same type again cancels placement. Users can register their own icon from a file.
**Specification:**
  Given Icon colour #ffbb3b and no icon type selected
  When  The user clicks 'arrow' twice
  Then  First click: addIcon('arrow', '#ffbb3b') and objects become non-selectable. Second click: standby, the icon type is cleared and cancelAddIcon runs.
**Edge cases handled:** The file-API check at 10106 tests _util.isSupportFileApi without calling it, so it never warns; The mask loader at 9811-9813 shows a warning but then continues anyway
**Suspected defect:** The browser-support check on custom icon upload never runs because the function is referenced, not called.
**Confidence:** High

### RULE-088: Menu-to-editor mode mapping
**Category:** Lifecycle
**Priority:** P2
**Source:** `dist/tui-image-editor.js:13052-13067`
**Plain English:** Opening the Text menu enters TEXT mode, Crop starts CROPPER drawing mode, and Shape enters SHAPE mode with the last shape type and options. Within Draw, 'free' selects FREE_DRAWING and any other value selects LINE_DRAWING.
**Specification:**
  Given The user opens the Shape menu with 'circle' remembered
  When  modeChange('shape') runs
  Then  The editor enters SHAPE mode and the drawing shape is circle with the remembered options
**Edge cases handled:** Other menus do not change mode; setDrawMode always stops the current drawing mode first (12616-12623)
**Confidence:** High

### RULE-089: Reset zoom to original image size
**Category:** Lifecycle
**Priority:** P2
**Source:** `dist/tui-image-editor.js:15117-15148`
**Plain English:** Restoring the zoom sets the zoom factor back to 1 and sizes the editor and canvas to the background image's natural width and height.
**Specification:**
  Given An editor zoomed to 1.5 with a background of 800x600
  When  The user restores the canvas dimension
  Then  The zoom factor is 1, the wrapper is 800x600, the CSS max size is 800x600 px and the backstore is 800x600
**Parameters:** Reset factor = 1
**Confidence:** High

### RULE-090: Flip image horizontally, vertically, or reset
**Category:** Lifecycle
**Priority:** P2
**Source:** `dist/tui-image-editor.js:1657-1715`
**Plain English:** The image can be mirrored on the X axis or the Y axis, or its flip state can be reset. Each action is undoable and returns the resulting flipX, flipY and angle.
**Specification:**
  Given An image loaded with flipX=false
  When  flipX() is called
  Then  A FLIP_IMAGE command with type 'flipX' runs and resolves with status {flipX, flipY, angle}
**Parameters:** type in {'flipX','flipY','reset'}
**Edge cases handled:** resetFlip uses type 'reset'
**Confidence:** High

### RULE-091: Activate drawing mode on demand (icons excluded)
**Category:** Lifecycle
**Priority:** P2
**Source:** `dist/tui-image-editor.js:2022-2026`
**Plain English:** The editor switches to a requested drawing mode only if it is not already in that mode. Icons never change the mode.
**Specification:**
  Given The current drawing mode is 'NORMAL'
  When  _changeActivateMode('TEXT') is called
  Then  startDrawingMode('TEXT') is invoked. For 'ICON', or when already in 'TEXT', nothing happens
**Parameters:** Modes: NORMAL, CROPPER, FREE_DRAWING, LINE_DRAWING, TEXT, SHAPE (JSDoc lines 1357-1362, 1580)
**Edge cases handled:** Per the JSDoc, startDrawingMode stops any non-NORMAL mode first
**Confidence:** High

### RULE-092: Destroy editor teardown
**Category:** Lifecycle
**Priority:** P2
**Source:** `dist/tui-image-editor.js:2578-2590`
**Plain English:** Destroying the editor stops drawing, removes the keyboard shortcuts, destroys the canvas and clears every instance field.
**Specification:**
  Given An active editor instance
  When  destroy() is called
  Then  Drawing mode is stopped, the document keydown listener is removed, graphics is destroyed and every own property is set to null
**Parameters:** none
**Edge cases handled:** Any call made after destroy fails because the fields are null
**Confidence:** High

### RULE-093: Clear objects and resize canvas are reversible
**Category:** Lifecycle
**Priority:** P2
**Source:** `dist/tui-image-editor.js:52384-52401`
**Plain English:** Clearing removes all objects except the background image and undo re-adds them; resizing the canvas stores the previous CSS max width/height and undo restores and refits it.
**Specification:**
  Given Canvas with 5 overlay objects and cssMaxWidth 1000/cssMaxHeight 800
  When  CLEAR_OBJECTS then undo; or RESIZE_CANVAS_DIMENSION({width:500,height:400}) then undo
  Then  All 5 objects return; css max dimension returns to 1000x800 followed by adjustCanvasDimension
**Parameters:** RESIZE_CANVAS_DIMENSION at 52718-52742
**Confidence:** High

### RULE-094: Flip state and reset guard
**Category:** Lifecycle
**Priority:** P2
**Source:** `dist/tui-image-editor.js:8825-8851`
**Plain English:** Images can be flipped horizontally or vertically. Reset is ignored when nothing is flipped, and the flip state is recalculated from the engine's result.
**Specification:**
  Given No flip has been applied (flipStatus false)
  When  The user clicks resetFlip
  Then  Nothing happens. After a flipX, flipStatus is true and the button shows both flipX and resetFlip.
**Parameters:** Flip types: flipX, flipY, resetFlip
**Confidence:** High

### RULE-095: Mask image load then apply
**Category:** Lifecycle
**Priority:** P2
**Source:** `dist/tui-image-editor.js:9795-9823`
**Plain English:** A mask image has to be loaded from a file before it can be applied. Loading turns on the Apply button, and applying runs the mask filter and turns it off again.
**Specification:**
  Given The user selects a PNG file for the mask
  When  The file input changes
  Then  The image is loaded through an object URL and the Apply button becomes active. Clicking Apply runs applyFilter() and clears the active state.
**Confidence:** High

### RULE-096: Window resize keeps the current canvas zoom
**Category:** Lifecycle
**Priority:** P2
**Source:** `index.html:289-292`
**Plain English:** When the browser window is resized, the editor recalculates its layout without resetting the user's current zoom, so the canvas and the editor frame stay aligned.
**Specification:**
  Given A user has zoomed the canvas
  When  The browser window is resized
  Then  imageEditor.ui.resizeEditor() runs and keeps the current zoom/size instead of going back to the initial size
**Parameters:** Trigger: window.onresize
**Edge cases handled:** Per the 09.09.2019 comment, the old behaviour reset to the initial size and left the canvas and editor sizes out of sync
**Confidence:** Medium — Is keeping the user's zoom level on window resize a required behaviour, or was it only a workaround for a layout glitch?

### RULE-097: Credits dialog opens from the Créditos link and closes from its X icon
**Category:** Lifecycle
**Priority:** P2
**Source:** `index.html:299-318`
**Plain English:** Clicking the 'Créditos' link opens creditos.html in a 900x600 modal dialog inside the app instead of going to a new page, and the X icon in the credits closes that dialog.
**Specification:**
  Given The editor header has the link #page-help pointing to ./creditos.html (rendered by dist/tui-image-editor.js:6598)
  When  The user clicks the link
  Then  The prevented navigation opens a jQuery UI dialog (closed until then) showing creditos.html, titled 'Créditos', 900px by 600px; the X in creditos.html calls cerrar() -> $dialog.dialog('close')
**Parameters:** width = 900; height = 600; autoOpen = false; link title = Créditos
**Edge cases handled:** The close handler in creditos.html:24-26 depends on the global $dialog declared in index.html:296; opened on its own, the X fails; The content is loaded once on page ready, not each time the dialog opens
**Confidence:** High

### RULE-098: Delete and Delete-All button state after removal
**Category:** Lifecycle
**Priority:** P2
**Source:** `legacy/tonga/dist/tui-image-editor.js:11365-11376`
**Plain English:** Deleting the selected object disables the Delete button and clears the active object. Deleting all objects disables both the Delete and Delete-All buttons.
**Specification:**
  Given One object is selected on a canvas with 3 objects
  When  The user clicks Delete
  Then  The active object is removed, activeObjectId becomes null and the Delete button is disabled. Delete All clears every object and disables both buttons.
**Confidence:** High

## Policy

### RULE-099: Licence, ownership and version of the work
**Category:** Policy
**Priority:** P1
**Source:** `creditos.html:72-116`
**Plain English:** The app and its content belong to the Gobierno de Canarias, are offered for free use by the educational community under Creative Commons BY-NC-SA 4.0 International, and are labelled © 2019, version 1.1.3.
**Specification:**
  Given A user opens the credits
  When  The credits dialog is shown
  Then  It states Gobierno de Canarias ownership, the CC BY-NC-SA 4.0 licence (link to creativecommons.org/licenses/by-nc-sa/4.0/deed.es), the contributing companies (as images), '© Gobierno de Canarias 2019' and 'Versión 1.1.3'
**Parameters:** Licence = CC BY-NC-SA 4.0; copyright year = 2019; version = 1.1.3 (hardcoded); EU and Canarias logos shown
**Edge cases handled:** Version and year are fixed text and are not taken from any build metadata
**Confidence:** High

### RULE-100: Keyboard shortcuts for copy, paste, undo, redo and delete
**Category:** Policy
**Priority:** P1
**Source:** `dist/tui-image-editor.js:1144-1197`
**Plain English:** Ctrl or Cmd plus C copies the selected object, V pastes a clone and clears the redo history, Z undoes and Y redoes. Delete or Backspace removes the selected object unless it is a text being edited.
**Specification:**
  Given The document has keyboard focus and an object is selected (not in text-editing mode)
  When  The user presses Ctrl/Cmd+C, Ctrl/Cmd+V, Ctrl/Cmd+Z, Ctrl/Cmd+Y, or BACKSPACE/DEL
  Then  C stores the active object as the copy target. V clones it (or every member of a multi-selection), selects the clones and empties the redo stack. Z/Y run undo/redo and discard any 'stack empty' errors without a message. DEL/BACKSPACE prevents the browser default and removes the active object
**Parameters:** Key codes come from consts.keyCodes (C, V, Z, Y, BACKSPACE, DEL); modifier = ctrlKey OR metaKey
**Edge cases handled:** Paste without a previous copy resolves to an empty result (graphics pasteObject, line 16135); A pasted clone becomes the new copy target, so pressing paste again clones the clone; Removal is blocked while a text object isEditing (graphics isReadyRemoveObject, line 14900-14903); A multi-selection is wrapped in a new fabric Group and that group is removed as one undoable command (graphics line 14880-14892); The listener is attached to the whole document, so the shortcuts also fire when focus is in other inputs on the page
**Suspected defect:** The paste clears the redo stack but does not record its own undo command here. Copy and paste are not undoable at this level unless the graphics layer fires addObject. Also, a document-wide keydown can delete canvas objects while the user types Backspace in an unrelated form field if a canvas object is still active.
**Confidence:** High

### RULE-101: Generic image download: file extension follows the actual image format
**Category:** Policy
**Priority:** P1
**Source:** `dist/tui-image-editor.js:12202-12219`
**Plain English:** For any download type that is not PDF/JPG/PNG/SVG, the canvas is exported as a data URL and saved with an extension that matches its real MIME subtype; if the browser cannot save files, the image opens in a new window instead.
**Specification:**
  Given The browser supports the File API and window.saveAs exists, and the user downloads under the name 'mapa'
  When  descargarImagen is called with an unrecognised type and the canvas exports as image/png
  Then  The blob type subtype 'png' is compared with the name's last dot-segment; since 'mapa' does not end in 'png', the file is saved as 'mapa.png'. A name already ending in '.png' is left unchanged
**Parameters:** Extension = blob.type.split('/')[1]; comparison is against imageName.split('.').pop() (case-sensitive)
**Edge cases handled:** Case-sensitive check: 'foto.PNG' with type 'png' becomes 'foto.PNG.png'; 'image/jpeg' gives extension 'jpeg', so 'foto.jpg' becomes 'foto.jpg.jpeg'; No File API or saveAs: opens a new window showing <img src=dataURL> and no file is saved; Explicit PDF/JPG/PNG/SVG cases live at 11987-12198, which is outside this range
**Suspected defect:** The case-sensitive extension check and the jpeg/jpg mismatch produce double extensions.
**Confidence:** High

### RULE-102: SVG export ignores the current zoom
**Category:** Policy
**Priority:** P1
**Source:** `dist/tui-image-editor.js:23847-23849`
**Plain English:** Exported SVGs are always written at the document's real scale, whatever zoom level the user has on screen.
**Specification:**
  Given A canvas zoomed to 200% in the editor
  When  The user exports or saves the drawing as SVG
  Then  The SVG coordinates are not multiplied by the 2x viewport transform. The output matches 100% scale
**Parameters:** svgViewportTransformation = false (the Fabric default is true)
**Confidence:** High

### RULE-103: Object type and image name persisted in SVG export
**Category:** Policy
**Priority:** P1
**Source:** `dist/tui-image-editor.js:35350-35356`
**Plain English:** Every exported shape, path, line, text and image gets a 'tipo' (object type) attribute, and images also get a 'nombre' (name) attribute, so the editor can recognise objects when the SVG is loaded again.
**Specification:**
  Given An image object with tipo='IMAGEN' and nombre='mapa1', and a freehand path with tipo='PATH'
  When  The canvas is exported to SVG
  Then  The image is written as <image ... tipo="IMAGEN" nombre="mapa1"> and the path as <path ... tipo="PATH" ...>. When the SVG is loaded again, 'tipo' is read back through SHARED_ATTRIBUTES (line 16295) and 'nombre'/'tipo' through Image.ATTRIBUTE_NAMES (35758-35759)
**Parameters:** Attribute names: tipo (all shapes: line 32443, circle 32604, triangle 32787, ellipse 32911, rect 33112, polyline/polygon 33289, path 33905, image 35353, text 43389); nombre (image only, defaults to the empty string). Text ATTRIBUTE_NAMES also lists tipo (40624).
**Edge cases handled:** If an object has no tipo, it is written as the literal tipo="undefined", and that string is read back as the type; nombre falls back to the empty string, but tipo has no fallback; The image height falls back to _element.height twice instead of naturalHeight
**Suspected defect:** Full-circle export (line 32605) emits 'r="', radius, ' tipo="' with no closing quote after the radius, which produces r="50 tipo="X" and malformed SVG. Circles therefore lose their tipo and radius on round-trip. Also, tipo="undefined" is emitted for objects that have no type.
**Confidence:** Medium — P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (The rule matches the code. At dist/tui-image-editor.js:35350-35356 the image's SVG markup gets tipo="<this.tipo>" and nombre="<this.nombre // ''>". The import path also matches: fabric.SHARED_ATTRIBUTES includes 'tipo' (line 16295) and fabric.Image.ATTRIBUTE_NAMES adds 'nombre tipo' (lines 35758-357…

### RULE-104: Silent execution bypasses undo history
**Category:** Policy
**Priority:** P1
**Source:** `dist/tui-image-editor.js:4650-4664`
**Plain English:** Some edits can be executed silently so they change the image but are not recorded in undo history.
**Specification:**
  Given An unlocked invoker
  When  executeSilent('loadImage', ...) is called and succeeds
  Then  The command runs, is NOT pushed to the undo stack, the redo stack is still cleared, and the silent flag is reset afterwards
**Edge cases handled:** The silent flag is appended as an extra trailing argument to execute/command creation
**Suspected defect:** _isSilent is only reset in the success handler; if the silent command rejects, the invoker stays silent and every later edit is also excluded from undo history. Also, a redo performed while silent would not be recorded.
**Confidence:** Medium — Which operations are expected to be non-undoable (silent), and should a failed silent command restore normal recording?

### RULE-105: Library catalogue is grouped into titled sections by header lines
**Category:** Policy
**Priority:** P1
**Source:** `dist/tui-image-editor.js:53308-53355`
**Plain English:** The root catalogue file lists collections as 'id/Label' lines; a line whose id is the reserved word 'tongaappcabecera' starts a new titled section, and a blank line closes the current section.
**Specification:**
  Given repositorios/lista.txt contains 'tongaappcabecera|Fauna', then 'aves|Aves', 'insectos|Insectos', then a blank line
  When  the Imagen submenu is built
  Then  one accordion section titled 'Fauna' is shown containing links 'Aves' and 'Insectos', each opening collection id 'aves' / 'insectos'
**Parameters:** Header marker = 'tongaappcabecera' (also accepted with trailing '\r'); field separator = '|'; catalogue path = ./repositorios/lista.txt; current catalogue has 7 sections (Fauna, Flora, Ciencia, Espacios creativos, Sociedad, Iconos, Fondos) - see repositorios/lista.txt:1-72
**Edge cases handled:** A new header while a section is open implicitly closes the previous section; Missing label after '/' yields an empty label; Several consecutive blank lines (repositorios/lista.txt:58-61) each emit closing tags again because the 'section open' flag is never reset; Collection lines appearing before any header are rendered outside any section; Collection id with CRLF line endings: only the header marker tolerates '\r'; for normal lines the '\r' ends up in the label; Load failure shows 'Error de conexión <err>'
**Suspected defect:** Blank-line handling does not reset hayCabeceraAnterior, so multiple blank lines produce unbalanced closing </ul></div></div> tags in the generated menu.
**Confidence:** High

### RULE-106: Default ranges for editing tool sliders
**Category:** Policy
**Priority:** P1
**Source:** `dist/tui-image-editor.js:5588-5646`
**Also cited:** dist/tui-image-editor.js:10885-10906
**Plain English:** Each editing tool slider has a fixed minimum, maximum and default value.
**Specification:**
  Given The user opens the rotate, draw, shape, text or filter menus
  When  The sliders are initialised
  Then  Rotate -360..360 default 0; draw brush 5..30 default 12; shape stroke 2..300 default 3; text size 10..100 default 50; filters as listed
**Parameters:** tintOpacity 0..1 def 0.7; removeWhite distance 0..1 def 0.2; brightness -1..1 def 0; noise 0..1000 def 100; pixelate 2..20 def 4; colorFilter threshold 0..1 def 0.2
**Edge cases handled:** realTimeEvent true for rotate and text sliders (apply while dragging), false for shape stroke
**Confidence:** High

### RULE-107: Default editor configuration and enabled tool menus
**Category:** Policy
**Priority:** P1
**Source:** `dist/tui-image-editor.js:5995-6011`
**Plain English:** Unless the host page says otherwise, the editor starts with no preloaded image, all ten tool menus enabled in a fixed order, no initial menu open, a full-size (100% x 100%) UI and the menu bar at the bottom.
**Specification:**
  Given The editor is created with options that do not specify menu, menuBarPosition, uiSize or loadImage
  When  The Ui object initialises its options
  Then  menu = [crop, flip, rotate, draw, shape, imagen, icon, text, mask, filter], menuBarPosition = 'bottom', uiSize = {width:'100%', height:'100%'}, loadImage = {path:'', name:''}, initMenu = '' (none); any supplied option overrides the default by shallow merge
**Parameters:** menu order: crop, flip, rotate, draw, shape, imagen, icon, text, mask, filter; menuBarPosition default 'bottom'; uiSize default 100%/100%; locale {}; menuIconPath ''
**Edge cases handled:** 'imagen' (insert image) is a Tonga addition (JBD 23.07.2019) not in upstream TUI; it maps to module 160; A shallow merge means passing a partial uiSize (e.g. only width) replaces the whole uiSize object, leaving height undefined
**Confidence:** High

### RULE-108: Export result in PDF, JPG, PNG or SVG
**Category:** Policy
**Priority:** P1
**Source:** `dist/tui-image-editor.js:6162-6172`
**Plain English:** The header offers four download buttons and each passes its format (PDF, JPG, PNG, SVG) to the editor's download action.
**Specification:**
  Given The user clicks the header button titled 'Descargar resultado en SVG'
  When  The download click handler runs
  Then  main.download('SVG') is invoked using the button's tipo attribute
**Parameters:** Formats from header template lines 6578-6592: PDF, JPG, PNG, SVG; buttons selected by class .tui-image-editor-download-btn-tonga
**Edge cases handled:** The legacy controls 'Download' button (line 6707) uses class tui-image-editor-download-btn, so it is not wired at all; A -tonga button without a tipo attribute would throw (getAttributeNode returns null); Download is only wired after menu activation (see one-time activation rule)
**Confidence:** Medium — P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (The rule matches the code. In legacy/tonga/dist/tui-image-editor.js:6162-6172, _addDownloadEvent adds a click listener to each download element. The listener reads the button's 'tipo' attribute and calls _actions.main.download(tipo). The header template at lines 6578-6592 defines four .tui-image-edi…

### RULE-109: Third-party usage statistics are disabled
**Category:** Policy
**Priority:** P1
**Source:** `dist/tui-image-editor.js:688-691`
**Also cited:** (default usageStatistics:false), dist/tui-image-editor.js:757-759 (gate on top-level options.usageStatistics), dist/tui-image-editor.js:5338-5346 (sendHostName body commented out); dist/tui-image-editor.js:5338-5346; dist/tui-image-editor.js:688-691
**Plain English:** The editor must not send usage tracking to the editor vendor; usage statistics are turned off for this government education app.
**Specification:**
  Given The TUI image editor normally reports usage statistics to its vendor
  When  The editor is created
  Then  usageStatistics is false, so no usage-tracking call is made
**Parameters:** usageStatistics = false
**Edge cases handled:** Required to keep the privacy policy linked in the footer (index.html:90) accurate
**Confidence:** Medium — Citation was corrected by referee (The behavior is real, but index.html:259 is not what turns it off. That line puts 'usageStatistics: false' inside the 'includeUI' object. The ImageEditor constructor only checks the top-level 'options.usageStatistics' (dist/tui-image-editor.js:757-759, 'if (options.usageStatistics) sendHostName()'), so the nested key does not affect that check. Usage tracking is…

### RULE-110: Editor exposes a fixed set of nine editing tools; mask and load are excluded
**Category:** Policy
**Priority:** P1
**Source:** `index.html:273-284`
**Plain English:** The image editor offers exactly nine tools in this order (crop, rotate, flip, draw, shape, image library, icon, text, filter), with the menu bar on the left; the stock 'mask' and 'load from disk' tools are deliberately left out.
**Specification:**
  Given The TongaApp page is opened in a browser
  When  The image editor is initialised
  Then  The left-hand menu shows crop, rotate, flip, draw, shape, imagen, icon, text, filter; no mask tool and no load-image button are offered
**Parameters:** menu = [crop, rotate, flip, draw, shape, imagen, icon, text, filter]; menuBarPosition = left; excluded (commented out): load, mask
**Edge cases handled:** 'imagen' is a custom, non-stock menu entry (the repository/library image picker) added to the vendored editor; Spanish labels still exist for mask filter (lines 149-150, 172), which shows mask was once enabled
**Confidence:** High

### RULE-111: Legal notice and privacy policy links always visible
**Category:** Policy
**Priority:** P1
**Source:** `index.html:88-91`
**Plain English:** A footer that is always shown links to the Gobierno de Canarias legal notice and to the education department's privacy policy, both opening in a new window.
**Specification:**
  Given Any screen of the app
  When  The page is rendered
  Then  The footer shows 'Aviso Legal' (gobiernodecanarias.org/principal/avisolegal.html) and 'Politica de privacidad' (gobiernodecanarias.org/eucd/politica_privacidad/), each opening in a separate window
**Parameters:** Footer height 1em; editor area = 100% - 1em (index.html:42-43)
**Confidence:** High

### RULE-112: Item classification: background vs. insertable image
**Category:** Policy
**Priority:** P1
**Source:** `js/repositorio.js:59-77`
**Plain English:** A catalogue item whose third field is 'tongaappfondo' is used as the drawing background on double-click; any other item is inserted as a movable image object.
**Specification:**
  Given an item line 'Salon_fondo.png|Salón|tongaappfondo' and another 'gato.png|Gato'
  When  the user double-clicks each thumbnail
  Then  Salon_fondo.png replaces the canvas background (cargarFondo); gato.png is added as an image object on the canvas (insertarImagen)
**Parameters:** Background flag = 'tongaappfondo' (also accepted with trailing '\r'); action trigger = double-click
**Edge cases handled:** Flag is case-sensitive and must be exact; any other third-field value means insert as object; All 21 entries in repositorios/escenarios/lista.txt are flagged as backgrounds
**Confidence:** Medium — P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (The rule card matches the code. In legacy/tonga/js/repositorio.js:44-46 the line is split on '/' into element, tooltip and fondo. Lines 59-62 then use 'cargarFondo' when fondo is exactly 'tongaappfondo' or 'tongaappfondo\r', and 'insertarImagen' otherwise. Line 76 attaches that function to the thumb…

### RULE-113: File type routing: SVG versus raster import
**Category:** Policy
**Priority:** P1
**Source:** `legacy/tonga/dist/tui-image-editor.js:11463-11764`
**Plain English:** Files whose (uppercased) extension is SVG are parsed as an editable vector scene. Every other extension is loaded as a raster background image.
**Specification:**
  Given A file named 'plano.svg'
  When  It is loaded
  Then  It goes through the SVG import path (fabric.loadSVGFromURL). 'foto.jpg' goes through loadImageFromFile, the editor resizes to the image, and the view is fitted with setFitFondo(newWidth, newHeight).
**Edge cases handled:** Extension matching is case-insensitive ('Svg' is treated as SVG)
**Confidence:** High

### RULE-114: Background handling at export (transparent / rotated / format)
**Category:** Policy
**Priority:** P1
**Source:** `legacy/tonga/dist/tui-image-editor.js:11792-11981`
**Plain English:** Formats without transparency (PDF, JPG) must not export a black background. A transparent background is swapped for white on PDF/JPG and for a transparent image on PNG/SVG. When the background is rotated and the format is PDF/JPG, a temporary white rectangle the size of the rotated image's bounding box is placed behind everything, and for non-transparent backgrounds a floating copy of the backgro…
**Specification:**
  Given A transparent-background image rotated 30 degrees with a bounding box of 1000x700
  When  The user downloads a JPG
  Then  The background is removed, a white rect 1000x700 is added at (500,350) and sent to back, the image is exported, the rect is deleted, both undo entries are popped, the background is restored and the shape menu is toggled off.
**Parameters:** White fill; rect centred at width/2, height/2 with rounded bounding size; './img/fondoBlanco.jpg' for PDF/JPG; './img/transparente.png' for PNG/SVG
**Edge cases handled:** Opaque background, unrotated or PNG/SVG: exported directly; Opaque background, rotated, PDF/JPG: angle set to 0, a floating copy of the cached background binary is added, the angle is restored, then the white rect goes behind; afterwards canvas._objects[0] is…; Rotated transparent background with PNG/SVG: uses sustituirFondo with the transparent image
**Suspected defect:** It forces _invoker._isLocked=false and pops undo entries by position, so concurrent actions could pop the wrong entries. Step 15 removes canvas._objects[0], which assumes the floating background is still first after the white rect was also sent to back (the rect is removed first, so it probably holds, but it is fragile).
**Confidence:** Medium — P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (The rule card matches the code at legacy/tonga/dist/tui-image-editor.js:11792-11981. A rotated image exported as PDF or JPG sets usarObjetoFondoEditor. When the background is transparent and the image is rotated, the code removes the backgroundImage and adds a white rect sized to the rounded boundin…

### RULE-115: Custom icon from uploaded image via vector tracing
**Category:** Policy
**Priority:** P2
**Source:** `dist/tui-image-editor.js:12497-12516`
**Plain English:** A user-uploaded image is traced to SVG. The first path's 'd' data becomes a new icon registered under the file name, and the icon is placed at (100,100).
**Specification:**
  Given The user uploads 'estrella.png'
  When  registCustomIcon(imgUrl, file) is called
  Then  The traced SVG's first path d attribute is registered as icon 'estrella.png' and added at left=100, top=100
**Parameters:** Default placement left=100, top=100; tracer uses tracerDefaultOption()
**Edge cases handled:** Only the first path is kept, so multi-path images lose detail; If no path matches, the match is null and the code throws; A file name equal to an existing icon key overwrites it
**Suspected defect:** There is no null guard on the regex match.
**Confidence:** High

### RULE-116: Default new text object
**Category:** Policy
**Priority:** P2
**Source:** `dist/tui-image-editor.js:12995-13008`
**Also cited:** dist/tui-image-editor.js:39477
**Plain English:** A new text box is created with the placeholder 'Doble Click', the current UI text colour, the UI font size as an integer, and the chosen font family or 'Noto Sans' by default.
**Specification:**
  Given The UI font size is '32.7' and no font family is chosen
  When  The user clicks to add text
  Then  Text 'Doble Click' is created at size 32 (toInteger) in Noto Sans, and the cursor returns to default
**Parameters:** Placeholder 'Doble Click'; default font 'Noto Sans'
**Confidence:** Medium — Does util.toInteger truncate or round (32.7 becomes 32 or 33)?

### RULE-117: Canvas size equals image size (no CSS max cap)
**Category:** Policy
**Priority:** P2
**Source:** `dist/tui-image-editor.js:15819-15848`
**Plain English:** After loading an image, the canvas display size is the image's bounding size rounded down to whole pixels. The original 1000x800 maximum display limit was deliberately turned off, so canvases can be as large as needed.
**Specification:**
  Given A loaded image whose bounding box is 2500.7x1800.2
  When  adjustCanvasDimension runs
  Then  The CSS max size is 2500x1800 and the backstore is 2500.7x1800.2, with the image centred
**Parameters:** DEFAULT_CSS_MAX_WIDTH=1000 and DEFAULT_CSS_MAX_HEIGHT=800 are still stored (lines 14541-14542, 14590-14596) but not applied
**Edge cases handled:** The original aspect-ratio downscaling logic is only present as commented-out code
**Confidence:** High

### RULE-118: Inserted image placement and tagging
**Category:** Policy
**Priority:** P2
**Source:** `dist/tui-image-editor.js:15855-15870`
**Plain English:** An image added from a URL is placed at the centre of the background image, gets the standard selection style, is tagged as a new object of type IMAGEN with its file name, and is selected right away.
**Specification:**
  Given A background centred at (400,300) and the image 'logo.png' added
  When  addImageObject resolves
  Then  The image has left=400, top=300, nuevoObjeto=true, tipo='IMAGEN' and nombre='logo.png', and is the active object
**Parameters:** crossOrigin='Anonymous'; nombre is passed through the fromURL options (15419-15436)
**Edge cases handled:** Fails if there is no background image (getCanvasImage() is null)
**Confidence:** Medium — Does the nuevoObjeto flag affect later positioning or flip logic (the comments say SVG-loaded images are positioned by centre point while inserted images use left)?

### RULE-119: Raise or lower the selected object one layer
**Category:** Policy
**Priority:** P2
**Source:** `dist/tui-image-editor.js:2345-2366`
**Plain English:** The selected object can be moved one step forward or backward in the stacking order.
**Specification:**
  Given The active object is at z-index 2 of 5
  When  setSubeZIndex() (raise) or setBajaZIndex() (lower) is called
  Then  The object moves to index 3 (raise) or 1 (lower) and the canvas re-renders
**Parameters:** Step = 1 layer (fabric bringForward/sendBackwards)
**Edge cases handled:** The change is not recorded on the undo stack; Nothing checks whether an object is active
**Confidence:** Medium — Should z-order changes be undoable, and what should happen when nothing is selected?

### RULE-120: Selecting an object does not change its layer order
**Category:** Policy
**Priority:** P2
**Source:** `dist/tui-image-editor.js:25468-25469`
**Plain English:** Selecting an object leaves it at its current stacking position instead of bringing it to the front.
**Specification:**
  Given An object lying below two other objects
  When  The user selects it
  Then  It keeps its z-order
**Parameters:** preserveObjectStacking = true (the Fabric default is false)
**Confidence:** High

### RULE-121: Keyboard shortcuts and selection appearance
**Category:** Policy
**Priority:** P2
**Source:** `dist/tui-image-editor.js:5501-5525`
**Plain English:** Undo/redo, delete and copy/paste are bound to fixed key codes and selected objects use a fixed visual style.
**Specification:**
  Given An object is selected on the canvas
  When  The user uses keyboard shortcuts
  Then  Z(90)=undo, Y(89)=redo, Backspace(8)/Del(46)=delete, C(67)/V(86)=copy/paste, Shift(16) modifier; selection drawn with red border, green opaque corners of size 10, centred origin
**Confidence:** Medium — Key code bindings are only declared here; confirm the handler mapping (e.g. whether Z requires Ctrl/Cmd and Shift+Z also redoes).

### RULE-122: Default object selection style in built-in UI mode
**Category:** Policy
**Priority:** P2
**Source:** `dist/tui-image-editor.js:5827-5841`
**Plain English:** When the built-in UI is used, selected objects show white circular 16px corner handles with a 2px white border, and crop/group selections use the same style unless the host overrides it.
**Specification:**
  Given The host supplies no selectionStyle
  When  setUiDefaultSelectionStyle is applied
  Then  applyCropSelectionStyle = true, applyGroupSelectionStyle = true, cornerStyle 'circle', cornerSize 16, cornerColor/cornerStrokeColor/borderColor '#fff', transparentCorners false, lineWidth 2
**Parameters:** cornerSize 16; lineWidth 2; colour #fff
**Confidence:** High

### RULE-123: Tonga header toolbar composition
**Category:** Policy
**Priority:** P2
**Source:** `dist/tui-image-editor.js:6500-6625`
**Plain English:** The Tonga header shows, left to right: the logo, Start with transparent background, Reload page, Reload last file, Send object backward, Bring object forward, Zoom out, Zoom in, Load image, Download PDF/JPG/PNG/SVG, and a Credits link to creditos.html.
**Specification:**
  Given The editor UI is rendered
  When  The header template is built
  Then  Each button carries the class that the Ui later binds to its action (tie-btn-comenzar, tie-btn-reload, tie-btn-recargar, tie-btn-z-abajo, tie-btn-z-arriba, tie-btn-smaller, tie-btn-bigger, tui-image-editor-load-btn, tui-image-editor-download-btn-tonga) with Spanish tooltips
**Parameters:** Credits link ./creditos.html; button images under img/botones/; 'Comenzar' container width 130px
**Edge cases handled:** The legacy controls template (module 76, lines 6639-6715) still renders a second Load input and an unwired Download button; Tooltips are hard-coded Spanish rather than localised
**Confidence:** High

### RULE-124: Only one colour picker open at a time
**Category:** Policy
**Priority:** P2
**Source:** `dist/tui-image-editor.js:7771-7796`
**Plain English:** Opening a colour picker closes the others in the same submenu, and clicking anywhere outside closes it.
**Specification:**
  Given The filter tint picker is open
  When  The user opens the blend picker
  Then  The tint and multiply pickers are hidden (colorPickerChangeShow, 8199-8207).
**Parameters:** Palette (JBD 24.07.2019): about 130 named colours, with '' as the first entry meaning transparent (7658-7662). Picker horizontal offset desvio = 60 px (7851).
**Confidence:** High

### RULE-125: Group selection inherits configured selection style
**Category:** Policy
**Priority:** P2
**Source:** `dist/tui-image-editor.js:881-900`
**Plain English:** The configured selection style applies to single objects. It also applies to the crop box and to multi-object selections when those options are turned on.
**Specification:**
  Given selectionStyle {cornerSize:20} with applyGroupSelectionStyle=true
  When  The user creates a multi-object selection (type 'activeSelection')
  Then  That selection gets cornerSize 20
**Parameters:** applyCropSelectionStyle, applyGroupSelectionStyle flags; rotation handle: cornerSize 50, circle, padding 5, icon img/Rotar-02.svg (lines 768-795)
**Edge cases handled:** If no selectionStyle is given while the apply flags are true, undefined is passed through
**Confidence:** High

### RULE-126: Spanish user interface labels
**Category:** Policy
**Priority:** P2
**Source:** `index.html:146-252`
**Plain English:** Every editor label is shown in Spanish through a fixed English-to-Spanish dictionary passed to the editor as its locale.
**Specification:**
  Given The editor would show English labels by default
  When  The editor UI is built with locale = locale_es
  Then  Labels are replaced, for example Crop->Recortar, Sepia2->Vintage, Free Drawing->Mano alzada, 'Rotate +90'->'Rotar +90', 'Custom icon'->'Cargar icono'
**Parameters:** About 100 label mappings; Sepia2 is shown as 'Vintage'; both 'Register custom icon' and 'Custom icon' map to 'Cargar icono'
**Edge cases handled:** Labels missing from the dictionary fall back to the editor's English default; Duplicate keys Multiply (lines 191 and 196), Shape (168 and 216) and Icon (169 and 228); the last one wins, but the values are the same, so nothing changes
**Suspected defect:** Typo at index.html:151: 'Text color' is translated as 'Coor de texto' instead of 'Color de texto'.
**Confidence:** High

### RULE-127: Download file name is a fixed prefix plus timestamp
**Category:** Policy
**Priority:** P2
**Source:** `legacy/tonga/dist/tui-image-editor.js:11771-11787`
**Plain English:** Every download is named 'imagen_YYYYMMDD_HHMMSS' with zero-padded local time, ignoring the original file name. The format's extension is added later.
**Specification:**
  Given The current local time is 2020-03-05 09:07:03
  When  The user downloads a PNG
  Then  The file name is 'imagen_20200305_090703.png'.
**Suspected defect:** The original image name is read and then overwritten with 'imagen', which is dead logic.
**Confidence:** High

## Rules requiring SME confirmation

- **RULE-006** (Medium): Should the edge check use the scaled object size and the actual canvas size instead of the unscaled size and the background image size?
- **RULE-008** (Medium): Should the span-offset adjustment apply only to <text> elements? Can an imported element have a first child without x/y lengths (for example <title> or <desc>)?
- **RULE-009** (Low): The comment says the matrix itself should be relative to left-top for PATHs, but the code changes only the cache key, not the matrix calculation. Does this patch actually fix the SVG save offset, or is the real fix elsewhere?
- **RULE-011** (Medium): Should the zoom-preserving resize run after the rotation undo/redo completes, and is truncation (vs rounding) of pixel sizes intended?
- **RULE-013** (Medium): Is the expected outcome that flipping twice returns every overlay object (paths, lines, SVG-loaded images) to its exact original position? Different anchor points are used before/after the first flip, so confirm which positions are correct for each object type.
- **RULE-014** (Medium): Does the ROTATE_IMAGE command normalize angles to a range (for example -360..360 or 0..359), and should silent rotations (slider drags) skip undo history by design?
- **RULE-015** (Medium): Should overlay objects keep their original origin (left/top) after rotation, or is permanently switching them to center origin intended?
- **RULE-018** (Medium): When a user zooms in (bigger/smaller) and then switches tool, should the zoom level be preserved or reset to 100%? The code currently forces scale 1.
- **RULE-021** (Medium): Was the generated background meant to be transparent or semi-transparent yellow? The code writes alpha 0.5 into an 8-bit channel, which stores 0, so it is fully transparent.
- **RULE-034** (Medium): Should generated ids be numbered per parent (parent_0, parent_1 for each group) or globally as now? Do any downstream features (map region lookup) rely on these generated ids?
- **RULE-046** (Medium): P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (Faithful. legacy/tonga/dist/tui-image-editor.js:11501-11552 does what the rule says. An image with xlink:href and nombre==='data-background' sets the canvas width and height and calls resizeEditor. The rotate slider gets Math.round(element.angle), so 29.6 becomes 30. The image becomes the background…
- **RULE-047** (Medium): Is an exact string match on the embedded data URL a reliable way to recognize the app's transparent background, given that the data URL prefix says jpeg but the content is a PNG?
- **RULE-054** (Medium): Is there any size or format limit on user-uploaded images enforced elsewhere, or is the browser accept filter the only check?
- **RULE-056** (Medium): Does clicking Bold a second time remove the bold style? The handler always sends fontWeight 'bold'.
- **RULE-058** (Medium): When eliminarObjetoFondoEditor is true, is the active object guaranteed to be the background object (for example the white JPG background)? Should a non-200 response or fetch error stop the download and tell the user?
- **RULE-059** (Medium): Should a hot background reload appear in the undo history? sustituirFondo removes its rotations from undo, but cargarFondo does not.
- **RULE-062** (Medium): P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (The rule card matches the code. Lines 1428-1462 add the Graphics instance as the first argument and pass the call to the invoker's execute or executeSilent. The invoker code outside the cited range confirms the rest. Around line 4562, _invokeExecution only pushes to the undo stack when _isSilent is…
- **RULE-066** (Medium): Which rectangles make getCroppedImageData return no data (zero size, outside the canvas)? Is a minimum crop size enforced in the Graphics/Cropper component?
- **RULE-069** (Medium): After a save and reload, nuevoObjeto is lost and the object switches to centre-based flipping. Is that the intended behaviour?
- **RULE-070** (Medium): P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (Compliance lens: this is undo/redo bookkeeping in a client-side image editor. It moves no money, enforces no legal or regulatory requirement, and creates no audit trail a controller would rely on. Undo history lives in memory and is a UX convenience, not a record of business transactions. If it chan…
- **RULE-071** (Medium): Should an undo on an empty history silently no-op, and should a failed undo restore the command to the undo stack?
- **RULE-074** (Medium): After loading a new image, overlays are removed from the canvas and only re-added on undo; should overlays persist onto the new image?
- **RULE-076** (Medium): Should undo/redo be available to Tonga users (the code keeps them) or hidden (as the 02.09.2019 comment says)? And should clicks on a disabled button be blocked rather than only styled?
- **RULE-078** (Medium): Is it intended that with no start image every tool and header button (including download) is unusable until the user loads a file?
- **RULE-079** (Medium): P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (The card describes the code accurately. In legacy/tonga/dist/tui-image-editor.js:6342-6361, _changeMenu does this when a submenu is already active: it removes 'active' from that submenu's button and removes the menu class from the main element. If discardSelection is set, it calls discardSelection.…
- **RULE-080** (Medium): After a copy-paste, should new shapes take the pasted shape's stroke and fill colours as well as its stroke width?
- **RULE-082** (Medium): Should a new session always open on the welcome image and require an explicit 'Comenzar' action to get a blank transparent canvas, or should it start on a blank canvas?
- **RULE-084** (Medium): Is force-unlocking the invoker (comment says otherwise state shows 'locked') intended, or is it masking a lock left by an unfinished command that should be completed first?
- **RULE-086** (Medium): P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (The code at legacy/tonga/dist/tui-image-editor.js:12097-12192 matches the rule. It builds a secondary canvas (#segundocanvas) with the main canvas's background image and _objects. The canvas is sized to the absolute bounding rect of canvasImage, so a rotated background is covered. Export runs toSVG…
- **RULE-096** (Medium): Is keeping the user's zoom level on window resize a required behaviour, or was it only a workaround for a layout glitch?
- **RULE-103** (Medium): P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (The rule matches the code. At dist/tui-image-editor.js:35350-35356 the image's SVG markup gets tipo="<this.tipo>" and nombre="<this.nombre // ''>". The import path also matches: fabric.SHARED_ATTRIBUTES includes 'tipo' (line 16295) and fabric.Image.ATTRIBUTE_NAMES adds 'nombre tipo' (lines 35758-357…
- **RULE-104** (Medium): Which operations are expected to be non-undoable (silent), and should a failed silent command restore normal recording?
- **RULE-108** (Medium): P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (The rule matches the code. In legacy/tonga/dist/tui-image-editor.js:6162-6172, _addDownloadEvent adds a click listener to each download element. The listener reads the button's 'tipo' attribute and calls _actions.main.download(tipo). The header template at lines 6578-6592 defines four .tui-image-edi…
- **RULE-109** (Medium): Citation was corrected by referee (The behavior is real, but index.html:259 is not what turns it off. That line puts 'usageStatistics: false' inside the 'includeUI' object. The ImageEditor constructor only checks the top-level 'options.usageStatistics' (dist/tui-image-editor.js:757-759, 'if (options.usageStatistics) sendHostName()'), so the nested key does not affect that check. Usage tracking is…
- **RULE-112** (Medium): P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (The rule card matches the code. In legacy/tonga/js/repositorio.js:44-46 the line is split on '/' into element, tooltip and fondo. Lines 59-62 then use 'cargarFondo' when fondo is exactly 'tongaappfondo' or 'tongaappfondo\r', and 'insertarImagen' otherwise. Line 76 attaches that function to the thumb…
- **RULE-114** (Medium): P0 panel split on whether this is critical to the system's core purpose or a costly-if-wrong rule (The rule card matches the code at legacy/tonga/dist/tui-image-editor.js:11792-11981. A rotated image exported as PDF or JPG sets usarObjetoFondoEditor. When the background is transparent and the image is rotated, the code removes the backgroundImage and adds a white rect sized to the rounded boundin…
- **RULE-116** (Medium): Does util.toInteger truncate or round (32.7 becomes 32 or 33)?
- **RULE-118** (Medium): Does the nuevoObjeto flag affect later positioning or flip logic (the comments say SVG-loaded images are positioned by centre point while inserted images use left)?
- **RULE-119** (Medium): Should z-order changes be undoable, and what should happen when nothing is selected?
- **RULE-121** (Medium): Key code bindings are only declared here; confirm the handler mapping (e.g. whether Z requires Ctrl/Cmd and Shift+Z also redoes).

## Rules folded into another

These rules described the same behavior as another rule in a different place, so they were merged into it (the kept rule lists their locations under "Also cited"):

- Analytics hostname reporting disabled (dist/tui-image-editor.js:5338-5346) into Third-party usage statistics are disabled
- Usage statistics (hostname reporting) disabled by default (dist/tui-image-editor.js:688-691) into Third-party usage statistics are disabled
- Default ranges for tool parameters (dist/tui-image-editor.js:10885-10906) into Default ranges for editing tool sliders
- Default text font is Noto Sans (dist/tui-image-editor.js:39477) into Default new text object
