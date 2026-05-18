"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const PDFJS_VERSION = "4.10.38";

type PdfJsPreviewProps = {
  url: string;
  className?: string;
};

let workerSrcSet = false;

export function PdfJsPreview({ url, className }: PdfJsPreviewProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const pdfRef = useRef<{ destroy: () => Promise<void> } | null>(null);
  const taskRef = useRef<{ destroy: () => void } | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || !url) return;

    host.innerHTML = "";
    setStatus("loading");
    pdfRef.current = null;
    taskRef.current = null;

    let cancelled = false;

    void (async () => {
      try {
        const pdfjs = await import("pdfjs-dist");
        if (!workerSrcSet) {
          pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${PDFJS_VERSION}/build/pdf.worker.min.mjs`;
          workerSrcSet = true;
        }

        const loadingTask = pdfjs.getDocument({ url });
        taskRef.current = loadingTask;

        const pdf = await loadingTask.promise;
        if (cancelled) {
          await pdf.destroy().catch(() => {});
          return;
        }

        taskRef.current = null;
        pdfRef.current = pdf;

        const numPages = pdf.numPages;
        const scale = typeof window !== "undefined" && window.devicePixelRatio > 1 ? 1.35 : 1.2;

        for (let p = 1; p <= numPages; p++) {
          if (cancelled) break;
          const page = await pdf.getPage(p);
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.className = "mx-auto mb-6 block max-w-full rounded border border-slate-200/80 bg-white shadow-sm";
          const ctx = canvas.getContext("2d");
          if (!ctx) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;

          await page.render({ canvasContext: ctx, viewport }).promise;
          host.appendChild(canvas);
        }

        if (!cancelled) setStatus("ready");
      } catch {
        if (!cancelled) {
          setStatus("error");
        }
      }
    })();

    return () => {
      cancelled = true;
      taskRef.current?.destroy();
      taskRef.current = null;
      void pdfRef.current?.destroy().catch(() => {});
      pdfRef.current = null;
      if (host) host.innerHTML = "";
    };
  }, [url]);

  return (
    <div
      className={cn(
        "relative max-h-[min(78vh,860px)] min-h-[320px] overflow-y-auto rounded-lg border border-slate-200 bg-slate-100/90 p-3",
        className,
      )}
    >
      {status === "loading" ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-slate-100/85">
          <p className="text-sm text-slate-500">Merender PDF…</p>
        </div>
      ) : null}
      {status === "error" ? (
        <p className="py-12 text-center text-sm text-red-600">Tidak dapat menampilkan PDF.</p>
      ) : null}
      <div ref={hostRef} />
    </div>
  );
}
