'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import StyledRating from '@src/components/common/Rating';
import { setSnackbar } from '@src/components/global/Snackbar';
import { useTRPC } from '@src/trpc/react';
import { authClient } from '@src/utils/auth-client';

type RatingWidgetProps = {
  fileId: string;
};

export default function RatingWidget({ fileId }: RatingWidgetProps) {
  const api = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const { data: userRating } = useQuery(
    api.savedNote.getUserRating.queryOptions({ fileId }),
  );

  const { data: averageRating } = useQuery(
    api.savedNote.getAverageRating.queryOptions({ fileId }),
  );

  const rateMutation = useMutation(
    api.savedNote.rate.mutationOptions({
      onMutate: async (variables) => {
        // Cancel outgoing refetches
        await queryClient.cancelQueries({
          queryKey: api.savedNote.getUserRating.queryKey({ fileId }),
        });
        await queryClient.cancelQueries({
          queryKey: api.savedNote.getAverageRating.queryKey({ fileId }),
        });

        // Remember previous values
        const previousUserRating = queryClient.getQueryData(
          api.savedNote.getUserRating.queryKey({ fileId }),
        );
        const previousAverage = queryClient.getQueryData(
          api.savedNote.getAverageRating.queryKey({ fileId }),
        );

        // Optimistically update user rating
        queryClient.setQueryData(
          api.savedNote.getUserRating.queryKey({ fileId }),
          { rating: variables.rating },
        );

        // Optimistically update average rating
        queryClient.setQueryData(
          api.savedNote.getAverageRating.queryKey({ fileId }),
          (old: { average: number; total: number } | undefined) => {
            if (!old || old.total === 0) {
              return { average: variables.rating, total: 1 };
            }
            const oldRating = previousUserRating?.rating;
            if (oldRating !== null && oldRating !== undefined) {
              // Updating existing rating: adjust average
              const newAverage =
                (old.average * old.total - oldRating + variables.rating) /
                old.total;
              return { average: newAverage, total: old.total };
            }
            // New rating: add to average
            const newTotal = old.total + 1;
            const newAverage =
              (old.average * old.total + variables.rating) / newTotal;
            return { average: newAverage, total: newTotal };
          },
        );

        // Return context for rollback
        return { previousUserRating, previousAverage };
      },
      onSuccess: () => {
        setSnackbar({
          message: 'Rating submitted!',
          type: 'success',
          autoHideDuration: true,
          fitContent: true,
          closeOn: ['timeout', 'escapeKeyDown', 'dismiss'],
        });
      },
      onError: (_err, _vars, context) => {
        if (context?.previousUserRating) {
          queryClient.setQueryData(
            api.savedNote.getUserRating.queryKey({ fileId }),
            context.previousUserRating,
          );
        }
        if (context?.previousAverage) {
          queryClient.setQueryData(
            api.savedNote.getAverageRating.queryKey({ fileId }),
            context.previousAverage,
          );
        }
        setSnackbar({
          message: 'Failed to submit rating',
          type: 'error',
          autoHideDuration: false,
          showClose: true,
        });
      },
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: api.savedNote.getUserRating.queryKey({ fileId }),
        });
        void queryClient.invalidateQueries({
          queryKey: api.savedNote.getAverageRating.queryKey({ fileId }),
        });
      },
    }),
  );

  const handleRatingChange = (
    e: React.SyntheticEvent,
    newValue: number | null,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      router.push(
        `/auth?callbackUrl=${encodeURIComponent(window.location.href)}`,
      );
      return;
    }

    if (newValue !== null) {
      rateMutation.mutate({ fileId, rating: newValue });
    }
  };

  const avg = averageRating?.average ?? 0;
  const total = averageRating?.total ?? 0;

  return (
    <div
      className="flex items-center gap-2"
      onClick={(e) => e.stopPropagation()}
    >
      <StyledRating
        value={userRating?.rating ?? avg}
        precision={userRating?.rating ? 1 : 0.5}
        onChange={handleRatingChange}
        size="small"
      />
      <span className="text-xs text-slate-600 dark:text-slate-400">
        {avg > 0 ? `${avg.toFixed(1)} (${total})` : 'No ratings'}
      </span>
    </div>
  );
}
