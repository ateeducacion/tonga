// Exports a project as an eXeLearning package (.elpx): one page with one Slide iDevice, whose
// editable scene is Fabric JSON, so the drawing stays editable in eXeLearning.
// Format: https://github.com/exelearning/exelearning/blob/main/doc/elpx-format.md
// Slide payload: public/files/perm/idevices/base/slide/src/serializer.ts in the same repository.
import { FabricImage, Group, type FabricObject, type StaticCanvas } from 'fabric';
import { renderOffscreen, type SourceResolver } from '../canvas/document';
import { embedFonts, usedFonts } from '../canvas/fonts';
import type { Project } from '../project/schema';
import { zip } from './zip';

// content.dtd and the "base" theme, copied from eXeLearning (vendor/exelearning/, see THIRD_PARTY_NOTICES.md).
// Text files are imported raw (as URLs, Vite would minify the CSS and rewrite its url()s), and
// lazily, so they only load on export; images are emitted untouched and fetched.
const TEXT = import.meta.glob<string>('/vendor/exelearning/**/*.{css,js,xml,dtd}', { query: '?raw', import: 'default' });
const BINARY = import.meta.glob<string>('/vendor/exelearning/**/*.{png,gif}', { query: '?url', import: 'default', eager: true });

// Slide iDevice limits (constants.ts): larger or smaller canvases are scaled to fit.
const SLIDE = { minW: 400, maxW: 1920, minH: 200, maxH: 1200 };
const SCREENSHOT = { width: 1280, height: 720 };
const RESOURCES = 'content/resources/';
const CONTEXT = '{{context_path}}/';

export type StaticLoader = () => Promise<Record<string, Uint8Array>>;

/** Scale factor that fits a canvas inside the Slide iDevice limits (1 when it already fits). */
export function slideScale(width: number, height: number): number {
  const down = Math.min(1, SLIDE.maxW / width, SLIDE.maxH / height);
  const up = Math.max(1, SLIDE.minW / width, SLIDE.minH / height);
  return down < 1 ? down : Math.min(up, SLIDE.maxW / width, SLIDE.maxH / height);
}

/** eXeLearning identifier: YYYYMMDDHHmmss + 6 characters from [A-Z0-9]. */
export function odeId(now = new Date()): string {
  const p = (v: number) => String(v).padStart(2, '0');
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const random = Array.from(crypto.getRandomValues(new Uint8Array(6)), (b) => chars[b % chars.length]).join('');
  return `${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}${random}`;
}

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const cdata = (s: string) => `<![CDATA[${s.replace(/]]>/g, ']]]]><![CDATA[>')}]]>`;

const hasImage = (o: FabricObject): boolean => o instanceof FabricImage || (o instanceof Group && o.getObjects().some(hasImage));

/** The Slide editor only resolves top-level images: groups holding images are ungrouped (nested too). */
function ungroupImages(canvas: StaticCanvas): void {
  for (let i = 0; i < canvas.getObjects().length; i++) {
    const obj = canvas.item(i);
    if (obj instanceof Group && hasImage(obj)) {
      canvas.remove(obj);
      canvas.insertAt(i, ...obj.removeAll()); // children come back in canvas coordinates
      i--;
    }
  }
}

export function dataUrlBytes(url: string): { bytes: Uint8Array; ext: string } {
  const m = /^data:image\/(png|jpeg|webp|svg\+xml)(;base64)?,(.*)$/s.exec(url);
  if (!m) throw new Error('Formato de imagen no admitido.');
  const [, type, base64, body] = m as unknown as [string, string, string | undefined, string];
  const bytes = base64 ? Uint8Array.from(atob(body), (c) => c.charCodeAt(0)) : new TextEncoder().encode(decodeURIComponent(body));
  return { bytes, ext: type === 'jpeg' ? 'jpg' : type === 'svg+xml' ? 'svg' : type };
}

function stripTonga(o: Record<string, unknown>): void {
  delete o.id;
  delete o.name;
  delete o.assetSrc;
  if (Array.isArray(o.objects)) for (const c of o.objects) stripTonga(c as Record<string, unknown>);
}

function canvasPng(el: HTMLCanvasElement): Promise<Uint8Array> {
  return new Promise((resolve, reject) =>
    el.toBlob((b) => (b ? b.arrayBuffer().then((a) => resolve(new Uint8Array(a)), reject) : reject(new Error('El navegador no pudo generar la imagen.'))), 'image/png'),
  );
}

/** 1280×720 project thumbnail: the drawing fitted and centred on its background colour. */
function screenshot(canvas: StaticCanvas, background: string): Promise<Uint8Array> {
  const { width, height } = SCREENSHOT;
  const scale = Math.min(width / canvas.width, height / canvas.height);
  const el = document.createElement('canvas');
  el.width = width;
  el.height = height;
  const ctx = el.getContext('2d') as CanvasRenderingContext2D;
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  const w = canvas.width * scale;
  const h = canvas.height * scale;
  ctx.drawImage(canvas.toCanvasElement(scale), (width - w) / 2, (height - h) / 2, w, h);
  return canvasPng(el);
}

async function fetchStatic(): Promise<Record<string, Uint8Array>> {
  const enc = new TextEncoder();
  const entries = await Promise.all([
    ...Object.entries(TEXT).map(async ([path, load]) => [path, enc.encode(await load())] as const),
    ...Object.entries(BINARY).map(async ([path, url]) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`No se pudo cargar ${path}.`);
      return [path, new Uint8Array(await res.arrayBuffer())] as const;
    }),
  ]);
  return Object.fromEntries(entries.map(([path, bytes]) => [path.replace('/vendor/exelearning/', ''), bytes]));
}

interface Slide {
  width: number;
  height: number;
  background: string;
  scene: Record<string, unknown>;
  svg: string;
  resources: Record<string, Uint8Array>;
  screenshot: Uint8Array;
}

/** Renders the project into the Slide iDevice's terms: fitted size, opaque colour, top-level images. */
async function toSlide(project: Project, resolve: SourceResolver): Promise<Slide> {
  const bg = project.canvas.background;
  const background = bg.kind === 'color' ? bg.color.toLowerCase() : '#ffffff';
  const k = slideScale(project.canvas.width, project.canvas.height);
  const width = Math.round(project.canvas.width * k);
  const height = Math.round(project.canvas.height * k);
  const visible = { ...project, layers: project.layers.filter((l) => l.visible) };
  const canvas = await renderOffscreen(visible, resolve);
  try {
    // A background image becomes the bottom object: the Slide iDevice only has a background colour.
    if (canvas.backgroundImage instanceof FabricImage && bg.kind === 'image') {
      const img = canvas.backgroundImage;
      img.assetSrc = bg.src;
      canvas.backgroundImage = undefined;
      canvas.insertAt(0, img);
    }
    canvas.backgroundColor = background;
    ungroupImages(canvas);
    // Positions are object centres, so scaling about the origin is a plain multiplication.
    for (const o of canvas.getObjects()) {
      o.set({ left: o.left * k, top: o.top * k, scaleX: o.scaleX * k, scaleY: o.scaleY * k });
      o.setCoords();
    }
    canvas.setDimensions({ width, height });
    canvas.renderAll();

    const images = canvas.getObjects().filter((o): o is FabricImage => o instanceof FabricImage);
    const resources: Record<string, Uint8Array> = {};
    const names = new Map<string, string>();
    // writeProject gives every image its canonical source (assetSrc), nested ones too.
    const source = (img: FabricImage) => img.assetSrc as string;
    for (const img of images) {
      const key = source(img);
      if (names.has(key)) continue;
      const { bytes, ext } = dataUrlBytes(await resolve(key));
      const name = `imagen-${names.size + 1}.${ext}`;
      names.set(key, name);
      resources[RESOURCES + name] = bytes;
    }
    const ref = (img: FabricImage) => CONTEXT + RESOURCES + names.get(source(img));

    const scene = canvas.toObject() as { objects: Record<string, unknown>[] } & Record<string, unknown>;
    scene.objects.forEach((o, i) => {
      const obj = canvas.item(i);
      if (obj instanceof FabricImage) o.src = ref(obj);
      stripTonga(o);
    });

    // Static preview: point unfiltered images at the package file (filtered ones keep their
    // rendered pixels inline). Only when every <image> is a top-level image, in z-order.
    let svg = canvas.toSVG({ suppressPreamble: true, width: `${width}`, height: `${height}`, viewBox: { x: 0, y: 0, width, height } });
    const tags = svg.match(/<image\b/g)?.length ?? 0;
    if (tags === images.length) {
      let i = 0;
      svg = svg.replace(/<image\b([^>]*?)\s(?:xlink:)?href="[^"]*"/g, (match, attrs: string) => {
        const img = images[i++] as FabricImage;
        return img.filters.length ? match : `<image${attrs} xlink:href="${ref(img)}"`;
      });
    }
    svg = await embedFonts(svg, usedFonts(visible.layers.map((l) => l.object)));
    return { width, height, background, scene, svg, resources, screenshot: await screenshot(canvas, background) };
  } finally {
    await canvas.dispose();
  }
}

/** content.xml (ODE 2.0) with one page, one block and one Slide iDevice. */
export function contentXml(slide: Pick<Slide, 'width' | 'height' | 'background' | 'scene' | 'svg'>, title: string, now = new Date()): string {
  const [project, version, page, block, idevice] = Array.from({ length: 5 }, () => odeId(now));
  const name = xml(title || 'Dibujo');
  const payload = {
    version: 3, engine: 'fabric', ideviceId: idevice, width: slide.width, height: slide.height,
    background: slide.background, fabric: slide.scene, svg: slide.svg,
  };
  // Same markup as the iDevice's renderView(): responsive SVG in a box with the slide's ratio.
  const responsive = slide.svg.replace(/(<svg[^>]*)\swidth="[^"]*"/, '$1 width="100%"').replace(/(<svg[^>]*)\sheight="[^"]*"/, '$1');
  const html = `<section class="slide-export"><div class="slide-export-fabric" style="max-width:${slide.width}px;aspect-ratio:${slide.width}/${slide.height}">${responsive}</div></section>`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE ode SYSTEM "content.dtd">
<ode xmlns="http://www.intef.es/xsd/ode" version="2.0">
<userPreferences><userPreference><key>theme</key><value>base</value></userPreference></userPreferences>
<odeResources>
<odeResource><key>odeId</key><value>${project}</value></odeResource>
<odeResource><key>odeVersionId</key><value>${version}</value></odeResource>
<odeResource><key>exe_version</key><value>3.0</value></odeResource>
</odeResources>
<odeProperties>
<odeProperty><key>pp_title</key><value>${name}</value></odeProperty>
<odeProperty><key>pp_lang</key><value>es</value></odeProperty>
</odeProperties>
<odeNavStructures>
<odeNavStructure>
<odePageId>${page}</odePageId>
<odeParentPageId></odeParentPageId>
<pageName>${name}</pageName>
<odeNavStructureOrder>1</odeNavStructureOrder>
<odeNavStructureProperties><odeNavStructureProperty><key>titlePage</key><value>${name}</value></odeNavStructureProperty></odeNavStructureProperties>
<odePagStructures>
<odePagStructure>
<odePageId>${page}</odePageId>
<odeBlockId>${block}</odeBlockId>
<blockName>${name}</blockName>
<iconName></iconName>
<odePagStructureOrder>1</odePagStructureOrder>
<odePagStructureProperties></odePagStructureProperties>
<odeComponents>
<odeComponent>
<odePageId>${page}</odePageId>
<odeBlockId>${block}</odeBlockId>
<odeIdeviceId>${idevice}</odeIdeviceId>
<odeIdeviceTypeName>slide</odeIdeviceTypeName>
<htmlView>${cdata(html)}</htmlView>
<jsonProperties>${cdata(JSON.stringify(payload))}</jsonProperties>
<odeComponentsOrder>1</odeComponentsOrder>
<odeComponentsProperties><odeComponentsProperty><key>visibility</key><value>true</value></odeComponentsProperty></odeComponentsProperties>
</odeComponent>
</odeComponents>
</odePagStructure>
</odePagStructures>
</odeNavStructure>
</odeNavStructures>
</ode>
`;
}

/**
 * @param resolve turns canonical sources into data: URLs (image bytes go into the package)
 * @param loadStatic content.dtd and theme/ files; fetched from the build by default
 */
export async function exportElpx(project: Project, resolve: SourceResolver, loadStatic: StaticLoader = fetchStatic): Promise<Blob> {
  const [slide, files] = await Promise.all([toSlide(project, resolve), loadStatic()]);
  const theme = Object.fromEntries(Object.entries(files).filter(([p]) => p.startsWith('theme/')));
  const dtd = files['content.dtd'];
  if (!dtd || !theme['theme/config.xml']) throw new Error('Faltan ficheros de eXeLearning en esta instalación.');
  const archive = zip({
    'content.xml': contentXml(slide, project.title),
    'content.dtd': dtd,
    'screenshot.png': slide.screenshot,
    ...slide.resources,
    ...theme,
  });
  return new Blob([archive as BlobPart], { type: 'application/zip' });
}
