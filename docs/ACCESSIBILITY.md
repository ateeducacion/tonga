# Accesibilidad

Referencia técnica: **WCAG 2.2 AA**. Un resultado limpio de axe **no** demuestra el cumplimiento: hace falta la revisión manual de abajo.

## Cómo es accesible un editor gráfico

El lienzo es una imagen (`<canvas role="img">`) que un lector de pantalla no puede recorrer. Por eso el dibujo tiene una **representación en el DOM**:

- El panel **Capas** es una lista de botones nativos. Ctrl/⌘ o Mayús + Intro (o + clic) añade una capa a la selección o la quita, y «Combinar capas» une las elegidas. Para cada objeto hay botones con nombre accesible para seleccionar («Texto 1 (Texto)», «… oculta, bloqueada»), subir, bajar, ocultar o mostrar, y bloquear o desbloquear.
- El panel **Propiedades** permite editar el objeto seleccionado sin ratón: nombre, posición, tamaño (con «Mantener proporción»), giro, opacidad, colores (selector y campo hexadecimal), texto, tipografía, alineación, orden, volteo, duplicar y borrar. En las imágenes también se puede recortar (campos por lado) y ajustar: cada deslizador tiene al lado un campo numérico. Sombra, estilo de línea, degradado, distribuir, conectar dos objetos («Conectar con flecha/línea») y escribir dentro de una forma («Escribir dentro») tienen también su botón: no dependen del ratón. El lápiz y el recorte con el ratón son ayudas visuales con alternativa por teclado (formas, campos de recorte).
- Una región `role="status"` anuncia selecciones, inserciones, borrados, deshacer y rehacer, y la herramienta activa.

## Teclado

- Todo es alcanzable con Tab. El primer elemento es «Saltar al lienzo».
- Las formas y el texto se insertan **centrados con un botón**: no hace falta arrastrar (criterio 2.5.7).
- El menú contextual se abre también con la tecla Menú o Mayús+F10, sobre el objeto seleccionado. Es un menú WAI-ARIA (flechas, Inicio/Fin, Intro, Esc), y todo lo que contiene está también en el inspector y en los atajos.
- Flechas para mover 1 px y Shift+flechas para 10 px; Supr para borrar; Ctrl/⌘+Z/Y/C/V/D/A; +, −, 0 y 1 para el zoom; V, H, B, T, R, E, L, I y K para herramientas y acciones. Los atajos **no actúan** mientras se escribe en un campo ni al editar texto del lienzo, y están documentados en *Ayuda*.
- Biblioteca: el buscador recibe el foco; en la cuadrícula, las flechas, Inicio y Fin mueven la selección (`aria-activedescendant`) y Enter añade la imagen.
- Los diálogos son `<dialog>` modales nativos: atrapan el foco, se cierran con Esc y devuelven el foco al cerrar.
- **Excepción documentada**: el dibujo libre necesita un dispositivo apuntador (ratón, lápiz o dedo). Las formas y el texto tienen alternativa con teclado.

## Visual

- Foco visible: contorno de 3 px con su propio color en los dos temas.
- Contraste: los tokens se eligieron para AA en claro y oscuro, y axe lo comprueba.
- Temas claro y oscuro con `light-dark()`. Por defecto sigue al sistema; un botón fija el contrario.
- `forced-colors` (alto contraste de Windows): los estados seleccionados usan `Highlight`.
- `prefers-reduced-motion`: la única animación, la entrada de los avisos, se desactiva.
- Objetivos táctiles de al menos 24 px (44 px en la barra móvil).
- Funciona con zoom del navegador del 200 % y en pantallas de 390 px de ancho: en móvil, la barra de herramientas pasa abajo y el panel se convierte en un cajón con botón de cierre.
- No hay `alert()`: los avisos son *toasts* con `aria-live`, y los errores usan `role="alert"`.

## Pruebas automáticas

`e2e/app/a11y.spec.ts` ejecuta axe (WCAG 2.0, 2.1 y 2.2 A/AA) en el inicio, el editor con selección, la biblioteca, los diálogos de exportación y ayuda, y el móvil con tema oscuro y el cajón abierto. Hay además un E2E que recorre un flujo **solo con teclado**.

## Revisión manual (lista de comprobación)

Hay que repetirla antes de cada versión mayor y anotar fecha y resultado.

- [ ] NVDA + Firefox: crear un dibujo, añadir texto y una forma, seleccionarlos desde Capas, cambiar el color y la posición, deshacer, exportar.
- [ ] VoiceOver + Safari (macOS e iPadOS): el mismo flujo, y la biblioteca.
- [ ] TalkBack + Chrome (Android): abrir el panel, añadir una imagen de la biblioteca.
- [ ] Solo teclado, sin ratón, el flujo completo.
- [ ] Zoom del navegador al 200 % y 400 % (reflow).
- [ ] Alto contraste de Windows.
- [ ] Mensajes de error al importar un fichero no válido.

| Fecha | Revisor | Resultado |
|---|---|---|
| — | — | Pendiente de la primera revisión manual |
