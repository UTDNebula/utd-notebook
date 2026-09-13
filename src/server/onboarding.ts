import { api } from '@src/trpc/server';
import { isProfileComplete } from '@src/utils/formSchemas';

export async function isOnboarded(userId: string): Promise<boolean> {
  const userMetadata = await api.userMetadata.byId({ id: userId });
  return isProfileComplete(userMetadata);
}
