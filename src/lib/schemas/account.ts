import { z } from 'zod';
import { studentClassificationEnum } from '@src/server/db/schema/user';
import { majors, minors } from '@src/server/db/schema/utdDegrees';

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

export const accountSchema = z.object({
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
  graduationDate: z.date('Graduation date is required').nullable(),
  contactEmail: z
    .email({
      error: 'Use your UT Dallas email',
      pattern:
        /^(?!\.)(?!.*\.\.)([a-z0-9_'+\-\.]*)[a-z0-9_+-]@([a-z0-9][a-z0-9\-]*\.)*utdallas\.edu$/i,
    })
    .nullable(),
});

export type AccountSchema = z.infer<typeof accountSchema>;