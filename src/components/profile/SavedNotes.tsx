'use client';

import { useQuery } from '@tanstack/react-query';
import Panel from '@src/components/common/Panel';
import EmptyStateCard from '@src/components/sections/EmptyStateCard';
import FilesGrid from '@src/components/sections/FilesGrid';
import type { SelectFileWithAuthorPreview } from '@src/server/db/models';
import { useTRPC } from '@src/trpc/react';

export default function SavedNotes() {
  const api = useTRPC();

  // getSavedNotes is session-scoped (protected) and returns the current user's saved files.
  const { data, isLoading } = useQuery(api.savedNote.getSavedNotes.queryOptions());

  // Reuse FilesGrid/FileCard rendering; empty and loading states stay within this panel.
  const savedNotes = (data ?? []) as SelectFileWithAuthorPreview[];

  return (
    <Panel heading="Saved Notes">
      {isLoading ? (
        <div className="w-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-md font-medium text-slate-600 dark:text-slate-400">
          Loading saved notes...
        </div>
      ) : savedNotes.length === 0 ? (
        <EmptyStateCard
          title="No saved notes"
          description="No saved notes found."
        />
      ) : (
        <FilesGrid files={savedNotes} />
      )}
    </Panel>
  );
}
