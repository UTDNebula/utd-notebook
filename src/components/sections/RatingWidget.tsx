'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useRef } from 'react';
import StyledRating from '@src/components/common/Rating';
import { useRegisterModal } from '@src/components/global/RegisterModalProvider';
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
  const useAuthPage = useRef(false);

  const { setShowRegisterModal } = useRegisterModal(() => {
    useAuthPage.current = true;
  });

  const { data: userRating, isPending: userRatingIsPending } = useQuery(
    api.savedNote.getUserRating.queryOptions({ fileId }),
  );

  const { data: averageRating, isPending: averageRatingIsPending } = useQuery(
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
            if (!old)
              return {
                average: variables.rating ?? 0,
                total: variables.rating ? 1 : 0,
              };
            const oldRating = previousUserRating?.rating;
            if (variables.rating === null) {
              // Removing rating
              if (
                oldRating !== null &&
                oldRating !== undefined &&
                old.total > 1
              ) {
                const newTotal = old.total - 1;
                const newAverage =
                  (old.average * old.total - oldRating) / newTotal;
                return { average: newAverage, total: newTotal };
              }
              return { average: 0, total: 0 };
            }
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
      onSuccess: (_data, variables) => {
        setSnackbar({
          message:
            variables.rating !== null ? 'Rating submitted!' : 'Rating removed',
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

    if (userRatingIsPending || averageRatingIsPending || rateMutation.isPending)
      return;

    if (!session) {
      // Falls back to auth page when not wrapped in a RegisterModalProvider
      if (useAuthPage.current) {
        router.push(
          `/auth?callbackUrl=${encodeURIComponent(window.location.href)}`,
        );
      } else {
        setShowRegisterModal(true);
      }
      return;
    }

    // null means the user clicked the same star to clear their rating
    rateMutation.mutate({
      fileId,
      rating: newValue !== null ? Math.round(newValue) : null,
    });
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
