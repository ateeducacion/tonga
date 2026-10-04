import { describe, expect, it } from 'vitest';
import { defaultFileName, exportFileName, exportBackground } from '../src/export/export';
import { newProject } from '../src/project/schema';

describe('export settings', () => {
  it('builds safe file names with the right extension (RULE-101)', () => {
    expect(exportFileName('Mi dibujo', 'jpeg')).toBe('Mi dibujo.jpg');
    expect(exportFileName('../../etc/passwd', 'png')).toBe('etcpasswd.png');
    expect(exportFileName('<script>.svg', 'svg')).toBe('script.svg');
    expect(exportFileName('   ', 'pdf')).toBe('dibujo.pdf');
    expect(exportFileName('Árbol canario', 'png')).toBe('Árbol canario.png');
  });

  it('defaults to tonga-YYYYMMDD-HHMMSS', () => {
    expect(defaultFileName(new Date(2026, 0, 5, 9, 4, 3))).toBe('tonga-20260105-090403');
  });

  it('never exports a JPEG or PDF with a transparent (black) background (RULE-114)', () => {
    const transparent = newProject(10, 10);
    const white = { kind: 'color', color: '#ffffff' };
    expect(exportBackground(transparent, { format: 'jpeg', transparent: true })).toEqual(white);
    expect(exportBackground(transparent, { format: 'pdf', transparent: true })).toEqual(white);
    expect(exportBackground(transparent, { format: 'png', transparent: true })).toEqual({ kind: 'transparent' });
    expect(exportBackground(transparent, { format: 'svg', transparent: false })).toEqual(white);
  });

  it('drops a colour or image background from PNG and SVG on request, like Canva', () => {
    const coloured = newProject(10, 10, { kind: 'color', color: '#ff0000' });
    const pictured = newProject(10, 10, { kind: 'image', src: 'repositorios/fondos/mar.png' });
    for (const p of [coloured, pictured]) {
      expect(exportBackground(p, { format: 'png', transparent: true })).toEqual({ kind: 'transparent' });
      expect(exportBackground(p, { format: 'svg', transparent: true })).toEqual({ kind: 'transparent' });
      expect(exportBackground(p, { format: 'png', transparent: false })).toEqual(p.canvas.background);
      expect(exportBackground(p, { format: 'jpeg', transparent: true })).toEqual(p.canvas.background);
    }
  });
});
