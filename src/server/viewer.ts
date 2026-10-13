import { headers } from 'next/headers';
import { cache } from 'react';
import { auth } from '@src/server/auth';
import { db } from '@src/server/db';
import { isOnboarded } from '@src/server/onboarding';

export type Viewer = 'anonymous' | 'incomplete' | 'onboarded';

//cached, so the layout and the page share one lookup per request
export const getViewer = cache(async (): Promise<Viewer> => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return 'anonymous';
  return (await isOnboarded(db, session.user.id)) ? 'onboarded' : 'incomplete';
});
