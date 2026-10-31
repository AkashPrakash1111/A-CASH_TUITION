import { useEffect, useState } from "react";
import * as pdfjs from "pdfjs-dist";
import workerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;

// Every paper is laid out 820px wide, which is also the width of the marking
// canvas, so a teacher's annotations (stored in canvas pixels) line up exactly
// for the student viewing them later.
export const PAPER_WIDTH = 820;
const MIN_HEIGHT = 400;

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("The answer sheet image could not be loaded."));
    img.src = src;
  });
}

async function renderPdf(url) {
  const pdf = await pdfjs.getDocument({ url }).promise;
  const pages = [];
  for (let n = 1; n <= pdf.numPages; n += 1) {
    const page = await pdf.getPage(n);
    const base = page.getViewport({ scale: 1 });
    // Render at 2x for sharp text, display at PAPER_WIDTH.
    const scale = (PAPER_WIDTH / base.width) * 2;
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
    pages.push({
      src: canvas.toDataURL("image/jpeg", 0.9),
      height: Math.round((canvas.height / canvas.width) * PAPER_WIDTH),
    });
  }
  return pages;
}

/**
 * Turns the student's uploaded sheet (image or PDF) into a list of page images
 * stacked top to bottom, plus the total height the marking canvas must have.
 * Multi-page PDFs get every page, so the teacher can mark all of them.
 */
export default function usePaperPages(url, isPdf, enabled = true) {
  const [state, setState] = useState({ pages: [], status: "idle", error: "" });

  useEffect(() => {
    if (!enabled || !url) {
      setState({ pages: [], status: "idle", error: "" });
      return undefined;
    }
    let cancelled = false;
    setState({ pages: [], status: "loading", error: "" });

    (async () => {
      try {
        let pages;
        if (isPdf) {
          pages = await renderPdf(url);
        } else {
          const img = await loadImage(url);
          pages = [
            {
              src: url,
              height: Math.max(
                MIN_HEIGHT,
                Math.round((img.naturalHeight / img.naturalWidth) * PAPER_WIDTH)
              ),
            },
          ];
        }
        if (!cancelled) setState({ pages, status: "ready", error: "" });
      } catch (err) {
        if (!cancelled) {
          setState({ pages: [], status: "error", error: err.message || "Could not open the file." });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [url, isPdf, enabled]);

  const totalHeight = state.pages.reduce((sum, p) => sum + p.height, 0) || 1160;
  return { ...state, totalHeight };
}
