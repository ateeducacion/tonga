# Modernización integral de Tonga

Quiero que modernices exhaustivamente el repositorio **`ateeducacion/tonga`**, tomando como referencia metodológica y de mantenimiento el trabajo realizado en **`ateeducacion/aritmates`**, pero sin copiar mecánicamente su arquitectura cuando Tonga tenga necesidades distintas.

El objetivo no es simplemente «actualizar dependencias». Quiero convertir Tonga en una aplicación web de dibujo razonable en 2026: mantenible, sencilla de desplegar, segura, rápida, accesible, intuitiva, responsive, instalable si aporta valor y con una interfaz comparable conceptualmente a una aplicación moderna de edición gráfica sencilla.

La aplicación debe seguir siendo software web esencialmente estático. No introduzcas backend, base de datos, autenticación ni infraestructura de servidor salvo que aparezca una necesidad funcional real y sea imposible resolverla razonablemente en el navegador.

---

# 1. Principios generales

Prioriza, en este orden:

1. preservación de la funcionalidad útil;
2. simplicidad;
3. mantenibilidad;
4. accesibilidad;
5. seguridad;
6. experiencia de usuario;
7. rendimiento;
8. reducción razonable de dependencias;
9. compatibilidad con navegadores actuales;
10. facilidad de despliegue.

No conserves una tecnología solo porque ya exista.

Tampoco sustituyas automáticamente código antiguo por frameworks nuevos.

Una dependencia nueva debe eliminar más complejidad de la que introduce.

Evita arquitecturas empresariales innecesarias.

No introduzcas React, Vue, Angular, Svelte, Redux u otro framework SPA salvo que, después de estudiar el código, puedas demostrar mediante un ADR que simplifica sustancialmente el producto respecto a TypeScript/JavaScript, HTML, CSS y componentes ligeros.

La hipótesis inicial es que **no necesitamos framework SPA**.

---

# 2. Investigación obligatoria antes de modificar

Antes de hacer cambios significativos, estudia:

- `main`;
- `upstream`;
- historial Git relevante;
- README;
- CHANGELOG;
- código JavaScript;
- `dist/`;
- CSS;
- recursos de `repositorios/`;
- créditos;
- dependencias;
- código copiado o vendorizado;
- workflows;
- configuración;
- cualquier documentación existente.

Estudia en paralelo `ateeducacion/aritmates`, en particular:

- `README.md`;
- `AGENTS.md`;
- `package.json`;
- `.github/workflows/`;
- `docs/ARCHITECTURE.md`;
- `docs/SIMPLIFICACION.md`;
- `docs/INFORME-MODERNIZACION.md`;
- `docs/TESTING.md`;
- sistema de tests;
- sistema de builds;
- tratamiento de la rama `upstream`;
- gestión de skills/agentes;
- hardening de GitHub Actions.

No presupongas que Tonga debe ser igual que Aritmates.

Utiliza Aritmates como ejemplo de:

- simplificación;
- conservación de comportamiento;
- separación entre original y versión mantenida;
- documentación;
- tests;
- CI;
- automatización;
- reproducibilidad de métricas.

---

# 3. Internet y Context7 son obligatorios

No tomes decisiones sobre librerías basándote únicamente en conocimiento interno o memoria.

Cuando evalúes una biblioteca, framework, API del navegador o herramienta:

1. consulta su documentación oficial actual;
2. consulta **Context7** si está disponible;
3. consulta Internet para comprobar:
   - estado del proyecto;
   - última versión estable;
   - fecha de actividad;
   - vulnerabilidades conocidas;
   - issues importantes;
   - licencia;
   - compatibilidad de navegador;
   - mantenimiento;
   - alternativas;
4. comprueba el repositorio original cuando sea software libre;
5. registra decisiones relevantes en un ADR.

Utiliza Context7 especialmente para:

- Fabric.js;
- Vite;
- TypeScript;
- Playwright;
- framework de tests elegido;
- APIs de serialización;
- PWA/service worker si se implementa;
- librerías de exportación PDF si fueran necesarias;
- cualquier dependencia relevante que se añada.

Si documentación oficial y Context7 discrepan, prioriza la documentación oficial más reciente e indica la discrepancia.

Nunca copies código de una web, blog, Stack Overflow, Gist o repositorio sin comprobar expresamente su licencia.

---

# 4. Rama `upstream`

Tonga ya posee una rama `upstream`.

No la recrees.

No la modernices.

No hagas commits en ella.

No hagas `force push`.

Trátala como una fotografía histórica del código original entregado por el proveedor.

Al comienzo:

- verifica su SHA;
- documenta qué versión representa;
- documenta su relación con `main`;
- comprueba que `main` desciende de ella;
- registra el SHA en la documentación de modernización.

Si es útil, crea documentación o un tag que identifique claramente la versión original, pero no reescribas la historia.

El código nuevo se mantiene exclusivamente en `main` mediante ramas y pull requests.

---

# 5. Auditoría funcional antes de reescribir

Antes de eliminar el editor existente, documenta todo lo que realmente funciona.

Crea una matriz de funcionalidades.

Como mínimo investiga:

- creación de un lienzo;
- tamaño inicial;
- fondo;
- transparencia;
- carga de una imagen;
- carga de SVG;
- biblioteca de imágenes;
- colecciones;
- fondos de biblioteca;
- selección;
- mover;
- redimensionar;
- rotar;
- duplicar;
- copiar;
- pegar;
- borrar;
- agrupación;
- desagrupación;
- alineación;
- orden de capas;
- deshacer;
- rehacer;
- dibujo libre;
- líneas;
- formas;
- texto;
- colores;
- contorno;
- relleno;
- opacidad;
- iconos;
- filtros;
- recorte;
- volteo;
- máscaras, si siguen siendo útiles;
- zoom;
- exportación PNG;
- exportación JPG;
- exportación SVG;
- exportación PDF;
- transparencia en exportación;
- comportamiento con imágenes rotadas;
- características específicas añadidas por Altia/Gobierno de Canarias.

Determina también qué funciones existen en el código pero no tienen ningún uso real.

No perpetúes código muerto por precaución.

Cuando exista duda, crea antes una prueba que reproduzca el comportamiento legacy.

---

# 6. Baseline reproducible

Antes de la gran sustitución del editor:

- crea pruebas Playwright sobre la versión legacy;
- genera capturas de referencia;
- registra dimensiones;
- registra principales flujos;
- registra exports de referencia cuando sea razonable;
- registra errores de consola;
- registra cantidad de recursos;
- registra tamaño desplegado;
- registra tamaño descargado inicialmente;
- registra número de dependencias;
- registra número de ficheros;
- registra código vendorizado;
- registra librerías obsoletas.

No uses screenshots pixel-perfect como única prueba de comportamiento del canvas.

Cuando sea posible valida también:

- número y tipo de objetos;
- propiedades;
- estado serializado;
- dimensiones de exportación;
- MIME;
- contenido estructural del SVG;
- nombre de fichero;
- persistencia.

---

# 7. TOAST UI Image Editor

No construyas la modernización encima del actual `tui-image-editor`.

El proyecto original ha sido archivado y no debe seguir siendo el núcleo de Tonga.

Investiga qué partes del `dist/tui-image-editor.js` actual son:

- código original de NHN;
- modificaciones de Tonga;
- parches del proveedor;
- funcionalidades específicas que debamos conservar.

Extrae requisitos, no necesariamente código.

Si reutilizas cualquier fragmento MIT de TOAST UI:

- conserva copyright;
- conserva licencia;
- documenta origen;
- registra commit/path si puede determinarse.

Siempre que sea viable, reimplementa la funcionalidad sobre APIs públicas modernas en lugar de mantener el fork.

No utilices APIs privadas de TOAST ni reproduzcas su arquitectura.

---

# 8. Motor gráfico propuesto: Fabric.js moderno

Evalúa Fabric.js actual como motor principal.

La hipótesis recomendada es usar **Fabric.js 7.x estable y actualizado**, directamente, sin TOAST UI Image Editor por encima.

Antes de fijar versión:

- consulta Context7;
- consulta documentación oficial;
- consulta releases;
- consulta advisories/CVEs;
- verifica licencia;
- ejecuta un pequeño spike.

Utiliza únicamente APIs públicas.

En particular, elimina patrones actuales como acceso directo a propiedades internas del tipo:

```js
imageEditor._invoker._isLocked
```

La nueva aplicación no debe depender de nombres privados que comiencen por `_`.

Investiga específicamente:

- `Canvas`;
- selección;
- eventos;
- `PencilBrush`;
- textos;
- formas;
- imágenes;
- grupos;
- clonación;
- serialización;
- `loadFromJSON`;
- exportación SVG;
- carga SVG;
- filtros;
- transformaciones;
- viewport;
- zoom;
- pan;
- Promise APIs;
- limpieza/dispose.

Ten presente que Fabric moderno cambió de namespace a imports ES y que determinadas modalidades de tree-shaking tienen advertencias relacionadas con carga JSON/SVG.

No optimices imports prematuramente a costa de romper serialización.

---

# 9. Arquitectura objetivo

Propón y documenta una arquitectura modular.

Hipótesis inicial:

```text
src/
  app/
  editor/
  canvas/
  history/
  project/
  assets/
  export/
  persistence/
  ui/
  accessibility/
  i18n/
  styles/
  templates/
  utils/

public/
  assets/
  icons/

scripts/
test/
e2e/
docs/
```

La separación conceptual debería aproximarse a:

```text
UI
 ↓
Application / editor commands
 ↓
Document model / project
 ↓
Canvas adapter
 ↓
Fabric.js
```

La UI no debe manipular directamente internals de Fabric en cualquier sitio.

Centraliza Fabric en una capa `CanvasAdapter` o equivalente.

La lógica de:

- proyecto;
- historia;
- assets;
- exportación;
- configuración;
- serialización;

no debe estar mezclada con handlers DOM.

---

# 10. TypeScript

Evalúa seriamente TypeScript.

En Tonga está inicialmente recomendado porque existen:

- objetos gráficos;
- comandos;
- historial;
- serialización;
- versiones de formato;
- eventos;
- numerosos tipos de herramienta;
- configuración de exportación;
- catálogo de recursos.

No uses TypeScript para crear abstracciones ceremoniales.

No uses `any` indiscriminadamente.

No crees interfaces vacías o capas inútiles.

El JavaScript generado no se versiona.

---

# 11. Build

Evalúa Vite actual como build tool.

Objetivo:

```bash
npm ci
npm run dev
npm run build
```

`npm run build` debe generar un `dist/` completamente estático.

Producción no necesita:

- Node;
- PHP;
- Composer;
- base de datos;
- servicios externos.

La aplicación debe funcionar:

- en raíz;
- en subdirectorio;
- en GitHub Pages;
- detrás de Nginx/Apache;
- con rutas relativas correctamente resueltas.

No versiones `dist/` en `main` salvo que exista una razón operativa muy fuerte y documentada.

GitHub Pages debe recibir un artifact generado por CI.

---

# 12. Interfaz completamente nueva

No intentes conservar visualmente la UI de TOAST.

Conserva las capacidades útiles y rediseña la experiencia.

Quiero una interfaz actual y sencilla.

## Escritorio/tablet

Diseño inicial recomendado:

### Barra superior

- logotipo/nombre Tonga;
- nuevo;
- abrir proyecto;
- guardar/descargar proyecto;
- deshacer;
- rehacer;
- zoom;
- ayuda;
- exportar.

No la satures.

Las operaciones contextuales pertenecen al inspector.

### Barra de herramientas izquierda

Herramientas principales:

- seleccionar;
- mover/pan;
- dibujo;
- línea;
- formas;
- texto;
- imagen;
- biblioteca.

Utiliza icono + tooltip accesible.

### Área central

Lienzo claramente separado del fondo de trabajo.

Soporta:

- zoom;
- ajustar a pantalla;
- 100 %;
- pan;
- rejilla opcional;
- reglas/guías solo si aportan utilidad real.

Usa patrón de transparencia cuando corresponda.

### Inspector derecho

Debe ser contextual.

Para una selección muestra únicamente propiedades que tienen sentido:

- posición;
- ancho;
- alto;
- mantener proporción;
- rotación;
- opacidad;
- relleno;
- trazo;
- grosor;
- tipografía;
- tamaño;
- alineación;
- propiedades de imagen;
- filtros.

No muestres todos los controles todo el tiempo.

### Panel de capas

Incluye, si la complejidad lo justifica:

- nombre;
- tipo;
- selección;
- orden;
- subir/bajar;
- ocultar/mostrar;
- bloquear/desbloquear;
- duplicar;
- borrar.

No es necesario copiar Photoshop.

---

# 13. Biblioteca gráfica

La biblioteca de Tonga es una característica diferencial y debe mejorar considerablemente.

Sustituye la interacción actual basada en doble clic por una interfaz normal:

- abrir biblioteca;
- buscar;
- filtrar por categoría;
- previsualizar;
- seleccionar;
- «Añadir al lienzo».

El doble clic puede ser un atajo adicional, nunca el único mecanismo.

Añade:

- búsqueda por nombre;
- categorías;
- resultados;
- lazy loading;
- thumbnails;
- estados de carga;
- mensajes cuando no hay resultados;
- navegación con teclado;
- metadatos;
- atribución/licencia cuando corresponda.

No cargues miles de imágenes al iniciar Tonga.

---

# 14. Catálogo de assets

No mantengas indefinidamente `lista.txt` como modelo principal de datos.

Durante la transición puede mantenerse un parser compatible.

Crea un catálogo estructurado generado durante build, por ejemplo:

```json
{
    "id": "auditorio",
    "title": "Auditorio",
    "category": "espacios",
    "file": "...",
    "thumbnail": "...",
    "type": "image",
    "background": false,
    "license": "...",
    "creator": "...",
    "source": "..."
}
```

El esquema exacto debe estudiarse.

Incluye validación automática:

- fichero existe;
- thumbnail existe;
- ID único;
- categoría existe;
- licencia indicada;
- atribución indicada cuando sea necesaria.

Un build debe fallar ante un catálogo corrupto.

---

# 15. Optimización de las 3.000+ imágenes

No borres material educativo válido solo por tamaño.

Analiza:

- duplicados;
- thumbnails redundantes;
- PNG que realmente podrían ser JPEG/WebP/AVIF;
- PNG que necesitan transparencia;
- resoluciones excesivas;
- metadatos innecesarios;
- archivos no referenciados.

Conserva originales cuando sea necesario.

Genera derivados optimizados durante build cuando compense.

No recomprimas destructivamente originales sin guardar su procedencia.

Mide antes y después.

No realices una reescritura del historial Git únicamente para ahorrar espacio.

No migres todo a Git LFS sin evaluar antes las consecuencias operativas.

---

# 16. Proyectos de Tonga

Añade un formato propio de proyecto para que una persona pueda continuar su trabajo otro día.

Por ejemplo:

```text
*.tonga
```

Puede ser JSON o un ZIP/JSON si termina necesitando recursos adjuntos.

Debe tener:

```json
{
    "format": "tonga",
    "version": 1
}
```

Nunca serialices simplemente un objeto interno de Fabric asumiendo que será estable para siempre.

Define un formato de Tonga y un adaptador hacia Fabric.

Incluye migraciones:

```text
v1 -> v2
v2 -> v3
```

aunque inicialmente solo exista `v1`.

Prueba round-trip:

```text
project → serialize → load → equivalent project
```

---

# 17. Guardado y recuperación

Implementa autosave local razonable.

Preferencia:

- IndexedDB para proyectos/autorecovery;
- `localStorage` únicamente para pequeñas preferencias.

Debe existir:

- recuperación tras cierre accidental;
- indicación de cambios sin guardar;
- nuevo proyecto;
- abrir proyecto;
- descargar proyecto;
- limpiar recuperación.

No envíes proyectos a ningún servidor.

---

# 18. Undo/redo

Implementa un historial explícito y fiable.

No dependas de internals de otra biblioteca.

Considera un patrón Command o snapshots estructurados si resulta más sencillo.

Debe cubrir:

- añadir;
- borrar;
- mover;
- escalar;
- rotar;
- texto;
- estilo;
- orden;
- agrupación;
- filtros;
- fondo.

No generes 200 estados mientras una persona arrastra un objeto.

Agrupa una interacción continua como una única operación lógica.

Pon un límite razonable a memoria/historial.

---

# 19. Atajos de teclado

Como mínimo estudia:

```text
Ctrl/Cmd+Z       Undo
Ctrl/Cmd+Shift+Z Redo
Ctrl/Cmd+Y       Redo donde sea habitual
Ctrl/Cmd+C       Copy
Ctrl/Cmd+V       Paste
Ctrl/Cmd+D       Duplicate
Delete/Backspace Delete
Escape           Cancel / deselect
Arrow keys       Move
Shift+Arrow      Move faster
Ctrl/Cmd+A       Select all si tiene sentido
+/-              Zoom
0                Fit
1                100 %
```

No captures un atajo cuando la persona está escribiendo en un campo de texto.

Documenta los atajos en ayuda.

---

# 20. Importación

Analiza soporte para:

- PNG;
- JPEG;
- WebP;
- SVG;
- proyecto Tonga.

No aceptes formatos porque «quizá sean útiles».

SVG requiere especial atención de seguridad.

Añade casos de prueba maliciosos.

No permitas ejecución de scripts, URLs peligrosas ni atributos peligrosos desde un SVG importado.

Revisa los advisories actuales de Fabric antes de implementar la funcionalidad.

---

# 21. Exportación

Mantén al menos:

- PNG;
- JPEG;
- SVG;
- PDF si sigue siendo requisito real.

El diálogo de exportación debería permitir, donde proceda:

- formato;
- nombre;
- transparencia;
- calidad JPEG;
- escala/resolución;
- dimensiones resultantes.

PNG/JPEG deben generarse directamente en navegador.

SVG debe mantener vectores siempre que sea posible.

Evalúa si PDF necesita realmente jsPDF o si existe una solución más sencilla.

Si jsPDF continúa:

- úsalo como dependencia npm;
- impórtalo dinámicamente solo al exportar;
- no cargues cientos de KB en la portada.

No utilices `html2canvas` si no existe una razón concreta.

---

# 22. Eliminar dependencias legacy

La versión final no debería necesitar, salvo justificación documentada:

- TOAST UI Image Editor;
- jQuery;
- jQuery UI;
- jquery-modal;
- Axios;
- FileSaver;
- tui-code-snippet;
- tui-color-picker;
- `xml2json`;
- Font Awesome completo.

Utiliza APIs modernas:

- `fetch`;
- `Blob`;
- `<a download>`;
- `structuredClone`;
- módulos ES;
- `<dialog>`;
- CSS moderno;
- inputs nativos.

Si una dependencia pequeña resuelve correctamente un problema complejo, puede utilizarse después de verificar mantenimiento y licencia.

---

# 23. Color y controles

No añadas una biblioteca de color picker pesada sin necesidad.

Evalúa:

- `<input type="color">`;
- valor HEX;
- opacidad;
- paleta reciente;
- colores del documento.

Proporciona un input textual accesible junto al selector visual.

---

# 24. Diseño responsive

La aplicación debe funcionar especialmente bien en:

- escritorio;
- portátil;
- tablet.

En móvil no es obligatorio reproducir una estación completa de diseño gráfico.

Debe ser usable.

Para pantallas pequeñas considera:

- toolbar inferior;
- inspector en drawer;
- biblioteca en panel completo;
- targets táctiles adecuados;
- ausencia de hover obligatorio.

No dupliques toda la aplicación mediante HTML «desktop» y HTML «mobile».

Debe existir una sola interfaz responsive.

---

# 25. Accesibilidad

Objetivo: **WCAG 2.2 AA** como referencia técnica.

El canvas gráfico no basta.

Crea una representación alternativa accesible del documento mediante el panel de capas/objetos.

Una persona que utiliza teclado debe poder:

- seleccionar objetos;
- conocer qué está seleccionado;
- cambiar propiedades;
- mover;
- borrar;
- duplicar;
- reordenar;
- acceder a biblioteca;
- exportar.

Revisa:

- foco visible;
- orden de foco;
- nombre/rol/valor;
- contraste;
- tamaño de targets;
- teclado;
- diálogos;
- tooltips;
- mensajes de estado;
- `aria-live` cuando proceda;
- reducción de movimiento;
- zoom de navegador;
- reflow;
- dark mode;
- high contrast.

No añadas ARIA cuando existe un elemento HTML nativo adecuado.

El canvas debe tener descripción accesible y su estado debe estar reflejado en DOM.

Añade auditoría automatizada de accesibilidad, pero no la confundas con una auditoría manual.

---

# 26. Temas

Añade:

- tema claro;
- tema oscuro;
- `prefers-color-scheme`;
- preferencia persistente.

No hagas de dark mode una segunda hoja de estilos duplicada.

Utiliza custom properties/tokens.

---

# 27. Sistema visual

Define un sistema pequeño:

```css
--space-*
--radius-*
--font-*
--color-*
--shadow-*
--control-size-*
```

No crees cientos de tokens.

Utiliza tipografía del sistema siempre que la identidad gráfica no exija otra cosa.

No cargues Google Fonts ni otras fuentes externas.

---

# 28. Iconografía

Elige un único conjunto coherente de iconos libres.

Antes de incorporarlo:

- verifica licencia;
- registra atribución si es necesaria;
- importa únicamente iconos usados.

No incluyas una fuente completa de iconos para utilizar seis símbolos.

Los botones de icono siempre tendrán nombre accesible.

---

# 29. Onboarding

La aplicación debe ser comprensible sin manual previo.

Al entrar, presenta un estado vacío útil:

- nuevo dibujo;
- tamaño del lienzo;
- quizá algunos tamaños frecuentes;
- abrir proyecto.

No abras veinte controles de golpe.

Considera una ayuda contextual ligera, no un tutorial obligatorio.

---

# 30. Tamaños de lienzo

Evalúa presets útiles:

- personalizado;
- A4 vertical;
- A4 horizontal;
- presentación 16:9;
- cuadrado;
- formatos educativos que realmente tengan sentido.

No añadas presets de redes sociales si no aportan valor al contexto educativo.

---

# 31. Capas y objetos

Si el modelo lo permite, cada objeto debe poder disponer de:

- ID estable;
- tipo;
- nombre accesible;
- visible;
- locked;
- z-index;
- propiedades.

Los nombres automáticos pueden ser:

```text
Texto 1
Imagen 2
Rectángulo 3
```

La persona podrá renombrarlos si resulta útil.

---

# 32. PWA

Evalúa hacer Tonga instalable como PWA.

Tiene sentido porque es:

- estática;
- educativa;
- potencialmente utilizada en entornos con mala conectividad;
- casi enteramente client-side.

Implementa PWA solo después de tener estable la aplicación principal.

Objetivo:

- manifest;
- iconos;
- modo standalone;
- shell offline.

No precaches todos los miles de recursos.

Usa una estrategia:

```text
app shell → precache
catálogo → caché pequeña/versionada
colecciones → runtime/on demand
```

El service worker debe actualizarse correctamente.

Nunca permitas que una versión antigua quede atrapada indefinidamente en caché.

---

# 33. Privacidad

La app debe funcionar sin:

- analítica;
- trackers;
- Google Fonts;
- CDN;
- telemetría;
- servicios externos.

No envíes imágenes, proyectos ni acciones del usuario fuera del navegador.

Documenta explícitamente que el procesamiento es local.

---

# 34. Seguridad frontend

Consulta OWASP actualizado.

Como base:

- evita `innerHTML` para contenido no controlado;
- evita `eval`;
- evita `new Function`;
- evita inline scripts;
- evita inline event handlers;
- valida archivos;
- valida SVG;
- limita tamaños de archivo razonablemente;
- limita dimensiones absurdas que puedan agotar memoria;
- maneja errores de decodificación;
- no cargues recursos remotos arbitrarios;
- no almacenes secretos;
- usa dependencias mantenidas;
- revisa advisories.

Diseña la aplicación para poder utilizar una CSP estricta.

En despliegues donde sea posible recomienda headers:

- Content-Security-Policy;
- X-Content-Type-Options;
- Referrer-Policy;
- Permissions-Policy.

GitHub Pages puede limitar control de headers; documenta las diferencias.

---

# 35. Licencias: no hacer suposiciones

Esta parte es obligatoria.

Actualmente hay señales distintas:

- la rama histórica no tenía `LICENSE`;
- `main` añadió GNU AGPL;
- `package.json` declara `AGPL-3.0`;
- los créditos históricos mencionan CC BY-NC-SA;
- existen librerías vendorizadas con licencias propias;
- existen miles de imágenes;
- existen fuentes;
- existe un sonido;
- hay código de NHN/Fabric y probablemente otros proveedores.

No declares automáticamente que todos los ficheros son AGPL.

Determina evidencia y procedencia.

No afirmes que una relicencia es jurídicamente válida si el repositorio no aporta evidencia suficiente.

Si falta información, documenta la duda.

---

# 36. SPDX y REUSE

Haz que el repositorio aspire a ser REUSE-compliant.

Evalúa una estructura similar a:

```text
LICENSES/
  AGPL-3.0-only.txt
  MIT.txt
  CC-BY-NC-SA-4.0.txt
  CC-BY-SA-4.0.txt
  Apache-2.0.txt
  ...

REUSE.toml
THIRD_PARTY_NOTICES.md
```

No elijas entre:

```text
AGPL-3.0-only
AGPL-3.0-or-later
```

sin determinar primero la intención del titular de derechos.

`AGPL-3.0` como identificador SPDX está obsoleto.

Añade `SPDX-License-Identifier` y `SPDX-FileCopyrightText` cuando corresponda.

Para miles de imágenes utiliza anotaciones agregadas de `REUSE.toml` cuando tengan la misma procedencia/licencia.

Para casos individuales utiliza `.license` cuando sea más preciso.

El objetivo es poder ejecutar:

```bash
reuse lint
reuse spdx
```

---

# 37. Código de terceros

Cada fragmento copiado debe registrar como mínimo:

- proyecto;
- autor/titular;
- URL;
- fichero de origen;
- commit/tag;
- licencia;
- cambios realizados.

No copies código de un repositorio porque «es público».

Repositorio público != código con permiso de reutilización.

Si no hay licencia clara:

**no uses ese código**.

Reimplementa la idea a partir de documentación pública.

Para fragmentos integrados en un fichero propio considera anotación SPDX de snippet.

---

# 38. Licencias de contenidos

Distingue claramente:

```text
software
contenido gráfico
fuentes
iconos
sonidos
documentación
```

No uses una única frase «todo está bajo AGPL» si no es verdad.

Investiga la actual CC BY-NC-SA 4.0.

La cláusula NC impide uso comercial.

Si el objetivo del proyecto pasa a ser verdaderamente reutilizable sin restricción comercial, propone por separado:

1. confirmar si el Gobierno de Canarias tiene derechos suficientes para relicenciar los contenidos propios;
2. relicenciarlos solo si existe autorización;
3. sustituir contenidos de terceros que no puedan relicenciarse;
4. preferir CC0, CC BY o CC BY-SA para nuevos recursos gráficos.

No elimines contenido histórico únicamente por este motivo sin documentarlo.

---

# 39. Créditos dentro de Tonga

Sustituye el viejo `creditos.html` por una sección moderna de:

**Acerca de / Créditos / Licencias**

Debe mostrar:

- autoría original;
- empresas participantes;
- Área de Tecnología Educativa;
- versión actual;
- licencia del software;
- licencia de los contenidos;
- licencias de terceros;
- enlace al código fuente;
- información de atribución de colecciones.

Genera esta información desde datos estructurados cuando sea posible.

Evita mantener manualmente cientos de créditos duplicados.

---

# 40. Tests unitarios

Elige un runner actual después de investigarlo.

Para una arquitectura Vite/TypeScript, Vitest es una hipótesis razonable, pero no lo elijas sin comprobar versión/licencia/mantenimiento.

Prueba intensamente:

- project schema;
- migraciones;
- historial;
- comandos;
- catálogo;
- parser legacy;
- validación de assets;
- serialización;
- export settings;
- nombres;
- configuración;
- seguridad de entradas;
- helpers puros.

Evita probar implementación interna irrelevante.

---

# 41. Tests E2E

Utiliza Playwright actual.

Configura:

- Chromium;
- Firefox;
- WebKit.

Context7 debe consultarse para APIs y buenas prácticas actuales.

Flujos críticos:

1. abre Tonga;
2. crea proyecto;
3. añade texto;
4. añade forma;
5. mueve;
6. redimensiona;
7. rota;
8. cambia color;
9. undo;
10. redo;
11. añade elemento de biblioteca;
12. abre proyecto guardado;
13. exporta PNG;
14. exporta JPEG;
15. exporta SVG;
16. exporta PDF cuando corresponda;
17. utiliza teclado;
18. comprueba responsive;
19. comprueba que no hay errores de consola.

Prueba también upload real con `setInputFiles`.

Para downloads registra el listener antes de provocar la descarga.

---

# 42. Visual tests

Añade capturas en varios viewports.

Como mínimo:

- desktop grande;
- portátil;
- tablet;
- móvil.

No hagas bloqueantes las capturas durante la primera fase si generan falsos positivos.

El objetivo inicial es detectar regresiones humanas.

Estabiliza después las áreas deterministas.

Los renders de canvas entre motores/navegadores pueden variar ligeramente; evita tolerancias absurdamente estrictas.

---

# 43. Tests de seguridad

Crea fixtures de:

- SVG con `<script>`;
- `javascript:`;
- referencias externas;
- XML extraño;
- dimensiones enormes;
- imágenes inválidas;
- proyecto Tonga mal formado;
- proyecto con versión desconocida.

La aplicación debe fallar de forma controlada.

No insertes mensajes de error mediante HTML sin escapar.

---

# 44. Accesibilidad automática

Evalúa axe-core/Playwright u otra herramienta equivalente.

Comprueba su licencia antes de añadirla.

Ejecuta auditoría al menos sobre:

- inicio;
- editor;
- biblioteca;
- exportación;
- diálogo;
- versión móvil.

Un cero de axe no significa cumplimiento WCAG.

Añade también pruebas manuales documentadas.

---

# 45. Rendimiento

Mide antes de fijar presupuestos.

Después establece budgets realistas para:

- JS inicial;
- CSS;
- número de requests;
- LCP;
- assets iniciales;
- memoria al abrir;
- tamaño de `dist/`.

Carga dinámicamente funciones pesadas:

- PDF;
- filtros poco usados;
- quizá biblioteca completa.

No cargues 3.000 miniaturas al inicio.

---

# 46. Lighthouse

Añade Lighthouse CI cuando la interfaz sea estable.

Inicialmente informativo, no bloqueante.

Mide:

- performance;
- accessibility;
- best practices.

No persigas un 100 sacrificando funcionalidad.

Establece thresholds basados en mediciones reales.

---

# 47. CI

Sustituye el workflow actual.

CI debe ejecutar algo conceptualmente equivalente a:

```bash
npm ci
npm run lint
npm run typecheck
npm test
npm run build
npm run check
npm run e2e
npm run audit
npm run licenses
```

Ajusta nombres a la implementación real.

Evita ejecutar dos veces la misma suite accidentalmente.

Usa Node 24 o la LTS actual justificada.

---

# 48. GitHub Actions

Sigue mínimo privilegio.

CI normalmente:

```yaml
permissions:
  contents: read
```

Solo un job que necesite desplegar debe obtener permisos adicionales.

No des `write-all`.

Actualiza actions a versiones actuales verificadas.

Consulta documentación oficial y, si está disponible, el skill de hardening utilizado en Aritmates.

GitHub Pages debe ejecutarse solo después de CI correcto.

---

# 49. Dependabot

Configura Dependabot para:

- npm;
- GitHub Actions.

Agrupa updates razonablemente cuando ayude.

No hagas auto-merge ciego de majors.

---

# 50. Supply chain

Añade comprobaciones razonables:

- `npm audit`;
- dependencias directas mínimas;
- lockfile;
- install reproducible;
- revisión de scripts de instalación;
- licencias.

Evalúa SBOM SPDX.

No introduzcas una plataforma compleja de supply chain si el coste supera el beneficio.

---

# 51. Scripts npm

Objetivo aproximado:

```json
{
    "scripts": {
        "dev": "...",
        "build": "...",
        "preview": "...",
        "clean": "...",
        "lint": "...",
        "typecheck": "...",
        "test": "...",
        "coverage": "...",
        "e2e": "...",
        "visual": "...",
        "check": "...",
        "audit": "...",
        "licenses": "..."
    }
}
```

Los comandos deben funcionar también mediante un Makefile simple.

---

# 52. Makefile

Mantén un Makefile pequeño y predecible.

Como mínimo:

```text
up
build
test
lint
fix
e2e
check
package
clean
help
```

No replique toda la lógica del `package.json`.

El Makefile llama a npm.

---

# 53. Releases

Implementa un workflow de release para tags `v*`.

Debe:

1. ejecutar quality gate;
2. construir;
3. generar ZIP de `dist/`;
4. publicar release;
5. adjuntar artifact.

El ZIP debe contener únicamente la aplicación desplegable.

No incluyas `node_modules`.

---

# 54. GitHub Pages

Publica una demo:

```text
https://ateeducacion.github.io/tonga/
```

si la configuración de la organización lo permite.

La demo se genera desde `main`.

Nunca publiques la rama `upstream`.

No mantengas una rama `gh-pages` manual si GitHub Pages mediante artifacts permite evitarla.

---

# 55. Documentación

Crea como mínimo:

```text
README.md
AGENTS.md
developers.md

docs/
  ARCHITECTURE.md
  TESTING.md
  LICENSING.md
  ASSETS.md
  PROJECT-FORMAT.md
  ACCESSIBILITY.md
  SECURITY.md
  MODERNIZATION.md
  MODERNIZATION-REPORT.md
  adr/
```

Documentación destinada a personas: español.

Código, variables, nombres de funciones y comentarios de código: inglés.

---

# 56. AGENTS.md

Toma Aritmates como inspiración, pero escribe uno específico para Tonga.

Debe fijar:

- `upstream` es histórica;
- `main` es mantenida;
- tecnologías permitidas;
- arquitectura;
- comandos;
- tests;
- reglas de licencia;
- dónde investigar;
- no usar APIs privadas de Fabric;
- no introducir framework sin ADR;
- formato del proyecto;
- política de assets;
- política de CI;
- política de commits.

---

# 57. Skills para agentes

Estudia el modelo de `.agents/skills` y `.claude/skills` de Aritmates.

Reutiliza únicamente skills realmente útiles.

Candidatos:

- GitHub Actions hardening;
- security audit;
- Playwright;
- Playwright trace;
- test-gap audit;
- quizá accesibilidad.

Respeta sus licencias.

Registra origen exacto.

No copies un skill sin licencia.

No llenes Tonga de skills que no se utilizan.

---

# 58. Informe de modernización

Crea un informe reproducible similar al de Aritmates.

Compara:

```text
upstream
vs
main modernizada
```

Métricas posibles:

- tamaño repositorio de trabajo;
- tamaño `dist/`;
- cantidad de ficheros;
- cantidad de JS/CSS;
- dependencias;
- código vendorizado;
- JS inicial;
- peticiones iniciales;
- tiempo de carga;
- tests;
- cobertura;
- E2E;
- accesibilidad automática;
- vulnerabilidades;
- `console.log`;
- `eval`;
- inline JS;
- librerías obsoletas;
- assets;
- recursos externos.

Genera las métricas con script reproducible.

No inventes cifras.

El informe debe señalar también qué empeoró o quedó pendiente.

---

# 59. Modernización por fases

No realices un commit gigantesco.

## Fase 0 — auditoría

- baseline;
- funcionalidades;
- licencias;
- dependencias;
- métricas;
- documentación.

## Fase 1 — infraestructura

- package moderno;
- Vite;
- TypeScript;
- lint;
- tests;
- Playwright;
- CI;
- Pages.

Sin cambiar todavía el comportamiento fundamental.

## Fase 2 — nuevo core gráfico

- Fabric moderno;
- CanvasAdapter;
- modelo de documento;
- comandos;
- history;
- serialización.

## Fase 3 — UI

- layout nuevo;
- toolbar;
- inspector;
- capas;
- responsive;
- teclado;
- accesibilidad.

## Fase 4 — biblioteca

- catálogo;
- búsqueda;
- thumbnails;
- lazy load;
- licencias.

## Fase 5 — export

- PNG;
- JPEG;
- SVG;
- PDF.

## Fase 6 — persistencia/PWA

- formato Tonga;
- autosave;
- restore;
- manifest;
- offline shell.

## Fase 7 — limpieza

Elimina definitivamente:

- TUI;
- jQuery;
- vendor duplicado;
- código muerto;
- CSS muerto;
- assets no referenciados comprobados;
- polyfills obsoletos.

## Fase 8 — hardening

- seguridad;
- licencias;
- accesibilidad;
- cross-browser;
- performance;
- documentación;
- informe final.

---

# 60. Migración, no big bang ciego

Aunque el destino sea una reescritura sustancial, conserva permanentemente un estado ejecutable.

No borres el legacy antes de que los tests de comportamiento básicos existan.

Es preferible:

```text
test que fija función
→ nueva implementación
→ test pasa
→ borrar implementación antigua
```

a:

```text
borrar todo
→ empezar de cero
→ confiar en memoria
```

---

# 61. UX: criterios concretos

Una persona nueva debería poder, sin leer instrucciones:

1. abrir Tonga;
2. crear un lienzo;
3. añadir texto;
4. cambiarlo;
5. añadir una imagen;
6. encontrar una imagen de la biblioteca;
7. mover objetos;
8. deshacer;
9. exportar.

Si cualquiera de esas operaciones requiere descubrir un doble clic oculto, botón ambiguo o menú inesperado, rediseña.

---

# 62. Mensajes y feedback

Añade feedback claro para:

- guardado;
- exportación;
- error;
- asset que no puede cargarse;
- proyecto incompatible;
- recuperación automática;
- descarga.

No uses `alert()` para la UI normal.

Usa toast/status donde sea adecuado.

Los errores críticos pueden usar diálogo.

---

# 63. Destructividad

Acciones como:

- limpiar lienzo;
- nuevo proyecto con cambios pendientes;
- eliminar todos;

deben permitir recuperación mediante undo o pedir confirmación cuando corresponda.

No preguntes confirmación para cada borrado normal si undo lo resuelve.

---

# 64. Errores

Implementa una capa sencilla de error handling.

No dejes:

```text
Unhandled Promise rejection
```

en consola.

En producción:

- mensaje comprensible;
- detalles técnicos en consola cuando tengan utilidad;
- sin datos sensibles.

Tests E2E deben fallar ante errores inesperados de consola.

---

# 65. Compatibilidad

Soporta versiones actuales de:

- Chromium;
- Firefox;
- Safari/WebKit.

No mantengas Internet Explorer.

No incluyas polyfills sin caso real.

Usa progressive enhancement para APIs opcionales.

---

# 66. APIs experimentales

Puedes explorar:

- File System Access;
- Clipboard API;
- Web Share;

pero nunca deben ser necesarias para el flujo principal.

Debe existir fallback estándar.

---

# 67. Código y estilo

Código en inglés.

Comentarios en inglés.

Documentación de usuario/desarrollo en español.

Nombres expresivos.

Evita:

- funciones enormes;
- clases enormes;
- globals;
- manipulación DOM distribuida;
- números mágicos;
- CSS inline;
- JS inline;
- eventos `onclick="..."`;
- duplicación desktop/mobile.

No añadas comentario que repita literalmente el código.

---

# 68. Commits y pull requests

No trabajes directamente sobre `main`.

No toques `upstream`.

No uses `--force`.

Commits:

- inglés;
- pequeños;
- un cambio lógico.

PRs:

- título en inglés;
- descripción Markdown en inglés;
- resumen;
- pruebas;
- screenshots si cambia UI;
- implicaciones de licencia cuando existan;
- métricas cuando sea relevante.

No atribuyas commits a agentes de IA.

---

# 69. No sacrificar simplicidad por «modernidad»

No confundas aplicación moderna con:

- microservicios;
- framework grande;
- estado global complejo;
- GraphQL;
- backend;
- contenedores obligatorios;
- Kubernetes;
- diseño con 200 dependencias.

Una Tonga moderna debería poder conceptualmente desplegarse así:

```bash
npm ci
npm run build
cp -R dist/* /var/www/tonga/
```

Ese nivel de simplicidad es una característica.

---

# 70. Hipótesis técnica inicial

A falta de que la investigación demuestre algo mejor, parte de:

```text
Node 24+
npm
Vite
TypeScript
Fabric.js 7.x
HTML semántico
CSS moderno
Custom Elements solo cuando aporten valor
Playwright
runner unitario ligero
REUSE/SPDX
GitHub Actions
GitHub Pages
```

No lo trates como dogma.

Revalida versiones mediante Context7 e Internet antes de añadirlas.

---

# 71. Dependencias objetivo

Intenta que las dependencias runtime sean pocas.

Un objetivo razonable sería algo próximo a:

```text
fabric
[PDF library, solo si se necesita]
[posible librería pequeña adicional justificada]
```

No añadas:

```text
axios
jquery
lodash
moment
bootstrap JS
fontawesome completo
```

para problemas que resuelve directamente el navegador.

Una biblioteca solo entra después de responder:

- ¿qué problema resuelve?
- ¿cuánto pesa?
- ¿está mantenida?
- ¿qué licencia tiene?
- ¿qué superficie de seguridad añade?
- ¿podemos resolverlo en 20 líneas claras?
- ¿el código propio sería realmente más mantenible?

---

# 72. Definition of Done

No consideres finalizada la modernización hasta que:

- `upstream` siga intacta;
- el comportamiento relevante esté inventariado;
- TOAST UI no sea dependencia de producción;
- no existan accesos a APIs privadas del editor;
- Fabric esté actualizado y documentado;
- la aplicación sea estática;
- exista build reproducible;
- exista TypeScript si finalmente se confirma su utilidad;
- el código esté modularizado;
- la UI sea responsive;
- exista navegación por teclado;
- exista representación accesible de objetos;
- exista biblioteca moderna;
- las colecciones no se carguen todas al inicio;
- exista formato de proyecto;
- exista autosave/recovery;
- undo/redo sea fiable;
- PNG funcione;
- JPEG funcione;
- SVG funcione de forma segura;
- PDF funcione si sigue siendo requisito;
- tests unitarios pasen;
- E2E pasen;
- Chromium pase;
- Firefox pase;
- WebKit pase;
- no haya errores inesperados de consola;
- lint pase;
- typecheck pase;
- build pase;
- auditoría de dependencias pase;
- inventario de licencias exista;
- REUSE esté configurado;
- terceros estén atribuidos;
- código y assets tengan licencia claramente diferenciada;
- README esté actualizado;
- arquitectura esté documentada;
- tests estén documentados;
- seguridad esté documentada;
- accesibilidad esté documentada;
- informe upstream/main esté generado;
- GitHub Pages se despliegue únicamente después de CI correcto.

---

# 73. Entregables

Al finalizar quiero:

1. aplicación modernizada;
2. rama `upstream` preservada;
3. tests;
4. E2E;
5. CI;
6. Pages;
7. release workflow;
8. documentación;
9. AGENTS.md;
10. inventario de dependencias;
11. inventario de licencias;
12. THIRD_PARTY_NOTICES;
13. REUSE/SPDX;
14. catálogo estructurado de assets;
15. métricas reproducibles;
16. informe de modernización;
17. screenshots de la nueva UI;
18. changelog;
19. lista explícita de deuda técnica restante.

---

# 74. Antes de implementar: primer resultado obligatorio

Antes de hacer la reescritura principal, entrega un informe breve con:

## Estado actual

Qué hace Tonga y cómo está construida.

## Diferencias `upstream` / `main`

Qué ya ha cambiado.

## Inventario tecnológico

Qué librerías existen y cuáles están realmente en uso.

## Riesgos

Especialmente:

- TOAST UI archivado;
- Fabric antiguo;
- APIs privadas;
- seguridad SVG;
- código vendorizado;
- assets;
- tamaño;
- ausencia de tests;
- CI insuficiente;
- licencias.

## Auditoría de licencias

Tabla:

| Elemento | Origen | Versión/commit | Licencia detectada | Evidencia | Acción |
|---|---|---|---|---|---|

## Arquitectura propuesta

Con diagrama.

## ADR tecnológico

Justifica:

- Fabric;
- Vite;
- TypeScript;
- runner unitario;
- Playwright;
- PWA sí/no.

## Plan de migración

PR por PR o bloques pequeños.

Solo después empieza la implementación.

---

# 75. Regla final

No modernices para que el código «parezca moderno».

Moderniza para que Tonga sea una aplicación que podamos mantener durante años.

Cada cambio debe poder responder al menos a una de estas preguntas:

- ¿reduce riesgo?
- ¿reduce complejidad?
- ¿mejora mantenimiento?
- ¿mejora seguridad?
- ¿mejora accesibilidad?
- ¿mejora UX?
- ¿mejora rendimiento?
- ¿hace explícita la licencia/procedencia?
- ¿añade una capacidad útil?

Si no responde a ninguna, probablemente no necesitamos ese cambio.
