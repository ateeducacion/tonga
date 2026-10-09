// Fonts for text. The system ones are everywhere; the classroom ones (SIL Open Font License)
// ship with Tonga in src/fonts and load only when a text uses them, never from a third-party
// server. An exported SVG carries the classroom fonts it uses as data: URLs.
import { cache } from 'fabric';

export const SYSTEM_FONTS = ['Arial', 'Verdana', 'Georgia', 'Times New Roman', 'Courier New', 'Trebuchet MS', 'Comic Sans MS'];

interface BundledFont {
  family: string;
  /** File prefix in src/fonts: `<file>-<weight>.woff2`. */
  file: string;
  weights: number[];
}

export const CLASSROOM_FONTS: readonly BundledFont[] = [
  { family: 'Andika', file: 'andika', weights: [400, 700] },
  { family: 'Atkinson Hyperlegible', file: 'atkinson-hyperlegible', weights: [400, 700] },
  { family: 'Lexend', file: 'lexend', weights: [400, 700] },
  { family: 'OpenDyslexic', file: 'opendyslexic', weights: [400, 700] },
  { family: 'Patrick Hand', file: 'patrick-hand', weights: [400] },
  { family: 'Playwrite ES', file: 'playwrite-es', weights: [400] },
];

const FILES = import.meta.glob<string>('../fonts/*.woff2', { query: '?url', import: 'default', eager: true });
const fileUrl = (font: BundledFont, weight: number) => FILES[`../fonts/${font.file}-${weight}.woff2`] as string;
const bundled = (families: Iterable<string>) => CLASSROOM_FONTS.filter((f) => [...families].includes(f.family));

const loaded = new Map<string, Promise<void>>();

/** Loads the classroom fonts among `families`, so Fabric measures and draws text with them. */
export async function loadFonts(families: Iterable<string>): Promise<void> {
  if (typeof FontFace === 'undefined') return; // no font loading API (tests without a browser)
  await Promise.all(bundled(families).map((font) => {
    let done = loaded.get(font.family);
    if (!done) {
      const faces = font.weights.map((w) => new FontFace(font.family, `url("${fileUrl(font, w)}")`, { weight: String(w) }));
      for (const face of faces) document.fonts.add(face);
      // Text measured with a fallback before the font arrived must be measured again.
      // Offline and not cached yet: the text keeps a fallback font, and the next use tries again.
      done = Promise.all(faces.map((f) => f.load())).then(
        () => cache.clearFontCache(font.family),
        () => void loaded.delete(font.family),
      );
      loaded.set(font.family, done);
    }
    return done;
  }));
}

/** Font families of the text objects in these serialized objects, groups included. */
export function usedFonts(objects: readonly Record<string, unknown>[]): Set<string> {
  const found = new Set<string>();
  const walk = (o: Record<string, unknown>) => {
    if (typeof o.fontFamily === 'string') found.add(o.fontFamily);
    if (Array.isArray(o.objects)) for (const c of o.objects) walk(c as Record<string, unknown>);
  };
  objects.forEach(walk);
  return found;
}

async function dataUrl(url: string): Promise<string> {
  const bytes = new Uint8Array(await (await fetch(url)).arrayBuffer());
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return `data:font/woff2;base64,${btoa(binary)}`;
}

/**
 * Adds @font-face rules for the classroom fonts used in `families` to an SVG made by Fabric,
 * so it shows the same letters on a computer without them. `read` is replaceable for tests.
 */
export async function embedFonts(svg: string, families: Iterable<string>, read: (url: string) => Promise<string> = dataUrl): Promise<string> {
  const rules = await Promise.all(bundled(families).flatMap((font) => font.weights.map(async (w) =>
    `@font-face { font-family: '${font.family}'; font-weight: ${w}; src: url('${await read(fileUrl(font, w))}') format('woff2'); }`)));
  return rules.length ? svg.replace('<defs>', `<defs>\n<style>\n${rules.join('\n')}\n</style>`) : svg;
}
