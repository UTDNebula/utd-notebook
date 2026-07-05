import { notFound } from 'next/navigation';
import { BaseCard } from '@src/nebula-library/components/BaseCard';
import Header from '@src/components/header/Header';
import NoteInfoPanel from '@src/components/sections/NoteInfoPanel';
import { api } from '@src/trpc/server';
import { addVersionToFile } from '@src/utils/fileCacheBust';

type NotePageProps = {
  params: Promise<{ id: string }>;
};

export default async function NotePage({ params }: NotePageProps) {
  const { id } = await params;
  const file = await api.file.byId({ id });
  if (!file) notFound();

  return (
    <div className="flex flex-col h-full">
      <Header />
      <main className="p-4 pt-0 flex w-full h-full flex-col items-center gap-4">
        {/* Info panel pinned to the top, floats over the PDF */}
        <NoteInfoPanel file={file} />

        {/* Scrollable area with white card background for the PDF */}
        <BaseCard className="h-full min-h-[50vh] w-full overflow-hidden max-w-6xl">
          <iframe
            src={addVersionToFile(file.publicUrl, file.updatedAt.getTime())}
            title={file.name}
            className="h-full w-full border-0"
          />
        </BaseCard>
      </main>
    </div>
  );
}
