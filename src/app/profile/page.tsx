import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@src/server/auth';
import { api } from '@src/trpc/server';
import { signInRoute } from '@src/utils/redirect';

export default async function ProfileLandingPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(await signInRoute('profile'));
  }

  const userMetadata = await api.userMetadata.byId({ id: session.user.id });

  redirect(`/profile/${userMetadata?.username ?? session.user.id}`);
}
