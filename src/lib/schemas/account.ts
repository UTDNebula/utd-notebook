import { z } from 'zod';
import { type SelectUserMetadata } from '@src/server/db/models';
import { studentClassificationEnum } from '@src/server/db/schema/user';

export const UTD_EMAIL_REGEX =
  /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)*utdallas\.edu$/i;

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
  major: z.string().trim().min(1, 'College major is required'),
  minor: z.string().nullable(),
  studentClassification: z.enum(studentClassificationEnum.enumValues),
  graduationDate: z.date().nullable(),
  contactEmail: z
    .email({
      error: 'Use your UT Dallas email',
      pattern: UTD_EMAIL_REGEX,
    })
    .nullable(),
});

export type AccountSettingsSchema = z.infer<typeof accountSettingsSchema>;

export const accountOnboardingSchema = z.object({
  firstName: z.string().min(1, 'Name is required'),
  lastName: z.string().optional(),
  major: z.string().trim().min(1, 'College major is required'),
  minor: z.string().nullable().optional(),
  studentClassification: z.enum(studentClassificationEnum.enumValues),
  graduationDate: z.date({ error: 'Graduation date is required' }).nullable(),
  contactEmail: z
    .email({
      error: 'Use your UT Dallas email',
      pattern: UTD_EMAIL_REGEX,
    })
    .min(1, 'Contact email is required')
    .nullable(),
});

export type AccountOnboardingSchema = z.infer<typeof accountOnboardingSchema>;

export function isProfileComplete(
  userMetadata:
    | Pick<SelectUserMetadata, 'major' | 'contactEmail'>
    | null
    | undefined,
): boolean {
  if (!userMetadata) return false;
  return (
    userMetadata.major.trim().length > 0 &&
    !!userMetadata.contactEmail &&
    UTD_EMAIL_REGEX.test(userMetadata.contactEmail)
  );
}
