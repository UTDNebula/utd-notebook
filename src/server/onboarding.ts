import { api } from '@src/lib/trpc/server';
import { isProfileComplete } from '@src/lib/schemas/account';

export async function isOnboarded(userId: string): Promise<boolean> {
  const userMetadata = await api.userMetadata.byId({ id: userId });
  return isProfileComplete(userMetadata);
}
