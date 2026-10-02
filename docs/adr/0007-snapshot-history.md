# 0007: Historial con snapshots del documento

Estado: aceptada (2026-10-02)

## Contexto

El historial de Tonga 1 dependía del `Invoker` de TOAST UI, incluido su cerrojo privado. El prompt pide un historial explícito, que agrupe una interacción continua en una sola operación y tenga un límite de memoria.

## Decisión

`src/history/history.ts` guarda el documento `.tonga` serializado después de cada cambio. Un cambio con la misma clave que el anterior (arrastre, slider del inspector, movimiento con flechas) sustituye al paso anterior en vez de añadir uno nuevo. Límites: 100 pasos y 20 MB.

Las imágenes no se guardan dentro del documento: se referencian por `asset:<sha256>` (sus bytes están en IndexedDB) o por su ruta de la biblioteca. Así, un snapshot con fotos sigue ocupando unos KB.

## Alternativas

- **Patrón Command con inversos**: menos memoria por paso, pero cada operación necesita su inverso, que es una fuente de errores (Tonga 1 tenía inversos rotos, ver RULE-039).

## Consecuencias

- Cualquier operación, presente o futura, se puede deshacer sin código adicional.
- Deshacer reconstruye los objetos del lienzo y vuelve a seleccionar por id.
