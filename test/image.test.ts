import { describe, expect, it } from 'vitest';
import { FabricImage, Point, StaticCanvas, type Rect } from 'fabric';
import { applyAdjustments, applyCrop, buildFilters, clearBackground, cropFromFrame, NO_ADJUSTMENTS, NO_CROP, readAdjustments, readCrop } from '../src/canvas/image';
import { readProject, writeProject } from '../src/canvas/document';
import { Editor, readGradient } from '../src/canvas/editor';
import { exportProject } from '../src/export/export';
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
    const a = { grayscale: true, sepia: true, invert: true, brightness: 25, contrast: -40, saturation: 60, blur: 30, vintage: true, pixelate: 1, noise: 45 };
    applyAdjustments(img, a);
    expect(img.filters.map((f) => f.type)).toEqual(['Grayscale', 'Sepia', 'Invert', 'Brightness', 'Contrast', 'Saturation', 'Blur', 'Vintage', 'Pixelate', 'Noise']);
    expect(readAdjustments(img)).toEqual(a);
    applyAdjustments(img, { ...NO_ADJUSTMENTS, pixelate: 100 });
    expect(img.filters[0]).toMatchObject({ blocksize: 41 });
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

  it('turns a frame drawn over the image into the crop, through rotation and an earlier crop', () => {
    const img = photo(200, 100); // centred at (300, 200), 200×100 on canvas
    const corners = (l: number, t: number, r: number, b: number) => [new Point(l, t), new Point(r, t), new Point(r, b), new Point(l, b)];
    expect(cropFromFrame(img, corners(250, 160, 350, 250))).toEqual({ left: 25, top: 10, right: 25, bottom: 0 });
    expect(cropFromFrame(img, corners(0, 0, 1000, 1000))).toEqual(NO_CROP); // outside the image: ignored
    applyCrop(img, { left: 50, top: 0, right: 0, bottom: 0 }); // the right half, still at its place
    img.rotate(90);
    const c = img.getCenterPoint();
    // A frame over the upper half of the rotated image keeps the left half of what is shown.
    const kept = cropFromFrame(img, corners(c.x - 50, c.y - 50, c.x + 50, c.y));
    expect(kept).toEqual({ left: 50, top: 0, right: 25, bottom: 0 });
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

describe('Editor visual crop', () => {
  async function withImage(): Promise<Editor> {
    document.body.innerHTML = '<canvas id="c"></canvas>';
    const ed = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
    await ed.open(newProject(800, 600));
    const el = document.createElement('canvas');
    el.width = 200;
    el.height = 100;
    await ed.addImage(el.toDataURL(), 'Foto');
    return ed;
  }

  it('crops to the frame the user resized, as one undo step; the frame is never in the document', async () => {
    const ed = await withImage();
    expect(ed.startCrop()).toBe(true);
    expect(ed.startCrop()).toBe(false); // already cropping
    expect(ed.isCropping).toBe(true);
    expect(ed.layers().map((l) => l.name)).toEqual(['Foto']);
    expect(ed.toProject().layers).toHaveLength(1);
    const frame = ed.canvas.getActiveObject() as Rect;
    frame.set({ scaleX: 0.5 }).setCoords(); // keep the middle half
    ed.finishCrop(true);
    expect(ed.isCropping).toBe(false);
    expect(ed.inspect()?.image?.crop).toEqual({ left: 25, top: 0, right: 25, bottom: 0 });
    expect(ed.canvas.getObjects()).toHaveLength(1);
    await ed.undo();
    expect(ed.inspect()?.image?.crop).toEqual(NO_CROP);
  });

  it('cancels on «Cancelar», when something else is selected, and on undo', async () => {
    const ed = await withImage();
    ed.startCrop();
    ed.finishCrop(false);
    expect(ed.inspect()?.image?.crop).toEqual(NO_CROP);
    ed.finishCrop(true); // not cropping: nothing to do
    ed.startCrop();
    ed.canvas.discardActiveObject();
    ed.canvas.fire('selection:cleared', {} as never);
    expect(ed.isCropping).toBe(false);
    expect(ed.canvas.getObjects()).toHaveLength(1);
    ed.selectAll();
    ed.startCrop();
    await ed.undo();
    expect(ed.isCropping).toBe(false);
    ed.addShape('rect');
    expect(ed.startCrop()).toBe(false); // not an image
  });
});

describe('Editor gradients', () => {
  it('fills a shape with a two-colour gradient, changes it, keeps it in SVG and turns it back to a colour', async () => {
    document.body.innerHTML = '<canvas id="c"></canvas>';
    const ed = new Editor(document.getElementById('c') as HTMLCanvasElement, (s) => s);
    await ed.open(newProject(800, 600));
    ed.addShape('rect');
    ed.setGradient({ from: '#2563eb', to: '#ffffff', direction: 'vertical' });
    expect(ed.inspect()).toMatchObject({ fill: '#2563eb', gradient: { from: '#2563eb', to: '#ffffff', direction: 'vertical' } });
    for (const direction of ['horizontal', 'diagonal'] as const) {
      ed.setGradient({ from: '#2563eb', to: '#16a34a', direction });
      expect(ed.inspect()?.gradient?.direction).toBe(direction);
    }
    await ed.open(ed.toProject());
    ed.selectAll();
    expect(ed.inspect()?.gradient).toEqual({ from: '#2563eb', to: '#16a34a', direction: 'diagonal' });
    const svg = await (await exportProject(ed.toProject(), { format: 'svg', scale: 1, quality: 1, transparent: true }, (s) => s, (s) => s)).text();
    expect(svg).toContain('<linearGradient');

    ed.addShape('star'); // remembered, as its own gradient
    expect(ed.inspect()?.gradient?.to).toBe('#16a34a');
    ed.setGradient(null);
    expect(ed.inspect()).toMatchObject({ fill: '#2563eb', gradient: null });
    ed.setGradient(null); // already a plain colour
    expect(ed.inspect()?.fill).toBe('#2563eb');
    expect(readGradient('#fff')).toBeNull();
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
