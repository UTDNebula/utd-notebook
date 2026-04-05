import { notFound } from 'next/navigation';
import Header from '@src/components/header/Header';
import RatingWidget from '@src/components/sections/RatingWidget';
import { api } from '@src/trpc/server';

type NotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const file = await api.file.byId({ id });
  if (!file) notFound();

  return (
    <>
      <Header />
      <main>
        <h1>{file.name}</h1>
        <p>{file.description || 'No provided description.'}</p>

        <section>
          <p>
            <strong>Course:</strong> {file.section?.prefix}{' '}
            {file.section?.number}
          </p>
          <p>
            <strong>Section: </strong> {file.section?.sectionCode}
          </p>
          <p>
            <strong>Professor:</strong> {file.section?.profFirst}{' '}
            {file.section?.profLast}
          </p>
          <p>
            <strong>Author:</strong>{' '}
            {file.author
              ? `${file.author.firstName} ${file.author.lastName}`
              : 'Unknown'}
          </p>
          <p>
            <strong>Last Updated:</strong>{' '}
            {file.updatedAt?.toLocaleDateString()}
          </p>
        </section>

        <section>
          <RatingWidget fileId={id} />
        </section>

        <section>
          <h2>PDF</h2>
          {file.publicUrl ? (
            <iframe
              src={file.publicUrl}
              title={file.name}
              width="100%"
              height="800px"
            />
          ) : (
            <p>PDF not available yet.</p>
          )}
        </section>
      </main>
    </>
  );
}
