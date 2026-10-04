// Layers panel: the accessible, DOM representation of the drawing. Top-most layer first.
// A native list of buttons: every action is reachable with Tab and Enter. A double click or F2
// renames a layer; with a mouse, the grip drags it up or down (the arrows do it by keyboard).
import type { Editor } from '../canvas/editor';
import { LAYER_LABEL } from '../i18n/es';
import { announce, byId, h, iconButton } from './dom';
import type { LayerType } from '../project/schema';
import { icon, type IconName } from './icons';

const TYPE_ICON: Record<LayerType, IconName> = {
  image: 'image', text: 'type', rect: 'square', ellipse: 'circle', triangle: 'triangle', line: 'slash', path: 'shapes', group: 'group',
};

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

/** Adds the layer to the selection, or takes it out (a locked layer cannot be chosen). */
function toggle(editor: Editor, id: string, name: string, locked: boolean): void {
  if (locked) return announce(`${name} está bloqueada`);
  const ids = editor.layers().filter((x) => x.selected).map((x) => x.id);
  const on = !ids.includes(id);
  editor.select(on ? [...ids, id] : ids.filter((x) => x !== id));
  announce(on ? `${name} añadida a la selección` : `${name} quitada de la selección`);
}

/** «Combinar capas»: wired once; it joins whatever is selected into one layer. */
let combineWired = false;

export function renderLayers(editor: Editor): void {
  const list = byId('layers');
  const focusedKey = (document.activeElement as HTMLElement | null)?.dataset.focusKey;
  const layers = editor.layers();
  byId('layers-empty').hidden = layers.length > 0;
  byId('layers-hint').hidden = layers.length < 2;
  byId('layers-count').textContent = String(layers.length);
  const selected = layers.filter((l) => l.selected).length;
  byId('layers-bar').hidden = selected < 2;
  byId('layers-selected').textContent = `${selected} capas seleccionadas`;
  if (!combineWired) {
    combineWired = true;
    byId('layers-combine').addEventListener('click', () => {
      const n = editor.selected().length;
      editor.group();
      announce(`${n} capas combinadas en una`);
    });
  }
  list.replaceChildren(
    ...layers.map((l, i) => {
      const name = l.name || LAYER_LABEL[l.type];
      const state = [LAYER_LABEL[l.type], l.visible ? '' : 'oculta', l.locked ? 'bloqueada' : ''].filter(Boolean).join(', ');
      const select = h('button', { type: 'button', class: 'btn layer-name', 'data-focus-key': `${l.id}:select`, 'aria-pressed': l.selected ? 'true' : 'false' }, name);
      select.setAttribute('aria-label', `${name} (${state})`);
      select.addEventListener('click', (e) => {
        // Ctrl/⌘ or Shift + click adds or removes the layer: several can then be combined.
        if (e.ctrlKey || e.metaKey || e.shiftKey) return toggle(editor, l.id, name, l.locked);
        // The first click re-renders the list, so the second one lands on a new button and no
        // dblclick fires; the click count survives the swap.
        if (e.detail === 2) return startRename(editor, select, l.id, name);
        editor.select([l.id]);
        announce(l.locked ? `${name} está bloqueada` : `${name} seleccionada`);
      });
      select.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && (e.ctrlKey || e.metaKey || e.shiftKey)) {
          e.preventDefault();
          toggle(editor, l.id, name, l.locked);
          return;
        }
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
      const kind = h('span', { class: 'layer-type', 'aria-hidden': 'true' });
      kind.append(icon(TYPE_ICON[l.type]));
      // Only the selected layer shows the arrows: the other rows stay short and readable.
      row.append(grip, kind, select, ...(l.selected ? [up, down] : []), eye, lock);
      return row;
    }),
  );
  // Re-rendering must not lose keyboard focus.
  if (focusedKey) list.querySelector<HTMLElement>(`[data-focus-key="${CSS.escape(focusedKey)}"]`)?.focus();
}
