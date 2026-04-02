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

const sectionRegex =
  /^[A-Z]{2,4} [A-Z0-9]{4}.[A-Z0-9]{3} (Spring|Summer|Fall) [0-9]{4}$/;

export const createFileFormSchema = z.object({
  file: fileSchema,
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Character limit reached'),
  description: z.string().max(1000, 'Character limit reached').optional(),
  section: z.string().regex(sectionRegex, 'Section must follow format'),
  handwritten: z.boolean(),
});

export const createFileSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Character limit reached'),
  description: z.string().max(1000, 'Character limit reached').optional(),
  section: z.string().regex(sectionRegex, 'Section must follow format'),
  handwritten: z.boolean(),
});

export const editFileFormSchema = z.object({
  id: z.string(),
  file: fileSchema,
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
