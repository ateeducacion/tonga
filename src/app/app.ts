// Wires the UI to the editor: tools, dialogs, shortcuts, zoom, import/export, autosave.
import { Editor, type ShapeKind } from '../canvas/editor';
import { buildTemplate, TEMPLATES } from '../canvas/templates';
import type { CatalogAsset } from '../assets/catalog';
import { resolveSource, resolveToDataUrl } from '../assets/sources';
import { APP_BUILD, APP_VERSION } from '../config';
import { UserError } from '../errors';
import { defaultFileName, exportFileName, exportProject, type ExportFormat } from '../export/export';
import { importFile } from '../import/load';
import { clearAutosave, getPref, loadAutosave, saveAutosave, setPref } from '../persistence/store';
import { importEmbeddedAssets, toTongaFile } from '../project/file';
import { newProject, parseProject, type Background } from '../project/schema';
import { announce, byId, confirmDialog, download, hydrateIcons, openDialog, toast } from '../ui/dom';
import { renderInspector } from '../ui/inspector';
import { renderLayers } from '../ui/layers';
import { ContextMenu, type MenuEntry } from '../ui/context-menu';
import { Library } from '../ui/library';
import { setupShapesMenu } from '../ui/shapes-menu';
import { setupTabs } from '../ui/tabs';
import { commandFor, isTyping, type Command } from '../ui/shortcuts';

type Tool = 'select' | 'hand' | 'draw';
const ZOOM_STEPS = [0.1, 0.25, 0.33, 0.5, 0.67, 0.75, 1, 1.25, 1.5, 2, 3, 4];
const AUTOSAVE_DELAY = 1500;

export class App {
  private readonly editor: Editor;
  private readonly library: Library;
  private readonly menu = new ContextMenu();
  private readonly workspace = byId('workspace');
  private tool: Tool = 'select';
  private savedRevision = 0;
  private autosavedRevision = 0;
  private autosaveTimer = 0;
  private title = '';
  private queue: Promise<unknown> = Promise.resolve();
  private copiedHere = false;

  constructor() {
    this.editor = new Editor(byId<HTMLCanvasElement>('canvas'), resolveSource);
    this.library = new Library('./catalog.json', {
      add: (a) => this.serial(() => this.addFromLibrary(a)),
      setBackground: (a) => this.serial(() => this.backgroundFromLibrary(a)),
    });
    hydrateIcons();
    const tablist = document.querySelector('.panel-tabs') as HTMLElement;
    setupTabs(tablist);
    // Capture phase: decide before the tab is selected whether it was the open one.
    const narrow = matchMedia('(max-width: 860px)');
    tablist.addEventListener('click', (e) => {
      const tab = (e.target as Element).closest('[role="tab"]');
      if (!tab || !narrow.matches) return;
      if (!byId('sidepanel').classList.contains('open')) this.togglePanel(true);
      else if (tab.getAttribute('aria-selected') === 'true') this.togglePanel(false);
    }, { capture: true });
    byId('about-version').textContent = APP_VERSION;
    if (APP_BUILD !== APP_VERSION) byId('about-version').title = `Compilación ${APP_BUILD}`;
    this.editor.subscribe(() => this.render());
    // Our menu replaces the browser's on the canvas (and on the empty area around it).
    byId('stage').addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.menu.open(e.clientX, e.clientY, this.menuEntries());
    }, { capture: true });
    this.bindActions();
    setupShapesMenu();
    this.bindTools();
    this.bindDialogs();
    this.bindKeyboard();
    this.bindHandTool();
    this.bindDropAndPaste();
    window.addEventListener('beforeunload', (e) => {
      if (this.dirty) e.preventDefault();
    });
    window.addEventListener('resize', () => this.fitIfNeeded());
  }

  async start(): Promise<void> {
    await this.editor.open(newProject(1123, 794));
    this.savedRevision = this.autosavedRevision = this.editor.revision; // a blank page has nothing to save
    this.zoomFit();
    byId('canvas-frame').classList.add('ready');
    const saved = await loadAutosave().catch(() => undefined);
    if (saved) {
      const when = new Date(saved.savedAt).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' });
      const recover = await confirmDialog({
        title: 'Hay un dibujo sin guardar',
        text: `Se guardó automáticamente en este navegador el ${when}. ¿Quieres recuperarlo? Si este equipo es compartido, puede ser de otra persona.`,
        ok: 'Recuperar',
        cancel: 'Descartar',
        image: saved.thumbnail || undefined,
      });
      if (recover) {
        await this.openProject(parseProject(saved.project), 'Dibujo recuperado.');
        return;
      }
      await clearAutosave().catch(() => undefined);
    }
    openDialog(byId<HTMLDialogElement>('dlg-new'));
  }

  /**
   * Runs document-changing work one at a time, in order. Without it, a slow «Nuevo» (IndexedDB)
   * could finish after a fast import and wipe the imported image.
   */
  private serial<T>(fn: () => Promise<T> | T): Promise<T> {
    const run = this.queue.then(fn, fn);
    this.queue = run.catch(() => undefined);
    return run;
  }

  // ---- Rendering --------------------------------------------------------------------------

  private render(): void {
    renderLayers(this.editor);
    renderInspector(this.editor, {
      resizeCanvas: (w, h) => void this.editor.resizeCanvas(w, h).then(() => this.fitIfNeeded()),
      setBackground: (c) => void this.setBackground(c ? { kind: 'color', color: c } : { kind: 'transparent' }),
    });
    byId<HTMLButtonElement>('workspace').classList.toggle('hand', this.tool === 'hand');
    (document.querySelector('[data-action="undo"]') as HTMLButtonElement).disabled = !this.editor.canUndo;
    (document.querySelector('[data-action="redo"]') as HTMLButtonElement).disabled = !this.editor.canRedo;
    byId('zoom-value').textContent = `${Math.round(this.editor.zoomLevel * 100)} %`;
    const frame = byId('canvas-frame');
    frame.style.width = `${this.editor.canvas.width}px`;
    frame.style.height = `${this.editor.canvas.height}px`;
    frame.classList.toggle('opaque', this.editor.currentBackground.kind !== 'transparent');
    document.title = `${this.dirty ? '• ' : ''}${this.title || 'Sin título'} · Tonga`;
    this.touch();
  }

  private get dirty(): boolean {
    return this.editor.revision !== this.savedRevision;
  }

  /** Schedules the autosave after a document change (stored only in this browser). */
  private touch(): void {
    if (this.editor.revision === this.autosavedRevision || !this.dirty) return;
    clearTimeout(this.autosaveTimer);
    this.autosaveTimer = window.setTimeout(() => void this.autosave(), AUTOSAVE_DELAY);
  }

  /** Saves the autosave now (before a reload to a new version, for example). */
  async flush(): Promise<void> {
    clearTimeout(this.autosaveTimer);
    if (this.dirty) await this.autosave();
  }

  private async autosave(): Promise<void> {
    try {
      this.autosavedRevision = this.editor.revision;
      const project = this.editor.toProject();
      const { width, height } = project.canvas;
      const thumbnail = this.editor.canvas.toDataURL({ format: 'png', multiplier: Math.min(1, 240 / Math.max(width, height)) / this.editor.zoomLevel });
      await saveAutosave({ project: JSON.stringify(project), savedAt: Date.now(), thumbnail });
    } catch (err) {
      console.warn('Autosave failed', err);
    }
  }

  // ---- Project ----------------------------------------------------------------------------

  private async openProject(project: ReturnType<typeof newProject>, message: string): Promise<void> {
    await this.editor.open(project);
    this.title = project.title;
    this.savedRevision = this.autosavedRevision = this.editor.revision;
    this.zoomFit();
    this.render();
    toast(message);
    announce(message);
  }

  private async newDrawing(form: HTMLFormElement): Promise<void> {
    const data = new FormData(form);
    const preset = String(data.get('preset'));
    let [w, h] = preset === 'custom' ? [Number(data.get('width')), Number(data.get('height'))] : preset.split('x').map(Number);
    w = Math.min(8192, Math.max(16, Math.round(w || 1123)));
    h = Math.min(8192, Math.max(16, Math.round(h || 794)));
    const bg: Background = data.get('bg') === 'color' ? { kind: 'color', color: String(data.get('bgcolor')) } : { kind: 'transparent' };
    const template = TEMPLATES.find((t) => t.kind === data.get('template'));
    await clearAutosave().catch(() => undefined);
    await this.openProject(
      template ? buildTemplate(template.kind, w, h, bg) : newProject(w, h, bg),
      template ? `Nuevo dibujo de ${w} × ${h} px con la plantilla «${template.label}».` : `Nuevo dibujo de ${w} × ${h} px.`,
    );
  }

  private async confirmDiscard(): Promise<boolean> {
    if (!this.dirty) return true;
    return confirmDialog({
      title: '¿Descartar los cambios?',
      text: 'El dibujo actual tiene cambios sin guardar. Puedes guardarlo antes con «Guardar».',
      ok: 'Descartar y continuar',
    });
  }

  private async save(): Promise<void> {
    try {
      const project = { ...this.editor.toProject(), title: this.title };
      const name = exportFileName(this.title || defaultFileName(), 'png').replace(/\.png$/, '.tonga');
      download(await toTongaFile(project), name);
      this.savedRevision = this.editor.revision;
      this.render();
      toast(`Proyecto guardado como «${name}».`);
    } catch (err) {
      this.fail(err);
    }
  }

  private async handleFile(file: File): Promise<void> {
    try {
      const result = await importFile(file, this.editor);
      if (result.kind === 'project') {
        if (!(await this.confirmDiscard())) return;
        await this.openProject(await importEmbeddedAssets(result.project), `Proyecto «${file.name}» abierto.`);
      } else if (result.kind === 'legacy-svg') {
        this.title = result.name;
        this.zoomFit();
        toast(`Dibujo de Tonga 1 «${file.name}» abierto.`);
      } else {
        toast(`«${result.name}» añadida al lienzo.`);
      }
    } catch (err) {
      this.fail(err);
    }
  }

  // ---- Library ----------------------------------------------------------------------------

  private async addFromLibrary(asset: CatalogAsset): Promise<void> {
    try {
      await this.editor.addImage(asset.file, asset.title);
      announce(`${asset.title} añadida al lienzo`);
    } catch (err) {
      this.fail(err, `No se pudo cargar «${asset.title}».`);
    }
  }

  private async backgroundFromLibrary(asset: CatalogAsset): Promise<void> {
    await this.setBackground({ kind: 'image', src: asset.file });
    announce(`${asset.title} es ahora el fondo`);
  }

  private async setBackground(bg: Background): Promise<void> {
    try {
      await this.editor.setBackground(bg);
    } catch (err) {
      this.fail(err, 'No se pudo cambiar el fondo.');
    }
  }

  // ---- Zoom -------------------------------------------------------------------------------

  private zoomFit(): void {
    const pad = 48;
    this.editor.setZoom(this.editor.fitZoom(this.workspace.clientWidth - pad, this.workspace.clientHeight - pad));
  }

  private fitIfNeeded(): void {
    const { width, height } = this.editor.size;
    const z = this.editor.zoomLevel;
    if (width * z > this.workspace.clientWidth || height * z > this.workspace.clientHeight) this.zoomFit();
  }

  private zoomStep(dir: 1 | -1): void {
    const z = this.editor.zoomLevel;
    const next = dir > 0 ? ZOOM_STEPS.find((s) => s > z + 0.001) : [...ZOOM_STEPS].reverse().find((s) => s < z - 0.001);
    if (next) this.editor.setZoom(next);
  }

  // ---- Tools ------------------------------------------------------------------------------

  private setTool(tool: Tool): void {
    this.tool = tool;
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-tool]')) b.setAttribute('aria-checked', String(b.dataset.tool === tool));
    this.editor.setDrawing(tool === 'draw');
    this.editor.canvas.selection = tool === 'select';
    this.editor.canvas.skipTargetFind = tool !== 'select';
    const names: Record<Tool, string> = { select: 'Seleccionar', hand: 'Mover la vista', draw: 'Dibujo libre' };
    announce(`Herramienta: ${names[tool]}`);
    this.render();
  }

  private bindTools(): void {
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-tool]')) b.addEventListener('click', () => this.setTool(b.dataset.tool as Tool));
    for (const b of document.querySelectorAll<HTMLButtonElement>('[data-add]')) {
      b.addEventListener('click', () => {
        this.setTool('select');
        const kind = b.dataset.add as 'text' | ShapeKind;
        if (kind === 'text') this.editor.addText();
        else this.editor.addShape(kind);
        announce(`${b.getAttribute('aria-label')?.replace('Añadir ', '') ?? ''} añadido en el centro del lienzo`);
      });
    }
  }

  private bindHandTool(): void {
    let start: { x: number; y: number; left: number; top: number } | null = null;
    let space = false;
    const handActive = () => this.tool === 'hand' || space;
    this.workspace.addEventListener('pointerdown', (e) => {
      if (!handActive()) return;
      start = { x: e.clientX, y: e.clientY, left: this.workspace.scrollLeft, top: this.workspace.scrollTop };
      this.workspace.setPointerCapture(e.pointerId);
    });
    this.workspace.addEventListener('pointermove', (e) => {
      if (!start) return;
      this.workspace.scrollLeft = start.left - (e.clientX - start.x);
      this.workspace.scrollTop = start.top - (e.clientY - start.y);
    });
    this.workspace.addEventListener('pointerup', () => (start = null));
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && !space && e.target === document.body) {
        space = true;
        this.editor.canvas.skipTargetFind = true;
        this.workspace.classList.add('hand');
        e.preventDefault();
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.code === 'Space' && space) {
        space = false;
        this.editor.canvas.skipTargetFind = this.tool !== 'select';
        this.workspace.classList.toggle('hand', this.tool === 'hand');
      }
    });
  }

  // ---- Actions & dialogs --------------------------------------------------------------------

  private bindActions(): void {
    const actions: Record<string, () => void | Promise<void>> = {
      new: async () => {
        if (await this.confirmDiscard()) openDialog(byId<HTMLDialogElement>('dlg-new'));
      },
      open: () => byId<HTMLInputElement>('file-project').click(),
      'open-from-new': () => {
        byId<HTMLDialogElement>('dlg-new').close();
        byId<HTMLInputElement>('file-project').click();
      },
      save: () => this.serial(() => this.save()),
      undo: () => this.serial(() => this.editor.undo()),
      redo: () => this.serial(() => this.editor.redo()),
      'zoom-in': () => this.zoomStep(1),
      'zoom-out': () => this.zoomStep(-1),
      'zoom-100': () => this.editor.setZoom(1),
      'zoom-fit': () => this.zoomFit(),
      theme: () => this.toggleTheme(),
      help: () => openDialog(byId<HTMLDialogElement>('dlg-help')),
      about: () => openDialog(byId<HTMLDialogElement>('dlg-about')),
      licences: () => openDialog(byId<HTMLDialogElement>('dlg-licences')),
      export: () => this.openExport(),
      import: () => byId<HTMLInputElement>('file-image').click(),
      library: () => this.library.open(),
      panel: () => this.togglePanel(),
    };
    // On phones the project actions live in the «Más acciones» menu: it closes once one is chosen.
    const more = byId('more-menu');
    more.addEventListener('click', (e) => {
      if ((e.target as Element).closest('[data-action]')) more.hidePopover();
    });
    // Focus inside the menu, so its keys (Escape) are not taken as canvas shortcuts.
    more.addEventListener('toggle', (e) => {
      if ((e as ToggleEvent).newState === 'open') more.querySelector<HTMLElement>('button')?.focus();
    });
    document.addEventListener('click', (e) => {
      const el = (e.target as Element).closest<HTMLElement>('[data-action]');
      const fn = el && actions[el.dataset.action ?? ''];
      if (fn) void Promise.resolve(fn()).catch((err) => this.fail(err));
    });
    for (const id of ['file-image', 'file-project']) {
      const input = byId<HTMLInputElement>(id);
      input.addEventListener('change', () => {
        const file = input.files?.[0];
        input.value = '';
        if (file) void this.serial(() => this.handleFile(file));
      });
    }
    this.syncThemeButton();
  }

  private bindDialogs(): void {
    for (const dlg of document.querySelectorAll<HTMLDialogElement>('dialog')) {
      dlg.querySelectorAll('[data-close]').forEach((b) => b.addEventListener('click', () => dlg.close()));
    }
    const newDlg = byId<HTMLDialogElement>('dlg-new');
    // React on submit, not on 'close': the close event arrives a task later, after other input.
    const newForm = newDlg.querySelector('form') as HTMLFormElement;
    newForm.addEventListener('submit', (e) => {
      if (e.submitter instanceof HTMLButtonElement && e.submitter.value === 'create') void this.serial(() => this.newDrawing(newForm));
    });
    newDlg.querySelector('select[name="template"]')?.append(...TEMPLATES.map((t) => {
      const option = document.createElement('option');
      option.value = t.kind;
      option.textContent = t.label;
      return option;
    }));
    newDlg.querySelector('input[name="bgcolor"]')?.addEventListener('input', () => {
      (newDlg.querySelector('input[name="bg"][value="color"]') as HTMLInputElement).checked = true;
    });
    const exportDlg = byId<HTMLDialogElement>('dlg-export');
    const form = exportDlg.querySelector('form') as HTMLFormElement;
    form.addEventListener('change', () => this.updateExportForm(form));
    form.addEventListener('submit', (e) => {
      if (e.submitter instanceof HTMLButtonElement && e.submitter.value === 'export') void this.serial(() => this.doExport(form));
    });
  }

  private openExport(): void {
    const form = byId<HTMLDialogElement>('dlg-export').querySelector('form') as HTMLFormElement;
    (form.elements.namedItem('filename') as HTMLInputElement).value = this.title || defaultFileName();
    (form.elements.namedItem('transparent') as HTMLInputElement).checked = this.editor.currentBackground.kind === 'transparent';
    this.updateExportForm(form);
    openDialog(byId<HTMLDialogElement>('dlg-export'));
  }

  private updateExportForm(form: HTMLFormElement): void {
    const data = new FormData(form);
    const format = String(data.get('format')) as ExportFormat;
    for (const el of form.querySelectorAll<HTMLElement>('[data-for]')) el.hidden = !(el.dataset.for ?? '').split(' ').includes(format);
    const { width, height } = this.editor.size;
    const scale = Number(data.get('scale'));
    byId('export-summary').textContent =
      format === 'pdf' ? 'Una página A4 con el dibujo ajustado (orientación según el lienzo).'
        : format === 'elpx' ? 'Proyecto de eXeLearning: una página con el dibujo en una diapositiva editable.'
        : format === 'svg' ? `Vectorial, ${width} × ${height} px, con las imágenes incluidas.`
          : `${Math.round(width * scale)} × ${Math.round(height * scale)} px.`;
  }

  private async doExport(form: HTMLFormElement): Promise<void> {
    const data = new FormData(form);
    const format = String(data.get('format')) as ExportFormat;
    const filename = exportFileName(String(data.get('filename')), format);
    try {
      this.editor.canvas.discardActiveObject();
      const blob = await exportProject(
        this.editor.toProject(),
        { format, scale: Number(data.get('scale')) || 1, quality: Number(data.get('quality')) || 0.9, transparent: data.get('transparent') === 'on' },
        resolveSource,
        resolveToDataUrl,
      );
      download(blob, filename);
      toast(`Descargado «${filename}».`);
    } catch (err) {
      this.fail(err, 'No se pudo exportar el dibujo.');
    }
  }

  /**
   * Small screens: the panel folds down to its tabs, always on screen above the tool bar.
   * A tab unfolds it; the open tab, «Ocultar panel» or Escape fold it again.
   */
  private togglePanel(force?: boolean): void {
    const panel = byId('sidepanel');
    const open = panel.classList.toggle('open', force);
    if (!open && panel.contains(document.activeElement)) panel.querySelector<HTMLElement>('[role="tab"][aria-selected="true"]')?.focus();
  }

  // ---- Context menu -------------------------------------------------------------------------

  private menuEntries(): MenuEntry[] {
    const e = this.editor;
    const selection = e.selected();
    const none = selection.length === 0;
    const mod = /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘' : 'Ctrl+';
    const isGroup = e.inspect()?.type === 'group';
    const run = (fn: () => void | Promise<void>) => () => void this.serial(fn).catch((err) => this.fail(err));
    return [
      { label: 'Cortar', icon: 'scissors', shortcut: `${mod}X`, disabled: none, run: run(() => (this.copied(), e.cut())) },
      { label: 'Copiar', icon: 'copy', shortcut: `${mod}C`, disabled: none, run: run(() => (this.copied(), e.copy())) },
      { label: 'Pegar', icon: 'clipboardPaste', shortcut: `${mod}V`, disabled: !e.hasClipboard, run: run(() => e.paste()) },
      { label: 'Duplicar', icon: 'copyPlus', shortcut: `${mod}D`, disabled: none, run: run(() => e.duplicate()) },
      'separator',
      { label: 'Traer al frente', icon: 'chevronsUp', disabled: none, run: run(() => e.order('front')) },
      { label: 'Subir una capa', icon: 'arrowUp', disabled: none, run: run(() => e.order('forward')) },
      { label: 'Bajar una capa', icon: 'arrowDown', disabled: none, run: run(() => e.order('backward')) },
      { label: 'Enviar al fondo', icon: 'chevronsDown', disabled: none, run: run(() => e.order('back')) },
      'separator',
      isGroup
        ? { label: 'Desagrupar', icon: 'ungroup', run: run(() => e.ungroup()) }
        : { label: 'Agrupar', icon: 'group', disabled: selection.length < 2, run: run(() => e.group()) },
      { label: 'Bloquear', icon: 'lock', disabled: none, run: run(() => selection.forEach((o) => e.setLocked(o.id ?? '', true))) },
      { label: 'Seleccionar todo', icon: 'mousePointer2', shortcut: `${mod}A`, run: run(() => e.selectAll()) },
      'separator',
      { label: 'Borrar', icon: 'trash2', shortcut: 'Supr', danger: true, disabled: none, run: run(() => e.removeSelected()) },
    ];
  }

  /** Menu key / Shift+F10: open the menu over the selection (or the canvas centre). */
  private openMenuFromKeyboard(): void {
    const rect = this.editor.canvas.getElement().getBoundingClientRect();
    const active = this.editor.canvas.getActiveObject();
    const zoom = this.editor.zoomLevel;
    const p = active ? active.getCenterPoint() : { x: this.editor.size.width / 2, y: this.editor.size.height / 2 };
    this.menu.open(rect.left + p.x * zoom, rect.top + p.y * zoom, this.menuEntries());
  }

  // ---- Keyboard ---------------------------------------------------------------------------

  private bindKeyboard(): void {
    document.addEventListener('keydown', (e) => {
      if (document.querySelector('dialog[open]')) return;
      if (e.target instanceof Element && e.target.closest('#context-menu')) return; // the menu handles its own keys
      if (e.key === 'Escape' && byId('sidepanel').classList.contains('open')) {
        this.togglePanel(false);
        return;
      }
      const cmd = commandFor(e, this.editor.isEditingText());
      if (!cmd) return;
      // Nothing copied here since the window got focus: let the browser's paste event bring
      // what was copied elsewhere (an image, some text). See pasteFromSystem.
      if (cmd === 'paste' && !this.copiedHere) return;
      e.preventDefault();
      void this.serial(() => this.run(cmd)).catch((err) => this.fail(err));
    });
  }

  private async run(cmd: Command): Promise<void> {
    const e = this.editor;
    if (typeof cmd === 'object') return e.nudge(...cmd.nudge);
    const map: Record<string, () => void | Promise<void>> = {
      undo: async () => {
        await e.undo();
        announce('Deshecho');
      },
      redo: async () => {
        await e.redo();
        announce('Rehecho');
      },
      cut: () => {
        const n = e.selected().length;
        if (n) this.copied();
        e.cut();
        if (n) announce(n === 1 ? 'Objeto cortado' : `${n} objetos cortados`);
      },
      copy: () => {
        if (e.selected().length) this.copied();
        e.copy();
      },
      'context-menu': () => this.openMenuFromKeyboard(),
      paste: () => e.paste(),
      duplicate: () => e.duplicate(),
      delete: () => {
        const n = e.selected().length;
        e.removeSelected();
        if (n) announce(n === 1 ? 'Objeto borrado' : `${n} objetos borrados`);
      },
      deselect: () => {
        e.canvas.discardActiveObject();
        e.canvas.requestRenderAll();
        this.render();
      },
      'select-all': () => e.selectAll(),
      'zoom-in': () => this.zoomStep(1),
      'zoom-out': () => this.zoomStep(-1),
      'zoom-fit': () => this.zoomFit(),
      'zoom-100': () => e.setZoom(1),
      'tool-select': () => this.setTool('select'),
      'tool-hand': () => this.setTool('hand'),
      'tool-draw': () => this.setTool('draw'),
      'add-text': () => e.addText(),
      'add-rect': () => e.addShape('rect'),
      'add-ellipse': () => e.addShape('ellipse'),
      'add-line': () => e.addShape('line'),
      import: () => byId<HTMLInputElement>('file-image').click(),
      library: () => this.library.open(),
    };
    await map[cmd]?.();
  }

  private bindDropAndPaste(): void {
    this.workspace.addEventListener('dragover', (e) => e.preventDefault());
    this.workspace.addEventListener('drop', (e) => {
      e.preventDefault();
      const file = e.dataTransfer?.files[0];
      if (file) void this.serial(() => this.handleFile(file));
    });
    window.addEventListener('blur', () => (this.copiedHere = false));
    document.addEventListener('paste', (e) => this.pasteFromSystem(e));
  }

  /** Objects copied in Tonga: Ctrl+V pastes them until the user goes to another window. */
  private copied(): void {
    this.copiedHere = true;
    // Tonga's copy replaces whatever the system clipboard held, as any other app's would.
    void navigator.clipboard?.writeText('').catch(() => undefined);
  }

  /** An image or text copied in another app becomes a new layer; otherwise Tonga's own clipboard. */
  private pasteFromSystem(e: ClipboardEvent): void {
    if (document.querySelector('dialog[open]') || isTyping(e.target) || this.editor.isEditingText()) return;
    e.preventDefault();
    const file = [...(e.clipboardData?.files ?? [])].find((f) => f.type.startsWith('image/'));
    const text = e.clipboardData?.getData('text/plain').trim() ?? '';
    if (file) {
      void this.serial(() => this.handleFile(file));
    } else if (text) {
      this.setTool('select');
      this.editor.addText(text.slice(0, 5000));
      announce('Texto pegado en el centro del lienzo');
    } else {
      void this.serial(() => this.editor.paste()).catch((err) => this.fail(err));
    }
  }

  // ---- Theme ------------------------------------------------------------------------------

  /** Two states: follow the system, or pin the opposite of what the system uses now. */
  private toggleTheme(): void {
    const systemDark = matchMedia('(prefers-color-scheme: dark)').matches;
    const pinned = getPref('color-scheme');
    const next = pinned ? null : systemDark ? 'light' : 'dark';
    setPref('color-scheme', next);
    (document.querySelector('meta[name="color-scheme"]') as HTMLMetaElement).content = next ?? 'light dark';
    if (next) document.documentElement.dataset.theme = next;
    else delete document.documentElement.dataset.theme;
    this.syncThemeButton();
  }

  private syncThemeButton(): void {
    for (const b of document.querySelectorAll('[data-action="theme"]')) b.setAttribute('aria-pressed', String(!!getPref('color-scheme')));
  }

  // ---- Errors -----------------------------------------------------------------------------

  fail(err: unknown, fallback = 'Algo ha ido mal.'): void {
    // Expected problems (a bad file, a missing image) are warnings; anything else is a bug.
    if (err instanceof UserError) console.warn(err.message);
    else console.error(err);
    const message = err instanceof UserError ? err.message : fallback;
    toast(message, 'error');
    announce(message);
  }
}
