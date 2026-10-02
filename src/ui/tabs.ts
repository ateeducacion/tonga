// WAI-ARIA tabs: one tab stop for the tab list, arrow keys / Home / End move between tabs,
// and selecting a tab shows its panel. Used by the side panel (Propiedades / Capas).

export function setupTabs(tablist: HTMLElement): (id: string) => void {
  const tabs = [...tablist.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  const select = (tab: HTMLButtonElement, focus = false) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls') ?? '');
      if (panel) panel.hidden = !on;
    }
    if (focus) tab.focus();
  };
  for (const tab of tabs) tab.addEventListener('click', () => select(tab));
  tablist.addEventListener('keydown', (e) => {
    const i = tabs.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    select(tabs[(next + tabs.length) % tabs.length] as HTMLButtonElement, true);
  });
  return (id) => {
    const tab = tabs.find((t) => t.id === id);
    if (tab) select(tab);
  };
}
