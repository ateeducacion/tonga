// «Formas» menu: a native popover with the predefined shapes, grouped as in eXeLearning. Each
// button carries data-add, so the app wires it like any other «Añadir …» button.
import { SHAPES, type ShapeGroup } from '../canvas/shapes';
import { byId, h } from './dom';

const SVG = 'http://www.w3.org/2000/svg';

function preview(d: string): SVGSVGElement {
  const svg = document.createElementNS(SVG, 'svg');
  const path = document.createElementNS(SVG, 'path');
  for (const [k, v] of Object.entries({ viewBox: '-6 -6 112 112', width: '24', height: '24', 'aria-hidden': 'true', focusable: 'false' })) svg.setAttribute(k, v);
  for (const [k, v] of Object.entries({ d, fill: 'none', stroke: 'currentColor', 'stroke-width': '2', 'stroke-linejoin': 'round', 'vector-effect': 'non-scaling-stroke' })) path.setAttribute(k, v);
  svg.append(path);
  return svg;
}

export function setupShapesMenu(): void {
  const menu = byId('shapes-menu');
  const groups = [...new Set(SHAPES.map((s) => s.group))] as ShapeGroup[];
  menu.replaceChildren(
    ...groups.map((group) => {
      const title = h('h3', { class: 'shapes-title' }, group);
      const grid = h('div', { class: 'shapes-grid' });
      for (const s of SHAPES.filter((x) => x.group === group)) {
        const b = h('button', { type: 'button', class: 'tool', 'data-add': s.kind, 'aria-label': `Añadir ${s.label.toLowerCase()}`, title: s.label });
        b.append(preview(s.d));
        b.addEventListener('click', () => menu.hidePopover());
        grid.append(b);
      }
      return h('section', { class: 'shapes-section' }, title, grid);
    }),
  );
  // Next to its button: to the right of the side toolbar, above the bottom one on small screens.
  menu.addEventListener('toggle', (e) => {
    if ((e as ToggleEvent).newState !== 'open') return;
    const button = document.querySelector('[popovertarget="shapes-menu"]') as HTMLElement;
    const anchor = button.getBoundingClientRect();
    const { width, height } = menu.getBoundingClientRect();
    const below = anchor.right + width + 8 > innerWidth;
    const left = below ? anchor.left : anchor.right + 8;
    const top = below ? anchor.top - height - 8 : anchor.top;
    menu.style.left = `${Math.max(4, Math.min(left, innerWidth - width - 4))}px`;
    menu.style.top = `${Math.max(4, Math.min(top, innerHeight - height - 4))}px`;
    menu.querySelector<HTMLElement>('button')?.focus();
  });
}
