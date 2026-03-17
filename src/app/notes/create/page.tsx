import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Header from '@src/components/header/Header';
import { auth } from '@src/server/auth';
import { signInRoute } from '@src/utils/redirect';
import NoteForm from './NoteForm';

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
      <main className="p-4 flex w-full flex-col items-center">
        <NoteForm />
      </main>
    </>
  );
}
