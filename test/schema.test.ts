import { describe, expect, it } from 'vitest';
import { CURRENT_VERSION, isSafeImageSrc, newProject, parseProject, ProjectError, serializeProject } from '../src/project/schema';

const layer = (over: Record<string, unknown> = {}) => ({
  id: 'l1', type: 'rect', name: 'Rectángulo 1', visible: true, locked: false, object: { type: 'Rect', width: 10 }, ...over,
});
const doc = (over: Record<string, unknown> = {}) =>
  JSON.stringify({ format: 'tonga', version: 1, title: 't', canvas: { width: 800, height: 600, background: { kind: 'transparent' } }, layers: [layer()], ...over });

describe('project schema', () => {
  it('round-trips a project', () => {
    const p = newProject(1123, 794, { kind: 'color', color: '#ffffff' });
    p.layers.push(layer() as never);
    expect(parseProject(serializeProject(p))).toEqual(p);
  });

  it('declares the format and version', () => {
    expect(newProject(10, 10)).toMatchObject({ format: 'tonga', version: CURRENT_VERSION });
  });

  it.each([
    ['not JSON', '{nope', /JSON/],
    ['another format', JSON.stringify({ format: 'x', version: 1 }), /no es un proyecto/],
    ['a newer version', doc({ version: 99 }), /más nueva/],
    ['version 0', doc({ version: 0 }), /versión/],
    ['a huge canvas', doc({ canvas: { width: 100000, height: 10 } }), /tamaño/],
    ['an unknown layer type', doc({ layers: [layer({ type: 'script' })] }), /tipo desconocido/],
    ['duplicate layer ids', doc({ layers: [layer(), layer()] }), /mismo identificador/],
    ['a remote image', doc({ layers: [layer({ type: 'image', object: { src: 'https://evil.example/x.png' } })] }), /origen no permitido/],
    ['a remote image inside a group', doc({ layers: [layer({ type: 'group', object: { objects: [{ src: 'javascript:alert(1)' }] } })] }), /origen no permitido/],
    ['a bad background colour', doc({ canvas: { width: 10, height: 10, background: { kind: 'color', color: 'red;}' } } }), /fondo/],
    ['a non-image asset', doc({ assets: { ['asset:' + 'a'.repeat(64)]: 'data:text/html;base64,PGgxPg==' } }), /recurso/],
  ])('rejects %s with a readable error', (_name, text, message) => {
    expect(() => parseProject(text)).toThrowError(ProjectError);
    expect(() => parseProject(text)).toThrowError(message);
  });

  it('defaults optional layer fields safely', () => {
    const p = parseProject(doc({ layers: [{ id: 'a', type: 'text', object: {} }] }));
    expect(p.layers[0]).toMatchObject({ name: '', visible: true, locked: false });
  });
});

describe('isSafeImageSrc', () => {
  it.each([
    ['asset:' + 'f'.repeat(64), true],
    ['data:image/png;base64,iVBORw0KGgo=', true],
    ['repositorios/aves/Águila.png', true],
    ['./repositorios/escenarios/Auditorio_fondo.png', true],
    ['repositorios/../index.html', false],
    ['https://example.com/a.png', false],
    ['//example.com/a.png', false],
    ['data:text/html;base64,PGgxPg==', false],
    ['javascript:alert(1)', false],
    ['blob:http://x/1', false],
  ])('%s -> %s', (src, ok) => expect(isSafeImageSrc(src)).toBe(ok));
});
