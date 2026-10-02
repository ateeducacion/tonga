# 0004: Vitest para los tests unitarios

Estado: aceptada (2026-10-02)

## Decisión

**Vitest 5.0** (MIT) con entorno **jsdom 30**. Comparte la configuración de Vite y entiende TypeScript sin pasos extra. Fabric necesita un contexto 2D real en Node: se permite el script de instalación de su dependencia opcional `canvas`, que descarga el binario precompilado oficial. Solo afecta a los tests: el navegador usa su canvas nativo.

## Alternativas

- **Mocha + Chai** (Aritmates): habría que configurar TypeScript y los alias.
- **Modo navegador de Vitest**: tests en un Chromium real. Daría un canvas sin `canvas` nativo a cambio de más configuración; los E2E ya cubren los tres navegadores.

## Consecuencias

`npm run coverage` mide los módulos de lógica con umbrales. La conexión con el DOM la cubren los E2E ([TESTING](../TESTING.md)).
