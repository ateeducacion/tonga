# 0002: Fabric.js 7 como motor, sin TOAST UI Image Editor

Estado: aceptada (2026-10-02)

## Contexto

Tonga 1 era un fork de TOAST UI Image Editor 3.6.0 (proyecto archivado) con 271 ediciones manuales («JBD») sobre un bundle sin código fuente, con un Fabric 2.7 embebido y accesos a APIs privadas (`_invoker._isLocked`).

## Decisión

Fabric.js **7.4.0** (MIT), importado desde la raíz del paquete (`'fabric'`), usado directamente y solo con APIs públicas.

Comprobaciones: npm (`fabric@7.4.0`, publicado el 2026-05-18, MIT), documentación oficial y Context7 (*upgrading to 6/7*: módulos ES, promesas, `FabricObject.customProperties`, origen `center` por defecto en v7), GitHub Advisories (GHSA-hfvx-25r5-qc3w, XSS en la exportación SVG, corregido en 7.2.0; GHSA-w22m-hvvm-xmwx, escape de `colorStops`, corregido en 7.4.0). Antes de adoptarlo se hizo un *spike* (round-trip JSON y `toSVG` en Vitest).

## Alternativas

- **Mantener o actualizar TOAST UI**: archivado, sin fuente del fork, y descartado por el prompt.
- **Konva**: buen rendimiento, pero sin importación ni exportación SVG nativa, que Tonga necesita.
- **Canvas propio**: demasiado código (selección, transformaciones, texto editable, SVG).

## Consecuencias

- `FabricObject.customProperties = ['id', 'name', 'assetSrc']` para serializar los metadatos de Tonga.
- Se declara de forma explícita el origen `center`. La geometría se hace con `getCenterPoint`, `setPositionByOrigin` y `getBoundingRect`.
- La serialización del documento es de Tonga ([PROJECT-FORMAT](../PROJECT-FORMAT.md)): un cambio de formato de Fabric en el futuro se absorbe con una migración.
- ESLint impide accesos `_privados` y limita dónde se importa `fabric`.
