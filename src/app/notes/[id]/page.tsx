import { notFound, redirect } from 'next/navigation';
import { api } from '@src/trpc/server';

type NotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const file = await api.file.byId({ id });
  if (!file) notFound();

  redirect(file.publicUrl);
}
