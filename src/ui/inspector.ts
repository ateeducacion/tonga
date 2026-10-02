// Contextual inspector: shows only what makes sense for the selection (or the canvas when
// nothing is selected). Rebuilt when the selection changes; otherwise only values are synced,
// so typing in a field never loses focus.
import type { AlignEdge, Editor, SelectionInfo } from '../canvas/editor';
import { HEX_COLOR } from '../project/schema';
import { byId, h, iconButton } from './dom';
import type { IconName } from './icons';

const FONTS = ['Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New', 'Trebuchet MS', 'Comic Sans MS'];

export interface InspectorActions {
  resizeCanvas(width: number, height: number): void;
  setBackground(color: string | null): void;
  toggleGrid(on: boolean): void;
  gridOn(): boolean;
}

let signature = '';

export function renderInspector(editor: Editor, actions: InspectorActions, force = false): void {
  const form = byId<HTMLFormElement>('inspector');
  const info = editor.inspect();
  const sig = info ? `${info.type}:${info.ids.join(',')}` : `canvas:${editor.size.width}x${editor.size.height}:${JSON.stringify(editor.currentBackground)}`;
  if (sig === signature && !force) {
    syncValues(form, info, editor);
    return;
  }
  signature = sig;
  form.replaceChildren(...(info ? selectionFields(editor, info) : canvasFields(editor, actions)));
  syncValues(form, info, editor);
}

function syncValues(form: HTMLFormElement, info: SelectionInfo | null, editor: Editor): void {
  const values: Record<string, string> = info
    ? {
        name: info.name, x: String(info.x), y: String(info.y), width: String(info.width), height: String(info.height),
        angle: String(info.angle), opacity: String(Math.round(info.opacity * 100)),
        fill: info.fill ?? '', fillHex: info.fill ?? '', stroke: info.stroke ?? '', strokeHex: info.stroke ?? '', strokeWidth: String(info.strokeWidth ?? 0),
        text: info.text?.text ?? '', fontFamily: info.text?.fontFamily ?? '', fontSize: String(info.text?.fontSize ?? ''), textAlign: info.text?.textAlign ?? '',
      }
    : { cw: String(editor.size.width), ch: String(editor.size.height) };
  for (const [name, value] of Object.entries(values)) {
    const el = form.elements.namedItem(name);
    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      if (el !== document.activeElement && el.type !== 'checkbox') el.value = el.type === 'color' && !HEX_COLOR.test(value) ? '#000000' : value;
    }
  }
  if (info?.text) {
    const bold = form.elements.namedItem('bold') as HTMLInputElement | null;
    if (bold) bold.checked = info.text.bold;
    const italic = form.elements.namedItem('italic') as HTMLInputElement | null;
    if (italic) italic.checked = info.text.italic;
  }
}

function num(label: string, name: string, attrs: Record<string, string | number> = {}): HTMLLabelElement {
  return h('label', {}, label, h('input', { type: 'number', name, inputmode: 'decimal', step: 1, ...attrs }));
}

/** Colour picker + accessible HEX text field kept in sync. */
function colour(label: string, name: string, onChange: (hex: string) => void): HTMLDivElement {
  const picker = h('input', { type: 'color', name, 'aria-label': `${label} (selector)` });
  const hex = h('input', { type: 'text', name: `${name}Hex`, 'aria-label': `${label} (hexadecimal)`, maxlength: 7, spellcheck: 'false', pattern: '#[0-9a-fA-F]{6}' });
  picker.addEventListener('input', () => {
    hex.value = picker.value;
    onChange(picker.value);
  });
  hex.addEventListener('change', () => {
    const v = hex.value.trim().startsWith('#') ? hex.value.trim() : `#${hex.value.trim()}`;
    if (HEX_COLOR.test(v)) {
      picker.value = v;
      onChange(v.toLowerCase());
    }
  });
  return h('div', {}, h('span', { class: 'muted' }, label), h('div', { class: 'color-row' }, picker, hex));
}

function action(iconName: IconName, label: string, fn: () => void): HTMLButtonElement {
  const b = iconButton(iconName, label);
  b.addEventListener('click', fn);
  return b;
}

function bind(form: HTMLElement, name: string, fn: (value: string, el: HTMLInputElement) => void, event = 'input'): void {
  form.querySelector<HTMLInputElement>(`[name="${name}"]`)?.addEventListener(event, (e) => fn((e.target as HTMLInputElement).value, e.target as HTMLInputElement));
}

function selectionFields(editor: Editor, info: SelectionInfo): HTMLElement[] {
  const key = (p: string) => `${p}:${info.ids.join(',')}`;
  const multi = info.type === 'selection';
  const box = h('div', { class: 'grid2' }, num('X', 'x'), num('Y', 'y'), num('Ancho', 'width', { min: 1 }), num('Alto', 'height', { min: 1 }), num('Giro (°)', 'angle', { min: -360, max: 360 }), num('Opacidad (%)', 'opacity', { min: 0, max: 100 }));
  const keep = h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'ratio', checked: true }), 'Mantener proporción');
  const parts: HTMLElement[] = [];
  if (!multi) {
    const name = h('label', {}, 'Nombre', h('input', { type: 'text', name: 'name', maxlength: 200 }));
    name.querySelector('input')?.addEventListener('change', (e) => editor.rename(info.ids[0] ?? '', (e.target as HTMLInputElement).value));
    parts.push(name);
  }
  parts.push(box, keep);
  bind(box, 'x', (v) => editor.setProps({ left: Number(v) }, key('x')));
  bind(box, 'y', (v) => editor.setProps({ top: Number(v) }, key('y')));
  bind(box, 'angle', (v) => editor.setProps({ angle: Number(v) }, key('angle')));
  bind(box, 'opacity', (v) => editor.setProps({ opacity: Math.min(100, Math.max(0, Number(v))) / 100 }, key('opacity')));
  const ratio = () => (keep.querySelector('input') as HTMLInputElement).checked;
  bind(box, 'width', (v) => {
    const w = Number(v);
    const cur = editor.inspect();
    if (!cur || !(w > 0)) return;
    editor.setSize(w, ratio() ? (cur.height * w) / cur.width : cur.height, key('size'));
  });
  bind(box, 'height', (v) => {
    const hgt = Number(v);
    const cur = editor.inspect();
    if (!cur || !(hgt > 0)) return;
    editor.setSize(ratio() ? (cur.width * hgt) / cur.height : cur.width, hgt, key('size'));
  });

  const shape = ['rect', 'ellipse', 'triangle', 'path', 'line'].includes(info.type);
  if (info.text) {
    const t = h('div', { class: 'inspector' },
      h('label', {}, 'Texto', h('textarea', { name: 'text', rows: 3 })),
      h('div', { class: 'grid2' },
        h('label', {}, 'Tipografía', h('select', { name: 'fontFamily' }, ...FONTS.map((f) => h('option', { value: f }, f)))),
        num('Tamaño', 'fontSize', { min: 4, max: 400 })),
      h('div', { class: 'grid2' },
        h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'bold' }), 'Negrita'),
        h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'italic' }), 'Cursiva')),
      h('label', {}, 'Alineación', h('select', { name: 'textAlign' },
        h('option', { value: 'left' }, 'Izquierda'), h('option', { value: 'center' }, 'Centro'), h('option', { value: 'right' }, 'Derecha'))),
      colour('Color del texto', 'fill', (c) => editor.setProps({ fill: c }, key('fill'))));
    t.querySelector('textarea')?.addEventListener('input', (e) => editor.setProps({ text: (e.target as HTMLTextAreaElement).value }, key('text')));
    bind(t, 'fontFamily', (v) => editor.setProps({ fontFamily: v }), 'change');
    bind(t, 'fontSize', (v) => Number(v) > 0 && editor.setProps({ fontSize: Number(v) }, key('fontSize')));
    bind(t, 'bold', (_v, el) => editor.setProps({ fontWeight: el.checked ? 'bold' : 'normal' }), 'change');
    bind(t, 'italic', (_v, el) => editor.setProps({ fontStyle: el.checked ? 'italic' : 'normal' }), 'change');
    bind(t, 'textAlign', (v) => editor.setProps({ textAlign: v }), 'change');
    parts.push(t);
  } else if (shape) {
    const s = h('div', { class: 'inspector' });
    if (info.type !== 'line' && info.type !== 'path') s.append(colour('Relleno', 'fill', (c) => editor.setProps({ fill: c }, key('fill'))));
    s.append(colour('Trazo', 'stroke', (c) => editor.setProps({ stroke: c }, key('stroke'))), num('Grosor del trazo', 'strokeWidth', { min: 0, max: 100 }));
    bind(s, 'strokeWidth', (v) => Number(v) >= 0 && editor.setProps({ strokeWidth: Number(v) }, key('strokeWidth')));
    parts.push(s);
  }

  const align = (edge: AlignEdge, iconName: IconName, label: string) => action(iconName, label, () => editor.align(edge));
  parts.push(
    h('div', { class: 'actions', role: 'group', 'aria-label': multi ? 'Alinear la selección' : 'Alinear con el lienzo' },
      align('left', 'alignHorizontalJustifyStart', 'Alinear a la izquierda'),
      align('center', 'alignHorizontalJustifyCenter', 'Centrar en horizontal'),
      align('right', 'alignHorizontalJustifyEnd', 'Alinear a la derecha'),
      align('top', 'alignVerticalJustifyStart', 'Alinear arriba'),
      align('middle', 'alignVerticalJustifyCenter', 'Centrar en vertical'),
      align('bottom', 'alignVerticalJustifyEnd', 'Alinear abajo')),
    h('div', { class: 'actions', role: 'group', 'aria-label': 'Orden y transformación' },
      action('chevronsUp', 'Traer al frente', () => editor.order('front')),
      action('arrowUp', 'Subir una capa', () => editor.order('forward')),
      action('arrowDown', 'Bajar una capa', () => editor.order('backward')),
      action('chevronsDown', 'Enviar al fondo', () => editor.order('back')),
      action('flipHorizontal2', 'Voltear en horizontal', () => editor.flip('x')),
      action('flipVertical2', 'Voltear en vertical', () => editor.flip('y'))),
    h('div', { class: 'actions', role: 'group', 'aria-label': 'Objeto' },
      action('copy', 'Duplicar (Ctrl+D)', () => void editor.duplicate()),
      ...(multi ? [action('group', 'Agrupar', () => editor.group())] : []),
      ...(info.type === 'group' ? [action('ungroup', 'Desagrupar', () => editor.ungroup())] : []),
      action('trash2', 'Borrar (Supr)', () => editor.removeSelected())),
  );
  return parts;
}

function canvasFields(editor: Editor, actions: InspectorActions): HTMLElement[] {
  const size = h('div', { class: 'grid2' }, num('Ancho del lienzo', 'cw', { min: 16, max: 8192 }), num('Alto del lienzo', 'ch', { min: 16, max: 8192 }));
  const apply = h('button', { type: 'button', class: 'btn' }, 'Cambiar tamaño');
  apply.addEventListener('click', () => {
    const form = byId<HTMLFormElement>('inspector');
    const w = Number((form.elements.namedItem('cw') as HTMLInputElement).value);
    const hgt = Number((form.elements.namedItem('ch') as HTMLInputElement).value);
    if (w >= 16 && w <= 8192 && hgt >= 16 && hgt <= 8192) actions.resizeCanvas(Math.round(w), Math.round(hgt));
  });
  const bg = editor.currentBackground;
  const transparent = h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'bgTransparent', checked: bg.kind === 'transparent' }), 'Fondo transparente');
  const color = colour('Color de fondo', 'bg', (c) => actions.setBackground(c));
  const picker = color.querySelector<HTMLInputElement>('input[type="color"]');
  const hex = color.querySelector<HTMLInputElement>('input[type="text"]');
  if (picker && hex) picker.value = hex.value = bg.kind === 'color' ? bg.color : '#ffffff';
  transparent.querySelector('input')?.addEventListener('change', (e) => {
    actions.setBackground((e.target as HTMLInputElement).checked ? null : (picker?.value ?? '#ffffff'));
  });
  const grid = h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'grid', checked: actions.gridOn() }), 'Mostrar rejilla');
  grid.querySelector('input')?.addEventListener('change', (e) => actions.toggleGrid((e.target as HTMLInputElement).checked));
  return [
    h('p', { class: 'muted' }, 'Nada seleccionado. Ajustes del lienzo:'),
    size,
    apply,
    transparent,
    color,
    grid,
    h('p', { class: 'muted' }, bg.kind === 'image' ? 'El fondo es una imagen de la biblioteca.' : ''),
  ];
}
