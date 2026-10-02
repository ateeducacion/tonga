                    name: commandNames.ADD_ICON}
                    execute: function execute(graphics, type, options) {
                        var _this = this;

                        var iconComp = graphics.getComponent(ICON);

                        return iconComp.add(type, options).then(function (objectProps) {
                            _this.undoData.object = graphics.getObject(objectProps.id);

                            return objectProps;
                        });
                    },

            /* 142 */
                    name: commandNames.ADD_IMAGE_OBJECT,
                    execute: function execute(graphics, imgUrl, nombre) {
                        // JBD 23.08.2019 IDENTIFICAR IMAGENES - Paso el nombre del fichero para añadirlo como propiedad a la imagen
                        var _this = this;

                        return graphics.addImageObject(imgUrl, nombre).then(function (objectProps) {
                            _this.undoData.object = graphics.getObject(objectProps.id);

                            return objectProps;
                        });
                    },

            /* 143 */
                    name: commandNames.ADD_OBJECT,
                    execute: function execute(graphics, object) {
                        return new _promise2.default(function (resolve, reject) {
                            if (!graphics.contains(object)) {
                                graphics.add(object);
                                resolve(object);
                            } else {
                                reject(rejectMessages.addedObject);
                            }
                        });
                    },

            /* 144 */
                    name: commandNames.ADD_SHAPE,
                    execute: function execute(graphics, type, options) {
                        var _this = this;

                        var shapeComp = graphics.getComponent(SHAPE);

                        return shapeComp.add(type, options).then(function (objectProps) {
                            _this.undoData.object = graphics.getObject(objectProps.id);

                            return objectProps;
                        });
                    },

            /* 145 */
                    name: commandNames.ADD_TEXT,
                    execute: function execute(graphics, text, options) {
                        var _this = this;

                        var textComp = graphics.getComponent(TEXT);

                        return textComp.add(text, options).then(function (objectProps) {
                            _this.undoData.object = graphics.getObject(objectProps.id);

                            return objectProps;
                        });
                    },

            /* 146 */
                    name: commandNames.APPLY_FILTER,
                    execute: function execute(graphics, type, options) {
                        var filterComp = graphics.getComponent(FILTER);

                        if (type === "mask") {
                            var maskObj = graphics.getObject(options.maskObjId);

                            if (!(maskObj && maskObj.isType("image"))) {
                                return Promise.reject(rejectMessages.invalidParameters);
                            }

                            options = {
                                mask: maskObj
                            };
                        }

                        if (type === "mask") {
                            this.undoData.object = options.mask;
                            graphics.remove(options.mask);
                        } else {
                            this.undoData.options = filterComp.getOptions(type);
                        }

                        return filterComp.add(type, options);
                    },

            /* 147 */
                    name: commandNames.CHANGE_ICON_COLOR,
                    execute: function execute(graphics, id, color) {
                        var _this = this;

                        return new _promise2.default(function (resolve, reject) {
                            var iconComp = graphics.getComponent(ICON);
                            var targetObj = graphics.getObject(id);

                            if (!targetObj) {
                                reject(rejectMessages.noObject);
                            }

                            _this.undoData.object = targetObj;
                            _this.undoData.color = iconComp.getColor(targetObj);
                            iconComp.setColor(color, targetObj);
                            resolve();
                        });
                    },

            /* 148 */
                    name: commandNames.CHANGE_SHAPE,
                    execute: function execute(graphics, id, options) {
                        var _this = this;

                        var shapeComp = graphics.getComponent(SHAPE);
                        var targetObj = graphics.getObject(id);

                        if (!targetObj) {
                            return _promise2.default.reject(rejectMessages.noObject);
                        }

                        this.undoData.object = targetObj;
                        this.undoData.options = {};
                        _tuiCodeSnippet2.default.forEachOwnProperties(options, function (value, key) {
                            _this.undoData.options[key] = targetObj[key];
                        });

                        return shapeComp.change(targetObj, options);
                    },

            /* 149 */
                    name: commandNames.CHANGE_TEXT,
                    execute: function execute(graphics, id, text) {
                        var textComp = graphics.getComponent(TEXT);
                        var targetObj = graphics.getObject(id);

                        if (!targetObj) {
                            return _promise2.default.reject(rejectMessages.noObject);
                        }

                        this.undoData.object = targetObj;
                        this.undoData.text = textComp.getText(targetObj);

                        return textComp.change(targetObj, text);
                    },

            /* 150 */
                    name: commandNames.CHANGE_TEXT_STYLE,
                    execute: function execute(graphics, id, styles) {
                        var _this = this;

                        var textComp = graphics.getComponent(TEXT);
                        var targetObj = graphics.getObject(id);

                        if (!targetObj) {
                            return _promise2.default.reject(rejectMessages.noObject);
                        }

                        this.undoData.object = targetObj;
                        this.undoData.styles = {};
                        _tuiCodeSnippet2.default.forEachOwnProperties(styles, function (value, key) {
                            _this.undoData.styles[key] = targetObj[key];
                        });

                        return textComp.setStyle(targetObj, styles);
                    },

            /* 151 */
                    name: commandNames.CLEAR_OBJECTS,
                    execute: function execute(graphics) {
                        var _this = this;

                        return new _promise2.default(function (resolve) {
                            _this.undoData.objects = graphics.removeAll();
                            resolve();
                        });
                    },

            /* 152 */
                    name: commandNames.FLIP_IMAGE,
                    execute: function execute(graphics, type) {
                        var flipComp = graphics.getComponent(FLIP);

                        this.undoData.setting = flipComp.getCurrentSetting();

                        return flipComp[type]();
                    },

            /* 153 */
                    name: commandNames.LOAD_IMAGE,
                    execute: function execute(graphics, imageName, imgUrl) {
                        var loader = graphics.getComponent(IMAGE_LOADER);
                        var prevImage = loader.getCanvasImage();
                        var prevImageWidth = prevImage ? prevImage.width : 0;
                        var prevImageHeight = prevImage ? prevImage.height : 0;
                        var objects = graphics.removeAll(true).filter(function (objectItem) {
                            return objectItem.type !== "cropzone";
                        });

                        objects.forEach(function (objectItem) {
                            objectItem.evented = true;
                        });

                        this.undoData = {
                            name: loader.getImageName(),
                            image: prevImage,
                            objects: objects
                        };

                        return loader.load(imageName, imgUrl).then(function (newImage) {
                            return {
                                oldWidth: prevImageWidth,
                                oldHeight: prevImageHeight,
                                newWidth: newImage.width,
                                newHeight: newImage.height
                            };
                        });
                    },


            /* 154 */
                    name: commandNames.REMOVE_FILTER,
                    execute: function execute(graphics, type) {
                        var filterComp = graphics.getComponent(FILTER);

                        this.undoData.options = filterComp.getOptions(type);

                        return filterComp.remove(type);
                    },


            /* 155 */
                    name: commandNames.REMOVE_OBJECT,
                    execute: function execute(graphics, id) {
                        var _this = this;

                        return new _promise2.default(function (resolve, reject) {
                            _this.undoData.objects = graphics.removeObjectById(id);
                            if (_this.undoData.objects.length) {
                                resolve();
                            } else {
                                reject(rejectMessages.noObject);
                            }
                        });
                    },

            /* 156 */
                    name: commandNames.RESIZE_CANVAS_DIMENSION,
                    execute: function execute(graphics, dimension) {
                        var _this = this;

                        return new _promise2.default(function (resolve) {
                            _this.undoData.size = {
                                width: graphics.cssMaxWidth,
                                height: graphics.cssMaxHeight
                            };

                            graphics.setCssMaxDimension(dimension);
                            graphics.adjustCanvasDimension();
                            resolve();
                        });
                    },

            /* 157 */
                    name: commandNames.ROTATE_IMAGE,
                    execute: function execute(graphics, type, angle, isSilent) {
                        var rotationComp = graphics.getComponent(ROTATION);

                        if (!isSilent) {
                            this.undoData.angle = rotationComp.getCurrentAngle();
                        }

                        return rotationComp[type](angle);
                    },

            /* 158 */
                    name: commandNames.SET_OBJECT_PROPERTIES,
                    execute: function execute(graphics, id, props) {
                        var _this = this;

                        var targetObj = graphics.getObject(id);

                        if (!targetObj) {
                            return _promise2.default.reject(rejectMessages.noObject);
                        }

                        this.undoData.props = {};
                        _tuiCodeSnippet2.default.forEachOwnProperties(props, function (value, key) {
                            _this.undoData.props[key] = targetObj[key];
                        });

                        graphics.setObjectProperties(id, props);

                        return _promise2.default.resolve();
                    },


            /* 159 */
                    name: commandNames.SET_OBJECT_POSITION,
                    execute: function execute(graphics, id, posInfo) {
                        var targetObj = graphics.getObject(id);

                        if (!targetObj) {
                            return _promise2.default.reject(rejectMessages.noObject);
                        }

                        this.undoData.objectId = id;
                        this.undoData.props = graphics.getObjectProperties(id, ["left", "top"]);

                        graphics.setObjectPosition(id, posInfo);
                        graphics.renderAll();

                        return _promise2.default.resolve();
                    },
