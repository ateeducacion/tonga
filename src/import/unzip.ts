// Reads a ZIP file (eXeLearning's .elpx, .idevice and .block are ZIPs) with the browser's own
// DecompressionStream: no dependency. Only what eXeLearning writes is supported: stored and
// deflated entries, no encryption, no ZIP64. Untrusted input, so it is bounded.
import { ImportError } from './sniff';

const MAX_ENTRIES = 5000;
const MAX_TOTAL = 200 * 1024 * 1024; // uncompressed bytes, against "zip bombs"

const u16 = (b: Uint8Array, at: number) => (b[at] ?? 0) | ((b[at + 1] ?? 0) << 8);
const u32 = (b: Uint8Array, at: number) => (u16(b, at) | (u16(b, at + 2) << 16)) >>> 0;

export function isZip(bytes: Uint8Array): boolean {
  return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

async function inflate(data: Uint8Array): Promise<Uint8Array> {
  const source = new ReadableStream<BufferSource>({
    start(controller) {
      controller.enqueue(data as BufferSource);
      controller.close();
    },
  });
  const stream = source.pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** The files of a ZIP by path. Directories and unsafe paths ("..", absolute) are skipped. */
export async function unzip(bytes: Uint8Array): Promise<Map<string, Uint8Array>> {
  const bad = () => new ImportError('El fichero está dañado: no es un ZIP válido.');
  // End of central directory: the last 22 bytes, or up to 64 KB earlier if there is a comment.
  let end = -1;
  for (let i = bytes.length - 22; i >= Math.max(0, bytes.length - 22 - 65535); i--) {
    if (u32(bytes, i) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) throw bad();
  const count = u16(bytes, end + 10);
  if (count > MAX_ENTRIES) throw new ImportError('El fichero tiene demasiados elementos.');
  let at = u32(bytes, end + 16);
  const files = new Map<string, Uint8Array>();
  let total = 0;
  for (let n = 0; n < count; n++) {
    if (u32(bytes, at) !== 0x02014b50) throw bad();
    const method = u16(bytes, at + 10);
    const flags = u16(bytes, at + 8);
    const compressed = u32(bytes, at + 20);
    const size = u32(bytes, at + 24);
    const nameLength = u16(bytes, at + 28);
    const extra = u16(bytes, at + 30);
    const comment = u16(bytes, at + 32);
    const local = u32(bytes, at + 42);
    const name = new TextDecoder().decode(bytes.subarray(at + 46, at + 46 + nameLength));
    at += 46 + nameLength + extra + comment;
    if (name.endsWith('/') || name.startsWith('/') || name.split('/').includes('..')) continue;
    if (flags & 1) throw new ImportError('El fichero está cifrado.');
    if (u32(bytes, local) !== 0x04034b50) throw bad();
    total += size;
    if (total > MAX_TOTAL) throw new ImportError('El fichero descomprimido sería demasiado grande.');
    const start = local + 30 + u16(bytes, local + 26) + u16(bytes, local + 28);
    const data = bytes.subarray(start, start + compressed);
    if (method === 0) files.set(name, data);
    else if (method === 8) files.set(name, await inflate(data));
    else throw new ImportError('El fichero usa una compresión que no se puede leer.');
  }
  return files;
}
