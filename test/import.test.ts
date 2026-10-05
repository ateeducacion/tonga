import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ImportError, sniff } from '../src/import/sniff';
import { checkImageSize, sanitizeSvg } from '../src/import/svg';

const bytes = (...b: number[]) => new Uint8Array(b);
const text = (s: string) => new TextEncoder().encode(s);

describe('file type detection (RULE-113)', () => {
  it('trusts the bytes, not the extension', () => {
    expect(sniff(bytes(0x89, 0x50, 0x4e, 0x47, 0, 0), 'foto.jpg')).toBe('png');
    expect(sniff(bytes(0xff, 0xd8, 0xff, 0xe0), 'x.final.png')).toBe('jpeg');
    expect(sniff(text('RIFF\0\0\0\0WEBPVP8 '), 'a')).toBe('webp');
    expect(sniff(text('<?xml version="1.0"?>\n<svg xmlns="http://www.w3.org/2000/svg"/>'), 'a.svg')).toBe('svg');
    expect(sniff(text('{"format":"tonga"}'), 'clase.tonga')).toBe('tonga');
  });

  it.each([
    ['an empty file', new Uint8Array(), /vacío/],
    ['a GIF', text('GIF89a'), /no admitido/],
    ['an HTML page', text('<html><body>'), /no admitido/],
  ])('rejects %s', (_n, b, msg) => expect(() => sniff(b, 'x')).toThrowError(msg));

  it('judges the size from the whole file, with a larger limit for eXeLearning packages', () => {
    const png = bytes(0x89, 0x50, 0x4e, 0x47);
    const elpx = bytes(0x50, 0x4b, 0x03, 0x04);
    expect(sniff(png, 'foto.png', 99 * 1024 * 1024)).toBe('png');
    expect(() => sniff(png, 'foto.png', 101 * 1024 * 1024)).toThrowError('pesa más de 100 MB');
    expect(sniff(elpx, 'curso.elpx', 500 * 1024 * 1024)).toBe('exe');
    expect(() => sniff(elpx, 'curso.elpx', 3 * 1024 ** 3)).toThrowError('pesa más de 2 GB');
    expect(() => sniff(png, 'foto.png', 0)).toThrowError('vacío');
  });
});

describe('SVG sanitizer', () => {
  const svg = (inner: string, attrs = 'width="100" height="50"') => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${attrs}>${inner}</svg>`;

  it('removes scripts, event handlers, foreignObject and javascript: links', () => {
    const out = sanitizeSvg(svg('<script>alert(1)</script><rect onclick="alert(1)" width="5" height="5"/><foreignObject><div/></foreignObject><a href="javascript:alert(1)"><circle r="2"/></a>')).svg;
    expect(out).not.toMatch(/script|onclick|foreignObject|javascript:/i);
    expect(out).toContain('<rect');
    expect(out).toContain('<circle');
  });

  it('strips external references that would track the user or taint the canvas', () => {
    const out = sanitizeSvg(svg('<image href="https://tracker.example/p.png" width="1" height="1"/><rect style="fill:url(https://x.example/a)"/><rect fill="url(#grad)"/><rect fill="url(#a) url(https://y.example/b)"/>')).svg;
    expect(out).not.toContain('tracker.example');
    expect(out).not.toContain('x.example');
    expect(out).not.toContain('y.example');
    expect(out).toContain('url(#grad)');
  });

  it('keeps embedded data: images', () => {
    const out = sanitizeSvg(svg('<image href="data:image/png;base64,iVBORw0KGgo=" width="1" height="1"/>')).svg;
    expect(out).toContain('data:image/png;base64,iVBORw0KGgo=');
  });

  it('rejects DOCTYPE/entity tricks, invalid XML and absurd sizes', () => {
    expect(() => sanitizeSvg('<!DOCTYPE svg [<!ENTITY a "aaaa">]><svg xmlns="http://www.w3.org/2000/svg">&a;</svg>')).toThrowError(ImportError);
    expect(() => sanitizeSvg('<svg xmlns="http://www.w3.org/2000/svg"><rect></svg>')).toThrowError(/no es válido/);
    expect(() => sanitizeSvg(svg('', 'width="100000" height="10"'))).toThrowError(/px por lado/);
    expect(() => checkImageSize(9000, 10)).toThrowError(/máximo/);
  });

  it('recognises a Tonga 1.x export and pulls out its background (RULE-046/047)', () => {
    const legacy = readFileSync('test/fixtures/legacy/export.svg', 'utf8');
    const out = sanitizeSvg(legacy);
    expect(out).toMatchObject({ width: 2000, height: 1335 });
    expect(out.legacyBackground).toMatch(/^data:image\/jpeg;base64,iVBOR/);
    expect(out.svg).not.toContain('data-background');
    expect(out.svg.match(/<image/g)).toHaveLength(1);
  });
});
