import { describe, expect, it } from 'vitest';
import { History } from '../src/history/history';

describe('History', () => {
  it('records edits, undoes and redoes them (RULE-070/071/072)', () => {
    const h = new History('a');
    h.push('b');
    h.push('c');
    expect(h.undo()).toBe('b');
    expect(h.undo()).toBe('a');
    expect(h.undo()).toBeNull();
    expect(h.redo()).toBe('b');
    expect(h.current).toBe('b');
  });

  it('a new edit after undo discards the redo branch (RULE-070)', () => {
    const h = new History('a');
    h.push('b');
    h.undo();
    h.push('x');
    expect(h.canRedo).toBe(false);
    expect(h.undo()).toBe('a');
  });

  it('ignores a push that does not change the state', () => {
    const h = new History('a');
    h.push('a');
    expect(h.canUndo).toBe(false);
  });

  it('coalesces a continuous interaction into one undo step', () => {
    const h = new History('a');
    for (const s of ['b1', 'b2', 'b3']) h.push(s, 'opacity:layer-1');
    h.push('c');
    expect(h.undo()).toBe('b3');
    expect(h.undo()).toBe('a');
  });

  it('starts a new step after seal() even with the same key', () => {
    const h = new History('a');
    h.push('b', 'k');
    h.seal();
    h.push('c', 'k');
    expect(h.undo()).toBe('b');
  });

  it('keeps at most maxEntries undo steps', () => {
    const h = new History('0', { maxEntries: 3 });
    for (let i = 1; i <= 10; i++) h.push(String(i));
    let steps = 0;
    while (h.undo() !== null) steps++;
    expect(steps).toBe(3);
    expect(h.current).toBe('7');
  });

  it('drops the oldest steps when the byte budget is exceeded', () => {
    const big = (c: string) => c.repeat(1000);
    const h = new History(big('a'), { maxBytes: 2000 * 3 });
    h.push(big('b'));
    h.push(big('c'));
    h.push(big('d'));
    expect(h.undo()).toBe(big('c'));
    expect(h.undo()).toBe(big('b'));
    expect(h.undo()).toBeNull();
  });

  it('reset() empties both stacks', () => {
    const h = new History('a');
    h.push('b');
    h.reset('z');
    expect(h.canUndo || h.canRedo).toBe(false);
    expect(h.current).toBe('z');
  });
});
