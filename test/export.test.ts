import { describe, expect, it } from 'vitest';
import { defaultFileName, exportFileName, needsWhiteBackground } from '../src/export/export';
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
    expect(needsWhiteBackground(transparent, { format: 'jpeg', transparent: true })).toBe(true);
    expect(needsWhiteBackground(transparent, { format: 'pdf', transparent: true })).toBe(true);
    expect(needsWhiteBackground(transparent, { format: 'png', transparent: true })).toBe(false);
    expect(needsWhiteBackground(transparent, { format: 'svg', transparent: false })).toBe(true);
    const coloured = newProject(10, 10, { kind: 'color', color: '#ff0000' });
    expect(needsWhiteBackground(coloured, { format: 'jpeg', transparent: true })).toBe(false);
  });
});
