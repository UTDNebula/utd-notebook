import { notFound } from 'next/navigation';
import Header from '@src/components/header/Header';
import NoteInfoPanel from '@src/components/sections/NoteInfoPanel';
import PdfViewer from '@src/components/sections/PdfViewer';
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
          <div className="mx-auto rounded-2xl overflow-hidden shadow-lg max-w-[1200px] bg-white dark:bg-neutral-800 p-[50px]">
            {file.publicUrl ? (
              <PdfViewer url={file.publicUrl} title={file.name} />
            ) : (
              <p className="p-8 text-slate-500 dark:text-slate-400">
                PDF not available yet.
              </p>
            )}
          </div>
        </div>

        {/* Info panel pinned to the top, floats over the PDF */}
        <NoteInfoPanel
          fileId={id}
          name={file.name}
          description={file.description}
          authorId={file.authorId}
          authorName={authorName}
          course={course}
          section={file.section?.sectionCode ?? undefined}
          professor={professor}
          updatedAt={file.updatedAt?.toLocaleDateString()}
        />
      </main>
    </>
  );
}
