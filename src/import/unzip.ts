// Reads a ZIP file (eXeLearning's .elpx, .idevice and .block are ZIPs) with the browser's own
// DecompressionStream: no dependency. Only what eXeLearning writes is supported: stored and
// deflated entries, no encryption, no ZIP64. A project can weigh hundreds of MB (audio, video),
// so the file is never loaded whole: only its directory and the entries asked for are read.
// Untrusted input, so it is bounded.
import { ImportError } from './sniff';

const MAX_ENTRIES = 20000;
const MAX_ENTRY = 100 * 1024 * 1024; // uncompressed bytes of one entry
const MAX_READ = 200 * 1024 * 1024; // uncompressed bytes read from one archive, against "zip bombs"

const u16 = (b: Uint8Array, at: number) => (b[at] ?? 0) | ((b[at + 1] ?? 0) << 8);
const u32 = (b: Uint8Array, at: number) => (u16(b, at) | (u16(b, at + 2) << 16)) >>> 0;

interface Entry {
  method: number;
  compressed: number;
  size: number;
  local: number;
}

/** The files of a ZIP, read on demand. */
export interface ZipArchive {
  /** Paths of the files, without directories or unsafe paths ("..", absolute). */
  readonly names: string[];
  /** The bytes of a file, or undefined when the archive does not have it. */
  read(name: string): Promise<Uint8Array | undefined>;
}

export function isZip(bytes: Uint8Array): boolean {
  return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
}

const slice = async (blob: Blob, from: number, to: number) => new Uint8Array(await blob.slice(from, to).arrayBuffer());

/** Inflates raw deflate data, giving up as soon as it grows past `size` (what the ZIP declared). */
async function inflate(data: Uint8Array, size: number): Promise<Uint8Array> {
  const source = new ReadableStream<BufferSource>({
    start(controller) {
      controller.enqueue(data as BufferSource);
      controller.close();
    },
  });
  const reader = source.pipeThrough(new DecompressionStream('deflate-raw')).getReader();
  const out = new Uint8Array(size);
  let length = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    if (length + value.length > size) {
      await reader.cancel();
      throw new ImportError('El fichero está dañado: no es un ZIP válido.');
    }
    out.set(value, length);
    length += value.length;
  }
  return out.subarray(0, length);
}

/** Opens a ZIP, reading only its central directory. */
export async function openZip(blob: Blob): Promise<ZipArchive> {
  const bad = () => new ImportError('El fichero está dañado: no es un ZIP válido.');
  // End of central directory: the last 22 bytes, or up to 64 KB earlier if there is a comment.
  const tailStart = Math.max(0, blob.size - 22 - 65535);
  const tail = await slice(blob, tailStart, blob.size);
  let end = -1;
  for (let i = tail.length - 22; i >= 0; i--) {
    if (u32(tail, i) === 0x06054b50) {
      end = i;
      break;
    }
  }
  if (end < 0) throw bad();
  const count = u16(tail, end + 10);
  if (count > MAX_ENTRIES) throw new ImportError('El fichero tiene demasiados elementos.');
  const dirSize = u32(tail, end + 12);
  const dirStart = u32(tail, end + 16);
  if (dirStart + dirSize > tailStart + end) throw bad();
  const dir = await slice(blob, dirStart, dirStart + dirSize);
  const entries = new Map<string, Entry>();
  let at = 0;
  for (let n = 0; n < count; n++) {
    if (u32(dir, at) !== 0x02014b50) throw bad();
    const flags = u16(dir, at + 8);
    const method = u16(dir, at + 10);
    const compressed = u32(dir, at + 20);
    const size = u32(dir, at + 24);
    const nameLength = u16(dir, at + 28);
    const extra = u16(dir, at + 30);
    const comment = u16(dir, at + 32);
    const local = u32(dir, at + 42);
    const name = new TextDecoder().decode(dir.subarray(at + 46, at + 46 + nameLength));
    at += 46 + nameLength + extra + comment;
    if (name.endsWith('/') || name.startsWith('/') || name.split('/').includes('..')) continue;
    if (flags & 1) throw new ImportError('El fichero está cifrado.');
    if (method !== 0 && method !== 8) throw new ImportError('El fichero usa una compresión que no se puede leer.');
    entries.set(name, { method, compressed, size, local });
  }

  let read = 0;
  return {
    names: [...entries.keys()],
    async read(name) {
      const entry = entries.get(name);
      if (!entry) return undefined;
      if (entry.size > MAX_ENTRY) throw new ImportError(`«${name}» pesa más de ${MAX_ENTRY / 1024 / 1024} MB descomprimido.`);
      read += entry.size;
      if (read > MAX_READ) throw new ImportError('El fichero descomprimido sería demasiado grande.');
      const header = await slice(blob, entry.local, entry.local + 30);
      if (u32(header, 0) !== 0x04034b50) throw bad();
      const start = entry.local + 30 + u16(header, 26) + u16(header, 28);
      const data = await slice(blob, start, start + entry.compressed);
      if (data.length !== entry.compressed) throw bad();
      return entry.method === 0 ? data : inflate(data, entry.size);
    },
  };
}
