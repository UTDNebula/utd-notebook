'use client';

import Alert from '@mui/material/Alert';
import { useQuery } from '@tanstack/react-query';
import CreatedNotes from '@src/components/form/CreatedNotes';
import { useTRPC } from '@src/trpc/react';

type ProfileCreatedNotesProps = {
  username: string;
};

export default function ProfileCreatedNotes({
  username,
}: ProfileCreatedNotesProps) {
  const api = useTRPC();

  // Public profile pages resolve files by username instead of session user id.
  const { data, isLoading, error } = useQuery(
    api.file.getByUsername.queryOptions({ username }),
  );

  // Keep the UI shell stable while data loads or if the username is invalid.
  if (error) {
    return (
      <Alert severity="error" variant="filled" className="rounded-lg">
        Could not load notes for this profile.
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="w-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-md font-medium text-slate-600 dark:text-slate-400">
        Loading notes...
      </div>
    );
  }

  return <CreatedNotes createdNotes={data ?? []} />;
}
