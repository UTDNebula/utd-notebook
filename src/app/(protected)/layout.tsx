import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@src/server/auth';
import { isOnboarded } from '@src/server/onboarding';

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (session && !(await isOnboarded(session.user.id))) {
    redirect('/get-started');
  }

  return <>{children}</>;
}
