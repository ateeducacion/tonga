import { describe, expect, it } from 'vitest';
import { A4, a4Layout, jpegToPdf } from '../src/export/pdf';

const fakeJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 0xff, 0xd9]);
const text = (b: Uint8Array) => new TextDecoder('latin1').decode(b);

describe('PDF writer (RULE-022)', () => {
  it('fits a portrait image on a portrait A4 page keeping its aspect ratio, centred', () => {
    const { page, box } = a4Layout(794, 1123);
    expect(page).toEqual([A4.width, A4.height]);
    expect(box[2] / box[3]).toBeCloseTo(794 / 1123, 5);
    expect(box[0]).toBeCloseTo((A4.width - box[2]) / 2, 5);
    expect(box[1]).toBeCloseTo((A4.height - box[3]) / 2, 5);
  });

  it('uses a landscape A4 page for a landscape drawing', () => {
    const { page, box } = a4Layout(1920, 1080);
    expect(page).toEqual([A4.height, A4.width]);
    expect(box[2]).toBeCloseTo(A4.height, 5);
  });

  it('writes a single-page PDF with a DCT image and a valid cross-reference table', () => {
    const pdf = jpegToPdf({ jpeg: fakeJpeg, width: 100, height: 50 }, 'Mi (dibujo)');
    const s = text(pdf);
    expect(s.startsWith('%PDF-1.4\n')).toBe(true);
    expect(s.trimEnd().endsWith('%%EOF')).toBe(true);
    expect(s).toContain('/Count 1');
    expect(s).toContain('/Filter /DCTDecode /Length 9');
    expect(s).toContain('/Title (Mi \\(dibujo\\))');

    // Each xref entry points at "<n> 0 obj".
    const xrefAt = Number(/startxref\n(\d+)/.exec(s)?.[1]);
    expect(s.slice(xrefAt, xrefAt + 4)).toBe('xref');
    const entries = [...s.slice(xrefAt).matchAll(/(\d{10}) 00000 n/g)].map((m) => Number(m[1]));
    expect(entries).toHaveLength(6);
    entries.forEach((off, i) => expect(s.slice(off, off + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`));
  });
});
