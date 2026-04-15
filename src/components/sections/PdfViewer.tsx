'use client';

import { useEffect, useRef, useState } from 'react';

type PdfViewerProps = {
  url: string;
  title?: string;
};

export default function PdfViewer({ url, title }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [numPages, setNumPages] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const renderingRef = useRef(false);

  useEffect(() => {
    if (!url || renderingRef.current) return;
    renderingRef.current = true;

    let cancelled = false;

    const render = async () => {
      try {
        const pdfjsLib = await import('pdfjs-dist');
        console.log('pdfjs loaded');
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          'pdfjs-dist/build/pdf.worker.mjs',
          import.meta.url,
        ).toString();

        const pdf = await pdfjsLib.getDocument(url).promise;
        console.log('pdf document loaded, pages:', pdf.numPages);

        setNumPages(pdf.numPages);

        const container = containerRef.current;
        if (!container) return;
        container.innerHTML = '';

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) break;

          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale: 1.5 });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.display = 'block';
          canvas.style.width = '100%';
          canvas.style.marginBottom = '12px';
          canvas.style.borderRadius = '4px';
          canvas.style.boxShadow = '0 1px 4px rgba(0,0,0,0.1)';

          container.appendChild(canvas);

          const ctx = canvas.getContext('2d')!;
          await page.render({ canvasContext: ctx, viewport, canvas }).promise;
        }

        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error('PDF render error:', err);
          setError('Failed to load PDF.');
          setLoading(false);
        }
      }
    };

    void render();

    return () => {
      cancelled = true;
    };
  }, [url]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        {error}
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {loading && (
        <div className="flex h-full items-center justify-center text-sm text-slate-500">
          Loading PDF…
        </div>
      )}
      <div
        ref={containerRef}
        aria-label={title ?? 'PDF viewer'}
      />
      {!loading && numPages > 0 && (
        <div className="pointer-events-none absolute bottom-2 right-4 text-xs text-slate-400">
          {numPages} page{numPages !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}