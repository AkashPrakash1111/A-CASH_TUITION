import { PAPER_WIDTH } from "../hooks/usePaperPages";
import { drawAnnotationItem } from "./drawAnnotations";

// Builds a PDF of the marked-up paper entirely in the browser: every page is
// flattened (student's page + teacher's marks) into a JPEG and wrapped in a
// minimal hand-written PDF, so no library is needed.

const SCALE = 1.6; // render resolution relative to the 820px paper width
const PT_WIDTH = 595; // A4 width in PDF points

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("A page could not be prepared for the PDF."));
    img.src = src;
  });
}

const enc = new TextEncoder();

function dataUrlToBytes(dataUrl) {
  const bin = atob(dataUrl.split(",")[1]);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i += 1) out[i] = bin.charCodeAt(i);
  return out;
}

/**
 * pages: [{ src, height }] stacked top to bottom (as in usePaperPages)
 * annotations: items in stacked-canvas coordinates
 * Returns a Blob (application/pdf).
 */
export async function buildCorrectedPdf(pages, annotations) {
  const jpegs = [];
  let offsetY = 0;

  for (const pg of pages) {
    const w = Math.round(PAPER_WIDTH * SCALE);
    const h = Math.round(pg.height * SCALE);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, w, h);
    ctx.drawImage(await loadImage(pg.src), 0, 0, w, h);

    // Marks live in stacked coordinates: shift so this page's slice lands on it
    ctx.save();
    ctx.scale(SCALE, SCALE);
    ctx.translate(0, -offsetY);
    annotations.forEach((a) => drawAnnotationItem(ctx, a));
    ctx.restore();

    jpegs.push({ bytes: dataUrlToBytes(canvas.toDataURL("image/jpeg", 0.85)), w, h, ptH: (PT_WIDTH * pg.height) / PAPER_WIDTH });
    offsetY += pg.height;
  }

  const chunks = [];
  const offsets = [];
  let length = 0;
  const push = (data) => {
    const bytes = typeof data === "string" ? enc.encode(data) : data;
    chunks.push(bytes);
    length += bytes.length;
  };
  const startObj = (n) => {
    offsets[n] = length;
    push(`${n} 0 obj\n`);
  };

  // Object layout: 1 catalog, 2 page tree, then per page: page, content, image
  const pageObj = (i) => 3 + i * 3;
  push("%PDF-1.4\n");
  startObj(1);
  push("<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
  startObj(2);
  push(`<< /Type /Pages /Count ${jpegs.length} /Kids [${jpegs.map((_, i) => `${pageObj(i)} 0 R`).join(" ")}] >>\nendobj\n`);

  jpegs.forEach((j, i) => {
    const p = pageObj(i);
    startObj(p);
    push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PT_WIDTH} ${j.ptH.toFixed(2)}] /Resources << /XObject << /Im0 ${p + 2} 0 R >> >> /Contents ${p + 1} 0 R >>\nendobj\n`);
    const content = `q ${PT_WIDTH} 0 0 ${j.ptH.toFixed(2)} 0 0 cm /Im0 Do Q`;
    startObj(p + 1);
    push(`<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`);
    startObj(p + 2);
    push(`<< /Type /XObject /Subtype /Image /Width ${j.w} /Height ${j.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${j.bytes.length} >>\nstream\n`);
    push(j.bytes);
    push("\nendstream\nendobj\n");
  });

  const count = 3 + jpegs.length * 3;
  const xref = length;
  push(`xref\n0 ${count}\n0000000000 65535 f \n`);
  for (let n = 1; n < count; n += 1) push(`${String(offsets[n]).padStart(10, "0")} 00000 n \n`);
  push(`trailer\n<< /Size ${count} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);

  return new Blob(chunks, { type: "application/pdf" });
}
