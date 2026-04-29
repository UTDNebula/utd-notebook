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
  const professor =
    file.section?.profFirst || file.section?.profLast
      ? `${file.section.profFirst ?? ''} ${file.section.profLast ?? ''}`.trim()
      : undefined;
  const authorName = file.author
    ? `${file.author.firstName} ${file.author.lastName}`.trim()
    : undefined;

  return (
    <>
      <Header />
      <main className="relative overflow-hidden h-[calc(100dvh-68px)]">
        {/* Scrollable area with white card background for the PDF */}
        <div className="absolute inset-0 overflow-y-auto px-10 pt-40 pb-6">
          <div className="mx-auto rounded-2xl overflow-hidden shadow-lg max-w-[1200px] bg-white dark:bg-neutral-800">
            <iframe
              src={file.publicUrl}
              title={file.name}
              className="w-full h-[80vh] rounded border-0"
            />
          </div>
        </div>

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
      </main>
    </>
  );
}
