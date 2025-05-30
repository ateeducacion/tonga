# TongaApp 1.1.3

Cambios:

Se elimina la referencia existente a Google analitycs en tui-code-snippet.js y se actualiza el número de versión.

## Instalación

1. Realizar una copia de seguridad de los archivos js/tui-code-snippet.js y creditos.html
2. Añadir estos 2 archivos en la carpeta /js y en la raiz de la aplicación.


# TongaApp 1.1.1

Cambios:

Se controla que el canvas no se posicione sobre los botones de la barra superior cuando se usan pantallas con resoluciones bajas.

## Instalación 🔧

La instalación de la aplicación consiste en descargarse la aplicación del repositorio y copiarla al directorio del servidor web.

Los pasos serían los siguientes:

1. Descargar la aplicación del repositorio

2. Sustituir el contenido de la carpeta del servidor web por la aplicación descargada


## Versionado 📌

1.1.1


# TongaApp 1.1.0

Cambios:

Esta versión incluye nuevas colecciones, posibilidad de descargar un PDF, psoibilidad de usar un fondo transparente al inicio y de cambiar el fondo en caliente, copiar y pegar objetos, deshacer y rehacer objetos, cambios en los logotipos de la zona superior izquierda, modifica la pantalla de fondo inicial e incopora en los créditos el número de versión. Además, cuando se exporta a PDF o JPG, y la imagen está girada se colorea de blanco el fondo de la imagen fuera del canvas.

## Instalación 🔧

La instalación de la aplicación consiste en descargarse la aplicación del repositorio y copiarla al directorio del servidor web.

Los pasos serían los siguientes:

1. Descargar la aplicación del repositorio

2. Sustituir el contenido de la carpeta del servidor web por la aplicación descargada


## Versionado 📌

1.1.0


# TongaApp 1.0.0

Editor javascript que permite generar y modificar archivos SVG y exportarlos a SVG, JPG y PNG

## Comenzando 🚀

_Estas instrucciones permiten instalar y desplegar esta aplicación_

## Prerequisitos 📋

No hay ningún prerequisito inicial

## Instalación 🔧

La instalación de la aplicación consiste en copiarla a un nuevo servidor web y dar permisos de acceso a los ficheros necesarios.

Los pasos serían los siguientes:

1. Crear la carpeta donde residirá la aplicación web. Por ejemplo:

```
/opt/lampp/htdocs/tongaapp
```

2. Copiar todo el contenido de la aplicación en esta carpeta

```
creditos_completo.html
creditos.html
css/
dist/
img/
index.html
js/
logs/
README.MD
repositorios/
webfonts/
```

3. Dar permisos especiales al directorio de repositorios para que las consultas ajax de las imágenes tengan los permisos necesarios

```
chmod -R 755 /opt/lampp/htdocs/tongaapp/repositorios/*
```

4. Crear un nuevo virtualhost en el apache indicando el directorio de la aplicación, por ejemplo:

```
<VirtualHost *:80>
    ServerName tongaapp
    DocumentRoot "/opt/lampp/htdocs/tongaapp"
    ErrorLog "/opt/lampp/htdocs/tongaapp/logs/tongaapp_apache_error.log"
    CustomLog "/opt/lampp/htdocs/tongaapp/logs/eva_access.log" common
    <Directory "/opt/lampp/htdocs/tongaapp">
        Options Indexes FollowSymLinks MultiViews
        AllowOverride all
        Order Deny,Allow
        Allow from all
        Require all granted
    </Directory>
</VirtualHost>
```

## Versionado 📌

1.0.0



# Como actualizar las colecciones de TongaApp

Instrucciones para explicar como actualizar las colecciones en preproducción y producción


## Prerequisitos 📋

No hay ningún prerequisito inicial

## Actualizar las colecciones en preproducción o producción 🔧

La carga de colecciones se realiza en la carpeta de la aplicación "_repositorios_". Esta carpeta contiene una serie de subcarpetas con los elementos gráficos que conforman las colecciones y un fichero llamado *lista.txt* con la estructura que se ve a continuación. En esta lista indicamos solo las 2 primeras colecciones de nivel superior *Fauna* y *Flora* como ejemplo de lo queremos explicar. Estos 2 elementos son supercolecciones de colecciones, es decir, contienen más colecciones, que en este caso son aves, fauna marina, etc.

<pre><code class="xml">
tongaappcabecera|Fauna
aves|Aves
faunamarina|Fauna Marina
faunaterrestre|Fauna Terrestre
insectos|Insectos

tongaappcabecera|Flora
floracanaria|Flora Canaria
florageneral|Flora General
pisosvegetacion|Pisos Vegetacion
espaciosnaturales|Espacios Naturales

....
</code></pre>

La estructura de este fichero txt es bastante simple y consta de una cabecera y uno o mas elementos (items):

1) *Cabecera* : tongaappcabecera|Fauna - "tongaappcabecera" identifica que se trata del nombre de la supercolección y el nombre con el que va a salir en TongaApp
2) *Items* : aves|Aves - El primer elemento es el nombre de la carpeta que contiene los gráficos de las aves y el segundo elemento es el nombre que se le da en TongaApp

En la siguiente imagen podemos ver esta estructura en TongaApp 

![Chrome Download Folder](install/colecciones.jpg? "Routes")

Dentro de cada subcarpeta se encuentran los elementos gráficos, una subcarpeta con los thumbnails de cada elemento y otro fichero *lista.txt* , que en este caso contiene la siguiente información:

<pre><code class="xml">
Auditorio_fondo.png|Auditorio|tongaappfondo
Aula01_fondo.png|Aula|tongaappfondo
Aula2_fondo.png|Aula|tongaappfondo
Biblioteca_fondo.png|Biblioteca|tongaappfondo 

....
</code></pre>

La estructura de este fichero es muy similar al anterior pero en este caso no tiene cabecera. Consta de 3 partes separadas por |, dónde solo la primera es obligatoria. Lo explicamos a continuación:

* Nombre del fichero | Tooltip | tongaappfondo

1) *Nombre del fichero* : Se especifica el nombre del fichero gráfico tal cual esta en la carpeta.
2) *Tooltip* : Tooltip que va a aparecer cuando se pasa por encima del elemento en los listados. Sino se específica se muestra el nombre del fichero.
3) *tongaappfondo* : Si se especifica este valor, este elemento se va a tratar como un fondo.

