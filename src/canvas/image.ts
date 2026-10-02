// Image adjustments (filters) and non-destructive crop, through Fabric's public filter and crop API.
// Values use the units the inspector shows: percentages, 0 = unchanged.
import { FabricImage, filters, type FabricObject } from 'fabric';

export interface ImageAdjustments {
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  /** −100…100 */
  brightness: number;
  /** −100…100 */
  contrast: number;
  /** −100…100 */
  saturation: number;
  /** 0…100 */
  blur: number;
}

/** Percentages of the original image removed from each side. */
export interface ImageCrop {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export const NO_ADJUSTMENTS: ImageAdjustments = { grayscale: false, sepia: false, invert: false, brightness: 0, contrast: 0, saturation: 0, blur: 0 };
export const NO_CROP: ImageCrop = { left: 0, top: 0, right: 0, bottom: 0 };

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, Number.isFinite(v) ? v : 0));

export function isImage(obj: FabricObject | undefined): obj is FabricImage {
  return obj instanceof FabricImage;
}

export function buildFilters(a: ImageAdjustments): filters.BaseFilter<string>[] {
  const list: filters.BaseFilter<string>[] = [];
  if (a.grayscale) list.push(new filters.Grayscale());
  if (a.sepia) list.push(new filters.Sepia());
  if (a.invert) list.push(new filters.Invert());
  if (a.brightness) list.push(new filters.Brightness({ brightness: clamp(a.brightness, -100, 100) / 100 }));
  if (a.contrast) list.push(new filters.Contrast({ contrast: clamp(a.contrast, -100, 100) / 100 }));
  if (a.saturation) list.push(new filters.Saturation({ saturation: clamp(a.saturation, -100, 100) / 100 }));
  // Blur is a fraction of the image size; 100 % maps to a strong but still recognisable blur.
  if (a.blur) list.push(new filters.Blur({ blur: clamp(a.blur, 0, 100) / 200 }));
  return list;
}

export function readAdjustments(img: FabricImage): ImageAdjustments {
  const a = { ...NO_ADJUSTMENTS };
  for (const f of img.filters) {
    const type = f.type;
    const p = f as unknown as Record<string, number>;
    if (type === 'Grayscale') a.grayscale = true;
    else if (type === 'Sepia') a.sepia = true;
    else if (type === 'Invert') a.invert = true;
    else if (type === 'Brightness') a.brightness = Math.round((p.brightness ?? 0) * 100);
    else if (type === 'Contrast') a.contrast = Math.round((p.contrast ?? 0) * 100);
    else if (type === 'Saturation') a.saturation = Math.round((p.saturation ?? 0) * 100);
    else if (type === 'Blur') a.blur = Math.round((p.blur ?? 0) * 200);
  }
  return a;
}

export function applyAdjustments(img: FabricImage, a: ImageAdjustments): void {
  img.filters = buildFilters(a);
  img.applyFilters();
}

export function readCrop(img: FabricImage): ImageCrop {
  const { width: w, height: h } = img.getOriginalSize();
  if (!w || !h) return { ...NO_CROP };
  const pct = (v: number, of: number) => Math.round((v / of) * 1000) / 10;
  return {
    left: pct(img.cropX, w),
    top: pct(img.cropY, h),
    right: pct(w - img.cropX - img.width, w),
    bottom: pct(h - img.cropY - img.height, h),
  };
}

/**
 * Crops by hiding a percentage of each side of the original image. The visible part keeps its
 * on-canvas scale and stays where it was (the centre moves with the kept area).
 */
export function applyCrop(img: FabricImage, c: ImageCrop): void {
  const { width: w, height: h } = img.getOriginalSize();
  if (!w || !h) return;
  const left = clamp(c.left, 0, 95);
  const top = clamp(c.top, 0, 95);
  const right = clamp(c.right, 0, 95 - left);
  const bottom = clamp(c.bottom, 0, 95 - top);
  const before = img.getPointByOrigin('left', 'top');
  const oldCropX = img.cropX;
  const oldCropY = img.cropY;
  img.set({
    cropX: (w * left) / 100,
    cropY: (h * top) / 100,
    width: (w * (100 - left - right)) / 100,
    height: (h * (100 - top - bottom)) / 100,
  });
  // Keep the uncropped content still: shift by the change of the hidden top-left area.
  const dx = (img.cropX - oldCropX) * img.scaleX;
  const dy = (img.cropY - oldCropY) * img.scaleY;
  img.setPositionByOrigin(before.add(rotate(dx, dy, img.angle)), 'left', 'top');
  img.setCoords();
}

function rotate(x: number, y: number, deg: number) {
  const r = (deg * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  return { x: x * cos - y * sin, y: x * sin + y * cos } as const;
}
