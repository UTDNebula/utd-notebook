'use client';

import Panel from '@src/components/common/Panel';
import FilesGrid from '@src/components/sections/FilesGrid';
import type { SelectFile } from '@src/server/db/models';

type CreatedNotesProps = {
  createdNotes: SelectFile[];
};

export default function CreatedNotes({ createdNotes }: CreatedNotesProps) {
  return (
    <Panel heading="Created Notes">
      <FilesGrid
        files={createdNotes}
        noFilesMessage={
          <div className="w-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-md font-medium text-slate-600 dark:text-slate-400">
            You haven&apos;t created any notes yet.
          </div>
        }
      />
    </Panel>
  );
}
