'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import { Button } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Confirmation from '@src/components/Confirmation';
import { useTRPC } from '@src/trpc/react';

export default function NoteDeleteButton({ fileId }: { fileId: string }) {
  const [open, setOpen] = useState(false);
  const api = useTRPC();
  const router = useRouter();
  const deleteMutation = useMutation(api.file.delete.mutationOptions());

  return (
    <>
      <Button
        variant="contained"
        size="small"
        className="normal-case bg-white hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-haiti dark:text-white"
        startIcon={<DeleteIcon />}
        onClick={() => setOpen(true)}
      >
        Delete
      </Button>
      <Confirmation
        open={open}
        onClose={() => setOpen(false)}
        contentText="This will permanently delete this note. This action cannot be undone."
        onConfirm={() => {
          deleteMutation.mutate(
            { id: fileId },
            {
              onSuccess: () => {
                setOpen(false);
                router.refresh();
              },
            },
          );
        }}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
