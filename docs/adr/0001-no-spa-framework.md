# 0001: Sin framework SPA

Estado: aceptada (2026-10-02)

## Contexto

Tonga tiene una sola pantalla con pocas vistas: barra superior, herramientas, lienzo, inspector, capas y unos diálogos. El estado relevante (el documento) vive en el editor y en Fabric, no en la interfaz. El prompt de modernización parte de la hipótesis de que no hace falta React, Vue, Angular ni Svelte, salvo que un ADR demuestre lo contrario.

## Decisión

TypeScript, HTML semántico y CSS, sin framework. Los diálogos son `<dialog>` nativos declarados en `index.html`. Las partes dinámicas (capas, inspector, cuadrícula de la biblioteca) se repintan con funciones `render*` cuando el editor notifica un cambio. Un helper `h()` crea los elementos con `textContent`.

## Alternativas

- **React/Preact/Vue/Svelte**: dan componentes y reactividad, pero añaden dependencia, build y un modelo de estado paralelo al de Fabric que habría que sincronizar. El mayor riesgo de la app (el lienzo) no mejora con ellos.
- **Custom Elements**: útiles si un widget se reutilizara en otras apps. Hoy no es el caso; se pueden introducir cuando aporten.

## Consecuencias

- Una única dependencia de runtime (`fabric`). Bundle inicial: unos 112 KB gzip.
- Repintar el inspector conserva el foco (solo se reconstruye cuando cambia la selección).
- Si la interfaz crece mucho, este ADR se revisa.
