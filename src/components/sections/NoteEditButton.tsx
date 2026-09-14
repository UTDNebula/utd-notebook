'use client';

import EditIcon from '@mui/icons-material/Edit';
import { Button } from '@mui/material';
import Link from 'next/link';

export default function NoteEditButton({ fileId }: { fileId: string }) {
  return (
    <Button
      LinkComponent={Link}
      href={`/notes/${fileId}/edit`}
      variant="contained"
      size="small"
      className="text-haiti bg-white normal-case hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
      startIcon={<EditIcon />}
    >
      Edit
    </Button>
  );
}
