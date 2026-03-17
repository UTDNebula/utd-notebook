import type { ReactNode } from 'react';
import { BaseCard } from '@src/components/common/BaseCard';
import type { SectionWithFiles } from '@src/server/db/models';
import FileCard from './FileCard';

type FilesGridProps = {
  files: SectionWithFiles['files'];
  noFilesMessage?: ReactNode;
};

export default function FilesGrid({ files, noFilesMessage }: FilesGridProps) {
  if (files.length === 0) {
    if (noFilesMessage) {
      return noFilesMessage;
    }

    return (
      <BaseCard className="px-6 py-5 text-center">
        <h3 className="text-lg font-semibold">No files yet</h3>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Be the first to upload notes for this section.
        </p>
      </BaseCard>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {files.map((file) => (
        <FileCard key={file.id} file={file} />
      ))}
    </div>
  );
}
