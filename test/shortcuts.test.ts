import { describe, expect, it } from 'vitest';
import { commandFor, type KeyLike } from '../src/ui/shortcuts';

const key = (k: string, mods: Partial<KeyLike> = {}): KeyLike => ({
  key: k, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, target: document.body, ...mods,
});

describe('keyboard shortcuts (RULE-100)', () => {
  it.each([
    [key('z', { ctrlKey: true }), 'undo'],
    [key('z', { metaKey: true }), 'undo'],
    [key('Z', { ctrlKey: true, shiftKey: true }), 'redo'],
    [key('y', { ctrlKey: true }), 'redo'],
    [key('c', { metaKey: true }), 'copy'],
    [key('v', { ctrlKey: true }), 'paste'],
    [key('d', { ctrlKey: true }), 'duplicate'],
    [key('a', { ctrlKey: true }), 'select-all'],
    [key('Delete'), 'delete'],
    [key('Backspace'), 'delete'],
    [key('Escape'), 'deselect'],
    [key('+'), 'zoom-in'],
    [key('-'), 'zoom-out'],
    [key('0'), 'zoom-fit'],
    [key('1'), 'zoom-100'],
    [key('t'), 'add-text'],
    [key('k'), 'library'],
    [key('x'), 'tool-erase'],
  ])('%o -> %s', (e, cmd) => expect(commandFor(e)).toBe(cmd));

  it('moves 1 px, or 10 px with Shift', () => {
    expect(commandFor(key('ArrowLeft'))).toEqual({ nudge: [-1, 0] });
    expect(commandFor(key('ArrowDown', { shiftKey: true }))).toEqual({ nudge: [0, 10] });
  });

  it('does nothing while the user types in a field or edits canvas text', () => {
    const input = document.createElement('input');
    expect(commandFor(key('Backspace', { target: input }))).toBeNull();
    expect(commandFor(key('z', { ctrlKey: true, target: document.createElement('textarea') }))).toBeNull();
    expect(commandFor(key('Delete'), true)).toBeNull();
  });

  it('leaves keys inside a popover menu to the menu', () => {
    const menu = document.createElement('div');
    menu.setAttribute('popover', '');
    const item = menu.appendChild(document.createElement('button'));
    expect(commandFor(key('Escape', { target: item }))).toBeNull();
    expect(commandFor(key('Escape'))).not.toBeNull();
  });

  it('keeps Ctrl shortcuts on non-text controls ; arrows go to form controls, Delete on a button still deletes', () => {
    const range = Object.assign(document.createElement('input'), { type: 'range' });
    expect(commandFor(key('z', { ctrlKey: true, target: range }))).toBe('undo');
    expect(commandFor(key('ArrowLeft', { target: range }))).toBeNull();
    expect(commandFor(key('Delete', { target: document.createElement('button') }))).toBe('delete');
  });
});
