            /* 2 */
                    _createClass(ImageEditor, [{}])
                        value: function _setSelectionStyle(selectionStyle, _ref)  {}
                        value: function getImagenBinario() {}
                        value: function setImagenBinario(value) {}
                        value: function getFondoTransparenteFalso() {}
                        value: function setFondoTransparenteFalso(value) {}
                        value: function getFondoTransparente() {}
                        value: function setFondoTransparente(value) {}
                        value: function getFactorZoom() {}
                        value: function setFactorZoom(value) {}
                        value: function setWidthImagenBackground(value) {}
                        value: function setHeightImagenBackground(value) {}
                        value: function getWidthImagenBackground() {}
                        value: function getHeightImagenBackground() {}
                        value: function _attachInvokerEvents() {}
                        value: function _attachGraphicsEvents() {}
                        value: function _attachDomEvents() {}
                        value: function _detachDomEvents() {}
                        value: function _onKeyDown(e) {}
                        value: function removeActiveObject() {}
                        value: function _onMouseDown(event, originPointer) {}
                        value: function _pushAddObjectCommand(obj) {}
                        value: function _onObjectActivated(props) {}
                        value: function _onObjectMoved(props) {}
                        value: function _onObjectScaled(props) {}
                        value: function getDrawingMode() {}
                        value: function clearObjects() {}
                        value: function deactivateAll() {}
                        value: function discardSelection() {}
                        value: function changeSelectableAll(selectable) {}
                        value: function execute(commandName) {}
                        value: function executeSilent(commandName) {}
                        value: function undo() {}
                        value: function redo() {}
                        value: function getFileURL(imgFile, imageName) {}
                        value: function loadImageFromFile(imgFile, imageName) {}
                        value: function loadImageFromURL(url, imageName) {}
                        value: function addImageObject(imgUrl, nombre) {}
                        value: function startDrawingMode(mode, option) {}
                        value: function stopDrawingMode() {}
                        value: function crop(rect) {}
                        value: function getCropzoneRect() {}
                        value: function setCropzoneRect(mode) {}
                        value: function _flip(type) {}
                        value: function flipX() {}
                        value: function flipY() {}
                        value: function resetFlip() {}
                        value: function _rotate(type, angle, isSilent) {}
                        value: function rotate(angle, isSilent) {}
                        value: function setAngle(angle, isSilent) {}
                        value: function setBrush(option) {}
                        value: function setDrawingShape(type, options) {}
                        value: function addShape(type, options) {}
                        value: function changeShape(id, options) {}
                        value: function addText(text, options) {}
                        value: function changeText(id, text) {}
                        value: function changeTextStyle(id, styleObj) {}
                        value: function _changeActivateMode(type) {}
                        value: function _onTextChanged(objectProps) {}
                        value: function _onIconCreateResize(originPointer) {}
                        value: function _onIconCreateEnd(originPointer) {}
                        value: function _onTextEditing() {}
                        value: function _onAddText(event) {}
                        value: function _onAddObject(objectProps) {}
                        value: function _onAddObjectAfter(objectProps) {}
                        value: function _selectionCleared() {}
                        value: function _selectionCreated(eventTarget) {}
                        value: function registerIcons(infos) {}
                        value: function changeCursor(cursorType) {}
                        value: function addIcon(type, options) {}
                        value: function changeIconColor(id, color) {}
                        value: function removeObject(id) {}
                        value: function hasFilter(type) {}
                        value: function removeFilter(type) {}
                        value: function applyFilter(type, options) {}
                        value: function toDataURL(options) {}
                        value: function getImageName() {}
                        value: function getCanvas() {}
                        value: function setSubeZIndex() {}
                        value: function setBajaZIndex() {}
                        value: function recargar() {}
                        value: function comenzar() {}
                        value: function reload() {}
                        value: function _getBackgroundImage() {}
                        value: function clearUndoStack() {}
                        value: function clearRedoStack() {}
                        value: function isEmptyUndoStack() {}
                        value: function isEmptyRedoStack() {}
                        value: function resizeCanvasDimension(dimension) {}
                        value: function destroy() {}
                        value: function _setPositions(options) {}
                        value: function setObjectProperties(id, keyValue) {}
                        value: function setObjectPropertiesQuietly(id, keyValue) {}
                        value: function getObjectProperties(id, keys) {}
                        value: function getCanvasSize() {}
                        value: function getObjectPosition(id, originX, originY) {}
                        value: function setObjectPosition(id, posInfo) {}

            /* 68 */
                    _createClass(Invoker, [{}])
                        value: function _invokeExecution(command) {}
                        value: function _invokeUndo(command) {}
                        value: function _fireRedoStackChanged() {}
                        value: function _fireUndoStackChanged() {}
                        value: function lock() {}
                        value: function unlock() {}
                        value: function executeSilent() {}
                        value: function execute() {}
                        value: function undo() {}
                        value: function redo() {}
                        value: function pushUndoStack(command, isSilent) {}
                        value: function pushRedoStack(command, isSilent) {}
                        value: function isEmptyRedoStack() {}
                        value: function isEmptyUndoStack() {}
                        value: function clearUndoStack() {}
                        value: function clearRedoStack() {}
            
            /* 69 */
                        _classCallCheck(this, Command);
                        this.name = actions.name;
                        this.args = args;
                        this.execute = actions.execute;
                        this.undo = actions.undo;
                        this.executeCallback = actions.executeCallback || null;
                        this.undoCallback = actions.undoCallback || null;
                        this.undoData = {};

                    _createClass(Command, [{
                        value: function execute() {}
                        value: function undo() {}
                        value: function setExecuteCallback(callback) {}
                        value: function setUndoCallback(callback) {}

            /* 73 */
                    componentNames: _util2.default.keyMirror("IMAGE_LOADER", "CROPPER", "FLIP", "ROTATION", "FREE_DRAWING", "LINE", "TEXT", "IMAGEN", "ICON", "FILTER", "SHAPE"),

                    commandNames: {
                        CLEAR_OBJECTS: "clearObjects",
                        LOAD_IMAGE: "loadImage",
                        FLIP_IMAGE: "flip",
                        ROTATE_IMAGE: "rotate",
                        ADD_OBJECT: "addObject",
                        REMOVE_OBJECT: "removeObject",
                        APPLY_FILTER: "applyFilter",
                        REMOVE_FILTER: "removeFilter",
                        ADD_ICON: "addIcon",
                        CHANGE_ICON_COLOR: "changeIconColor",
                        ADD_IMAGEN: "addImagen",
                        CHANGE_IMAGEN_COLOR: "changeImagenColor",
                        ADD_SHAPE: "addShape",
                        CHANGE_SHAPE: "changeShape",
                        ADD_TEXT: "addText",
                        CHANGE_TEXT: "changeText",
                        CHANGE_TEXT_STYLE: "changeTextStyle",
                        ADD_IMAGE_OBJECT: "addImageObject",
                        RESIZE_CANVAS_DIMENSION: "resizeCanvasDimension",
                        SET_OBJECT_PROPERTIES: "setObjectProperties",
                        SET_OBJECT_POSITION: "setObjectPosition"
                    },

                    eventNames: {
                        OBJECT_ACTIVATED: "objectActivated",
                        OBJECT_MOVED: "objectMoved",
                        OBJECT_SCALED: "objectScaled",
                        OBJECT_CREATED: "objectCreated",
                        TEXT_EDITING: "textEditing",
                        TEXT_CHANGED: "textChanged",
                        IMAGEN_CREATE_RESIZE: "imagenCreateResize",
                        IMAGEN_CREATE_END: "imagenCreateEnd",
                        ICON_CREATE_RESIZE: "iconCreateResize",
                        ICON_CREATE_END: "iconCreateEnd",
                        ADD_TEXT: "addText",
                        ADD_OBJECT: "addObject",
                        ADD_OBJECT_AFTER: "addObjectAfter",
                        MOUSE_DOWN: "mousedown",
                        MOUSE_UP: "mouseup",
                        MOUSE_MOVE: "mousemove",
                        // UNDO/REDO Events
                        REDO_STACK_CHANGED: "redoStackChanged",
                        UNDO_STACK_CHANGED: "undoStackChanged",
                        SELECTION_CLEARED: "selectionCleared",
                        SELECTION_CREATED: "selectionCreated"
                    },

            /* 74 */
                    function Ui(element, options, actions) {}

                        this.options = this._initializeOption(options);
                        this._actions = actions;
                        this.submenu = false;
                        this.imageSize = {};
                        this.uiSize = {};
                        this._locale = new _locale2.default(this.options.locale);
                        this.theme = new _theme2.default(this.options.theme);

                        this._submenuChangeTransection = false;
                        this._selectedElement = null;
                        this._mainElement = null;
                        this._editorElementWrap = null;
                        this._editorElement = null;
                        this._menuElement = null;
                        this._subMenuElement = null;
                        this._makeUiElement(element);
                        this._setUiSize();
                        this._initMenuEvent = false;

                        this._els = {
                            // JBD 02.09.2019 OCULTO-UNDO-REDO Quito el menú de undo-redo
                            undo: this._menuElement.querySelector("#tie-btn-undo"),
                            redo: this._menuElement.querySelector("#tie-btn-redo"),
                            reset: this._menuElement.querySelector("#tie-btn-reset"),
                            delete: this._menuElement.querySelector("#tie-btn-delete"),
                            deleteAll: this._menuElement.querySelector("#tie-btn-delete-all"),
                            download: this._selectedElement.querySelectorAll(".tui-image-editor-download-btn-tonga") /* JBD 20.08.2019 Cambio el estilo para poner imagenes Tonga */,
                            load: this._selectedElement.querySelectorAll(".tui-image-editor-load-btn"),
                            smaller: this._selectedElement.querySelector(".tie-btn-smaller"),
                            bigger: this._selectedElement.querySelector(".tie-btn-bigger"),
                            zabajo: this._selectedElement.querySelector(".tie-btn-z-abajo"),
                            zarriba: this._selectedElement.querySelector(".tie-btn-z-arriba"),
                            recargar: this._selectedElement.querySelector(".tie-btn-recargar"),
                            reload: this._selectedElement.querySelector(".tie-btn-reload"),
                            comenzar: this._selectedElement.querySelector(".tie-btn-comenzar"),
                        };

                        value: function setUiDefaultSelectionStyle(option) {}
                        value: function resizeEditor() {}
                        value: function changeUndoButtonStatus(enableStatus) {}
                        value: function changeRedoButtonStatus(enableStatus) {}
                        value: function changeResetButtonStatus(enableStatus) {}
                        value: function changeDeleteAllButtonEnabled(enableStatus) {}
                        value: function changeDeleteButtonEnabled(enableStatus) {}
                        value: function _initializeOption(options) {}
                        value: function _setUiSize() {}
                        value: function _makeSubMenu() {}
                        value: function _makeUiElement(element) {}
                        value: function _makeMenuElement(menuName) {}
                        value: function _addHelpActionEvent(helpName) {}
                        value: function _addDownloadEvent() {}
                        value: function _addLoadEvent() {}
                        value: function _addMenuEvent(menuName) {}
                        value: function _addSubMenuEvent(menuName) {}
                        value: function getEditorArea() {}
                        value: function activeMenuEvent() {}
                        value: function initCanvas() {}
                        value: function _getLoadImage() {}
                        value: function changeMenu(menuName) {}
                        value: function _changeMenu(menuName, toggle, discardSelection) {}
                        value: function _initMenu() {}
                        value: function _getEditorDimension() {}
                        value: function _setEditorPosition(menuBarPosition) {}
            
            /* 80 */
                    _createClass(Shape, [{}])
                        value: function addEvent(actions) {}
                        value: function setShapeStatus(_ref2) {}
                        value: function changeStartMode() {}
                        value: function changeStandbyMode() {}
                        value: function setMaxStrokeValue(maxValue) {}
                        value: function setStrokeValue(value) {}
                        value: function getStrokeValue() {}
                        value: function _changeShapeHandler(event) {}
                        value: function _changeStrokeRangeHandler(value) {}
                        value: function _changeFillColorHandler(color) {}
                        value: function _changeStrokeColorHandler(color) {}

            /* 88 */
                    _createClass(Flip, [{}])
                        value: function addEvent(actions) {}
                        value: function _changeFlip(event) {}

            /* 90 */
                    _createClass(Rotate, [{}])
                        value: function setRangeBarAngle(type, angle) {}
                        value: function _setRangeBarRatio(angle) {}
                        value: function _inicializarRangeBar(angle) {}
                        value: function addEvent(actions) {}
                        value: function _changeRotateForRange(value, isLast) {}
                        value: function _changeRotateForButton(event) {}

            /* 92 */
                    _createClass(Text, [{}])
                        value: function addEvent(actions) {}
                        value: function changeStandbyMode() {}
                        value: function changeStartMode() {}
                        value: function _setTextEffectHandler(event) {}
                        value: function _setTextFontFamilyHandler(event) {}
                        value: function _setTextAlignHandler(event) {}
                        value: function _changeTextRnageHandler(value) {}
                        value: function _changeColorHandler(color) {}
                        get: function get() {}
                        get: function get() {}
                        set: function set(value) {}

            /* 94 */
                    _createClass(Mask, [{}])
                        value: function addEvent(actions) {}
                        value: function _applyMask() {}
                        value: function _loadMaskFile(event) {}


            /* 96 _icon2 */
                    _createClass(Icon, [{}])
                        value: function addEvent(actions) {}
                        value: function clearIconType() {}
                        value: function registDefaultIcon() {}
                        value: function setIconPickerColor(iconColor) {}
                        value: function changeStandbyMode() {}
                        value: function _changeColorHandler(color) {}
                        value: function _addIconHandler(event) {}
                        value: function _registeIconHandler(event) {}

            /* 98 */
                    _createClass(Draw, [{}])
                        value: function addEvent(actions) {
                        value: function setDrawMode() {
                        value: function changeStandbyMode() {
                        value: function changeStartMode() {
                        value: function _changeDrawType(event) {
                        value: function _changeDrawColor(color) {
                        value: function _changeDrawRange(value) {

            /* 100 */
                    _createClass(Filter, [{}])
                        value: function addEvent(_ref2) {
                        value: function _changeRangeValue(applyFilter, filter) {
                        value: function _getFilterOption(type) {
                        value: function _makeControlElement() {
                        value: function _pickerWithRange(pickerControl) {
                        value: function _pickerWithSelectbox(pickerControl) {
                        value: function _drawSelectOptionList(selectlist, optionlist) {
                        value: function _pickerWithSelectboxForAddEvent(selectlist, optionlist) {
                        value: function _makeSelectOptionList(selectlist) {

            /* 103 */
                    getActions: function getActions() {}
                    _mainAction: function _mainAction() 
                            initLoadImage: function initLoadImage(imagePath, imageName) {}
                            undo: function undo() {}
                            redo: function redo() {}
                            reset: function reset() {}
                            delete: function _delete() {}
                            deleteAll: function deleteAll() {}
                            bigger: function bigger() {}
                            smaller: function smaller() {}
                            zarriba: function zarriba() {}
                            zabajo: function zabajo() {}
                            recargar: function recargar() {}
                            reload: function reload() {}
                            comenzar: function comenzar() {}
                            load: function load(file) {}
                            download: function download(tipo) {}
                    descargarImagen: function descargarImagen(tipo, imageName) {}
                    cambiarAngulo: function cambiarAngulo(angulo) {}
                    crearBotonComenzar: function crearBotonComenzar() {}
                    eliminarBotonComenzar: function eliminarBotonComenzar() {}
                    cargarFondo: function cargarFondo(nombreFichero, imgUrl) {}
                    _iconAction: function _iconAction() {}
                    _imagenAction: function _imagenAction() {}
                    _drawAction: function _drawAction() {}
                    _maskAction: function _maskAction() {}
                    _textAction: function _textAction() {}
                    _rotateAction: function _rotateAction() {}
                    _shapeAction: function _shapeAction() {}
                    _cropAction: function _cropAction() {}
                    _flipAction: function _flipAction() {}
                    _filterAction: function _filterAction() {}
                    setReAction: function setReAction() {}
                    _commonAction: function _commonAction() {}
                    mixin: function mixin(ImageEditor) {}

            /* 104 */
                    _createClass(ImageTracer, [{}])
                        value: function imageToSVG(url, callback, options) {}
                        value: function imagedataToSVG(imgd, options) {}
                        value: function imageToTracedata(url, callback, options) {}
                        value: function imagedataToTracedata(imgd, options) {}
                        value: function checkoptions(options) {}
                        value: function colorquantization(imgd, options) {}
                        value: function samplepalette(numberofcolors, imgd) {}
                        value: function samplepalette2(numberofcolors, imgd) {}
                        value: function generatepalette(numberofcolors) {}
                        value: function layering(ii) {}
                        value: function layeringstep(ii, cnum) {}
                        value: function pathscan(arr, pathomit) {}
                        value: function boundingboxincludes(parentbbox, childbbox) {}
                        value: function batchpathscan(layers, pathomit) {}
                        value: function internodes(paths, options) {}
                        value: function testrightangle(path, idx1, idx2, idx3, idx4, idx5) {}
                        value: function getdirection(x1, y1, x2, y2) {}
                        value: function batchinternodes(bpaths, options) {}
                        value: function tracepath(path, ltres, qtres) {}
                        value: function fitseq(path, ltres, qtres, seqstart, seqend) {}
                        value: function batchtracepaths(internodepaths, ltres, qtres) {}
                        value: function batchtracelayers(binternodes, ltres, qtres) {}
                        value: function roundtodec(val, places) {}
                        value: function svgpathstring(tracedata, lnum, pathnum, options) {}
                        value: function getsvgstring(tracedata, options) {}
                        value: function compareNumbers(a, b) {}
                        value: function torgbastr(c) {}
                        value: function tosvgcolorstr(c, options) {}
                        value: function appendSVGString(svgstr, parentid) {}
                        value: function blur(imgd, radius, delta) {}
                        value: function loadImage(url, callback, options) {}
                        value: function getImgdata(canvas) {}
                        value: function drawLayers(layers, palette, scale, parentid) {}

            /* 105 */
                    function Graphics(element) {
                        this.canvasImage = null;
                        this.cssMaxWidth = cssMaxWidth || DEFAULT_CSS_MAX_WIDTH;
                        this.cssMaxHeight = cssMaxHeight || DEFAULT_CSS_MAX_HEIGHT;
                        this.useItext = useItext;
                        this.useDragAddIcon = useDragAddIcon;
                        this.useDragAddImagen = useDragAddImagen;
                        this.cropSelectionStyle = {};
                        this.targetObjectForCopyPaste = null;
                        this.imageName = "";
                        this._objects = {};
                        this._canvas = null;
                        this._drawingMode = drawingModes.NORMAL;
                        this._drawingModeMap = {};
                        this._componentMap = {};
                        this._handler = {
                            onMouseDown: this._onMouseDown.bind(this),
                            onObjectAdded: this._onObjectAdded.bind(this),
                            onObjectRemoved: this._onObjectRemoved.bind(this),
                            onObjectMoved: this._onObjectMoved.bind(this),
                            onObjectScaled: this._onObjectScaled.bind(this),
                            onObjectSelected: this._onObjectSelected.bind(this),
                            onPathCreated: this._onPathCreated.bind(this),
                            onSelectionCleared: this._onSelectionCleared.bind(this),
                            onSelectionCreated: this._onSelectionCreated.bind(this)
                            // JBD 13.03.2020 DESHACER
                            , onFondoAdded: this._onFondoAdded.bind(this)
                        };
                        this._setObjectCachingToFalse();
                        this._setCanvasElement(element);
                        this._createDrawingModeInstances();
                        this._createComponents();
                        this._attachCanvasEvents();
                    }

                    _createClass(Graphics, [{}])
                        value: function destroy() {}
                        value: function deactivateAll() {}
                        value: function renderAll() {}
                        value: function add(objects) {}
                        value: function contains(target) {}
                        value: function getObjects() {}
                        value: function getObject(id) {}
                        value: function remove(target) {}
                        value: function removeAll(includesBackground) {}
                        value: function removeObjectById(id) {}
                        value: function getObjectId(object) {}
                        value: function getActiveObject() {}
                        value: function getActiveObjectIdForRemove() {}
                        value: function isReadyRemoveObject() {}
                        value: function getActiveObjects() {}
                        value: function getActiveSelectionFromObjects(objects) {}
                        value: function setActiveObject(target) {}
                        value: function setCropSelectionStyle(style) {}
                        value: function getComponent(name) {}
                        value: function getDrawingMode() {}
                        value: function startDrawingMode(mode, option) {}
                        value: function stopDrawingMode() {}
                        value: function toDataURL(options) {}
                        value: function setCanvasImage(name, canvasImage) {}
                        value: function setCssMaxDimension(maxDimension) {}
                        value: function adjustCanvasDimension() {}
                        value: function restoreCanvasDimension() {}
                        value: function biggerCanvasDimension() {}
                        value: function smallerCanvasDimension() {}
                        value: function setCanvasCssDimension(dimension) {}
                        value: function getCanvasCssDimension() {}
                        value: function setCanvasBackstoreDimension(dimension) {}
                        value: function setImageProperties(setting, withRendering) {}
                        value: function getCanvasElement() {}
                        value: function getCanvas() {}
                        value: function getCanvasImage() {}
                        value: function getImageName() {}
                        value: function addImageObject(imgUrl, nombre) {}
                        value: function getCenter() {}
                        value: function getCropzoneRect() {}
                        value: function setCropzoneRect(mode) {}
                        value: function getCroppedImageData(cropRect) {}
                        value: function setBrush(option) {}
                        value: function setDrawingShape(type, options) {}
                        value: function registerPaths(pathInfos) {}
                        value: function changeCursor(cursorType) {}
                        value: function hasFilter(type) {}
                        value: function setSelectionStyle(styles) {}
                        value: function setObjectProperties(id, props) {}
                        value: function getObjectProperties(id, keys) {}
                        value: function getObjectPosition(id, originX, originY) {}
                        value: function setObjectPosition(id, posInfo) {}
                        value: function getCanvasSize() {}
                        value: function _getDrawingModeInstance(modeName) {}
                        value: function _setObjectCachingToFalse() {}
                        value: function _setCanvasElement(element) {}
                        value: function _createDrawingModeInstances() {}
                        value: function _createComponents() {}
                        value: function _register(map, module) {}
                        value: function _isSameDrawingMode(mode) {}
                        value: function _calcMaxDimension(width, height) {}
                        value: function _callbackAfterLoadingImageObject(obj) {}
                        value: function _attachCanvasEvents() {}
                        value: function _onMouseDown(fEvent) {}
                        value: function _onObjectAdded(fEvent) {}
                        value: function _onFondoAdded(fEvent) {}
                        value: function _onObjectRemoved(fEvent) {}
                        value: function _onObjectMoved(fEvent) {}
                        value: function _onObjectScaled(fEvent) {}
                        value: function _onObjectSelected(fEvent) {}
                        value: function _onPathCreated(obj) {}
                        value: function _onSelectionCleared() {}
                        value: function _onSelectionCreated(fEvent) {}
                        value: function discardSelection() {}
                        value: function changeSelectableAll(selectable) {}
                        value: function createObjectProperties(obj) {}
                        value: function _createTextProperties(obj) {}
                        value: function _addFabricObject(obj) {}
                        value: function _removeFabricObject(id) {}
                        value: function resetTargetObjectForCopyPaste() {}
                        value: function pasteObject() {}
                        value: function _cloneObject(targetObjects) {}
                        value: function _cloneObjectItem(targetObject) {}
                        value: function _copyFabricObjectForPaste(targetObject) {}
                        value: function _copyFabricObject(targetObject) {}

            /* 115 */
                    _createClass(ImageLoader, [{}])
                        value: function load(imageName, img) {}
                        value: function _setBackgroundImage(img) {}

            /* 116 */
                    _createClass(Component, [{}])
                        value: function fire() {}
                        value: function setCanvasImage(name, oImage) {}
                        value: function getCanvasElement() {}
                        value: function getCanvas() {}
                        value: function getCanvasImage() {}
                        value: function getImageName() {}
                        value: function getEditor() {}
                        value: function getName() {}
                        value: function setImageProperties(setting, withRendering) {}
                        value: function setCanvasCssDimension(dimension) {}
                        value: function getCanvasCssDimension() {}
                        value: function setCanvasBackstoreDimension(dimension) {}
                        value: function adjustCanvasDimension() {}

            /* 117 */
                    _createClass(Cropper, [{}])
                        value: function start() {}
                        value: function end() {}
                        value: function _onFabricMouseDown(fEvent) {}
                        value: function _onFabricMouseMove(fEvent) {}
                        value: function _calcRectDimensionFromPoint(x, y) {}
                        value: function _onFabricMouseUp() {}
                        value: function getCroppedImageData(cropRect) {}
                        value: function getCropzoneRect() {}
                        value: function setCropzoneRect(presetRatio) {}
                        value: function _getPresetCropSizePosition(presetRatio) {}
                        value: function _onKeyDown(e) {}
                        value: function _onKeyUp(e) {}

            /* 118 */
                var Cropzone = _fabric.fabric.util.createClass(_fabric.fabric.Rect {})

                    initialize: function initialize(canvas, options, extendsOptions) {}
                    _renderCropzone: function _renderCropzone() {}
                    _render: function _render() {}
                    _fillOuterRect: function _fillOuterRect(ctx, fillStyle) {}
                    _fillInnerRect: function _fillInnerRect(ctx) {}
                    _caculateInnerPosition: function _caculateInnerPosition(outer, size) {}
                    _getCoordinates: function _getCoordinates() {}
                    _strokeBorder: function _strokeBorder(ctx, strokeStyle, _ref) {}
                    _onMoving: function _onMoving() {}
                    _onScaling: function _onScaling(fEvent) {}
                    _calcScalingSizeFromPointer: function _calcScalingSizeFromPointer(pointer) {}
                    _calcTopLeftScalingSizeFromPointer: function _calcTopLeftScalingSizeFromPointer(x, y) {}
                    _calcBottomRightScalingSizeFromPointer: function _calcBottomRightScalingSizeFromPointer(x, y) {}
                    _makeScalingSettings: function _makeScalingSettings(tl, br) {}

            /* 119 */
                    _createClass(Flip, [{}])
                        value: function getCurrentSetting() {}
                        value: function set(newSetting) {}
                        value: function _invertAngle(isChangingFlipX, isChangingFlipY) {}
                        value: function _flipObjects(isChangingFlipX, isChangingFlipY) {}
                        value: function reset() {}
                        value: function flipX() {}
                        value: function flipY() {}

            /* 120 */
                    _createClass(Rotation, [{}])
                        value: function getCurrentAngle() {}
                        value: function setAngle(angle) {}
                        value: function _rotateForEachObject(oldImageCenter, newImageCenter, angleDiff) {}
                        value: function rotate(additionalAngle) {}

            /* 121 */
                    _createClass(FreeDrawing, [{}])
                        value: function start(setting) {}
                        value: function setBrush(setting) {}
                        value: function end() {}

            /* 122 */
                    _createClass(Line, [{}])
                        value: function start(setting) {}
                        value: function setBrush(setting) {}
                        value: function end() {}
                        value: function _onFabricMouseDown(fEvent) {}
                        value: function _onFabricMouseMove(fEvent) {}
                        value: function _onFabricMouseUp() {}

            /* 123 */
                    _createClass(Text, [{}])
                        value: function start() {}
                        value: function end() {}
                        value: function add(text, options) {}
                        value: function change(activeObj, text) {}
                        value: function setStyle(activeObj, styleObj) {}
                        value: function getText(activeObj) {}
                        value: function setSelectedInfo(obj, state) {}
                        value: function isSelected() {}
                        value: function getSelectedObj() {}
                        value: function setCanvasRatio() {}
                        value: function getCanvasRatio() {}
                        value: function _setInitPos(position) {}
                        value: function _createTextarea() {}
                        value: function _removeTextarea() {}
                        value: function _onInput() {}
                        value: function _onKeyDown() {}
                        value: function _onBlur() {}
                        value: function _onScroll() {}
                        value: function _onFabricScaling(fEvent) {}
                        value: function _onFabricSelectClear(fEvent) {}
                        value: function _onFabricSelect(fEvent) {}
                        value: function _onFabricMouseDown(fEvent) {}
                        value: function _fireAddText(fEvent) {}
                        value: function _onFabricMouseUp(fEvent) {}
                        value: function _isDoubleClick(newClickTime) {}
                        value: function _changeToEditingMode(obj) {}

            /* 124 */
                    _createClass(Icon, [{}])
                        value: function add(type, options) {}
                        value: function _addWithDragEvent(canvas) {}
                        value: function registerPaths(pathInfos) {}
                        value: function setColor(color, obj) {}
                        value: function getColor(obj) {}
                        value: function _createIcon(path) {}

            /* 125 */
                    _createClass(Filter, [{}])
                        value: function add(type, options) {}
                        value: function remove(type) {}
                        value: function hasFilter(type) {}
                        value: function getOptions(type) {}
                        value: function _changeFilterValues(imgFilter, options) {}
                        value: function _apply(sourceImg, callback) {}
                        value: function _getSourceImage() {}
                        value: function _createFilter(sourceImg, type, options) {}
                        value: function _getFilter(sourceImg, type) {}
                        value: function _removeFilter(sourceImg, type) {}
                        value: function _getFabricFilterType(type) {}

            /* 131 */
                    _createClass(Shape, [{}])
                        value: function start() {}
                        value: function end() {}
                        value: function setStates(type, options) {}
                        value: function add(type, options) {}
                        value: function change(shapeObj, options) {}
                        value: function _createInstance(type, options) {}
                        value: function _extendOptions(options) {}
                        value: function _bindEventOnShape(shapeObj) {}
                        value: function _onFabricMouseDown(fEvent) {}
                        value: function _onFabricMouseMove(fEvent) {}
                        value: function _onFabricMouseUp() {}
                        value: function _onKeyDown(e) {}
                        value: function _onKeyUp(e) {}

         /* 140 */ /* 141 */ /***/
                    name: commandNames.ADD_ICON}

            /* 142 */
                    name: commandNames.ADD_IMAGE_OBJECT,

            /* 143 */
                    name: commandNames.ADD_OBJECT,

            /* 144 */
                    name: commandNames.ADD_SHAPE,

            /* 145 */
                    name: commandNames.ADD_TEXT,

            /* 146 */
                    name: commandNames.APPLY_FILTER,

            /* 147 */
                    name: commandNames.CHANGE_ICON_COLOR,

            /* 148 */
                    name: commandNames.CHANGE_SHAPE,

            /* 149 */
                    name: commandNames.CHANGE_TEXT,

            /* 150 */
                    name: commandNames.CHANGE_TEXT_STYLE,

            /* 151 */
                    name: commandNames.CLEAR_OBJECTS,

            /* 152 */
                    name: commandNames.FLIP_IMAGE,

            /* 153 */
                    name: commandNames.LOAD_IMAGE,

            /* 154 */
                    name: commandNames.REMOVE_FILTER,

            /* 155 */
                    name: commandNames.REMOVE_OBJECT,

            /* 156 */
                    name: commandNames.RESIZE_CANVAS_DIMENSION,

            /* 157 */
                    name: commandNames.ROTATE_IMAGE,

            /* 158 */
                    name: commandNames.SET_OBJECT_PROPERTIES,

            /* 159 */
                    name: commandNames.SET_OBJECT_POSITION,

            /* 160 _imagen2 */
                    _createClass(Imagen, [{}])
                        value: function addEvent(actions) {}
                        value: function clearImagenType() {}
                        value: function changeStandbyMode() {}
                        value: function _addImagenHandler(event) {}
                        value: function _registerImagenHandler(event) {}

            /* 162 */
                    _createClass(Imagen, [{
                        value: function add(type, options) {
                        value: function _addWithDragEvent(canvas) {
                        value: function registerPaths(pathInfos) {
                        value: function setColor(color, obj) {
                        value: function getColor(obj) {
