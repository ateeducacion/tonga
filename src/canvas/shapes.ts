// Predefined shapes of the «Formas» menu. Plain data (no Fabric): the menu draws its previews
// from the same SVG path data, in a 100×100 box, that the editor turns into a Fabric Path.
// rect, roundRect, circle, ellipse, triangle and line become native Fabric objects instead.

export type ShapeGroup = 'Formas' | 'Flechas' | 'Bocadillos';

export interface ShapeDef {
  kind: string;
  label: string;
  group: ShapeGroup;
  d: string;
}

const n = (v: number) => Math.round(v * 10) / 10;
const poly = (points: [number, number][]) => `M${points.map(([x, y]) => `${n(x)} ${n(y)}`).join(' L')} Z`;

/** A regular polygon (or a star, with an inner radius) inside the 100×100 box. */
function regular(sides: number, start: number, inner?: number): string {
  const count = inner ? sides * 2 : sides;
  return poly(Array.from({ length: count }, (_, i) => {
    const r = inner && i % 2 ? inner : 50;
    const a = start + (i * 2 * Math.PI) / count;
    return [50 + r * Math.cos(a), 50 + r * Math.sin(a)];
  }));
}

const ARROW: [number, number][] = [[0, 35], [60, 35], [60, 12], [100, 50], [60, 88], [60, 65], [0, 65]];
const arrow = (map: (x: number, y: number) => [number, number]) => poly(ARROW.map(([x, y]) => map(x, y)));

export const SHAPES = [
  { kind: 'rect', label: 'Rectángulo', group: 'Formas', d: 'M8 22 H92 V78 H8 Z' },
  { kind: 'roundRect', label: 'Rectángulo redondeado', group: 'Formas', d: 'M22 22 H78 Q92 22 92 36 V64 Q92 78 78 78 H22 Q8 78 8 64 V36 Q8 22 22 22 Z' },
  { kind: 'circle', label: 'Círculo', group: 'Formas', d: 'M10 50 A40 40 0 1 0 90 50 A40 40 0 1 0 10 50 Z' },
  { kind: 'ellipse', label: 'Elipse', group: 'Formas', d: 'M4 50 A46 30 0 1 0 96 50 A46 30 0 1 0 4 50 Z' },
  { kind: 'triangle', label: 'Triángulo', group: 'Formas', d: 'M50 8 L94 88 L6 88 Z' },
  { kind: 'diamond', label: 'Rombo', group: 'Formas', d: 'M50 0 L100 50 L50 100 L0 50 Z' },
  { kind: 'pentagon', label: 'Pentágono', group: 'Formas', d: regular(5, -Math.PI / 2) },
  { kind: 'hexagon', label: 'Hexágono', group: 'Formas', d: regular(6, 0) },
  { kind: 'star', label: 'Estrella', group: 'Formas', d: regular(5, -Math.PI / 2, 20) },
  { kind: 'parallelogram', label: 'Paralelogramo', group: 'Formas', d: 'M28 20 H100 L72 80 H0 Z' },
  { kind: 'heart', label: 'Corazón', group: 'Formas', d: 'M50 92 C20 72 0 54 0 32 C0 14 13 2 28 2 C39 2 47 9 50 19 C53 9 61 2 72 2 C87 2 100 14 100 32 C100 54 80 72 50 92 Z' },
  { kind: 'line', label: 'Línea', group: 'Formas', d: 'M10 90 L90 10' },
  { kind: 'arrowRight', label: 'Flecha a la derecha', group: 'Flechas', d: arrow((x, y) => [x, y]) },
  { kind: 'arrowLeft', label: 'Flecha a la izquierda', group: 'Flechas', d: arrow((x, y) => [100 - x, y]) },
  { kind: 'arrowUp', label: 'Flecha arriba', group: 'Flechas', d: arrow((x, y) => [y, 100 - x]) },
  { kind: 'arrowDown', label: 'Flecha abajo', group: 'Flechas', d: arrow((x, y) => [100 - y, x]) },
  { kind: 'speech', label: 'Bocadillo', group: 'Bocadillos', d: 'M12 6 H88 Q96 6 96 14 V58 Q96 66 88 66 H42 L20 90 L26 66 H12 Q4 66 4 58 V14 Q4 6 12 6 Z' },
  {
    kind: 'thought', label: 'Bocadillo de pensamiento', group: 'Bocadillos',
    d: 'M24 58 A14 14 0 0 1 20 32 A18 18 0 0 1 45 14 A18 18 0 0 1 76 17 A16 16 0 0 1 90 44 A15 15 0 0 1 72 64 A18 18 0 0 1 42 68 A14 14 0 0 1 24 58 Z M14 76 A6 6 0 1 0 26 76 A6 6 0 1 0 14 76 Z M4 92 A4 4 0 1 0 12 92 A4 4 0 1 0 4 92 Z',
  },
] as const satisfies readonly ShapeDef[];

export type ShapeKind = (typeof SHAPES)[number]['kind'];
