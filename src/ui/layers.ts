// Layers panel: the accessible, DOM representation of the drawing. Top-most layer first.
// A native list of buttons: every action is reachable with Tab and Enter. A double click or F2
// renames a layer; with a mouse, the grip drags it up or down (the arrows do it by keyboard).
import type { Editor } from '../canvas/editor';
import { LAYER_LABEL } from '../i18n/es';
import { announce, byId, h, iconButton } from './dom';
import { icon } from './icons';

let dragged: string | null = null;

function startRename(editor: Editor, button: HTMLButtonElement, id: string, name: string): void {
  const input = h('input', { type: 'text', class: 'layer-rename', value: name, maxlength: 200, 'aria-label': `Nombre de ${name}`, 'data-focus-key': `${id}:select` });
  let done = false;
  const finish = (save: boolean) => {
    if (done) return;
    done = true;
    const value = input.value.trim();
    if (save && value && value !== name) editor.rename(id, value);
    else renderLayers(editor);
  };
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') finish(true);
    else if (e.key === 'Escape') finish(false);
    else return;
    e.preventDefault();
  });
  input.addEventListener('blur', () => finish(true));
  button.replaceWith(input);
  input.focus();
  input.select();
}

/** Where a row dropped on `row` lands: above or below it, by the pointer's half. */
function dropSlot(row: HTMLElement, index: number, clientY: number): number {
  const box = row.getBoundingClientRect();
  return clientY < box.top + box.height / 2 ? index : index + 1;
}

export function renderLayers(editor: Editor): void {
  const list = byId('layers');
  const focusedKey = (document.activeElement as HTMLElement | null)?.dataset.focusKey;
  const layers = editor.layers();
  byId('layers-empty').hidden = layers.length > 0;
  byId('layers-count').textContent = String(layers.length);
  list.replaceChildren(
    ...layers.map((l, i) => {
      const name = l.name || LAYER_LABEL[l.type];
      const state = [LAYER_LABEL[l.type], l.visible ? '' : 'oculta', l.locked ? 'bloqueada' : ''].filter(Boolean).join(', ');
      const select = h('button', { type: 'button', class: 'btn layer-name', 'data-focus-key': `${l.id}:select`, 'aria-pressed': l.selected ? 'true' : 'false' }, name);
      select.setAttribute('aria-label', `${name} (${state})`);
      select.addEventListener('click', (e) => {
        // The first click re-renders the list, so the second one lands on a new button and no
        // dblclick fires; the click count survives the swap.
        if (e.detail === 2) return startRename(editor, select, l.id, name);
        editor.select([l.id]);
        announce(l.locked ? `${name} está bloqueada` : `${name} seleccionada`);
      });
      select.addEventListener('keydown', (e) => {
        if (e.key !== 'F2') return;
        e.preventDefault();
        startRename(editor, select, l.id, name);
      });
      select.title = 'Doble clic o F2 para cambiar el nombre';
      const eye = iconButton(l.visible ? 'eye' : 'eyeOff', l.visible ? `Ocultar ${name}` : `Mostrar ${name}`, { 'data-focus-key': `${l.id}:visible` });
      eye.addEventListener('click', () => editor.setVisible(l.id, !l.visible));
      const lock = iconButton(l.locked ? 'lock' : 'lockOpen', l.locked ? `Desbloquear ${name}` : `Bloquear ${name}`, { 'data-focus-key': `${l.id}:lock` });
      lock.addEventListener('click', () => editor.setLocked(l.id, !l.locked));
      const up = iconButton('arrowUp', `Subir ${name}`, { 'data-focus-key': `${l.id}:up`, disabled: i === 0 || l.locked });
      up.addEventListener('click', () => {
        editor.select([l.id]);
        editor.order('forward');
      });
      const down = iconButton('arrowDown', `Bajar ${name}`, { 'data-focus-key': `${l.id}:down`, disabled: i === layers.length - 1 || l.locked });
      down.addEventListener('click', () => {
        editor.select([l.id]);
        editor.order('backward');
      });
      const row = h('li', { class: `layer${l.visible ? '' : ' hidden-layer'}`, 'aria-current': l.selected ? 'true' : undefined });
      // Mouse-only shortcut for the arrows, so it is hidden from assistive technology.
      const grip = h('span', { class: 'layer-grip', draggable: l.locked ? undefined : 'true', 'aria-hidden': 'true', title: l.locked ? undefined : 'Arrastrar para reordenar' });
      grip.append(icon('gripVertical'));
      grip.addEventListener('dragstart', (e) => {
        if (l.locked) return e.preventDefault();
        dragged = l.id;
        e.dataTransfer?.setData('text/plain', name);
        e.dataTransfer?.setDragImage(row, 0, row.offsetHeight / 2);
        row.classList.add('dragging');
      });
      grip.addEventListener('dragend', () => {
        dragged = null;
        renderLayers(editor);
      });
      row.addEventListener('dragover', (e) => {
        if (!dragged) return;
        e.preventDefault();
        const below = dropSlot(row, i, e.clientY) > i;
        row.classList.toggle('drop-before', !below);
        row.classList.toggle('drop-after', below);
      });
      row.addEventListener('dragleave', () => row.classList.remove('drop-before', 'drop-after'));
      row.addEventListener('drop', (e) => {
        if (!dragged) return;
        e.preventDefault();
        const from = layers.findIndex((x) => x.id === dragged);
        const slot = dropSlot(row, i, e.clientY);
        editor.moveLayer(dragged, slot > from ? slot - 1 : slot);
      });
      row.append(grip, select, up, down, eye, lock);
      return row;
    }),
  );
  // Re-rendering must not lose keyboard focus.
  if (focusedKey) list.querySelector<HTMLElement>(`[data-focus-key="${CSS.escape(focusedKey)}"]`)?.focus();
}
