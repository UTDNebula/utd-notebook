import { notFound } from 'next/navigation';
import Header from '@src/components/header/Header';
import NoteInfoPanel from '@src/components/sections/NoteInfoPanel';
import { api } from '@src/trpc/server';

type NotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const file = await api.file.byId({ id });
  if (!file) notFound();

  const course = file.section
    ? `${file.section.prefix} ${file.section.number}`
    : undefined;
  const authorName = file.author
    ? `${file.author.firstName} ${file.author.lastName}`.trim()
    : undefined;

  return (
    <>
      <Header />
      <main className="p-4 pt-0 flex w-full flex-col items-center gap-4">
        {/* Info panel pinned to the top, floats over the PDF */}
        <NoteInfoPanel
          fileId={id}
          name={file.name}
          description={file.description}
          authorId={file.authorId}
          authorName={authorName}
          authorUsername={file.author?.username ?? undefined}
          course={course}
          section={file.section?.sectionCode ?? undefined}
          profFirst={file.section?.profFirst ?? undefined}
          profLast={file.section?.profLast ?? undefined}
          updatedAt={file.updatedAt?.toLocaleDateString()}
        />

        {/* Scrollable area with white card background for the PDF */}
        <div className="h-hull w-full max-w-6xl">
          <div className="mx-auto rounded-2xl overflow-hidden shadow-lg max-w-[1200px] bg-white dark:bg-neutral-800">
            <iframe
              src={file.publicUrl}
              title={file.name}
              className="w-full h-[80vh] rounded border-0"
            />
          </div>
        </div>
      </main>
    </>
  );
}
