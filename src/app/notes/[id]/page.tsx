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
      <main
        className="relative overflow-hidden"
        style={{
          height: 'calc(100dvh - 68px)',
          backgroundColor: '#F0EEF5',
        }}
      >
        {/* Scrollable area with white card background for the PDF */}
        <div className="absolute inset-0 overflow-y-auto px-10 py-6">
          <div
            className="mx-auto rounded-2xl overflow-hidden"
            style={{
              backgroundColor: '#FFFFFF',
              boxShadow: '0 2px 16px 0 rgba(124,96,191,0.10)',
              padding: '50px',
              maxWidth: '1200px',
            }}
          >
            {file.publicUrl ? (
              <PdfViewer url={file.publicUrl} title={file.name} />
            ) : (
              <p className="p-8 text-gray-500">PDF not available yet.</p>
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
