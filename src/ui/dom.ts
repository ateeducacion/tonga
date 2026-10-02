// Small DOM helpers. Text always goes through textContent: no user data is parsed as HTML.
import { icon, type IconName } from './icons';

type Attrs = Record<string, string | number | boolean | undefined>;

export function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Attrs = {}, ...children: (Node | string)[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (v === undefined || v === false) continue;
    el.setAttribute(k, v === true ? '' : String(v));
  }
  el.append(...children);
  return el;
}

export function byId<T extends HTMLElement = HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing #${id}`);
  return el as T;
}

/** Puts the icon named in data-icon in front of each element's content. */
export function hydrateIcons(root: ParentNode = document): void {
  for (const el of root.querySelectorAll<HTMLElement>('[data-icon]')) {
    if (el.querySelector(':scope > svg')) continue;
    el.prepend(icon(el.dataset.icon as IconName));
  }
}

export function iconButton(name: IconName, label: string, attrs: Attrs = {}): HTMLButtonElement {
  const b = h('button', { type: 'button', class: 'btn icon-only', 'aria-label': label, title: label, ...attrs });
  b.append(icon(name));
  return b;
}

/** Announces a message to screen readers (polite). */
export function announce(message: string): void {
  const status = byId('status');
  status.textContent = '';
  // A new text node after clearing makes repeated messages announce again.
  requestAnimationFrame(() => (status.textContent = message));
}

export function toast(message: string, kind: 'info' | 'error' = 'info', ms = 3500, action?: { label: string; run: () => void }): void {
  const box = byId('toasts');
  const el = h('div', { class: `toast ${kind}`, role: kind === 'error' ? 'alert' : undefined }, message);
  if (action) {
    const b = h('button', { type: 'button', class: 'btn toast-action' }, action.label);
    b.addEventListener('click', () => {
      el.remove();
      action.run();
    });
    el.append(' ', b);
  }
  box.append(el);
  // A toast with an action stays until used: it may need more time than a status message.
  if (!action) setTimeout(() => el.remove(), kind === 'error' ? ms * 2 : ms);
}

export function openDialog(dialog: HTMLDialogElement): void {
  if (!dialog.open) dialog.showModal();
}

/** Asks a yes/no question in the confirm dialog; resolves true on OK. */
export function confirmDialog(opts: { title: string; text: string; ok: string; cancel?: string; image?: string }): Promise<boolean> {
  const dlg = byId<HTMLDialogElement>('dlg-confirm');
  byId('dlg-confirm-title').textContent = opts.title;
  byId('dlg-confirm-text').textContent = opts.text;
  byId('dlg-confirm-ok').textContent = opts.ok;
  byId('dlg-confirm-cancel').textContent = opts.cancel ?? 'Cancelar';
  const img = byId<HTMLImageElement>('dlg-confirm-image');
  img.hidden = !opts.image;
  if (opts.image) img.src = opts.image;
  dlg.returnValue = '';
  openDialog(dlg);
  return new Promise((resolve) => dlg.addEventListener('close', () => resolve(dlg.returnValue === 'ok'), { once: true }));
}

/** Downloads a Blob with the given file name (standard <a download>). */
export function download(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = h('a', { href: url, download: filename, hidden: true });
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
