# Seguridad y privacidad

## Privacidad

Tonga procesa todo **en el navegador**. No hay servidor de aplicación, cuentas, analítica, rastreadores, CDN, Google Fonts ni telemetría. Las imágenes y los proyectos no salen del equipo:

- las imágenes importadas y el autoguardado van a IndexedDB de ese navegador;
- la preferencia de tema va a `localStorage`;
- exportar y guardar descargan ficheros con `<a download>`.

Los E2E fallan si la app hace cualquier petición fuera de su origen.

En equipos compartidos, la recuperación del autoguardado **nunca es automática**: se pregunta con una miniatura y la hora, y avisa de que el dibujo puede ser de otra persona.

## Entradas no confiables

| Entrada | Defensa |
|---|---|
| Ficheros importados | El tipo se detecta por los bytes, no por la extensión. Máximo 100 MB y 8.192 px por lado. Los paquetes de eXeLearning (`.elpx`, `.idevice`, `.block`) admiten hasta 2 GB porque no se cargan enteros: se lee el directorio del ZIP y solo las entradas necesarias (`content.xml` y las imágenes de la diapositiva), con un máximo de 100 MB descomprimidos por entrada y 200 MB en total. Los errores de decodificación se muestran con un mensaje legible. |
| SVG | Saneado antes de Fabric (`src/import/svg.ts`): se rechazan DOCTYPE y entidades. Se eliminan `<script>`, `<foreignObject>`, `<iframe>`, animaciones y atributos `on*`. `href` y `url()` solo admiten `data:image/…` o `#fragmento`, así que no hay peticiones de rastreo ni lienzo contaminado. Nunca se pinta un SVG mediante `<img>`. |
| Proyectos `.tonga` | Validación estricta (`parseProject`): versión conocida, tamaños acotados, tipos de capa conocidos, ids únicos, imágenes solo locales (`asset:`, `data:image/…` o `repositorios/…`). Cada imagen incrustada se comprueba contra su SHA-256. |
| Catálogo de la biblioteca | Se genera y valida en el build. Los títulos se pintan con `textContent`. |
| Exportación SVG | Fabric ≥ 7.4.0 escapa los atributos (corrige GHSA-hfvx-25r5-qc3w y GHSA-w22m-hvvm-xmwx). |

La interfaz no usa `innerHTML` con datos: el único `innerHTML` mete el marcado constante de los iconos, fijado en el build. No hay `eval`, `new Function`, scripts en línea ni handlers en línea.

## Cabeceras recomendadas

La aplicación se puede servir con una CSP estricta. Para Nginx:

```nginx
add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data: blob:; connect-src 'self'; worker-src 'self'; manifest-src 'self'; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self'" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "no-referrer" always;
add_header Permissions-Policy "camera=(), microphone=(), geolocation=(), payment=(), usb=()" always;
```

Para Apache, lo mismo con `Header always set …`. Fabric aplica estilos en línea a sus elementos de canvas. Si una política con `style-src 'self'` bloquease algún estilo en un navegador concreto, se añade `'unsafe-inline'` solo a `style-src`.

**GitHub Pages no permite definir cabeceras HTTP.** Allí no hay CSP ni `Permissions-Policy`; GitHub sirve HTTPS y `X-Content-Type-Options: nosniff`. Para un despliegue institucional se recomienda Nginx o Apache con las cabeceras de arriba.

## Dependencias y cadena de suministro

- Una sola dependencia de runtime: `fabric` (MIT), fijada a versión exacta.
- `npm ci` usa el lockfile. Los scripts de instalación están limitados con `allowScripts`: solo `canvas` (binario precompilado para los tests), y nunca se distribuye.
- `npm run audit` (CI y release) falla con vulnerabilidades altas o críticas. Dependabot actualiza npm, GitHub Actions y la imagen base de Docker cada semana. Los cambios mayores no se fusionan de forma automática.
- Las actions van fijadas por SHA. El CI tiene `contents: read`; solo el job de despliegue de Pages tiene `pages: write`/`id-token: write`, y solo el de release tiene `contents: write`.
- Pages despliega únicamente después de un CI correcto en un push a `main`. Un pull request nunca publica nada.
- Cada release lleva su SBOM SPDX (`npm sbom`).

## Informar de un problema

Escribe a <ate.educacion@gobiernodecanarias.org> o abre un *security advisory* privado en GitHub. No publiques los detalles en una issue abierta.

## Revisión

La auditoría de seguridad de la versión original está en `analysis/tonga/ASSESSMENT.md` (SEC-001…017). Su resolución en Tonga 2.0:

| Hallazgo | Estado |
|---|---|
| SEC-001…004, 016 (CI que publicaba en PR, actions sin fijar, permisos, `dependabot.yml` inválido) | Resuelto |
| SEC-005 (XSS en el SVG exportado) | Resuelto (Fabric 7.4 y un SVG nuevo) |
| SEC-006 (`innerHTML` y `onclick` con datos de `lista.txt`) | Resuelto (DOM con `textContent` y `addEventListener`) |
| SEC-007…010 (jQuery, jQuery UI, jsPDF, axios vulnerables) | Resuelto (eliminados) |
| SEC-011 (`clipTo` con `new Function` en Fabric 2) | Resuelto (Fabric 7 y validación del proyecto) |
| SEC-012, 013 (peticiones externas desde un SVG, validación de ficheros) | Resuelto |
| SEC-014 (sin CSP) | La app permite una CSP estricta; GitHub Pages no la envía (ver arriba) |
| SEC-015 (`target` sin `rel`) | Resuelto (`rel="noopener noreferrer"`) |
| SEC-017 (beacon de analítica latente) | Resuelto (eliminado con TOAST UI) |
