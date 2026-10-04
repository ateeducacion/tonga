// Exports a project to PNG, JPEG, SVG, PDF or eXeLearning (.elpx). Everything is rendered off-screen at 1:1 from the
// document, so the live canvas (zoom, selection) is never touched (RULE-102).
import type { StaticCanvas } from 'fabric';
import { renderOffscreen, type SourceResolver } from '../canvas/document';
import type { Background, Project } from '../project/schema';
import { exportElpx } from './elpx';
import { jpegToPdf } from './pdf';

export type ExportFormat = 'png' | 'jpeg' | 'svg' | 'pdf' | 'elpx';

export interface ExportOptions {
  format: ExportFormat;
  scale: number;
  quality: number;
  /** Drop the canvas background (colour or image) where the format allows it (PNG, SVG), as Canva does. */
  transparent: boolean;
}

export const MIME: Record<ExportFormat, string> = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  elpx: 'application/zip',
};

export const EXTENSION: Record<ExportFormat, string> = { png: 'png', jpeg: 'jpg', svg: 'svg', pdf: 'pdf', elpx: 'elpx' };

/** Safe file name: keeps letters (with accents), digits, spaces, dots, dashes; adds the right extension. */
export function exportFileName(name: string, format: ExportFormat): string {
  const base = name.normalize('NFC').replace(/\.[a-z0-9]{2,5}$/i, '').replace(/[^\p{L}\p{N} ._-]+/gu, '').replace(/^[.\s]+/, '').trim().slice(0, 80) || 'dibujo';
  return `${base}.${EXTENSION[format]}`;
}

/** Default name: tonga-YYYYMMDD-HHMMSS (local time). */
export function defaultFileName(now = new Date()): string {
  const p = (v: number) => String(v).padStart(2, '0');
  return `tonga-${now.getFullYear()}${p(now.getMonth() + 1)}${p(now.getDate())}-${p(now.getHours())}${p(now.getMinutes())}${p(now.getSeconds())}`;
}

/**
 * Background actually exported: PNG and SVG drop it when asked for transparency; JPEG, PDF and opaque requests
 * fill a transparent canvas with white, never black (RULE-114).
 */
export function exportBackground({ canvas: { background } }: Project, opts: Pick<ExportOptions, 'format' | 'transparent'>): Background {
  const alpha = opts.transparent && (opts.format === 'png' || opts.format === 'svg');
  if (alpha) return { kind: 'transparent' };
  return background.kind === 'transparent' ? { kind: 'color', color: '#ffffff' } : background;
}

function withBackground(project: Project, opts: ExportOptions): Project {
  return { ...project, canvas: { ...project.canvas, background: exportBackground(project, opts) } };
}

function toBlob(canvas: StaticCanvas, type: string, scale: number, quality: number): Promise<Blob> {
  const el = canvas.toCanvasElement(scale);
  return new Promise((resolve, reject) =>
    el.toBlob((b) => (b ? resolve(b) : reject(new Error('El navegador no pudo generar la imagen.'))), type, quality),
  );
}

/**
 * @param resolve      loads canonical sources for raster formats
 * @param resolveInline turns canonical sources into data: URLs, so the SVG is self-contained
 */
export async function exportProject(project: Project, opts: ExportOptions, resolve: SourceResolver, resolveInline: SourceResolver): Promise<Blob> {
  if (opts.format === 'elpx') return exportElpx(project, resolveInline);
  const doc = withBackground(project, opts);
  if (opts.format === 'svg') {
    const canvas = await renderOffscreen(doc, resolveInline);
    try {
      const { width, height } = doc.canvas;
      return new Blob([canvas.toSVG({ width: `${width}`, height: `${height}`, viewBox: { x: 0, y: 0, width, height } })], { type: MIME.svg });
    } finally {
      await canvas.dispose();
    }
  }
  const canvas = await renderOffscreen(doc, resolve);
  try {
    if (opts.format === 'pdf') {
      // About 150 dpi on A4 is plenty for classroom printing and keeps files small.
      const scale = Math.min(2, 1754 / Math.max(doc.canvas.width, doc.canvas.height));
      const jpeg = new Uint8Array(await (await toBlob(canvas, MIME.jpeg, scale, 0.92)).arrayBuffer());
      const pdf = jpegToPdf({ jpeg, width: Math.round(doc.canvas.width * scale), height: Math.round(doc.canvas.height * scale) }, doc.title || 'Tonga');
      return new Blob([pdf as BlobPart], { type: MIME.pdf });
    }
    return await toBlob(canvas, MIME[opts.format], opts.scale, opts.quality);
  } finally {
    await canvas.dispose();
  }
}
