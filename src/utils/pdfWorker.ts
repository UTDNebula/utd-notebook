'use client';

import { GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs';

let isWorkerConfigured = false;

export const ensurePdfJsWorker = () => {
  if (isWorkerConfigured || typeof window === 'undefined') {
    return;
  }

  const workerUrl = new URL(
    'pdfjs-dist/legacy/build/pdf.worker.mjs',
    import.meta.url,
  );

  try {
    // Prefer workerPort in Next.js to avoid URL resolution issues that can trigger fake worker mode.
    GlobalWorkerOptions.workerPort = new Worker(workerUrl, {
      type: 'module',
    });
  } catch {
    // Fallback for environments where constructing Worker can fail.
    GlobalWorkerOptions.workerSrc = workerUrl.toString();
  }

  isWorkerConfigured = true;
};