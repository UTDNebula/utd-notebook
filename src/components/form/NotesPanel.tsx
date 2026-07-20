'use client';

import type { ReactNode } from 'react';
import Panel from '@nebula-library/components/Panel';
import FilesGrid from '@src/components/sections/FilesGrid';
import type { SelectFileWithAuthorPreview } from '@src/server/db/models';

type NotesProps = {
  notes: SelectFileWithAuthorPreview[];
  heading?: ReactNode;
  noFilesMessage?: ReactNode;
};

export default function NotesPanel({
  notes,
  heading = 'Notes',
  noFilesMessage,
}: NotesProps) {
  return (
    <Panel heading={heading}>
      <FilesGrid
        files={notes}
        noFilesMessage={
          noFilesMessage ?? (
            <div className="w-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-md font-medium text-slate-600 dark:text-slate-400">
              You haven&apos;t created any notes yet.
            </div>
          )
        }
      />
    </Panel>
  );
}
