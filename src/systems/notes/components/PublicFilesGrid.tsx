import type { ReactNode } from 'react';
import { BaseCard } from '@nebula-library/components/BaseCard';
import type { PublicFile } from '@src/server/publicNotes';
import PublicFileCard from './PublicFileCard';

type PublicFilesGridProps = {
  files: PublicFile[];
  noFilesMessage?: ReactNode;
};

export default function PublicFilesGrid({
  files,
  noFilesMessage,
}: PublicFilesGridProps) {
  if (files.length === 0) {
    return (
      noFilesMessage ?? (
        <BaseCard className="px-6 py-5 text-center">
          <h3 className="text-lg font-semibold">No files yet</h3>
        </BaseCard>
      )
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {files.map((file) => (
        <PublicFileCard key={file.id} file={file} />
      ))}
    </div>
  );
}
