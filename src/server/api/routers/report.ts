import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { report } from '@src/server/db/schema/reports';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const reportRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
        category: z.string(),
        details: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      try {
        await ctx.db.insert(report).values({
          userId,
          fileId: input.fileId,
          category: input.category,
          details: input.details,
        });

        return { success: true };
      } catch (error: any) {
        // PostgreSQL unique constraint violation
        if (error?.code === '23505') {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'You have already reported this file',
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to submit report',
        });
      }
    }),
});
