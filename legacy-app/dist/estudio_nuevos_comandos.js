                            /**
                             * @private
                             * @param {Event} e Event fired on mousemove
                             */
                            _transformObject: function (e) {
                                var pointer = this.getPointer(e),
                                    transform = this._currentTransform;

                                transform.reset = false;
                                transform.target.isMoving = true;
                                transform.shiftKey = e.shiftKey;
                                transform.altKey = e[this.centeredKey];

                                this._beforeScaleTransform(e, transform);
                                this._performTransformAction(e, transform, pointer);

                                transform.actionPerformed && this.requestRenderAll();
                            },

                            /**
                             * @private
                             */
                            _performTransformAction: function (e, transform, pointer) {
                                var x = pointer.x,
                                    y = pointer.y,
                                    action = transform.action,
                                    actionPerformed = false,
                                    options = {
                                        target: transform.target,
                                        e: e,
                                        transform: transform,
                                        pointer: pointer
                                    };

                                if (action === "rotate") {
                                    (actionPerformed = this._rotateObject(x, y)) && this._fire("rotating", options);
                                } else if (action === "scale") {
                                    (actionPerformed = this._onScale(e, transform, x, y)) && this._fire("scaling", options);
                                } else if (action === "scaleX") {
                                    (actionPerformed = this._scaleObject(x, y, "x")) && this._fire("scaling", options);
                                } else if (action === "scaleY") {
                                    (actionPerformed = this._scaleObject(x, y, "y")) && this._fire("scaling", options);
                                } else if (action === "skewX") {
                                    (actionPerformed = this._skewObject(x, y, "x")) && this._fire("skewing", options);
                                } else if (action === "skewY") {
                                    (actionPerformed = this._skewObject(x, y, "y")) && this._fire("skewing", options);
                                } else {
                                    actionPerformed = this._translateObject(x, y);
                                    if (actionPerformed) {
                                        this._fire("moving", options);
                                        this.setCursor(options.target.moveCursor || this.moveCursor);
                                    }
                                }
                                transform.actionPerformed = transform.actionPerformed || actionPerformed;

                                // JBD 17.03.2020 DESHACER - Para Rotar, Escalar y Mover un objeto, se llama a sus nuevos comandos
                                this.execute(commands.OBJETO_ROTAR, parametros);



                            },

                            /**
                             * @private
                             */
                            _fire: function (eventName, options) {
                                this.fire("object:" + eventName, options);
                                options.target.fire(eventName, options);
                            },