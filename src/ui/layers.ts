// Layers panel: the accessible, DOM representation of the drawing. Top-most layer first.
// A native list of buttons: every action is reachable with Tab and Enter.
import type { Editor } from '../canvas/editor';
import { LAYER_LABEL } from '../i18n/es';
import { announce, byId, h, iconButton } from './dom';

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
      select.addEventListener('click', () => {
        editor.select([l.id]);
        announce(l.locked ? `${name} está bloqueada` : `${name} seleccionada`);
      });
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
      return h('li', { class: `layer${l.visible ? '' : ' hidden-layer'}`, 'aria-current': l.selected ? 'true' : undefined }, select, up, down, eye, lock);
    }),
  );
  // Re-rendering must not lose keyboard focus.
  if (focusedKey) list.querySelector<HTMLElement>(`[data-focus-key="${CSS.escape(focusedKey)}"]`)?.focus();
}
