import { z } from 'zod';
import { majors, minors } from '@src/constants/utdDegrees';
import { studentClassificationEnum } from '@src/server/db/schema/user';
import { MAX_NOTE_BYTES, NOTE_MIME_TYPE, noteIdSchema } from './noteFile';

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
  major: z.enum(majors, {
    error: (iss) =>
      iss.input === '' ? 'College major is required' : 'Invalid college major',
  }),
  // Considers empty strings valid...hopefully not an issue?
  // Better strat would be using preprocess() to turn empty strings into null,
  // but I can't get typescript to recognize the output type as string | null,
  // which causes errors in UserInfo.tsx and OnboardingForm.tsx.
  minor: z.union([
    z.enum(minors, 'Invalid college minor').nullable(),
    z.string().max(0, 'Invalid college minor').nullable(),
  ]),
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
  major: z
    .enum(majors, {
      error: (iss) =>
        iss.input === ''
          ? 'College major is required'
          : 'Invalid college major',
    })
    .optional(),
  // See comment at accountSettingsSchema minor
  minor: z.union([
    z.enum(minors, 'Invalid college minor').nullable(),
    z.string().max(0, 'Invalid college minor').nullable(),
  ]),
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

export const MAX_FILE_SIZE = MAX_NOTE_BYTES;
export const ACCEPTED_FILE_TYPES = [NOTE_MIME_TYPE];

const fileSchema = z
  .file('File required')
  .refine(
    (file) => !file || ACCEPTED_FILE_TYPES.includes(file.type),
    'Only PDF format is supported',
  )
  .refine(
    (file) => !file || file.size <= MAX_FILE_SIZE,
    'Max PDF size is 5MB',
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

export const editFileSchema = z.strictObject({
  id: noteIdSchema,
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
