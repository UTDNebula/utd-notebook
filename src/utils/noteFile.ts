import { z } from 'zod';

export const noteIdSchema = z.string().regex(/^[A-Za-z0-9_-]{20}$/);
export const NOTE_MIME_TYPE = 'application/pdf';
export const MAX_NOTE_BYTES = 5 * 1024 * 1024;

// File destinations belong to the application, never to an edit request.
export function getNoteFileUrl(id: string) {
  return `/api/files/${encodeURIComponent(noteIdSchema.parse(id))}`;
}
