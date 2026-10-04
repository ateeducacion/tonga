// Starting points for classroom drawings («Nuevo → Plantilla»). Each template is built from the
// same pieces the user has (shapes, text inside shapes, connectors), laid out in proportion to
// the canvas, so everything stays editable. The result is an ordinary project.
import { Ellipse, FabricImage, Line, Path, Rect, StaticCanvas, Textbox, type FabricObject } from 'fabric';
import type { Background, Project } from '../project/schema';
import { readProject } from './document';
import { makeConnector } from './links';
import { SHAPES } from './shapes';

export type TemplateKind = 'cover-panel' | 'cover-band' | 'concept-map' | 'venn' | 'timeline' | 'comic' | 'storyboard' | 'axes' | 'cycle' | 'org-chart';

export const TEMPLATES: { kind: TemplateKind; label: string }[] = [
  { kind: 'cover-panel', label: 'Portada de recurso (panel lateral)' },
  { kind: 'cover-band', label: 'Portada de recurso (banda superior)' },
  { kind: 'concept-map', label: 'Mapa conceptual' },
  { kind: 'venn', label: 'Diagrama de Venn' },
  { kind: 'timeline', label: 'Línea temporal' },
  { kind: 'comic', label: 'Cómic (4 viñetas)' },
  { kind: 'storyboard', label: 'Storyboard (6 escenas)' },
  { kind: 'axes', label: 'Ejes cartesianos' },
  { kind: 'cycle', label: 'Ciclo' },
  { kind: 'org-chart', label: 'Organigrama' },
];

const INK = '#1f2937';
const LINE = { stroke: INK, strokeWidth: 3, strokeUniform: true, strokeLineCap: 'round' as const, strokeLineJoin: 'round' as const };

let counter = 0;
const id = () => `t${Date.now().toString(36)}${(counter++).toString(36)}`;

/** Builds the template's objects on a canvas of the given size. */
class Builder {
  readonly objects: FabricObject[] = [];
  /** Layers that start locked (a full-canvas background, so clicks reach what is on top). */
  readonly locked = new Set<FabricObject>();
  readonly u: number;

  constructor(readonly w: number, readonly h: number) {
    this.u = Math.min(w, h);
  }

  add<T extends FabricObject>(o: T, name: string): T {
    o.set({ id: id(), name });
    this.objects.push(o);
    return o;
  }

  text(text: string, x: number, y: number, width: number, size: number, name = 'Texto'): Textbox {
    return this.add(new Textbox(text, { left: x, top: y, width, fontSize: size, fontFamily: 'Arial', fill: INK, textAlign: 'center' }), name);
  }

  /** A shape with a text written inside it (tied to it, as «Escribir dentro» does). */
  box(shape: FabricObject, name: string, text: string, size = Math.round(this.u / 30)): FabricObject {
    this.add(shape, name);
    const label = this.text(text, shape.left, shape.top, shape.getScaledWidth() * 0.8, size, `Texto de ${name}`);
    label.set({ attachedTo: shape.id });
    return shape;
  }

  /** A text block given by its left edge, as on a cover (left-aligned unless told otherwise). */
  block(text: string, x: number, y: number, width: number, size: number, name: string, style: Partial<Textbox> = {}): Textbox {
    return this.add(new Textbox(text, {
      left: x + width / 2, top: y, width, fontSize: Math.round(size), fontFamily: 'Arial', fill: '#ffffff', textAlign: 'left', ...style,
    }), name);
  }

  /**
   * A library image (a 256 px Lucide icon) centred at (x, y), `size` px wide. The element is never
   * loaded here: the project keeps its canonical path and the editor loads it when it opens.
   */
  image(src: string, x: number, y: number, size: number, name: string): FabricImage {
    const el = document.createElement('img');
    el.src = src;
    const img = new FabricImage(el, { width: 256, height: 256, left: x, top: y, scaleX: size / 256, scaleY: size / 256 });
    img.set({ assetSrc: src });
    return this.add(img, name);
  }

  /** The two-diamond mark of the covers, a placeholder for the centre's or the author's logo. */
  logo(x: number, y: number, size: number, colours: [string, string]): void {
    const diamond = (cx: number, cy: number, r: number, fill: string, opacity = 1) =>
      new Path(`M ${cx} ${cy - r} L ${cx + r} ${cy} L ${cx} ${cy + r} L ${cx - r} ${cy} Z`, { fill, opacity, strokeWidth: 0 });
    this.add(diamond(x, y, size / 2, colours[0]), 'Logo');
    this.add(diamond(x + size * 0.3, y + size * 0.15, size * 0.36, colours[1], 0.92), 'Logo (detalle)');
  }

  connect(from: FabricObject, to: FabricObject, arrow = true): void {
    // Behind the shapes, like «Conectar».
    const c = makeConnector(from, to, arrow, LINE);
    c.set({ id: id(), name: 'Conector' });
    this.objects.unshift(c);
  }
}

/** An arrow from (x0, y0) to (x1, y1) in canvas coordinates, its head `head` px long. */
function arrow(x0: number, y0: number, x1: number, y1: number, head: number): Path {
  const a = Math.atan2(y1 - y0, x1 - x0);
  const wing = (side: number) => `${x1 - head * Math.cos(a + (side * Math.PI) / 6)} ${y1 - head * Math.sin(a + (side * Math.PI) / 6)}`;
  return new Path(`M ${x0} ${y0} L ${x1} ${y1} M ${wing(1)} L ${x1} ${y1} L ${wing(-1)}`, { ...LINE, fill: null });
}

const rect = (x: number, y: number, w: number, h: number, fill: string, rounded = false) =>
  new Rect({ left: x, top: y, width: w, height: h, rx: rounded ? h / 5 : 0, ry: rounded ? h / 5 : 0, fill, stroke: INK, strokeWidth: 2, strokeUniform: true });
const ellipse = (x: number, y: number, rx: number, ry: number, fill: string) =>
  new Ellipse({ left: x, top: y, rx, ry, fill, stroke: INK, strokeWidth: 2, strokeUniform: true });

const flat = (x: number, y: number, w: number, h: number, fill: string, r = 0) =>
  new Rect({ left: x + w / 2, top: y + h / 2, width: w, height: h, rx: r, ry: r, fill, strokeWidth: 0 });
const disc = (x: number, y: number, rx: number, ry: number, fill: string) => new Ellipse({ left: x, top: y, rx, ry, fill, strokeWidth: 0 });

/** Placeholder texts of a resource cover (an eXeLearning cover page, a worksheet…). */
const COVER = {
  title: 'Título del recurso',
  subtitle: 'Subtítulo o pregunta que guía el recurso',
  details: ['Nivel educativo', 'Área o materia', 'Duración: 4 sesiones'],
  image: 'repositorios/iconosescuela/book-open.svg',
};

const BUILD: Record<TemplateKind, (b: Builder) => void> = {
  // A coloured side panel with the texts and an illustration on the light side (like the
  // eXeLearning covers made with the Slide iDevice).
  'cover-panel': (b) => {
    const { w, h, u } = b;
    const panel = w * 0.42;
    const pad = w * 0.045;
    const text = panel - pad * 2;
    b.locked.add(b.add(flat(0, 0, w, h, '#fbf3e9'), 'Fondo'));
    b.add(disc(w * 0.71, h * 0.42, h * 0.36, h * 0.36, '#f6e6d2'), 'Círculo de fondo');
    b.image(COVER.image, w * 0.71, h * 0.42, h * 0.4, 'Imagen');
    b.add(flat(0, 0, panel, h, '#12615a'), 'Panel');
    b.add(new Path(`M ${panel} 0 L ${panel + w * 0.05} ${h / 2} L ${panel} ${h} Z`, { fill: '#17786c', strokeWidth: 0 }), 'Pico del panel');
    b.logo(pad + u * 0.04, h * 0.12, u * 0.08, ['#f2b04e', '#7fd0c2']);
    b.block(COVER.title, pad, h * 0.29, text, u * 0.08, 'Título', { fontWeight: 'bold' });
    b.block(COVER.subtitle, pad, h * 0.5, text, u * 0.042, 'Subtítulo', { fontStyle: 'italic', fill: '#eaf4f1' });
    b.add(flat(pad, h * 0.6, text * 0.55, u * 0.012, '#3e9e8d', u * 0.006), 'Separador');
    b.block(COVER.details.join('\n\n'), pad, h * 0.79, text, u * 0.034, 'Datos del recurso', { fontWeight: 'bold' });
  },
  // A band across the top with the title, the illustration in the middle and a row of details.
  'cover-band': (b) => {
    const { w, h, u } = b;
    const band = h * 0.4;
    b.locked.add(b.add(flat(0, 0, w, h, '#f8fafc'), 'Fondo'));
    b.add(flat(0, 0, w, band, '#1e3a8a'), 'Banda');
    b.add(flat(0, band, w, u * 0.014, '#f2b04e'), 'Filete');
    b.logo(w * 0.06, band * 0.22, u * 0.07, ['#f2b04e', '#93c5fd']);
    b.block(COVER.title, w * 0.12, band * 0.36, w * 0.76, u * 0.085, 'Título', { fontWeight: 'bold', textAlign: 'center' });
    b.block(COVER.subtitle, w * 0.12, band * 0.62, w * 0.76, u * 0.04, 'Subtítulo', { fontStyle: 'italic', fill: '#dbeafe', textAlign: 'center' });
    b.add(disc(w / 2, h * 0.63, h * 0.17, h * 0.17, '#e0e7ff'), 'Círculo de fondo');
    b.image(COVER.image, w / 2, h * 0.63, h * 0.26, 'Imagen');
    COVER.details.forEach((t, i) => {
      b.block(t, w * (0.06 + i * 0.31), h * 0.88, w * 0.26, u * 0.032, `Dato ${i + 1}`, { fontWeight: 'bold', fill: '#1e3a8a', textAlign: 'center' });
    });
  },
  'concept-map': (b) => {
    const { w, h, u } = b;
    const centre = b.box(ellipse(w / 2, h / 2, u * 0.17, u * 0.1, '#fde68a'), 'Idea principal', 'Idea principal', Math.round(u / 24));
    const spots: [number, number][] = [[0.18, 0.2], [0.82, 0.2], [0.18, 0.8], [0.82, 0.8]];
    spots.forEach(([fx, fy], i) => {
      const idea = b.box(rect(w * fx, h * fy, u * 0.26, u * 0.12, '#bfdbfe', true), `Idea ${i + 1}`, `Idea ${i + 1}`);
      b.connect(centre, idea);
    });
  },
  venn: (b) => {
    const { w, h, u } = b;
    const r = u * 0.28;
    const left = b.add(ellipse(w / 2 - r * 0.55, h / 2, r, r, '#93c5fd'), 'Conjunto A');
    const right = b.add(ellipse(w / 2 + r * 0.55, h / 2, r, r, '#fca5a5'), 'Conjunto B');
    for (const c of [left, right]) c.set({ opacity: 0.6 });
    b.text('A', w / 2 - r * 1.1, h / 2 - r * 1.15, r, Math.round(u / 18), 'Título A');
    b.text('B', w / 2 + r * 1.1, h / 2 - r * 1.15, r, Math.round(u / 18), 'Título B');
    b.text('Ambos', w / 2, h / 2, r * 0.6, Math.round(u / 30), 'Intersección');
  },
  timeline: (b) => {
    const { w, h, u } = b;
    b.add(arrow(w * 0.05, h / 2, w * 0.95, h / 2, u * 0.03), 'Eje del tiempo');
    for (let i = 0; i < 5; i++) {
      const x = w * (0.15 + i * 0.16);
      b.add(ellipse(x, h / 2, u * 0.02, u * 0.02, '#f28c28'), `Hito ${i + 1}`);
      const above = i % 2 === 0;
      b.text(`Fecha ${i + 1}`, x, h / 2 + (above ? -1 : 1) * u * 0.08, u * 0.22, Math.round(u / 32), `Fecha ${i + 1}`);
      b.text('Qué pasó', x, h / 2 + (above ? -1 : 1) * u * 0.16, u * 0.22, Math.round(u / 40), `Suceso ${i + 1}`);
    }
  },
  comic: (b) => {
    const { w, h, u } = b;
    const m = u * 0.04;
    const pw = (w - m * 3) / 2;
    const ph = (h - m * 3) / 2;
    [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([cx = 0, cy = 0], i) => {
      b.add(new Rect({ left: m + pw / 2 + cx * (pw + m), top: m + ph / 2 + cy * (ph + m), width: pw, height: ph, fill: '#ffffff', stroke: INK, strokeWidth: 4, strokeUniform: true }), `Viñeta ${i + 1}`);
    });
    const speech = SHAPES.find((s) => s.kind === 'speech')?.d ?? '';
    const bubble = new Path(speech, { left: m + pw * 0.7, top: m + ph * 0.3, scaleX: (pw * 0.4) / 100, scaleY: (ph * 0.4) / 100, fill: '#ffffff', stroke: INK, strokeWidth: 2, strokeUniform: true });
    b.add(bubble, 'Bocadillo');
    b.text('¡Hola!', bubble.left, bubble.top - ph * 0.04, pw * 0.3, Math.round(u / 28), 'Diálogo');
  },
  storyboard: (b) => {
    const { w, h, u } = b;
    const m = u * 0.04;
    const fw = (w - m * 4) / 3;
    const fh = (h - m * 3) / 2 - u * 0.06;
    for (let i = 0; i < 6; i++) {
      const col = i % 3;
      const row = Math.floor(i / 3);
      const x = m + fw / 2 + col * (fw + m);
      const y = m + fh / 2 + row * (fh + m + u * 0.06);
      b.add(new Rect({ left: x, top: y, width: fw, height: fh, fill: '#ffffff', stroke: INK, strokeWidth: 2, strokeUniform: true }), `Escena ${i + 1}`);
      b.text(`Escena ${i + 1}: …`, x, y + fh / 2 + u * 0.03, fw, Math.round(u / 40), `Texto de la escena ${i + 1}`);
    }
  },
  axes: (b) => {
    const { w, h, u } = b;
    b.add(arrow(w * 0.05, h / 2, w * 0.95, h / 2, u * 0.03), 'Eje X');
    b.add(arrow(w / 2, h * 0.95, w / 2, h * 0.05, u * 0.03), 'Eje Y');
    const step = u / 10;
    for (let k = -4; k <= 4; k++) {
      if (!k) continue;
      b.add(new Line([w / 2 + k * step, h / 2 - u * 0.01, w / 2 + k * step, h / 2 + u * 0.01], { ...LINE, strokeWidth: 2 }), `Marca x ${k}`);
      b.add(new Line([w / 2 - u * 0.01, h / 2 + k * step, w / 2 + u * 0.01, h / 2 + k * step], { ...LINE, strokeWidth: 2 }), `Marca y ${-k}`);
    }
    const size = Math.round(u / 24);
    b.text('x', w * 0.95, h / 2 + u * 0.05, size * 2, size, 'Etiqueta x');
    b.text('y', w / 2 + u * 0.05, h * 0.06, size * 2, size, 'Etiqueta y');
    b.text('O', w / 2 - u * 0.035, h / 2 + u * 0.04, size * 2, size, 'Origen');
  },
  cycle: (b) => {
    const { w, h, u } = b;
    const r = u * 0.3;
    const steps = [0, 1, 2, 3].map((i) => {
      const a = -Math.PI / 2 + (i * Math.PI) / 2;
      return b.box(ellipse(w / 2 + r * Math.cos(a) * 1.3, h / 2 + r * Math.sin(a), u * 0.13, u * 0.08, '#bbf7d0'), `Paso ${i + 1}`, `Paso ${i + 1}`);
    });
    steps.forEach((s, i) => b.connect(s, steps[(i + 1) % steps.length] as FabricObject));
  },
  'org-chart': (b) => {
    const { w, h, u } = b;
    const top = b.box(rect(w / 2, h * 0.2, u * 0.3, u * 0.12, '#fde68a', true), 'Dirección', 'Dirección');
    [0.2, 0.5, 0.8].forEach((fx, i) => {
      const child = b.box(rect(w * fx, h * 0.55, u * 0.26, u * 0.12, '#bfdbfe', true), `Equipo ${i + 1}`, `Equipo ${i + 1}`);
      b.connect(top, child, false);
    });
  },
};

/** A new project with the template laid out on a canvas of the given size. */
export function buildTemplate(kind: TemplateKind, width: number, height: number, background: Background, title = ''): Project {
  const b = new Builder(width, height);
  BUILD[kind](b);
  const canvas = new StaticCanvas(undefined, { width, height, renderOnAddRemove: false });
  canvas.add(...b.objects);
  const project = readProject(canvas, { width, height }, background, title);
  const locked = new Set([...b.locked].map((o) => o.id));
  for (const layer of project.layers) layer.locked = locked.has(layer.id);
  void canvas.dispose();
  return project;
}
