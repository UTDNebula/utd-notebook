import { z } from 'zod';
import {
  MAX_NOTE_BYTES,
  NOTE_MIME_TYPE,
  noteIdSchema,
} from '@src/lib/note-files/noteFile';

export const MAX_FILE_SIZE = MAX_NOTE_BYTES;
export const ACCEPTED_FILE_TYPES = [NOTE_MIME_TYPE];

const fileSchema = z
  .file('File required')
  .refine(
    (file) => !file || ACCEPTED_FILE_TYPES.includes(file.type),
    'Only PDF format is supported',
  )
  .refine((file) => !file || file.size <= MAX_FILE_SIZE, 'Max PDF size is 5MB');

export const createFileFormSchema = z.object({
  file: fileSchema,
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Character limit reached'),
  description: z.string().max(1000, 'Character limit reached').optional(),
  section: z.string().min(1, 'Select a section'),
  prefix: z.string().min(1, 'Select a section'),
  number: z.string().min(1, 'Select a section'),
  sectionCode: z.string().min(1, 'Select a section'),
  term: z.string().min(1, 'Select a section'),
  year: z.number().min(2000, 'Select a section'),
  profFirst: z.string().min(1, 'Select a section to populate professor'),
  profLast: z.string().min(1, 'Select a section to populate professor'),
  handwritten: z.boolean(),
});

export const createFileSchema = z.object({
  id: noteIdSchema.optional(),
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Character limit reached'),
  description: z.string().max(1000, 'Character limit reached').optional(),
  prefix: z.string().min(1),
  number: z.string().min(1),
  sectionCode: z.string().min(1),
  term: z.enum(['Spring', 'Summer', 'Fall']),
  year: z.number().min(2000),
  profFirst: z.string().min(1, 'Professor info required'),
  profLast: z.string().min(1, 'Professor info required'),
  handwritten: z.boolean(),
});

export const editFileFormSchema = z.object({
  id: z.string(),
  file: fileSchema.nullish(),
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Character limit reached'),
  description: z.string().max(1000, 'Character limit reached').optional(),
  handwritten: z.boolean(),
});

export const editFileSchema = z.strictObject({
  id: noteIdSchema,
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Character limit reached'),
  description: z.string().max(1000, 'Character limit reached').optional(),
  handwritten: z.boolean(),
});
