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
    GlobalWorkerOptions.workerPort = new Worker(workerUrl, {
      type: 'module',
    });
  } catch {
    GlobalWorkerOptions.workerSrc = workerUrl.toString();
  }

  isWorkerConfigured = true;
};
