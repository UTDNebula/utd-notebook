import { z } from 'zod';
import { studentClassificationEnum } from '@src/server/db/schema/user';

const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username must be at most 30 characters')
  .regex(
    /^[a-zA-Z0-9_-]+$/,
    'Username can only contain letters, numbers, hyphens, and underscores',
  );

export const editUsernameSchema = z.object({
  username: usernameSchema,
});

export type EditUsernameSchema = z.infer<typeof editUsernameSchema>;

export const accountSettingsSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  major: z.string().min(1, 'College major is required'),
  minor: z.string().nullable(),
  studentClassification: z.enum(studentClassificationEnum.enumValues),
  graduationDate: z.date().nullable(),
  contactEmail: z
    .email({
      error: 'Use your UT Dallas email',
      pattern:
        /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)*utdallas\.edu$/i,
    })
    .nullable(),
});

export type AccountSettingsSchema = z.infer<typeof accountSettingsSchema>;

export const accountOnboardingSchema = z.object({
  firstName: z.string().min(1, 'Name is required'),
  lastName: z.string().optional(),
  major: z.string().optional(),
  minor: z.string().nullable().optional(),
  studentClassification: z.enum(studentClassificationEnum.enumValues),
  graduationDate: z.date({ error: 'Graduation date is required' }).nullable(),
  contactEmail: z
    .email({
      error: 'Use your UT Dallas email',
      pattern:
        /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)*utdallas\.edu$/i,
    })
    .min(1, 'Contact email is required')
    .nullable(),
});

export type AccountOnboardingSchema = z.infer<typeof accountOnboardingSchema>;

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ACCEPTED_FILE_TYPES = ['application/pdf'];

const fileSchema = z
  .file('File required')
  .refine(
    (file) => !file || ACCEPTED_FILE_TYPES.includes(file.type),
    'Only PDF format is supported',
  )
  .refine(
    (file) => !file || file.size <= MAX_FILE_SIZE,
    'Max image size is 5MB',
  );

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

export const editFileSchema = z.object({
  id: z.string(),
  file: z.url(),
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Character limit reached'),
  description: z.string().max(1000, 'Character limit reached').optional(),
  handwritten: z.boolean(),
});

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
