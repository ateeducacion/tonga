// Keyboard shortcuts. Pure mapping from a key event to a command, so it can be tested.

export type Command =
  | 'undo' | 'redo' | 'cut' | 'copy' | 'paste' | 'context-menu' | 'duplicate' | 'delete' | 'deselect' | 'select-all'
  | 'zoom-in' | 'zoom-out' | 'zoom-fit' | 'zoom-100'
  | 'tool-select' | 'tool-hand' | 'tool-draw' | 'tool-erase'
  | 'add-text' | 'add-rect' | 'add-ellipse' | 'add-line' | 'import' | 'library'
  | { nudge: [number, number] };

export interface KeyLike {
  key: string;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  altKey: boolean;
  target: EventTarget | null;
}

/** True while the user types in a field: shortcuts must not steal those keys. */
export function isTyping(target: EventTarget | null): boolean {
  if (!target || !(target instanceof Element)) return false;
  if (target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement) return true;
  if (target instanceof HTMLInputElement) return !['button', 'checkbox', 'radio', 'range', 'color', 'submit', 'reset', 'file'].includes(target.type);
  return target.closest('[contenteditable="true"], [contenteditable=""]') !== null;
}

export function commandFor(e: KeyLike, editingText = false): Command | null {
  if (editingText || isTyping(e.target) || e.altKey) return null;
  // Keys inside a menu (a popover) belong to it: Escape must close it, not deselect.
  if (e.target instanceof Element && e.target.closest('[popover]')) return null;
  const mod = e.ctrlKey || e.metaKey;
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (mod) {
    if (key === 'z') return e.shiftKey ? 'redo' : 'undo';
    if (key === 'y') return 'redo';
    if (key === 'x') return 'cut';
    if (key === 'c') return 'copy';
    if (key === 'v') return 'paste';
    if (key === 'd') return 'duplicate';
    if (key === 'a') return 'select-all';
    return null;
  }
  // Arrows and Delete belong to a focused form control or list, not to the canvas. Buttons keep
  // them for the canvas: after clicking «Añadir rectángulo», Delete must still delete it.
  if (e.target instanceof Element && e.target.closest('input, select, textarea, [role="listbox"]')) return null;
  const step = e.shiftKey ? 10 : 1;
  if (key === 'ContextMenu' || (key === 'F10' && e.shiftKey)) return 'context-menu';
  switch (key) {
    case 'Delete':
    case 'Backspace':
      return 'delete';
    case 'Escape':
      return 'deselect';
    case 'ArrowLeft':
      return { nudge: [-step, 0] };
    case 'ArrowRight':
      return { nudge: [step, 0] };
    case 'ArrowUp':
      return { nudge: [0, -step] };
    case 'ArrowDown':
      return { nudge: [0, step] };
    case '+':
    case '=':
      return 'zoom-in';
    case '-':
      return 'zoom-out';
    case '0':
      return 'zoom-fit';
    case '1':
      return 'zoom-100';
  }
  if (e.shiftKey) return null;
  const letters: Record<string, Command> = {
    v: 'tool-select', h: 'tool-hand', b: 'tool-draw', x: 'tool-erase', t: 'add-text', r: 'add-rect', e: 'add-ellipse', l: 'add-line', i: 'import', k: 'library',
  };
  return letters[key] ?? null;
}
