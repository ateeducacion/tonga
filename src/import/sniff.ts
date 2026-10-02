// Decides what an imported file is from its bytes (not its name) and enforces size limits.
import { MAX_IMPORT_BYTES } from '../config';
import { UserError } from '../errors';

export type ImportKind = 'png' | 'jpeg' | 'webp' | 'svg' | 'tonga';

export class ImportError extends UserError {}

export function sniff(bytes: Uint8Array, name: string): ImportKind {
  if (bytes.length > MAX_IMPORT_BYTES) throw new ImportError(`El fichero pesa más de ${MAX_IMPORT_BYTES / 1024 / 1024} MB.`);
  if (bytes.length === 0) throw new ImportError('El fichero está vacío.');
  const b = bytes;
  if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return 'png';
  if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return 'jpeg';
  if (ascii(b, 0, 4) === 'RIFF' && ascii(b, 8, 12) === 'WEBP') return 'webp';
  const head = new TextDecoder().decode(b.subarray(0, 512)).replace(/^\uFEFF/, '').trimStart();
  if (head.startsWith('{') && /\.tonga$|\.json$/i.test(name)) return 'tonga';
  if (head.startsWith('<') && /<svg[\s>]/i.test(new TextDecoder().decode(b.subarray(0, 4096)))) return 'svg';
  throw new ImportError('Formato no admitido. Usa PNG, JPEG, WebP, SVG o un proyecto .tonga.');
}

function ascii(b: Uint8Array, from: number, to: number): string {
  return String.fromCharCode(...b.subarray(from, to));
}
