# Tonga

![Language](https://img.shields.io/badge/Language-HTML%20%2B%20JavaScript-yellow)
![License: AGPL v3](https://img.shields.io/badge/License-AGPLv3-blue.svg)
![Last Commit](https://img.shields.io/github/last-commit/ateeducacion/tonga)
![Open Issues](https://img.shields.io/github/issues/ateeducacion/tonga)

**Tonga** es una aplicación de dibujo basada en HTML5 y JavaScript que permite crear, editar y exportar gráficos SVG, JPG y PNG. Fue desarrollada por Altia y está mantenida por el Área de Tecnología Educativa (ATE). Incluye una biblioteca de imágenes con licencia Creative Commons organizada en colecciones para su uso inmediato en los diseños.

## Características Clave

* **Editor SVG integrado** con operaciones de selección, movimiento, rotación, agrupación y alineación.
* **Exportación directa** a SVG, JPG y PNG sin dependencias externas.
* **Historial de acciones** con deshacer y rehacer.
* **Colecciones** de gráficos Creative Commons listadas mediante archivos `lista.txt`.
* **Modo transparencia** y cambio de fondo en tiempo real.
* Copiar y pegar objetos entre lienzos.
* Interfaz adaptable a pantallas con baja resolución.

## Instalación

Tonga es una aplicación estática. Puede servirse desde cualquier servidor web o abrirse de forma local en un navegador moderno.

```bash
# clonar el repositorio
git clone https://github.com/ateeducacion/tonga.git
cd tonga

# usar Makefile (requiere make instalado)
make up        # levanta un servidor simple en http://localhost:8000
```

> Alternativa rápida con Python:
>
> ```bash
> python3 -m http.server
> ```

## Estructura del Proyecto

```
js/                 # código JavaScript de la aplicación
css/                # estilos
img/                # recursos gráficos de la interfaz
repositorios/       # colecciones CC organizadas por carpetas y lista.txt
dist/               # artefactos generados
index.html          # punto de entrada
creditos.html       # créditos del proyecto y de las colecciones
logs/               # registros opcionales
```

## Contribución

Los *pull requests* son bienvenidos.

1. Realiza un *fork* del repositorio.
2. Trabaja en una rama descriptiva basada en `main`.
3. Ejecuta `make lint` antes de enviar tu propuesta.
4. Abre una *pull request* explicando los cambios.

## Versionado

Seguimos [SemVer](https://semver.org/lang/es/). Revisa [CHANGELOG.md](./CHANGELOG.md) para detalles de cada versión.

## Licencia

Tonga se publica bajo la **GNU Affero General Public License v3**. Consulta el archivo [LICENSE](./LICENSE).

## Créditos

Las imágenes situadas en `repositorios/` provienen de distintos autores y se distribuyen con licencias Creative Commons. Revisa `creditos.html` para el detalle completo.
