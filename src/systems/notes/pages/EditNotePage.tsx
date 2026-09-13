import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import Header from '@src/components/header/Header';
import { api } from '@src/lib/trpc/server';
import { signInRoute } from '@src/lib/utils/redirect';
import { auth } from '@src/server/auth';
import EditNoteForm from '@src/systems/notes/forms/EditNoteForm';

type EditNotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditNotePage({ params }: EditNotePageProps) {
  const [{ id }, session] = await Promise.all([
    params,
    auth.api.getSession({ headers: await headers() }),
  ]);
  if (!session) redirect(await signInRoute(`notes/${id}/edit`));

  const file = await api.file.byId({ id });
  if (!file) notFound();

  if (file.authorId !== session.user.id) {
    redirect(`/notes/${id}`);
  }

  return (
    <>
      <Header />
      <main className="flex w-full flex-col items-center p-4">
        <EditNoteForm
          file={{
            id: file.id,
            name: file.name,
            description: file.description ?? undefined,
            handwritten: file.handwritten,
            updatedAt: file.updatedAt,
            prefix: file.section?.prefix,
            number: file.section?.number,
            sectionCode: file.section?.sectionCode,
            term: file.section?.term,
            year: file.section?.year,
          }}
        />
      </main>
    </>
  );
}
