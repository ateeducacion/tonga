# 0003: Vite 8 y TypeScript 6

Estado: aceptada (2026-10-02)

## Contexto

Tonga 1 no tenía build: copiaba librerías minificadas a mano (`npm run update`) y el `package.json` no correspondía con lo que se cargaba. El dominio (documento, capas, historial, comandos, formato versionado) se beneficia de tipos.

## Decisión

- **Vite 8.3** (MIT) como servidor de desarrollo y build: `base: './'` para rutas relativas, `dist/` estático y un plugin pequeño que genera el service worker.
- **TypeScript 6.0.3** (Apache-2.0) en modo `strict` con `noUncheckedIndexedAccess`, sin `any`. Solo se usa `tsc --noEmit`, porque Vite transpila.

TypeScript 7.0 (el compilador nativo) ya está publicado, pero `typescript-eslint` 8.71 declara `typescript >=4.8.4 <6.1.0`. Se fija la 6.0 hasta que el linter con tipos soporte la 7.

## Alternativas

- **esbuild a mano** (como Aritmates): sirve para builds simples, pero el servidor de desarrollo, el HMR y los assets con hash habría que hacerlos a mano.
- **JavaScript con JSDoc**: menos herramientas, pero menos garantías en el formato y el historial.

## Consecuencias

- El JavaScript generado no se versiona: `dist/` está en `.gitignore`.
- Producción no necesita Node: `cp -R dist/*` en cualquier servidor web.
