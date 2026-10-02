import type { LayerType } from '../project/schema';

export const LAYER_LABEL: Record<LayerType, string> = {
  image: 'Imagen',
  text: 'Texto',
  rect: 'Rectángulo',
  ellipse: 'Elipse',
  triangle: 'Triángulo',
  line: 'Línea',
  path: 'Trazo',
  group: 'Grupo',
};
