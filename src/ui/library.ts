// Library dialog: search, filter by collection, preview, select, then «Añadir al lienzo».
// Double-click (or Enter) is only a shortcut. Thumbnails load lazily and only when the dialog opens.
import { loadCatalog, searchAssets, type Catalog, type CatalogAsset } from '../assets/catalog';
import { libraryUrl, setRevisions } from '../assets/sources';
import { byId, h, openDialog } from './dom';

const PAGE = 120;

export interface LibraryActions {
  add(asset: CatalogAsset): Promise<void>;
  setBackground(asset: CatalogAsset): Promise<void>;
}

export class Library {
  private catalog: Catalog | null = null;
  private results: CatalogAsset[] = [];
  private shown = 0;
  private active = -1;
  private readonly dialog = byId<HTMLDialogElement>('dlg-library');
  private readonly grid = byId('library-grid');
  private readonly search = byId<HTMLInputElement>('library-search');
  private readonly collection = byId<HTMLSelectElement>('library-collection');
  private readonly count = byId('library-count');
  private readonly selected = byId('library-selected');
  private readonly addBtn = byId<HTMLButtonElement>('library-add');
  private readonly bgBtn = byId<HTMLButtonElement>('library-as-bg');

  constructor(
    private readonly catalogUrl: string,
    private readonly actions: LibraryActions,
  ) {
    let timer = 0;
    this.search.addEventListener('input', () => {
      clearTimeout(timer);
      timer = window.setTimeout(() => this.update(), 150);
    });
    this.collection.addEventListener('change', () => this.update());
    this.grid.addEventListener('click', (e) => {
      const item = (e.target as Element).closest<HTMLElement>('[data-index]');
      if (item) this.setActive(Number(item.dataset.index));
    });
    this.grid.addEventListener('dblclick', (e) => {
      const item = (e.target as Element).closest<HTMLElement>('[data-index]');
      if (item) void this.commit('default');
    });
    this.grid.addEventListener('keydown', (e) => this.onKey(e));
    this.grid.addEventListener('scroll', () => {
      if (this.grid.scrollTop + this.grid.clientHeight > this.grid.scrollHeight - 200) this.renderMore();
    });
    this.addBtn.addEventListener('click', () => void this.commit('add'));
    this.bgBtn.addEventListener('click', () => void this.commit('background'));
    this.dialog.querySelector('[data-close]')?.addEventListener('click', () => this.dialog.close());
  }

  async open(): Promise<void> {
    openDialog(this.dialog);
    if (!this.catalog) {
      this.count.textContent = 'Cargando la biblioteca…';
      try {
        this.catalog = await loadCatalog(this.catalogUrl);
        setRevisions(this.catalog.assets);
      } catch (err) {
        this.count.textContent = err instanceof Error ? err.message : 'No se pudo cargar la biblioteca.';
        return;
      }
      this.fillCollections(this.catalog);
      this.update();
    }
    this.search.focus();
  }

  private fillCollections(catalog: Catalog): void {
    this.collection.replaceChildren(h('option', { value: '' }, 'Todas las colecciones'));
    for (const cat of catalog.categories) {
      const group = h('optgroup', { label: cat.title });
      for (const id of cat.collections) {
        const c = catalog.collections.find((x) => x.id === id);
        if (c) group.append(h('option', { value: c.id }, c.title));
      }
      this.collection.append(group);
    }
  }

  private update(): void {
    if (!this.catalog) return;
    this.results = searchAssets(this.catalog, this.search.value, this.collection.value);
    this.grid.replaceChildren();
    this.shown = 0;
    this.active = -1;
    this.updateSelection();
    this.count.textContent = this.results.length
      ? `${this.results.length} ${this.results.length === 1 ? 'resultado' : 'resultados'}`
      : 'No hay resultados. Prueba con otra palabra o con «Todas las colecciones».';
    this.renderMore();
  }

  private renderMore(): void {
    const end = Math.min(this.results.length, this.shown + PAGE);
    const frag = document.createDocumentFragment();
    for (let i = this.shown; i < end; i++) {
      const a = this.results[i] as CatalogAsset;
      const img = h('img', { src: libraryUrl(a.thumbnail), alt: '', loading: 'lazy', decoding: 'async', width: 110, height: 96 });
      img.addEventListener('error', () => img.replaceWith(h('span', { class: 'muted' }, 'Sin vista previa')), { once: true });
      frag.append(
        h('div', { class: 'asset', role: 'option', id: `asset-${i}`, 'data-index': i, 'aria-selected': 'false', title: a.title },
          img, h('span', {}, a.title)),
      );
    }
    this.grid.append(frag);
    this.shown = end;
  }

  private setActive(index: number): void {
    if (index < 0 || index >= this.results.length) return;
    while (index >= this.shown) this.renderMore();
    this.grid.querySelector('[aria-selected="true"]')?.setAttribute('aria-selected', 'false');
    this.grid.querySelector('.active')?.classList.remove('active');
    const el = byId(`asset-${index}`);
    el.setAttribute('aria-selected', 'true');
    el.classList.add('active');
    el.scrollIntoView({ block: 'nearest' });
    this.grid.setAttribute('aria-activedescendant', el.id);
    this.active = index;
    this.updateSelection();
  }

  private updateSelection(): void {
    const a = this.results[this.active];
    this.addBtn.disabled = !a;
    this.bgBtn.disabled = !a;
    this.selected.textContent = a
      ? `${a.title} · ${this.catalog?.collections.find((c) => c.id === a.collection)?.title ?? ''} · ${a.creator}, ${a.license.replaceAll('-', ' ')}`
      : 'Elige una imagen.';
  }

  private columns(): number {
    const first = this.grid.querySelector<HTMLElement>('.asset');
    return first ? Math.max(1, Math.round(this.grid.clientWidth / (first.offsetWidth + 8))) : 1;
  }

  private onKey(e: KeyboardEvent): void {
    const cols = this.columns();
    const moves: Record<string, number> = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols, ArrowUp: -cols, Home: -Infinity, End: Infinity };
    if (e.key in moves) {
      e.preventDefault();
      const delta = moves[e.key] as number;
      const next = delta === -Infinity ? 0 : delta === Infinity ? this.results.length - 1 : Math.max(0, this.active + delta);
      this.setActive(Math.min(next, this.results.length - 1));
    } else if (e.key === 'Enter' && this.active >= 0) {
      e.preventDefault();
      void this.commit('default');
    }
  }

  /** 'default' (double-click, Enter) follows the catalogue: background items become the background (RULE-112). */
  private async commit(kind: 'add' | 'background' | 'default'): Promise<void> {
    const a = this.results[this.active];
    if (!a) return;
    this.dialog.close();
    const asBackground = kind === 'background' || (kind === 'default' && a.background);
    await (asBackground ? this.actions.setBackground(a) : this.actions.add(a));
  }
}
