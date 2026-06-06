'use client';

import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import { Button } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { setSnackbar } from '@src/components/global/Snackbar';
import { useTRPC } from '@src/trpc/react';
import { authClient } from '@src/utils/auth-client';

type SaveButtonProps = {
  fileId: string;
};

export default function SaveButton({ fileId }: SaveButtonProps) {
  const api = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const { data: savedState } = useQuery(
    api.savedNote.isSaved.queryOptions({ fileId }),
  );

  const toggleMutation = useMutation(
    api.savedNote.toggle.mutationOptions({
      onMutate: async () => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey: api.savedNote.isSaved.queryKey({ fileId }),
        });

        // Remember previous value
        const previous = queryClient.getQueryData(
          api.savedNote.isSaved.queryKey({ fileId }),
        );

        // Optimistically update the cache
        queryClient.setQueryData(
          api.savedNote.isSaved.queryKey({ fileId }),
          (old: { saved: boolean } | undefined) => ({
            saved: !(old?.saved ?? false),
          }),
        );

        // Return context for rollback
        return { previous };
      },
      onSuccess: (data) => {
        setSnackbar({
          message: data.saved ? 'Note saved!' : 'Note unsaved',
          type: 'success',
          autoHideDuration: true,
          fitContent: true,
          closeOn: ['timeout', 'escapeKeyDown', 'dismiss'],
        });
      },
      onError: (_err, _vars, context) => {
        if (context?.previous) {
          queryClient.setQueryData(
            api.savedNote.isSaved.queryKey({ fileId }),
            context.previous,
          );
        }
        setSnackbar({
          message: 'Failed to save note',
          type: 'error',
          autoHideDuration: false,
          showClose: true,
        });
      },
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: api.savedNote.isSaved.queryKey({ fileId }),
        });
      },
    }),
  );

  const isSaved = savedState?.saved ?? false;

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      router.push(
        `/auth?callbackUrl=${encodeURIComponent(window.location.href)}`,
      );
      return;
    }

    toggleMutation.mutate({ fileId });
  };

  return (
    <Button
      variant="contained"
      size="small"
      onClick={handleClick}
      className="normal-case bg-white hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-haiti dark:text-white"
      startIcon={isSaved ? <BookmarkIcon /> : <BookmarkBorderIcon />}
    >
      {isSaved ? 'Saved' : 'Save'}
    </Button>
  );
}
