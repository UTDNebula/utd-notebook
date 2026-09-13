import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { signInRoute } from '@src/lib/utils/redirect';
import { auth } from '@src/server/auth';
import { isOnboarded } from '@src/server/onboarding';
import CreateNoteForm from '@src/systems/notes/forms/CreateNoteForm';
import Header from '@src/systems/search/components/Header';

export const metadata: Metadata = {
  title: 'Create New Note',
  alternates: {
    canonical: 'https://notebook.utdnebula.com/notes/create',
  },
  openGraph: {
    url: 'https://notebook.utdnebula.com/notes/create',
  },
};

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(await signInRoute('notes/create'));

  if (!(await isOnboarded(session.user.id))) {
    redirect('/get-started');
  }

  return (
    <>
      <Header />
      <main className="flex w-full flex-col items-center p-4">
        <CreateNoteForm />
      </main>
    </>
  );
}
