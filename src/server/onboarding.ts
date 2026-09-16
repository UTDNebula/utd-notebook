import { eq } from 'drizzle-orm';
import { isProfileComplete } from '@src/lib/schemas/account';
import { db } from '@src/server/db';
import { userMetadata } from '@src/server/db/schema/user';

export async function isOnboarded(userId: string): Promise<boolean> {
  const metadata = await db.query.userMetadata.findFirst({
    where: eq(userMetadata.id, userId),
  });
  return isProfileComplete(metadata);
}