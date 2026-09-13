'use client';

import { useMutation } from '@tanstack/react-query';
import { useTRPC } from '@src/lib/trpc/react';
import { ACCEPTED_FILE_TYPES, MAX_FILE_SIZE } from '@src/utils/formSchemas';

export function useUploadToUploadURL() {
  const api = useTRPC();
  const createUpload = useMutation(api.storage.createUpload.mutationOptions());

  return useMutation({
    mutationFn: async ({
      file,
      fileName,
    }: {
      file: File | null;
      fileName: string;
    }) => {
      if (!file) {
        throw new Error('No file uploaded.');
      }

      if (!ACCEPTED_FILE_TYPES.includes(file.type)) {
        throw new Error('File must be a PDF.');
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error('File must be less than 5MB');
      }

      const [uploadUrlResponse, arrayBuffer] = await Promise.all([
        createUpload.mutateAsync({
          objectId: fileName,
          mime: 'application/pdf',
        }),
        file.arrayBuffer(),
      ]);

      if (uploadUrlResponse.message !== 'success') {
        throw new Error('Failed to get upload URL.');
      }

      const uploadUrl = uploadUrlResponse.data;

      const blob = new Blob([arrayBuffer], { type: file.type });

      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'content-type': file.type,
          'x-goog-content-length-range': `0,5000000`,
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file.');
      }
    },
  });
}
