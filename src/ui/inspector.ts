// Contextual inspector: shows only what makes sense for the selection (or the canvas when
// nothing is selected). Rebuilt when the selection changes; otherwise only values are synced,
// so typing in a field never loses focus.
import type { AlignEdge, Editor, SelectionInfo } from '../canvas/editor';
import { NO_ADJUSTMENTS, NO_CROP, type ImageAdjustments, type ImageCrop } from '../canvas/image';
import { HEX_COLOR } from '../project/schema';
import { byId, h, iconButton } from './dom';
import type { IconName } from './icons';

const FONTS = ['Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New', 'Trebuchet MS', 'Comic Sans MS'];
/** One-tap colours; any other colour comes from the browser's picker or the HEX field. */
const PALETTE: [string, string][] = [
  ['#1f2937', 'Negro'], ['#ffffff', 'Blanco'], ['#f28c28', 'Naranja'], ['#e11d48', 'Rojo'],
  ['#f5c518', 'Amarillo'], ['#16a34a', 'Verde'], ['#2563eb', 'Azul'], ['#7c3aed', 'Morado'],
];
const TRANSPARENT = 'transparent';
const WIDTHS: [number, string][] = [[0, 'Ninguno'], [2, 'Fino'], [4, 'Medio'], [8, 'Grueso'], [12, 'Muy grueso']];
// The «Posición, tamaño y alineación» section stays as the user left it across selections.
let placementOpen = false;

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
        strokeWidth: String(info.strokeWidth ?? 0),
        text: info.text?.text ?? '', fontFamily: info.text?.fontFamily ?? '', fontSize: String(info.text?.fontSize ?? ''), textAlign: info.text?.textAlign ?? '',
      }
    : { cw: String(editor.size.width), ch: String(editor.size.height) };
  for (const [name, value] of Object.entries(values)) {
    const el = form.elements.namedItem(name);
    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      if (el !== document.activeElement && el.type !== 'checkbox') el.value = el.type === 'color' && !HEX_COLOR.test(value) ? '#000000' : value;
    }
  }
  if (info) {
    for (const group of form.querySelectorAll<HTMLElement>('[data-colour]')) syncColour(group, (group.dataset.colour === 'stroke' ? info.stroke : info.fill) ?? '');
    for (const b of form.querySelectorAll<HTMLButtonElement>('[data-width]')) b.setAttribute('aria-pressed', String(Number(b.dataset.width) === Math.round(info.strokeWidth ?? -1)));
    const out = form.querySelector('[data-output="opacity"]');
    if (out) out.textContent = `${Math.round(info.opacity * 100)} %`;
  }
  if (info?.image) {
    const { adjustments: a, crop: c } = info.image;
    const set = (name: string, v: number | boolean) => {
      const el = form.elements.namedItem(name);
      if (!(el instanceof HTMLInputElement) || el === document.activeElement) return;
      if (el.type === 'checkbox') el.checked = v as boolean;
      else el.value = String(v);
    };
    for (const k of ['grayscale', 'sepia', 'invert'] as const) set(k, a[k]);
    for (const k of ['brightness', 'contrast', 'saturation', 'blur'] as const) {
      set(k, a[k]);
      const out = form.querySelector(`[data-output="${k}"]`);
      if (out) out.textContent = String(a[k]);
    }
    for (const k of ['left', 'top', 'right', 'bottom'] as const) set(`crop-${k}`, c[k]);
  }
  if (info?.text) {
    const pressed = (sel: string, on: boolean) => form.querySelector(sel)?.setAttribute('aria-pressed', String(on));
    pressed('[data-toggle="bold"]', info.text.bold);
    pressed('[data-toggle="italic"]', info.text.italic);
    for (const align of ['left', 'center', 'right']) pressed(`[data-align="${align}"]`, info.text.textAlign === align);
  }
}

function num(label: string, name: string, attrs: Record<string, string | number> = {}): HTMLLabelElement {
  return h('label', {}, label, h('input', { type: 'number', name, inputmode: 'decimal', step: 1, ...attrs }));
}

/**
 * A colour: preset swatches (plus «Transparente» where it makes sense), the browser's own picker
 * for any other colour and an accessible HEX field. The current colour is always marked.
 */
function colour(label: string, name: string, onChange: (value: string) => void, opts: { transparent?: boolean } = {}): HTMLDivElement {
  const group = h('div', { class: 'colour', role: 'group', 'aria-label': label, 'data-colour': name });
  const swatches = h('div', { class: 'swatches' });
  const pick = (value: string) => {
    onChange(value);
    syncColour(group, value);
  };
  const swatch = (value: string, text: string) => {
    const b = h('button', { type: 'button', class: `swatch${value === TRANSPARENT ? ' none' : ''}`, 'data-value': value, 'aria-label': text, title: text, 'aria-pressed': 'false' });
    if (value !== TRANSPARENT) b.style.background = value;
    b.addEventListener('click', () => pick(value));
    return b;
  };
  if (opts.transparent) swatches.append(swatch(TRANSPARENT, 'Transparente'));
  swatches.append(...PALETTE.map(([value, text]) => swatch(value, text)));
  const picker = h('input', { type: 'color', name, class: 'swatch picker', 'aria-label': `${label} (selector)`, title: 'Otro color' });
  picker.addEventListener('input', () => pick(picker.value));
  swatches.append(picker);
  const hex = h('input', { type: 'text', name: `${name}Hex`, 'aria-label': `${label} (hexadecimal)`, maxlength: 7, spellcheck: 'false', pattern: '#[0-9a-fA-F]{6}' });
  hex.addEventListener('change', () => {
    const v = hex.value.trim().startsWith('#') ? hex.value.trim() : `#${hex.value.trim()}`;
    if (HEX_COLOR.test(v)) pick(v.toLowerCase());
  });
  group.append(h('span', { class: 'field-title' }, label), swatches, hex);
  return group;
}

/** Marks the current colour: its swatch, or the picker when it is not a preset. */
function syncColour(group: HTMLElement, value: string): void {
  const v = value.toLowerCase();
  const none = !v || v === TRANSPARENT;
  let preset = false;
  for (const b of group.querySelectorAll<HTMLButtonElement>('.swatch[data-value]')) {
    const on = b.dataset.value === (none ? TRANSPARENT : v);
    preset ||= on;
    b.setAttribute('aria-pressed', String(on));
  }
  const picker = group.querySelector<HTMLInputElement>('input[type="color"]');
  const hex = group.querySelector<HTMLInputElement>('input[type="text"]');
  if (picker) {
    if (HEX_COLOR.test(v)) picker.value = v;
    picker.classList.toggle('current', !preset && HEX_COLOR.test(v));
  }
  if (hex && hex !== document.activeElement) {
    hex.value = HEX_COLOR.test(v) ? v : '';
    hex.placeholder = none ? 'Transparente' : '';
  }
}

/** Stroke width as drawn lines; the exact value stays one field away. */
function strokeWidths(onChange: (width: number) => void): HTMLDivElement {
  const chips = h('div', { class: 'widths' });
  for (const [width, text] of WIDTHS) {
    const line = h('span', { class: 'width-line' });
    if (width) line.style.blockSize = `${Math.max(1, width / 1.5)}px`;
    else line.classList.add('none');
    const b = h('button', { type: 'button', class: 'width', 'data-width': width, 'aria-pressed': 'false', 'aria-label': `${text} (${width} px)`, title: `${text} (${width} px)` }, line, h('span', { 'aria-hidden': 'true' }, text));
    b.addEventListener('click', () => onChange(width));
    chips.append(b);
  }
  const exact = num('Grosor exacto (px)', 'strokeWidth', { min: 0, max: 100 });
  return h('div', { class: 'stroke-width', role: 'group', 'aria-label': 'Grosor del trazo' }, h('span', { class: 'field-title' }, 'Grosor del trazo'), chips, exact);
}

/** A labelled slider with its value next to the label. */
function slider(label: string, name: string, min: number, max: number, unit = ''): HTMLDivElement {
  const input = h('input', { type: 'range', name, id: `in-${name}`, min, max, step: 1 });
  const out = h('output', { for: `in-${name}`, 'data-output': name, class: 'muted' });
  input.addEventListener('input', () => (out.textContent = `${input.value}${unit}`));
  return h('div', { class: 'slider' }, h('div', { class: 'slider-head' }, h('label', { for: `in-${name}` }, label), out), input);
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
  const parts: HTMLElement[] = [];
  if (!multi) {
    const name = h('label', {}, 'Nombre', h('input', { type: 'text', name: 'name', maxlength: 200 }));
    name.querySelector('input')?.addEventListener('change', (e) => editor.rename(info.ids[0] ?? '', (e.target as HTMLInputElement).value));
    parts.push(name);
  }

  // What is changed most comes first: content and colours; position and size are folded away.
  const shape = ['rect', 'ellipse', 'triangle', 'path', 'line'].includes(info.type);
  if (info.text) parts.push(textFields(editor, key));
  else if (shape) {
    if (info.type !== 'line' && (info.type !== 'path' || info.fill)) parts.push(colour('Relleno', 'fill', (c) => editor.setProps({ fill: c }, key('fill')), { transparent: true }));
    parts.push(colour('Trazo', 'stroke', (c) => editor.setProps({ stroke: c }, key('stroke')), { transparent: info.type !== 'line' }));
    const widths = strokeWidths((w) => editor.setProps({ strokeWidth: w }, key('strokeWidth')));
    bind(widths, 'strokeWidth', (v) => Number(v) >= 0 && editor.setProps({ strokeWidth: Number(v) }, key('strokeWidth')));
    parts.push(widths);
  }
  if (info.image) parts.push(imageFields(editor, key));

  const opacity = slider('Opacidad (%)', 'opacity', 0, 100, ' %');
  bind(opacity, 'opacity', (v) => editor.setProps({ opacity: Math.min(100, Math.max(0, Number(v))) / 100 }, key('opacity')));
  parts.push(opacity);

  parts.push(h('div', { class: 'actions', role: 'group', 'aria-label': 'Objeto' },
    action('copy', 'Duplicar (Ctrl+D)', () => void editor.duplicate()),
    action('flipHorizontal2', 'Voltear en horizontal', () => editor.flip('x')),
    action('flipVertical2', 'Voltear en vertical', () => editor.flip('y')),
    action('chevronsUp', 'Traer al frente', () => editor.order('front')),
    action('chevronsDown', 'Enviar al fondo', () => editor.order('back')),
    ...(multi ? [action('group', 'Agrupar', () => editor.group())] : []),
    ...(info.type === 'group' ? [action('ungroup', 'Desagrupar', () => editor.ungroup())] : []),
    action('trash2', 'Borrar (Supr)', () => editor.removeSelected())));

  const box = h('div', { class: 'grid2' }, num('X', 'x'), num('Y', 'y'), num('Ancho', 'width', { min: 1 }), num('Alto', 'height', { min: 1 }), num('Giro (°)', 'angle', { min: -360, max: 360 }));
  const keep = h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'ratio', checked: true }), 'Mantener proporción');
  box.append(keep);
  bind(box, 'x', (v) => editor.setProps({ left: Number(v) }, key('x')));
  bind(box, 'y', (v) => editor.setProps({ top: Number(v) }, key('y')));
  bind(box, 'angle', (v) => editor.setProps({ angle: Number(v) }, key('angle')));
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
  const align = (edge: AlignEdge, iconName: IconName, label: string) => action(iconName, label, () => editor.align(edge));
  const placement = h('details', { class: 'placement', open: placementOpen },
    h('summary', {}, 'Posición, tamaño y alineación'),
    box,
    h('div', { class: 'actions', role: 'group', 'aria-label': multi ? 'Alinear la selección' : 'Alinear con el lienzo' },
      align('left', 'alignHorizontalJustifyStart', 'Alinear a la izquierda'),
      align('center', 'alignHorizontalJustifyCenter', 'Centrar en horizontal'),
      align('right', 'alignHorizontalJustifyEnd', 'Alinear a la derecha'),
      align('top', 'alignVerticalJustifyStart', 'Alinear arriba'),
      align('middle', 'alignVerticalJustifyCenter', 'Centrar en vertical'),
      align('bottom', 'alignVerticalJustifyEnd', 'Alinear abajo')),
    h('div', { class: 'actions', role: 'group', 'aria-label': 'Orden' },
      action('arrowUp', 'Subir una capa', () => editor.order('forward')),
      action('arrowDown', 'Bajar una capa', () => editor.order('backward'))));
  placement.addEventListener('toggle', () => (placementOpen = placement.open));
  parts.push(placement);
  return parts;
}

function textFields(editor: Editor, key: (p: string) => string): HTMLElement {
  const size = h('input', { type: 'number', name: 'fontSize', min: 4, max: 400, step: 1, inputmode: 'numeric', 'aria-label': 'Tamaño' });
  const step = (delta: number) => {
    const next = Math.min(400, Math.max(4, Math.round((Number(size.value) || 0) + delta)));
    size.value = String(next);
    editor.setProps({ fontSize: next }, key('fontSize'));
  };
  const minus = action('minus', 'Letra más pequeña', () => step(-4));
  const plus = action('plus', 'Letra más grande', () => step(4));
  const toggle = (name: 'bold' | 'italic', iconName: IconName, label: string, set: (on: boolean) => Record<string, string>) => {
    const b = action(iconName, label, () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      b.setAttribute('aria-pressed', String(on));
      editor.setProps(set(on));
    });
    b.dataset.toggle = name;
    b.setAttribute('aria-pressed', 'false');
    return b;
  };
  const alignBtn = (value: string, iconName: IconName, label: string) => {
    const b = action(iconName, label, () => editor.setProps({ textAlign: value }));
    b.dataset.align = value;
    b.setAttribute('aria-pressed', 'false');
    return b;
  };
  const t = h('div', { class: 'inspector' },
    h('label', {}, 'Texto', h('textarea', { name: 'text', rows: 2 })),
    h('div', { class: 'font-row' },
      h('label', {}, 'Tipografía', h('select', { name: 'fontFamily' }, ...FONTS.map((f) => h('option', { value: f }, f)))),
      h('div', { class: 'stepper', role: 'group', 'aria-label': 'Tamaño de la letra' }, minus, size, plus)),
    h('div', { class: 'toggles' },
      h('div', { class: 'segmented', role: 'group', 'aria-label': 'Estilo' },
        toggle('bold', 'bold', 'Negrita', (on) => ({ fontWeight: on ? 'bold' : 'normal' })),
        toggle('italic', 'italic', 'Cursiva', (on) => ({ fontStyle: on ? 'italic' : 'normal' }))),
      h('div', { class: 'segmented', role: 'group', 'aria-label': 'Alineación' },
        alignBtn('left', 'textAlignStart', 'Alinear el texto a la izquierda'),
        alignBtn('center', 'textAlignCenter', 'Centrar el texto'),
        alignBtn('right', 'textAlignEnd', 'Alinear el texto a la derecha'))),
    colour('Color del texto', 'fill', (c) => editor.setProps({ fill: c }, key('fill'))));
  t.querySelector('textarea')?.addEventListener('input', (e) => editor.setProps({ text: (e.target as HTMLTextAreaElement).value }, key('text')));
  bind(t, 'fontFamily', (v) => editor.setProps({ fontFamily: v }), 'change');
  bind(t, 'fontSize', (v) => Number(v) > 0 && editor.setProps({ fontSize: Number(v) }, key('fontSize')));
  return t;
}

/** Crop (percent per side) and adjustments for an image. Every control has a visible label. */
function imageFields(editor: Editor, key: (p: string) => string): HTMLElement {
  const read = (form: HTMLElement): { a: ImageAdjustments; c: ImageCrop } => {
    const v = (name: string) => Number((form.querySelector<HTMLInputElement>(`[name="${name}"]`) as HTMLInputElement).value) || 0;
    const on = (name: string) => (form.querySelector<HTMLInputElement>(`[name="${name}"]`) as HTMLInputElement).checked;
    return {
      a: { grayscale: on('grayscale'), sepia: on('sepia'), invert: on('invert'), brightness: v('brightness'), contrast: v('contrast'), saturation: v('saturation'), blur: v('blur') },
      c: { left: v('crop-left'), top: v('crop-top'), right: v('crop-right'), bottom: v('crop-bottom') },
    };
  };
  const box = h('fieldset', { class: 'inspector image-tools' },
    h('legend', {}, 'Imagen'),
    h('div', { class: 'filters' },
      h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'grayscale' }), 'Escala de grises'),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'sepia' }), 'Sepia'),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'invert' }), 'Negativo')),
    slider('Brillo', 'brightness', -100, 100),
    slider('Contraste', 'contrast', -100, 100),
    slider('Saturación', 'saturation', -100, 100),
    slider('Desenfoque', 'blur', 0, 100),
    h('details', { class: 'placement' },
      h('summary', {}, 'Recortar (% de cada lado)'),
      h('div', { class: 'grid2' }, num('Izquierda', 'crop-left', { min: 0, max: 95 }), num('Derecha', 'crop-right', { min: 0, max: 95 }), num('Arriba', 'crop-top', { min: 0, max: 95 }), num('Abajo', 'crop-bottom', { min: 0, max: 95 }))));
  const reset = h('button', { type: 'button', class: 'btn' }, 'Quitar recorte y ajustes');
  reset.addEventListener('click', () => {
    editor.setImageAdjustments({ ...NO_ADJUSTMENTS });
    editor.setImageCrop({ ...NO_CROP });
  });
  box.append(reset);
  box.addEventListener('input', (e) => {
    const name = (e.target as HTMLInputElement).name;
    const { a, c } = read(box);
    if (name.startsWith('crop-')) editor.setImageCrop(c, key('crop'));
    else editor.setImageAdjustments(a, key(`adjust-${name}`));
  });
  return box;
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
  // «Transparente» is a swatch like the colours: no separate checkbox.
  const color = colour('Color de fondo', 'bg', (c) => actions.setBackground(c === TRANSPARENT ? null : c), { transparent: true });
  syncColour(color, bg.kind === 'color' ? bg.color : bg.kind === 'transparent' ? TRANSPARENT : 'image'); // an image: no swatch marked
  const grid = h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'grid', checked: actions.gridOn() }), 'Mostrar rejilla');
  grid.querySelector('input')?.addEventListener('change', (e) => actions.toggleGrid((e.target as HTMLInputElement).checked));
  return [
    h('p', { class: 'muted' }, 'Nada seleccionado. Ajustes del lienzo:'),
    size,
    apply,
    color,
    grid,
    h('p', { class: 'muted' }, bg.kind === 'image' ? 'El fondo es una imagen de la biblioteca.' : ''),
  ];
}
