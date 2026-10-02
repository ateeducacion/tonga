// Minimal PDF writer: one page holding one JPEG image (DCTDecode), per ISO 32000-1.
// Replaces jsPDF for Tonga's only PDF need: printing the drawing on an A4 sheet.

export const A4 = { width: 595.28, height: 841.89 }; // points

export interface PdfImage {
  jpeg: Uint8Array;
  width: number; // pixels
  height: number;
}

/** Page size and image box (points) for an A4 page whose orientation follows the image, fitted and centred. */
export function a4Layout(imgWidth: number, imgHeight: number): { page: [number, number]; box: [number, number, number, number] } {
  const landscape = imgWidth > imgHeight;
  const pw = landscape ? A4.height : A4.width;
  const ph = landscape ? A4.width : A4.height;
  const scale = Math.min(pw / imgWidth, ph / imgHeight);
  const w = imgWidth * scale;
  const h = imgHeight * scale;
  return { page: [pw, ph], box: [(pw - w) / 2, (ph - h) / 2, w, h] };
}

const n = (v: number) => (Math.round(v * 100) / 100).toString();

export function jpegToPdf(img: PdfImage, title = 'Tonga'): Uint8Array {
  const { page, box } = a4Layout(img.width, img.height);
  const content = `q ${n(box[2])} 0 0 ${n(box[3])} ${n(box[0])} ${n(box[1])} cm /Im0 Do Q`;
  const enc = new TextEncoder();
  const safeTitle = title.replace(/[\\()]/g, (c) => `\\${c}`).replace(/[^\x20-\x7e]/g, '?');
  const objects: (string | [string, Uint8Array, string])[] = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${n(page[0])} ${n(page[1])}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`,
    [
      `<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${img.jpeg.length} >>\nstream\n`,
      img.jpeg,
      '\nendstream',
    ],
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    `<< /Title (${safeTitle}) /Producer (Tonga) >>`,
  ];

  const chunks: Uint8Array[] = [];
  let length = 0;
  const push = (part: string | Uint8Array) => {
    const bytes = typeof part === 'string' ? enc.encode(part) : part;
    chunks.push(bytes);
    length += bytes.length;
  };
  // The binary comment line marks the file as binary for transfer tools.
  push('%PDF-1.4\n');
  push(new Uint8Array([0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));
  const offsets: number[] = [];
  objects.forEach((obj, i) => {
    offsets.push(length);
    push(`${i + 1} 0 obj\n`);
    if (typeof obj === 'string') push(obj);
    else obj.forEach(push);
    push('\nendobj\n');
  });
  const xref = length;
  push(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  for (const off of offsets) push(`${String(off).padStart(10, '0')} 00000 n \n`);
  push(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R /Info ${objects.length} 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

  const out = new Uint8Array(length);
  let pos = 0;
  for (const c of chunks) {
    out.set(c, pos);
    pos += c.length;
  }
  return out;
}
