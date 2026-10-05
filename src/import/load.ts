// Turns an imported file into editor content: raster images, SVG (generic or Tonga 1.x) and projects.
import { FabricImage, loadSVGFromString, util, type FabricObject } from 'fabric';
import type { Editor } from '../canvas/editor';
import { putAsset } from '../persistence/store';
import { newProject, parseProject, type Project } from '../project/schema';
import { findSlides, type SlideChoice } from './exe';
import { ImportError, sniff } from './sniff';
import { openZip, type ZipArchive } from './unzip';
import { checkImageSize, sanitizeSvg } from './svg';

const RASTER_MIME = { png: 'image/png', jpeg: 'image/jpeg', webp: 'image/webp' } as const;

export type ImportResult =
  | { kind: 'image' | 'svg' | 'legacy-svg'; name: string }
  | { kind: 'project'; project: Project }
  | { kind: 'slides'; name: string; slides: SlideChoice[]; files: ZipArchive };

async function dataUrlToAsset(dataUrl: string): Promise<string> {
  return putAsset(await (await fetch(dataUrl)).blob());
}

/** Moves embedded data: images into the asset store so history and autosave stay small. */
async function internImages(objects: FabricObject[]): Promise<void> {
  for (const o of objects) {
    if (o instanceof FabricImage) {
      const src = o.getSrc();
      if (src.startsWith('data:')) o.set({ assetSrc: await dataUrlToAsset(src) });
    }
  }
}

const baseName = (name: string) => name.replace(/\.[^.]+$/, '').slice(0, 80) || 'Imagen';

export async function importFile(file: File, editor: Editor): Promise<ImportResult> {
  const kind = sniff(new Uint8Array(await file.slice(0, 4096).arrayBuffer()), file.name, file.size);

  if (kind === 'exe') {
    // Not read whole: an eXeLearning project can weigh hundreds of MB.
    const files = await openZip(file);
    const slides = await findSlides(files);
    if (!slides.length) throw new ImportError('Este fichero de eXeLearning no tiene ninguna diapositiva (iDevice «Slide») que abrir.');
    return { kind: 'slides', name: baseName(file.name), slides, files };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  if (kind === 'tonga') return { kind: 'project', project: parseProject(new TextDecoder().decode(bytes)) };

  if (kind === 'svg') {
    const clean = sanitizeSvg(new TextDecoder().decode(bytes));
    const { objects, options } = await loadSVGFromString(clean.svg);
    const parsed = objects.filter((o): o is FabricObject => !!o);
    await internImages(parsed);
    if (clean.legacyBackground) {
      // A drawing exported by Tonga 1.x: reopen it as a project with its background (RULE-046).
      const project = newProject(clean.width, clean.height, { kind: 'image', src: await dataUrlToAsset(clean.legacyBackground) });
      await editor.open(project);
      editor.addObjects(parsed);
      return { kind: 'legacy-svg', name: baseName(file.name) };
    }
    if (!parsed.length) throw new ImportError('El SVG no contiene nada que se pueda dibujar.');
    const group = util.groupSVGElements(parsed, options);
    const { width, height } = editor.size;
    group.scale(Math.min(1, (width * 0.8) / (group.width || 1), (height * 0.8) / (group.height || 1)));
    group.set({ left: width / 2, top: height / 2 });
    editor.addObjects([group], baseName(file.name));
    return { kind: 'svg', name: baseName(file.name) };
  }

  const blob = new Blob([bytes], { type: RASTER_MIME[kind] });
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob);
  } catch {
    throw new ImportError('La imagen está dañada o el navegador no puede leerla.');
  }
  try {
    checkImageSize(bitmap.width, bitmap.height);
  } finally {
    bitmap.close();
  }
  await editor.addImage(await putAsset(blob), baseName(file.name));
  return { kind: 'image', name: baseName(file.name) };
}
