'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Tooltip } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import { useState } from 'react';
import Confirmation from '@src/lib/components/Confirmation';
import { setSnackbar } from '@src/lib/modules/snackbar/Snackbar';
import { useTRPC } from '@src/lib/trpc/react';

type NoteDeleteButtonProps = {
  fileId: string;
  fallbackHref?: string;
};

export default function NoteDeleteButton({
  fileId,
  fallbackHref,
}: NoteDeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const api = useTRPC();
  const router = useRouter();
  const deleteMutation = useMutation(api.file.delete.mutationOptions());

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      <Tooltip title="Delete Note">
        <IconButton
          size="small"
          aria-label="Delete Note"
          sx={{
            backgroundColor: 'error.main',
            color: 'common.white',
            '&:hover': {
              backgroundColor: 'error.dark',
            },
          }}
          onClick={handleClick}
        >
          <DeleteIcon />
        </IconButton>
      </Tooltip>
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
                if (!fallbackHref) {
                  setSnackbar({
                    message: 'Note deleted. Returning to the home page.',
                    type: 'warning',
                    autoHideDuration: true,
                    closeOn: ['timeout', 'escapeKeyDown', 'dismiss'],
                  });
                  router.replace('/');
                  return;
                }

                router.replace(fallbackHref);
              },
            },
          );
        }}
        loading={deleteMutation.isPending}
      />
    </>
  );
}
