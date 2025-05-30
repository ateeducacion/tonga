function _imageEncode(arrayBuffer) {

    let u8 = new Uint8Array(arrayBuffer);
    let b64encoded = btoa(
        [].reduce.call(
            new Uint8Array(arrayBuffer),
            function (p, c) {
                return p + String.fromCharCode(c);
            },
            ""
        )
    );
    let mimetype = "image/jpeg";
    return "data:" + mimetype + ";base64," + b64encoded;
}

function cargarRepositorio(repositorio) {

    // JBD 02.09.2019 AYUDA-REPOSITORIO - Añadimos el mensaje de dar doble click
    var listaImagenes = "";
    listaImagenes += "\n        <div id='loading' >Cargando...</div>";
    listaImagenes += "\n        <div class='ayuda-repositorio'>";
    listaImagenes += "\n            <span class='ayuda-repositorio-span'>Haga doble clic para usar el icono en la zona dibujo</span>";
    listaImagenes += "\n        </div>";
    listaImagenes += "\n        <div id='divLista'></div>";

    document.getElementById("listaImagenes").innerHTML = listaImagenes;

    var loading = document.getElementById("loading");
    loading.style.display = "block";

    var divLista = document.getElementById("divLista");

    axios
        .get("./repositorios/" + repositorio + "/lista.txt", {
            responseType: "text"
        })
        .then(function (res) {
            if (res.status == 200) {
                var listaLineas = res.data.split("\n");
                listaLineas.forEach(linea => {

                    if (linea) {
                        var element = linea.split("|")[0];
                        var tooltip = linea.split("|")[1] || element;
                        var fondo = linea.split("|")[2] || ""; // JBD 10.10.2019 CARGAR FONDO - Creo el sistema para carga un fondo desde un repositorio


                        // **************************************************************
                        axios
                            .get("./repositorios/" + repositorio + "/thumbnails/" + element, { // JBD 09.10.2019 THUMBNAILS - Creo el sistema de leer thumbnails en los repositorios
                                responseType: "arraybuffer"
                            })
                            .then(function (result) {
                                if (result.status == 200) {

                                    if (element != "lista.txt" && element != "") {

                                        // JBD 10.10.2019 CARGAR FONDO - Creo el sistema para carga un fondo desde un repositorio
                                        var funcion = "insertarImagen";
                                        if (fondo === "tongaappfondo" || fondo === "tongaappfondo\r") {
                                            funcion = "cargarFondo";
                                        }

                                        var _img =
                                            '<div class="divImagenRepositorio">' +
                                            '<img class="imgImagenRepositorio" + src="' +
                                            _imageEncode(result.data) +
                                            '" name="' +
                                            element +
                                            '" alt="' +
                                            element +
                                            '" title="' +
                                            tooltip +
                                            //                                            '" width="100px" height="100px" ' + // JBD 09.10.2019 THUMBNAILS - Creo el sistema de leer thumbnails en los repositorios
                                            '"  ' +
                                            ' ondblclick="' + funcion + '(\'' + repositorio + '\', this)" ' +
                                            '/>' +
                                            '</div>'
                                            ;
                                        document.getElementById("divLista").innerHTML += _img;
                                    }
                                    loading.style.display = "none";
                                }
                            })
                            .catch(function (err) {
                                mensaje.innerText = "Error de conexión " + err;
                            })
                            .then(function () {
                                loading.style.display = "none";
                            });
                    }
                });

                // **************************************************************
            }
        })
        .catch(function (err) {
            mensaje.innerText = "Error de conexión " + err;
        })
        .then(function () {
            loading.style.display = "none";
        });
}

function insertarImagen(repositorio, img) {
    var localURL = "./repositorios/" + repositorio + "/" + img.alt;

    var request = new XMLHttpRequest();
    request.open('GET', localURL, true);
    request.responseType = 'blob';
    request.onload = function (imagen) {
        var nombreFichero = imagen.srcElement.responseURL.substring(imagen.srcElement.responseURL.lastIndexOf('/') + 1);
        var reader = new FileReader();
        reader.readAsDataURL(request.response);
        reader.onload = function (e) {
            imgUrl = e.target.result;
            imageEditor.getActions()["imagen"].registerCustomImagen(imgUrl, nombreFichero);
        };
    };

    bleep.play();

    request.send();
}

// JBD 10.10.2019 CARGAR FONDO - Creo el sistema para carga un fondo desde un repositorio
function cargarFondo(repositorio, img) {

    imageEditor.setFondoTransparente(false);

    var localURL = "./repositorios/" + repositorio + "/" + img.alt;

    var request = new XMLHttpRequest();
    request.open('GET', localURL, true);
    request.responseType = 'blob';
    request.onload = function (imagen) {
        var nombreFichero = imagen.srcElement.responseURL.substring(imagen.srcElement.responseURL.lastIndexOf('/') + 1);
        var reader = new FileReader();
        reader.readAsDataURL(request.response);
        reader.onload = function (e) {
            imgUrl = e.target.result;
            imageEditor._invoker._isLocked = false; // JBD 10.10.2019 Si no pongo esto sale que el estado es bloqueado
            imageEditor.cargarFondo(nombreFichero, imgUrl);
        };
    };

    bleep.play();

    request.send();
}