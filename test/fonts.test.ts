import { afterEach, describe, expect, it, vi } from 'vitest';
import { Textbox } from 'fabric';
import { Editor } from '../src/canvas/editor';
import { CLASSROOM_FONTS, embedFonts, loadFonts, usedFonts } from '../src/canvas/fonts';
import { newProject } from '../src/project/schema';

const SVG = '<svg><desc>x</desc>\n<defs>\n</defs>\n<text font-family="Andika">Hola</text></svg>';

describe('usedFonts', () => {
  it('collects the font of every text, inside groups too', () => {
    const fonts = usedFonts([
      { type: 'Textbox', fontFamily: 'Andika' },
      { type: 'Rect' },
      { type: 'Group', objects: [{ type: 'Textbox', fontFamily: 'Lexend' }, { type: 'Textbox', fontFamily: 'Arial' }] },
    ]);
    expect([...fonts]).toEqual(['Andika', 'Lexend', 'Arial']);
  });
});

describe('embedFonts', () => {
  it('adds a woff2 @font-face per weight of each classroom font used, as data: URLs', async () => {
    const read = vi.fn(async (url: string) => `data:font/woff2;base64,${btoa(url)}`);
    const svg = await embedFonts(SVG, ['Andika', 'Patrick Hand', 'Arial'], read);
    expect(read).toHaveBeenCalledTimes(3); // Andika 400 + 700, Patrick Hand 400; Arial is a system font
    expect(svg.match(/@font-face/g)).toHaveLength(3);
    expect(svg).toContain("font-family: 'Andika'; font-weight: 700; src: url('data:font/woff2;base64,");
    expect(svg.indexOf('<style>')).toBeGreaterThan(svg.indexOf('<defs>'));
  });

  it('leaves an SVG with system fonts only untouched', async () => {
    expect(await embedFonts(SVG, ['Arial'])).toBe(SVG);
  });

  it('reads the font files with fetch by default', async () => {
    const fetch = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(new Uint8Array([1, 2, 3])));
    const svg = await embedFonts(SVG, ['Playwrite ES']);
    expect(fetch).toHaveBeenCalledOnce();
    expect(svg).toContain(`url('data:font/woff2;base64,${btoa('\x01\x02\x03')}')`);
  });
});

describe('loadFonts', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  /** A FontFace stand-in that records what was loaded; `fail` makes loading reject. */
  function fakeFontFace(fail = false) {
    const added: string[] = [];
    class FakeFontFace {
      constructor(public family: string, public source: string, public descriptors: { weight: string }) {}
      load() {
        return fail ? Promise.reject(new Error('offline')) : Promise.resolve(this);
      }
    }
    vi.stubGlobal('FontFace', FakeFontFace);
    Object.defineProperty(document, 'fonts', { configurable: true, value: { add: (f: FakeFontFace) => added.push(`${f.family} ${f.descriptors.weight}`) } });
    return added;
  }

  it('does nothing without the font loading API', async () => {
    await expect(loadFonts(['Andika'])).resolves.toBeUndefined();
  });

  it('loads each classroom font once, every weight, and skips system fonts', async () => {
    const added = fakeFontFace();
    await loadFonts(['Lexend', 'Arial']);
    await loadFonts(['Lexend']);
    expect(added).toEqual(['Lexend 400', 'Lexend 700']);
  });

  it('tries again next time when a font could not load (offline)', async () => {
    const added = fakeFontFace(true);
    await loadFonts(['OpenDyslexic']);
    await loadFonts(['OpenDyslexic']);
    expect(added).toEqual(['OpenDyslexic 400', 'OpenDyslexic 700', 'OpenDyslexic 400', 'OpenDyslexic 700']);
  });
});

describe('Editor.setFont', () => {
  it('sets the font of the selected text and remembers it for the next one', async () => {
    document.body.innerHTML = '<canvas id="c"></canvas>';
    const editor = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
    await editor.open(newProject(800, 600));
    editor.addText('Hola');
    await editor.setFont(CLASSROOM_FONTS[0]?.family ?? '');
    expect(editor.inspect()?.text?.fontFamily).toBe('Andika');
    editor.addText('Otra');
    expect((editor.canvas.getActiveObject() as Textbox).fontFamily).toBe('Andika');
  });
});
