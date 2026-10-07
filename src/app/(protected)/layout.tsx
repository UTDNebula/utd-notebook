import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { REQUEST_PATH_HEADER } from '@src/lib/utils/requestPath';
import { auth } from '@src/server/auth';
import { db } from '@src/server/db';
import { isOnboarded } from '@src/server/onboarding';

// Guards every page in this route group, so new application pages go here
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  if (!session) {
    const requestedPath = requestHeaders.get(REQUEST_PATH_HEADER) ?? '/';
    redirect(`/auth?callbackUrl=${encodeURIComponent(requestedPath)}`);
  }

  if (!(await isOnboarded(db, session.user.id))) {
    redirect('/get-started');
  }

  return <>{children}</>;
}
