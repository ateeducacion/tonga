import { beforeEach, describe, expect, it } from 'vitest';
import { Group } from 'fabric';
import { Editor } from '../src/canvas/editor';
import { makeQr, QR_MAX_LENGTH, QR_QUIET_ZONE, qrPathData, readQr } from '../src/canvas/qr';
import { UserError } from '../src/errors';
import { newProject, parseProject, serializeProject } from '../src/project/schema';

describe('qrPathData', () => {
  it('draws a version 1 code (21 modules) inside its quiet zone, finder pattern first', () => {
    const { d, size } = qrPathData('hola');
    expect(size).toBe(21 + 2 * QR_QUIET_ZONE);
    // The top-left finder pattern starts with a run of seven dark modules.
    expect(d.startsWith(`M${QR_QUIET_ZONE} ${QR_QUIET_ZONE}h7v1h-7z`)).toBe(true);
  });

  it('grows with the text and accepts accents', () => {
    expect(qrPathData('https://www3.gobiernodecanarias.org/medusa/ecoescuela/ate/canción').size).toBeGreaterThan(21 + 2 * QR_QUIET_ZONE);
  });

  it('rejects an empty or too long text with a message for the user', () => {
    expect(() => qrPathData('  ')).toThrow(UserError);
    expect(() => qrPathData('x'.repeat(QR_MAX_LENGTH + 1))).toThrow(/1000 caracteres/);
  });
});

describe('makeQr / readQr', () => {
  it('builds a square group of the given side that remembers its text and colours', () => {
    const qr = makeQr({ text: 'https://example.org', color: '#2563eb', background: '#ffffff' }, 200);
    expect(qr.width).toBeCloseTo(200);
    expect(qr.height).toBeCloseTo(200);
    expect(readQr(qr)).toEqual({ text: 'https://example.org', color: '#2563eb', background: '#ffffff' });
  });

  it('leaves the background see-through when asked', () => {
    expect(readQr(makeQr({ text: 'a', color: '#000000', background: '' }, 100))?.background).toBe('transparent');
  });

  it('is null for anything that is not a QR code', () => {
    expect(readQr(new Group([]))).toBeNull();
    expect(readQr(undefined)).toBeNull();
  });
});

describe('Editor QR codes', () => {
  let editor: Editor;

  beforeEach(async () => {
    document.body.innerHTML = '<canvas id="c"></canvas>';
    editor = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
    await editor.open(newProject(800, 600));
  });

  it('adds a selected QR code at the centre, dark on white', () => {
    editor.addQr('  https://example.org  ');
    const info = editor.inspect();
    expect(info).toMatchObject({ type: 'group', name: 'Código QR 1', x: 400, y: 300, qr: { text: 'https://example.org', color: '#1f2937', background: '#ffffff' } });
  });

  it('regenerates it with another link and colours, keeping place, size, layer and undo', async () => {
    editor.addShape('rect');
    editor.addQr('https://example.org');
    editor.select([editor.layers()[0]?.id ?? '']);
    editor.setProps({ left: 120, top: 140, angle: 30 });
    editor.setSize(300, 300);
    const id = editor.inspect()?.ids[0];
    editor.setQr({ text: 'https://example.org/a/much/longer/link/that/needs/more/modules', color: '#e11d48', background: 'transparent' });
    const info = editor.inspect();
    expect(info).toMatchObject({ ids: [id], name: 'Código QR 1', x: 120, y: 140, angle: 30, width: 300, height: 300 });
    expect(info?.qr).toEqual({ text: 'https://example.org/a/much/longer/link/that/needs/more/modules', color: '#e11d48', background: 'transparent' });
    expect(editor.layers()[0]?.id).toBe(id); // still on top
    editor.setQr({ color: '#16a34a' });
    expect(editor.inspect()?.qr).toMatchObject({ text: 'https://example.org/a/much/longer/link/that/needs/more/modules', color: '#16a34a' });
    await editor.undo();
    await editor.undo();
    expect(readQr(editor.canvas.getObjects()[1])?.text).toBe('https://example.org');
  });

  it('ignores setQr when nothing or something else is selected', () => {
    editor.addShape('rect');
    const before = serializeProject(editor.toProject());
    editor.setQr({ text: 'x' });
    editor.canvas.discardActiveObject();
    editor.setQr({ text: 'x' });
    expect(serializeProject(editor.toProject())).toBe(before);
  });

  it('survives saving and opening the project', async () => {
    editor.addQr('https://example.org');
    const project = parseProject(serializeProject(editor.toProject()));
    expect(project.layers[0]).toMatchObject({ type: 'group', object: { qr: 'https://example.org' } });
    await editor.open(project);
    editor.select([project.layers[0]?.id ?? '']);
    expect(editor.inspect()?.qr?.text).toBe('https://example.org');
  });
});
