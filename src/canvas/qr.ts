// QR codes: a light square (the quiet zone included) under one path with the dark modules,
// grouped so the code moves and scales as a single object. The encoded text travels in the
// group's `qr` property, so the code can be regenerated with another link or colours.
import { Group, Path, Rect } from 'fabric';
import { encode } from 'uqr';
import { UserError } from '../errors';

/** Light modules around the code, as the QR standard asks. */
export const QR_QUIET_ZONE = 4;
export const QR_MAX_LENGTH = 1000;

export interface QrStyle {
  text: string;
  color: string;
  /** '' or 'transparent' leaves the light modules see-through. */
  background: string;
}

/** SVG path data for the dark modules, one module per unit, each row's runs merged. */
export function qrPathData(text: string): { d: string; size: number } {
  if (!text.trim()) throw new UserError('Escribe el enlace o el texto del código QR.');
  if (text.length > QR_MAX_LENGTH) throw new UserError(`El texto del código QR no puede pasar de ${QR_MAX_LENGTH} caracteres.`);
  const { data, size } = encode(text, { ecc: 'M', border: 0 });
  const runs: string[] = [];
  data.forEach((row, y) => {
    for (let x = 0; x < size; x++) {
      if (!row[x]) continue;
      const start = x;
      while (row[x + 1]) x++;
      runs.push(`M${start + QR_QUIET_ZONE} ${y + QR_QUIET_ZONE}h${x - start + 1}v1h${start - x - 1}z`);
    }
  });
  return { d: runs.join(''), size: size + 2 * QR_QUIET_ZONE };
}

/** A QR code `side` px wide, centred on the origin. */
export function makeQr({ text, color, background }: QrStyle, side: number): Group {
  const { d, size } = qrPathData(text);
  const scale = side / size;
  // A path sits on the centre of its own bounding box (pathOffset), not on the module grid's.
  const modules = new Path(d, { fill: color, stroke: null, strokeWidth: 0 });
  const offset = modules.pathOffset;
  modules.set({ left: (offset.x - size / 2) * scale, top: (offset.y - size / 2) * scale, scaleX: scale, scaleY: scale });
  const light = new Rect({ width: size * scale, height: size * scale, fill: background || 'transparent', strokeWidth: 0 });
  const group = new Group([light, modules]);
  group.set({ qr: text });
  return group;
}

/** The text and colours of a QR group, or null for any other object. */
export function readQr(o: unknown): QrStyle | null {
  if (!(o instanceof Group) || typeof o.qr !== 'string') return null;
  const [light, modules] = o.getObjects() as [Rect, Path];
  return { text: o.qr, color: String(modules.fill), background: String(light.fill) };
}
