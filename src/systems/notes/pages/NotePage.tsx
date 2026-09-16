import { notFound } from 'next/navigation';
import { BaseCard } from '@nebula-library/components/BaseCard';
import { getNoteFileUrl } from '@src/lib/note-files/noteFile';
import { api } from '@src/lib/trpc/server';
import { addVersionToFile } from '@src/lib/utils/fileCacheBust';
import NoteInfoPanel from '@src/systems/notes/components/NoteInfoPanel';
import Header from '@src/systems/search/components/Header';

type NotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const file = await api.file.byId({ id });
  if (!file) notFound();

  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="flex h-full w-full flex-col items-center gap-4 p-4 pt-0">
        {/* Info panel pinned to the top, floats over the PDF */}
        <NoteInfoPanel file={file} />

        {/* Scrollable area with white card background for the PDF */}
        <BaseCard className="h-full min-h-[50vh] w-full max-w-6xl overflow-hidden">
          <iframe
            src={addVersionToFile(
              getNoteFileUrl(file.id),
              file.updatedAt.getTime(),
            )}
            referrerPolicy="no-referrer"
            title={file.name}
            className="h-full w-full border-0"
          />
        </BaseCard>
      </main>
    </div>
  );
}
