import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { api } from '@src/lib/trpc/server';
import { signInRoute } from '@src/lib/utils/redirect';
import { auth } from '@src/server/auth';

export default async function ProfileLandingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(await signInRoute('profile'));
  }

  const userMetadata = await api.userMetadata.byId({ id: session.user.id });

  redirect(`/profile/${userMetadata?.username ?? session.user.id}`);
}
