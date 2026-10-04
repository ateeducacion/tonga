import { describe, expect, it } from 'vitest';
import { FabricImage, StaticCanvas } from 'fabric';
import { applyAdjustments, applyCrop, buildFilters, clearBackground, NO_ADJUSTMENTS, readAdjustments, readCrop } from '../src/canvas/image';
import { readProject, writeProject } from '../src/canvas/document';
import { Editor } from '../src/canvas/editor';
import { newProject } from '../src/project/schema';

function photo(width = 200, height = 100): FabricImage {
  const el = document.createElement('canvas');
  el.width = width;
  el.height = height;
  return new FabricImage(el, { left: 300, top: 200 });
}

describe('image adjustments', () => {
  it('builds no filter for an untouched image', () => {
    expect(buildFilters(NO_ADJUSTMENTS)).toEqual([]);
  });

  it('round-trips every adjustment through the filters', () => {
    const img = photo();
    const a = { grayscale: true, sepia: true, invert: true, brightness: 25, contrast: -40, saturation: 60, blur: 30 };
    applyAdjustments(img, a);
    expect(img.filters.map((f) => f.type)).toEqual(['Grayscale', 'Sepia', 'Invert', 'Brightness', 'Contrast', 'Saturation', 'Blur']);
    expect(readAdjustments(img)).toEqual(a);
  });

  it('clamps out-of-range values', () => {
    const img = photo();
    applyAdjustments(img, { ...NO_ADJUSTMENTS, brightness: 500, blur: -3 });
    expect(readAdjustments(img)).toMatchObject({ brightness: 100, blur: 0 });
  });

  it('survives saving and reopening the project', async () => {
    const a = new StaticCanvas(undefined, { width: 600, height: 400 });
    const img = photo();
    img.set({ id: 'i1', name: 'Foto', assetSrc: (img.getElement() as HTMLCanvasElement).toDataURL() });
    applyAdjustments(img, { ...NO_ADJUSTMENTS, grayscale: true, contrast: 30 });
    applyCrop(img, { left: 10, top: 0, right: 10, bottom: 20 });
    a.add(img);
    const project = readProject(a, { width: 600, height: 400 }, { kind: 'transparent' });
    expect(project.layers[0]?.object).toMatchObject({ cropX: 20, width: 160, height: 80, filters: [{ type: 'Grayscale' }, { type: 'Contrast' }] });
    const b = new StaticCanvas(undefined, { width: 600, height: 400 });
    await writeProject(b, project, (s) => s);
    const back = b.getObjects()[0] as FabricImage;
    expect(readAdjustments(back)).toMatchObject({ grayscale: true, contrast: 30 });
    expect(readCrop(back)).toEqual({ left: 10, top: 0, right: 10, bottom: 20 });
  });
});

describe('image crop', () => {
  it('hides a percentage of each side without moving the content that stays', () => {
    const img = photo(200, 100);
    img.scale(2);
    const leftEdgeOfContent = img.getPointByOrigin('left', 'top').x + 50 * 2; // pixel x=50 of the source
    applyCrop(img, { left: 25, top: 10, right: 25, bottom: 10 });
    expect(img).toMatchObject({ cropX: 50, cropY: 10, width: 100, height: 80 });
    expect(img.getPointByOrigin('left', 'top').x).toBeCloseTo(leftEdgeOfContent, 6);
    expect(readCrop(img)).toEqual({ left: 25, top: 10, right: 25, bottom: 10 });
  });

  it('never crops the whole image away', () => {
    const img = photo();
    applyCrop(img, { left: 90, top: 0, right: 90, bottom: 0 });
    expect(img.width).toBeGreaterThan(0);
    expect(readCrop(img).left + readCrop(img).right).toBeLessThanOrEqual(95);
  });
});

describe('clearBackground', () => {
  /** RGBA pixels from rows of characters: W white, w near-white, R red, . transparent. */
  function pixels(rows: string[]): { data: Uint8ClampedArray; width: number; height: number } {
    const colours: Record<string, number[]> = { W: [255, 255, 255, 255], w: [240, 245, 238, 255], R: [200, 0, 0, 255], '.': [0, 0, 0, 0] };
    const data = new Uint8ClampedArray(rows.flatMap((r) => [...r].flatMap((c) => colours[c] ?? [])));
    return { data, width: rows[0]?.length ?? 0, height: rows.length };
  }
  const alpha = (data: Uint8ClampedArray) => Array.from({ length: data.length / 4 }, (_, i) => (data[i * 4 + 3] ? '#' : '.')).join('');

  it('clears the frame touching the border, near-white included, and keeps the enclosed white', () => {
    const { data, width, height } = pixels(['WWWWW', 'wRRRW', 'WRWRW', 'WRRRw', 'WWWWW']);
    expect(clearBackground(data, width, height)).toBe(16);
    expect(alpha(data)).toBe('......###..###..###......');
  });

  it('flows through already transparent pixels', () => {
    const { data, width, height } = pixels(['..WWW', '.RRRW', 'WRRRW', 'WWWWW']);
    expect(clearBackground(data, width, height)).toBe(11);
    expect(alpha(data)).toBe('......###..###......');
  });

  it('leaves an image without a uniform border untouched', () => {
    const { data, width, height } = pixels(['RWRWR', 'WRRRW', 'RWRWR']);
    const before = data.slice();
    expect(clearBackground(data, width, height)).toBe(0);
    expect(data).toEqual(before);
  });

  it('has nothing to clear when the border is already transparent', () => {
    const { data, width, height } = pixels(['...', '.R.', '...']);
    expect(clearBackground(data, width, height)).toBe(0);
  });
});

describe('Editor image tools', () => {
  it('applies adjustments and crop to the selected image as undoable steps', async () => {
    document.body.innerHTML = '<canvas id="c"></canvas>';
    const ed = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
    await ed.open(newProject(800, 600));
    const el = document.createElement('canvas');
    el.width = 40;
    el.height = 20;
    await ed.addImage(el.toDataURL(), 'Foto');
    for (const v of [10, 20, 30]) ed.setImageAdjustments({ ...NO_ADJUSTMENTS, brightness: v }, 'brightness');
    ed.setImageCrop({ left: 0, top: 0, right: 50, bottom: 0 });
    expect(ed.inspect()?.image).toMatchObject({ adjustments: { brightness: 30 }, crop: { right: 50 } });
    await ed.undo(); // crop
    await ed.undo(); // the whole brightness drag, one step
    ed.select([ed.layers()[0]?.id ?? '']);
    expect(ed.inspect()?.image?.adjustments.brightness).toBe(0);
  });

  it('removes the background of the selected image as one undoable step, keeping its crop', async () => {
    document.body.innerHTML = '<canvas id="c"></canvas>';
    const ed = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
    await ed.open(newProject(800, 600));
    const el = document.createElement('canvas');
    el.width = 40;
    el.height = 20;
    const ctx = el.getContext('2d') as CanvasRenderingContext2D;
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 40, 20);
    ctx.fillStyle = '#c00';
    ctx.fillRect(10, 5, 20, 10);
    await ed.addImage(el.toDataURL(), 'Logo');
    ed.setImageCrop({ left: 0, top: 0, right: 50, bottom: 0 });
    const saved: Blob[] = [];
    const save = async (blob: Blob) => {
      saved.push(blob);
      return `data:image/png;base64,${Buffer.from(await blob.arrayBuffer()).toString('base64')}`;
    };
    expect(await ed.removeImageBackground(save)).toBe(true);
    expect(saved[0]?.type).toBe('image/png');
    expect(ed.inspect()?.image?.crop.right).toBe(50);
    const src = ed.toProject().layers[0]?.object.src as string;
    expect(src).toMatch(/^data:image\/png/);
    // A second pass starts from the stored asset, which has no background left.
    expect(await ed.removeImageBackground(save)).toBe(false);
    expect(saved).toHaveLength(1);
    await ed.undo();
    expect(ed.toProject().layers[0]?.object.src).toBe(el.toDataURL());
    ed.select([]);
    expect(await ed.removeImageBackground(save)).toBe(false);
  });
});
