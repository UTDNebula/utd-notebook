import { z } from 'zod';

export const reportCategoryEnum = z.enum([
  'inappropriate',
  'incorrect',
  'spam',
  'copyright',
  'other',
]);

export const createReportSchema = z.object({
  fileId: z.string().min(1, 'Missing file'),
  category: reportCategoryEnum,
  details: z
    .string()
    .min(10, 'Please provide at least 10 characters')
    .max(1000, 'Character limit reached'),
});

export type CreateReportSchema = z.infer<typeof createReportSchema>;
