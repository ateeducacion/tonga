// Contextual inspector: shows only what makes sense for the selection (or the canvas when
// nothing is selected). Rebuilt when the selection changes; otherwise only values are synced,
// so typing in a field never loses focus.
import { DEFAULT_SHADOW, GRID_SIZE, type AlignEdge, type Editor, type GradientDirection, type LineStyle, type SelectionInfo, type ShadowStyle } from '../canvas/editor';
import { CLASSROOM_FONTS, SYSTEM_FONTS } from '../canvas/fonts';
import { NO_ADJUSTMENTS, NO_CROP, type ImageAdjustments, type ImageCrop } from '../canvas/image';
import { HEX_COLOR } from '../project/schema';
import { putAsset } from '../persistence/store';
import { announce, byId, h, iconButton, toast } from './dom';
import { icon, type IconName } from './icons';

/** One-tap colours; any other colour comes from the browser's picker or the HEX field. */
const PALETTE: [string, string][] = [
  ['#1f2937', 'Negro'], ['#ffffff', 'Blanco'], ['#f28c28', 'Naranja'], ['#e11d48', 'Rojo'],
  ['#f5c518', 'Amarillo'], ['#16a34a', 'Verde'], ['#2563eb', 'Azul'], ['#7c3aed', 'Morado'],
];
const TRANSPARENT = 'transparent';
const WIDTHS: [number, string][] = [[0, 'Ninguno'], [2, 'Fino'], [4, 'Medio'], [8, 'Grueso'], [12, 'Muy grueso']];
const PENCIL_WIDTHS: [number, string][] = [[2, 'Fino'], [4, 'Medio'], [8, 'Grueso'], [16, 'Muy grueso']];
// The «Posición, tamaño y alineación» section stays as the user left it across selections.
let placementOpen = false;
let shadowOpen = false;

export interface InspectorActions {
  resizeCanvas(width: number, height: number): void;
  setBackground(color: string | null): void;
}

let signature = '';

export function renderInspector(editor: Editor, actions: InspectorActions, force = false): void {
  const form = byId<HTMLFormElement>('inspector');
  const info = editor.inspect();
  if (editor.isCropping) {
    if (signature !== 'crop') form.replaceChildren(...cropFields(editor));
    signature = 'crop';
    return;
  }
  const pencil = !info && editor.isDrawing;
  const sig = info ? `${info.type}:${info.ids.join(',')}` : pencil ? 'pencil' : `canvas:${editor.size.width}x${editor.size.height}:${JSON.stringify(editor.currentBackground)}`;
  if (sig === signature && !force) {
    syncValues(form, info, editor);
    return;
  }
  signature = sig;
  form.replaceChildren(...(info ? selectionFields(editor, info) : pencil ? pencilFields(editor) : canvasFields(editor, actions)));
  syncValues(form, info, editor);
}

function cropFields(editor: Editor): HTMLElement[] {
  const apply = h('button', { type: 'button', class: 'btn primary' }, 'Aplicar el recorte');
  apply.addEventListener('click', () => editor.finishCrop(true));
  const cancel = h('button', { type: 'button', class: 'btn' }, 'Cancelar');
  cancel.addEventListener('click', () => editor.finishCrop(false));
  return [
    h('p', { class: 'muted' }, 'Recortar: ajusta el marco azul con sus tiradores y pulsa «Aplicar el recorte». Escape o «Cancelar» dejan la imagen como estaba.'),
    h('div', { class: 'dialog-actions' }, apply, cancel),
  ];
}

/** While the pencil is on, the inspector holds its colour, width and mode for the next strokes. */
function pencilFields(editor: Editor): HTMLElement[] {
  const color = colour('Color del lápiz', 'pencil', (c) => editor.setPencil({ color: c }));
  const widths = strokeWidths((w) => editor.setPencil({ width: w }), { widths: PENCIL_WIDTHS, name: 'pencilWidth', title: 'Grosor del lápiz', min: 1 });
  bind(widths, 'pencilWidth', (v) => Number(v) >= 1 && editor.setPencil({ width: Number(v) }));
  const mode = (straight: boolean, text: string) => {
    const b = h('button', { type: 'button', class: 'btn', 'data-straight': String(straight), 'aria-pressed': 'false' }, text);
    b.addEventListener('click', () => editor.setPencil({ straight }));
    return b;
  };
  return [
    h('p', { class: 'muted' }, 'Lápiz: elige cómo dibujar y traza sobre el lienzo.'),
    color,
    widths,
    h('div', { class: 'segmented', role: 'group', 'aria-label': 'Modo del lápiz' }, mode(false, 'Mano alzada'), mode(true, 'Recta')),
    h('p', { class: 'muted' }, 'En «Recta», mantén Mayús para trazar en ángulos de 45°.'),
  ];
}

function syncValues(form: HTMLFormElement, info: SelectionInfo | null, editor: Editor): void {
  const values: Record<string, string> = info
    ? {
        name: info.name, x: String(info.x), y: String(info.y), width: String(info.width), height: String(info.height),
        angle: String(info.angle), opacity: String(Math.round(info.opacity * 100)),
        strokeWidth: String(info.strokeWidth ?? 0),
        qrtext: info.qr?.text ?? '',
        text: info.text?.text ?? '', fontFamily: info.text?.fontFamily ?? '', fontSize: String(info.text?.fontSize ?? ''), textAlign: info.text?.textAlign ?? '',
      }
    : { cw: String(editor.size.width), ch: String(editor.size.height), pencilWidth: String(editor.pencil.width) };
  if (!info && editor.isDrawing) {
    const p = editor.pencil;
    for (const group of form.querySelectorAll<HTMLElement>('[data-colour="pencil"]')) syncColour(group, p.color);
    for (const b of form.querySelectorAll<HTMLButtonElement>('[data-width]')) b.setAttribute('aria-pressed', String(Number(b.dataset.width) === p.width));
    for (const b of form.querySelectorAll<HTMLButtonElement>('[data-straight]')) b.setAttribute('aria-pressed', String(b.dataset.straight === String(p.straight)));
  }
  for (const [name, value] of Object.entries(values)) {
    const el = form.elements.namedItem(name);
    if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement || el instanceof HTMLTextAreaElement) {
      if (el !== document.activeElement && el.type !== 'checkbox') el.value = el.type === 'color' && !HEX_COLOR.test(value) ? '#000000' : value;
    }
  }
  if (info) {
    const colours: Record<string, string | null> = { stroke: info.stroke, fill: info.fill, shadow: (info.shadow ?? DEFAULT_SHADOW).color, gradientTo: info.gradient?.to ?? null,
      qrColor: info.qr?.color ?? null, qrBackground: info.qr?.background ?? null };
    const gradientOn = form.elements.namedItem('gradientOn');
    if (gradientOn instanceof HTMLInputElement) gradientOn.checked = !!info.gradient;
    for (const el of form.querySelectorAll<HTMLElement>('[data-gradient]')) el.hidden = !info.gradient;
    for (const b of form.querySelectorAll<HTMLButtonElement>('[data-direction]')) b.setAttribute('aria-pressed', String(b.dataset.direction === info.gradient?.direction));
    for (const group of form.querySelectorAll<HTMLElement>('[data-colour]')) syncColour(group, colours[group.dataset.colour ?? ''] ?? '');
    const shadow = info.shadow ?? DEFAULT_SHADOW;
    const on = form.elements.namedItem('shadowOn');
    if (on instanceof HTMLInputElement) on.checked = !!info.shadow;
    for (const [name, v] of [['shadowBlur', shadow.blur], ['shadowX', shadow.offsetX], ['shadowY', shadow.offsetY]] as const) {
      const el = form.elements.namedItem(name);
      if (el instanceof HTMLInputElement && el !== document.activeElement) el.value = String(v);
      const out = form.querySelector(`[data-output="${name}"]`);
      if (out) out.textContent = String(v);
    }
    for (const b of form.querySelectorAll<HTMLButtonElement>('[data-width]')) b.setAttribute('aria-pressed', String(Number(b.dataset.width) === Math.round(info.strokeWidth ?? -1)));
    for (const b of form.querySelectorAll<HTMLButtonElement>('[data-line]')) b.setAttribute('aria-pressed', String(b.dataset.line === info.lineStyle));
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
    for (const k of ['grayscale', 'sepia', 'invert', 'vintage'] as const) set(k, a[k]);
    for (const k of ['brightness', 'contrast', 'saturation', 'blur', 'pixelate', 'noise'] as const) {
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
    pressed('[data-toggle="underline"]', info.text.underline);
    for (const align of ['left', 'center', 'right']) pressed(`[data-align="${align}"]`, info.text.textAlign === align);
  }
}

function num(label: string, name: string, attrs: Record<string, string | number> = {}): HTMLLabelElement {
  return h('label', {}, label, h('input', { type: 'number', name, inputmode: 'decimal', step: 1, ...attrs }));
}

/** The last colour picked with the browser's picker, kept as a swatch to return to it. */
let customColour: string | null = null;

/** Light colours get a dark check mark, dark ones a white one. */
function isLight(hex: string): boolean {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0) > 0.6;
}

/**
 * A colour, as in most drawing apps: preset swatches (plus «Transparente» where it makes sense),
 * the last custom colour and the browser's own picker for any other. The current colour is
 * marked with a ring and a check mark, so it is not told by colour alone.
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
    if (value !== TRANSPARENT) {
      b.style.background = value;
      b.classList.toggle('light', isLight(value));
    }
    b.addEventListener('click', () => pick(value));
    return b;
  };
  if (opts.transparent) swatches.append(swatch(TRANSPARENT, 'Transparente'));
  swatches.append(...PALETTE.map(([value, text]) => swatch(value, text)));
  const custom = h('button', { type: 'button', class: 'swatch custom', 'aria-pressed': 'false', hidden: true });
  custom.addEventListener('click', () => customColour && pick(customColour));
  const picker = h('input', { type: 'color', name, class: 'swatch picker', 'aria-label': `${label}: otro color`, title: 'Otro color' });
  picker.addEventListener('input', () => {
    customColour = picker.value;
    pick(picker.value);
  });
  swatches.append(custom, picker);
  group.append(h('span', { class: 'field-title' }, label), swatches);
  return group;
}

/** Marks the current colour: its preset swatch, or the custom one. */
function syncColour(group: HTMLElement, value: string): void {
  const v = value.toLowerCase();
  const current = !v || v === TRANSPARENT ? TRANSPARENT : v;
  let preset = false;
  for (const b of group.querySelectorAll<HTMLButtonElement>('.swatch[data-value]')) {
    const on = b.dataset.value === current;
    preset ||= on;
    b.setAttribute('aria-pressed', String(on));
  }
  if (!preset && HEX_COLOR.test(v)) customColour = v;
  const custom = group.querySelector<HTMLButtonElement>('.swatch.custom');
  if (custom) {
    custom.hidden = !customColour;
    if (customColour) {
      custom.style.background = customColour;
      custom.classList.toggle('light', isLight(customColour));
      custom.setAttribute('aria-label', `Color personalizado ${customColour}`);
      custom.title = `Color personalizado ${customColour}`;
    }
    custom.setAttribute('aria-pressed', String(!preset && customColour === v));
  }
  const picker = group.querySelector<HTMLInputElement>('input[type="color"]');
  if (picker && HEX_COLOR.test(v)) picker.value = v;
}

/** Stroke width as drawn lines; the exact value stays one field away. */
function strokeWidths(
  onChange: (width: number) => void,
  { widths = WIDTHS, name = 'strokeWidth', title = 'Grosor del trazo', min = 0 } = {},
): HTMLDivElement {
  const chips = h('div', { class: 'widths' });
  for (const [width, text] of widths) {
    const line = h('span', { class: 'width-line' });
    if (width) line.style.blockSize = `${Math.max(1, width / 1.5)}px`;
    else line.classList.add('none');
    const b = h('button', { type: 'button', class: 'width', 'data-width': width, 'aria-pressed': 'false', 'aria-label': `${text} (${width} px)`, title: `${text} (${width} px)` }, line, h('span', { 'aria-hidden': 'true' }, text));
    b.addEventListener('click', () => onChange(width));
    chips.append(b);
  }
  const exact = num('Grosor exacto (px)', name, { min, max: 100 });
  return h('div', { class: 'stroke-width', role: 'group', 'aria-label': title }, h('span', { class: 'field-title' }, title), chips, exact);
}

/** The fill colour, or a two-colour gradient whose first colour is the fill swatch. */
function fillFields(editor: Editor, key: (p: string) => string): HTMLElement[] {
  const gradient = () => editor.inspect()?.gradient ?? null;
  const fill = colour('Relleno', 'fill', (c) => {
    const g = gradient();
    if (g && c !== TRANSPARENT) editor.setGradient({ ...g, from: c });
    else editor.setProps({ fill: c }, key('fill'));
  }, { transparent: true });
  const on = h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'gradientOn' }), 'Degradado');
  bind(on, 'gradientOn', (_v, el) => {
    const from = editor.inspect()?.fill;
    editor.setGradient(el.checked ? { from: from && from !== TRANSPARENT ? from : '#f28c28', to: '#ffffff', direction: 'vertical' } : null);
  }, 'change');
  const directions: [GradientDirection, string][] = [['horizontal', 'Horizontal'], ['vertical', 'Vertical'], ['diagonal', 'Diagonal']];
  const options = h('div', { class: 'gradient-options', 'data-gradient': '' },
    colour('Segundo color', 'gradientTo', (c) => {
      const g = gradient();
      if (g) editor.setGradient({ ...g, to: c });
    }),
    h('div', { class: 'segmented', role: 'group', 'aria-label': 'Dirección del degradado' },
      ...directions.map(([direction, text]) => {
        const b = h('button', { type: 'button', class: 'btn', 'data-direction': direction, 'aria-pressed': 'false' }, text);
        b.addEventListener('click', () => {
          const g = gradient();
          if (g) editor.setGradient({ ...g, direction });
        });
        return b;
      })));
  return [fill, on, options];
}

/** Solid, dashed or dotted, each button drawing its own line. */
function lineStyles(editor: Editor): HTMLDivElement {
  const styles: [LineStyle, string, string][] = [['solid', 'Continua', 'Línea continua'], ['dashed', 'Guiones', 'Línea discontinua'], ['dotted', 'Puntos', 'Línea de puntos']];
  const buttons = styles.map(([style, text, label]) => {
    const line = h('span', { class: `line-sample ${style}`, 'aria-hidden': 'true' });
    const b = h('button', { type: 'button', class: 'width', 'data-line': style, 'aria-pressed': 'false', 'aria-label': label, title: label }, line, h('span', { 'aria-hidden': 'true' }, text));
    b.addEventListener('click', () => editor.setLineStyle(style));
    return b;
  });
  return h('div', { class: 'stroke-width', role: 'group', 'aria-label': 'Estilo de línea' }, h('span', { class: 'field-title' }, 'Estilo de línea'), h('div', { class: 'widths' }, ...buttons));
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
  if (multi) {
    // The plain way to join several objects: one visible button, not only an icon.
    const combine = h('button', { type: 'button', class: 'btn primary combine' }, icon('group'), `Combinar ${info.ids.length} objetos en una capa`);
    combine.addEventListener('click', () => {
      editor.group();
      announce(`${info.ids.length} objetos combinados en una capa`);
    });
    parts.push(combine);
  }
  if (!multi) {
    const name = h('label', {}, 'Nombre', h('input', { type: 'text', name: 'name', maxlength: 200 }));
    name.querySelector('input')?.addEventListener('change', (e) => editor.rename(info.ids[0] ?? '', (e.target as HTMLInputElement).value));
    parts.push(name);
  }

  // What is changed most comes first: content and colours; position and size are folded away.
  const shape = ['rect', 'ellipse', 'triangle', 'path', 'line'].includes(info.type);
  if (info.text) parts.push(textFields(editor, key));
  else if (shape) {
    if (info.type !== 'line' && (info.type !== 'path' || info.fill)) parts.push(...fillFields(editor, key));
    parts.push(colour('Trazo', 'stroke', (c) => editor.setProps({ stroke: c }, key('stroke')), { transparent: info.type !== 'line' }));
    const widths = strokeWidths((w) => editor.setProps({ strokeWidth: w }, key('strokeWidth')));
    bind(widths, 'strokeWidth', (v) => Number(v) >= 0 && editor.setProps({ strokeWidth: Number(v) }, key('strokeWidth')));
    parts.push(widths, lineStyles(editor));
  }
  if (info.image) parts.push(imageFields(editor, key));
  if (info.qr) parts.push(...qrFields(editor));
  if (info.connector) {
    const arrow = action('arrowRight', 'Punta de flecha', () => editor.setConnectorArrow(!editor.inspect()?.connector?.arrow));
    arrow.setAttribute('aria-pressed', String(info.connector.arrow));
    parts.push(h('div', { class: 'actions', role: 'group', 'aria-label': 'Conector' }, arrow));
  }
  if (shape && info.fill && info.type !== 'line') {
    const inside = h('button', { type: 'button', class: 'btn' }, 'Escribir dentro');
    inside.title = 'También con doble clic en la forma';
    inside.addEventListener('click', () => editor.writeInside());
    parts.push(inside);
  }
  if (multi && info.ids.length === 2) {
    parts.push(h('div', { class: 'actions', role: 'group', 'aria-label': 'Conectar los dos objetos' },
      action('workflow', 'Conectar con flecha', () => editor.connect(true)),
      action('minus', 'Conectar con línea', () => editor.connect(false))));
  }

  parts.push(shadowFields(editor, info, key));

  const opacity = slider('Opacidad (%)', 'opacity', 0, 100, ' %');
  bind(opacity, 'opacity', (v) => editor.setProps({ opacity: Math.min(100, Math.max(0, Number(v))) / 100 }, key('opacity')));
  parts.push(opacity);

  parts.push(h('div', { class: 'actions', role: 'group', 'aria-label': 'Objeto' },
    action('copy', 'Duplicar (Ctrl+D)', () => void editor.duplicate()),
    action('flipHorizontal2', 'Voltear en horizontal', () => editor.flip('x')),
    action('flipVertical2', 'Voltear en vertical', () => editor.flip('y')),
    action('chevronsUp', 'Traer al frente', () => editor.order('front')),
    action('chevronsDown', 'Enviar al fondo', () => editor.order('back')),
    ...(info.type === 'group' && !info.qr ? [action('ungroup', 'Desagrupar', () => editor.ungroup())] : []),
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
    ...(multi ? [h('div', { class: 'actions', role: 'group', 'aria-label': 'Distribuir (tres o más objetos)' },
      action('alignHorizontalDistributeCenter', 'Distribuir en horizontal', () => editor.distribute('x')),
      action('alignVerticalDistributeCenter', 'Distribuir en vertical', () => editor.distribute('y')))] : []),
    h('div', { class: 'actions', role: 'group', 'aria-label': 'Orden' },
      action('arrowUp', 'Subir una capa', () => editor.order('forward')),
      action('arrowDown', 'Bajar una capa', () => editor.order('backward'))));
  placement.addEventListener('toggle', () => (placementOpen = placement.open));
  parts.push(placement);
  return parts;
}

/** A QR code: what it encodes and its two colours. Each change draws the code again. */
function qrFields(editor: Editor): HTMLElement[] {
  const set = (changes: Parameters<Editor['setQr']>[0]) => {
    try {
      editor.setQr(changes);
    } catch (err) {
      toast((err as Error).message, 'error');
    }
  };
  const text = h('label', {}, 'Enlace o texto', h('input', { type: 'text', name: 'qrtext', inputmode: 'url', maxlength: 1000 }));
  bind(text, 'qrtext', (v) => set({ text: v }), 'change');
  return [
    text,
    colour('Color del código', 'qrColor', (c) => set({ color: c })),
    colour('Fondo del código', 'qrBackground', (c) => set({ background: c }), { transparent: true }),
  ];
}

/** A drop shadow: on/off, colour, blur and offset. Touching any control turns it on. */
function shadowFields(editor: Editor, info: SelectionInfo, key: (p: string) => string): HTMLElement {
  const on = h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'shadowOn' }), 'Sombra');
  const current = (): ShadowStyle => editor.inspect()?.shadow ?? { ...DEFAULT_SHADOW };
  const apply = (s: ShadowStyle | null) => editor.setShadow(s, key('shadow'));
  const color = colour('Color de la sombra', 'shadow', (c) => apply({ ...current(), color: c }));
  const box = h('details', { class: 'placement', open: shadowOpen || !!info.shadow },
    h('summary', {}, 'Sombra'),
    on,
    color,
    slider('Difuminado', 'shadowBlur', 0, 50),
    h('div', { class: 'grid2' }, slider('Horizontal', 'shadowX', -50, 50), slider('Vertical', 'shadowY', -50, 50)));
  box.addEventListener('toggle', () => (shadowOpen = box.open));
  bind(box, 'shadowOn', (_v, el) => apply(el.checked ? current() : null), 'change');
  const numeric = (name: string, prop: 'blur' | 'offsetX' | 'offsetY') => bind(box, name, (v) => apply({ ...current(), [prop]: Number(v) }));
  numeric('shadowBlur', 'blur');
  numeric('shadowX', 'offsetX');
  numeric('shadowY', 'offsetY');
  return box;
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
  const toggle = (name: 'bold' | 'italic' | 'underline', iconName: IconName, label: string, set: (on: boolean) => Record<string, string | boolean>) => {
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
      h('label', {}, 'Tipografía', h('select', { name: 'fontFamily' },
        h('optgroup', { label: 'Para el aula' }, ...CLASSROOM_FONTS.map((f) => h('option', { value: f.family }, f.family))),
        h('optgroup', { label: 'Del sistema' }, ...SYSTEM_FONTS.map((f) => h('option', { value: f }, f))))),
      h('div', { class: 'stepper', role: 'group', 'aria-label': 'Tamaño de la letra' }, minus, size, plus)),
    h('div', { class: 'toggles' },
      h('div', { class: 'segmented', role: 'group', 'aria-label': 'Estilo' },
        toggle('bold', 'bold', 'Negrita', (on) => ({ fontWeight: on ? 'bold' : 'normal' })),
        toggle('italic', 'italic', 'Cursiva', (on) => ({ fontStyle: on ? 'italic' : 'normal' })),
        toggle('underline', 'underline', 'Subrayado', (on) => ({ underline: on }))),
      h('div', { class: 'segmented', role: 'group', 'aria-label': 'Alineación' },
        alignBtn('left', 'textAlignStart', 'Alinear el texto a la izquierda'),
        alignBtn('center', 'textAlignCenter', 'Centrar el texto'),
        alignBtn('right', 'textAlignEnd', 'Alinear el texto a la derecha'))),
    colour('Color del texto', 'fill', (c) => editor.setProps({ fill: c }, key('fill'))));
  t.querySelector('textarea')?.addEventListener('input', (e) => editor.setProps({ text: (e.target as HTMLTextAreaElement).value }, key('text')));
  bind(t, 'fontFamily', (v) => void editor.setFont(v), 'change');
  bind(t, 'fontSize', (v) => Number(v) > 0 && editor.setProps({ fontSize: Number(v) }, key('fontSize')));
  return t;
}

/** Crop (percent per side) and adjustments for an image. Every control has a visible label. */
function imageFields(editor: Editor, key: (p: string) => string): HTMLElement {
  const read = (form: HTMLElement): { a: ImageAdjustments; c: ImageCrop } => {
    const v = (name: string) => Number((form.querySelector<HTMLInputElement>(`[name="${name}"]`) as HTMLInputElement).value) || 0;
    const on = (name: string) => (form.querySelector<HTMLInputElement>(`[name="${name}"]`) as HTMLInputElement).checked;
    return {
      a: { grayscale: on('grayscale'), sepia: on('sepia'), invert: on('invert'), brightness: v('brightness'), contrast: v('contrast'), saturation: v('saturation'), blur: v('blur'),
        vintage: on('vintage'), pixelate: v('pixelate'), noise: v('noise') },
      c: { left: v('crop-left'), top: v('crop-top'), right: v('crop-right'), bottom: v('crop-bottom') },
    };
  };
  const box = h('fieldset', { class: 'inspector image-tools' },
    h('legend', {}, 'Imagen'),
    h('div', { class: 'filters' },
      h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'grayscale' }), 'Escala de grises'),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'sepia' }), 'Sepia'),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'invert' }), 'Negativo'),
      h('label', { class: 'check' }, h('input', { type: 'checkbox', name: 'vintage' }), 'Vintage')),
    slider('Brillo', 'brightness', -100, 100),
    slider('Contraste', 'contrast', -100, 100),
    slider('Saturación', 'saturation', -100, 100),
    slider('Desenfoque', 'blur', 0, 100),
    slider('Pixelado', 'pixelate', 0, 100),
    slider('Ruido', 'noise', 0, 100),
    h('details', { class: 'placement' },
      h('summary', {}, 'Recortar (% de cada lado)'),
      h('div', { class: 'grid2' }, num('Izquierda', 'crop-left', { min: 0, max: 95 }), num('Derecha', 'crop-right', { min: 0, max: 95 }), num('Arriba', 'crop-top', { min: 0, max: 95 }), num('Abajo', 'crop-bottom', { min: 0, max: 95 }))));
  const clear = h('button', { type: 'button', class: 'btn', title: 'Hace transparente el fondo liso que toca los bordes (un marco blanco, por ejemplo)' }, 'Quitar fondo');
  clear.addEventListener('click', () => {
    clear.disabled = true;
    editor.removeImageBackground(putAsset)
      .then((done) => {
        const message = done ? 'Fondo quitado. Puedes deshacerlo.' : 'Esta imagen no tiene un fondo liso que quitar.';
        toast(message);
        announce(message);
      })
      .catch((err: unknown) => {
        console.warn(err);
        toast('No se ha podido quitar el fondo.', 'error');
      })
      .finally(() => (clear.disabled = false));
  });
  const cropButton = h('button', { type: 'button', class: 'btn' }, 'Recortar con el ratón');
  cropButton.addEventListener('click', () => editor.startCrop());
  box.querySelector('legend')?.after(clear, cropButton);
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
  const snap = (label: string, key: 'grid' | 'objects', title: string) => {
    const box = h('label', { class: 'check', title }, h('input', { type: 'checkbox', name: `snap-${key}`, checked: editor.snapping[key] }), label);
    box.querySelector('input')?.addEventListener('change', (e) => editor.setSnapping({ [key]: (e.target as HTMLInputElement).checked }));
    return box;
  };
  return [
    h('p', { class: 'muted' }, 'Nada seleccionado. Ajustes del lienzo:'),
    size,
    apply,
    color,
    snap('Ajustar a otros objetos', 'objects', 'Bordes y centros se alinean al arrastrar. Mantén Alt para moverlo libremente.'),
    snap('Ajustar a la rejilla', 'grid', `Al arrastrar, la esquina se acerca a una rejilla de ${GRID_SIZE} px, que se ve mientras arrastras.`),
    h('p', { class: 'muted' }, bg.kind === 'image' ? 'El fondo es una imagen de la biblioteca.' : ''),
  ];
}
