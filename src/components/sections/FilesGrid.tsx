import { BaseCard } from '@src/components/common/BaseCard';
import type { SectionWithFiles } from '@src/server/db/models';
import FileCard from './FileCard';

type FilesGridProps = {
  files: SectionWithFiles['files'];
};

export default function FilesGrid({ files }: FilesGridProps) {
  if (files.length === 0) {
    return (
      <BaseCard className="bg-white/85 dark:bg-neutral-900/85 backdrop-blur px-6 py-5 text-center">
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
