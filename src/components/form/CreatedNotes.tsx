'use client';

import Panel from '@src/components/common/Panel';
import EmptyStateCard from '@src/components/sections/EmptyStateCard';
import FilesGrid from '@src/components/sections/FilesGrid';
import type { SelectFileWithAuthorPreview } from '@src/server/db/models';

type CreatedNotesProps = {
  createdNotes: SelectFileWithAuthorPreview[];
};

export default function CreatedNotes({ createdNotes }: CreatedNotesProps) {
  return (
    <Panel heading="Created Notes">
      {createdNotes.length === 0 ? (
        <EmptyStateCard
          title="No uploaded notes yet"
          description="This user hasn't uploaded any notes yet."
        />
      ) : (
        <FilesGrid files={createdNotes} />
      )}
    </Panel>
  );
}
