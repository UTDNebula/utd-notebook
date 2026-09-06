import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Header from '@src/components/header/Header';
import { auth } from '@src/server/auth';
import { signInRoute } from '@src/utils/redirect';
import CreateNoteForm from './CreateNoteForm';

export const metadata: Metadata = {
  title: 'Create New Note',
  alternates: {
    canonical: 'https://notebook.utdnebula.com/notes/create',
  },
  openGraph: {
    url: 'https://notebook.utdnebula.com/notes/create',
  },
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const [{ q }, session] = await Promise.all([
    searchParams,
    auth.api.getSession({ headers: await headers() }),
  ]);
  if (!session) {
    const query = q ? `?${new URLSearchParams({ q })}` : '';
    redirect(await signInRoute(`notes/create${query}`));
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
