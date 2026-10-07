import { eq } from 'drizzle-orm';
import {
  isOnboardingComplete,
  type OnboardingData,
} from '@src/lib/schemas/account';
import type { db as database } from '@src/server/db';
import { userMetadata } from '@src/server/db/schema/user';

type Database = typeof database;

const onboardingColumns = {
  firstName: true,
  lastName: true,
  major: true,
  minor: true,
  studentClassification: true,
  graduationDate: true,
  contactEmail: true,
} as const;

export function pickOnboardingData(row: OnboardingData): OnboardingData {
  return {
    firstName: row.firstName,
    lastName: row.lastName,
    major: row.major,
    minor: row.minor,
    studentClassification: row.studentClassification,
    graduationDate: row.graduationDate,
    contactEmail: row.contactEmail,
  };
}

export async function getOnboardingData(
  db: Database,
  userId: string,
): Promise<OnboardingData | null> {
  const row = await db.query.userMetadata.findFirst({
    where: eq(userMetadata.id, userId),
    columns: onboardingColumns,
  });
  return row ?? null;
}

// A missing profile counts as not onboarded
export async function isOnboarded(
  db: Database,
  userId: string,
): Promise<boolean> {
  return isOnboardingComplete(await getOnboardingData(db, userId));
}
