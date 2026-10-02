// Right-click (or Menu key / Shift+F10) menu for the canvas. A native popover with the WAI-ARIA
// menu pattern: arrow keys, Home/End, Enter; Esc or a click outside closes it. Everything here is
// also reachable from the inspector and the shortcuts: the menu is a shortcut, never the only way.
import { byId, h } from './dom';
import { icon, type IconName } from './icons';

export interface MenuItem {
  label: string;
  icon?: IconName;
  shortcut?: string;
  disabled?: boolean;
  danger?: boolean;
  run: () => void | Promise<void>;
}

export type MenuEntry = MenuItem | 'separator';

export class ContextMenu {
  private readonly el = byId('context-menu');
  private returnFocus: HTMLElement | null = null;

  constructor() {
    this.el.addEventListener('keydown', (e) => this.onKey(e));
    this.el.addEventListener('toggle', (e) => {
      if ((e as ToggleEvent).newState === 'closed') this.returnFocus?.focus();
    });
  }

  open(x: number, y: number, entries: MenuEntry[]): void {
    this.returnFocus = document.activeElement instanceof HTMLElement && document.activeElement !== document.body ? document.activeElement : byId('workspace');
    this.el.replaceChildren(
      ...entries.map((entry) => {
        if (entry === 'separator') return h('div', { role: 'separator', class: 'menu-separator' });
        const item = h('button', { type: 'button', role: 'menuitem', class: `menu-item${entry.danger ? ' danger' : ''}`, tabindex: -1, disabled: entry.disabled },
          h('span', { class: 'menu-label' }, entry.label),
          h('kbd', { class: 'menu-shortcut' }, entry.shortcut ?? ''));
        if (entry.icon) item.prepend(icon(entry.icon));
        item.addEventListener('click', () => {
          this.close();
          void entry.run();
        });
        return item;
      }),
    );
    if (this.el.matches(':popover-open')) this.el.hidePopover();
    this.el.showPopover();
    // Keep the whole menu inside the viewport.
    const { width, height } = this.el.getBoundingClientRect();
    this.el.style.left = `${Math.max(4, Math.min(x, innerWidth - width - 4))}px`;
    this.el.style.top = `${Math.max(4, Math.min(y, innerHeight - height - 4))}px`;
    this.items()[0]?.focus();
  }

  close(): void {
    if (this.el.matches(':popover-open')) this.el.hidePopover();
  }

  private items(): HTMLButtonElement[] {
    return [...this.el.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)')];
  }

  private onKey(e: KeyboardEvent): void {
    const items = this.items();
    const i = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: items.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    items[(next + items.length) % items.length]?.focus();
  }
}
