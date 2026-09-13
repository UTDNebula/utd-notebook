import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Header from '@src/components/header/Header';
import { signInRoute } from '@src/lib/utils/redirect';
import { auth } from '@src/server/auth';
import CreateNoteForm from '@src/systems/notes/forms/CreateNoteForm';

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

  return (
    <>
      <Header />
      <main className="flex w-full flex-col items-center p-4">
        <CreateNoteForm />
      </main>
    </>
  );
}
