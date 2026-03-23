'use client';

import DeleteIcon from '@mui/icons-material/Delete';
import { IconButton, Tooltip } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { MouseEvent } from 'react';
import { useState } from 'react';
import Confirmation from '@src/components/Confirmation';
import { useTRPC } from '@src/trpc/react';

export default function NoteDeleteButton({ fileId }: { fileId: string }) {
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
