import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { report as reports } from '@src/server/db/schema/reports';
import { createTRPCRouter, protectedProcedure } from '../trpc';

const createReportInputSchema = z.object({
  fileId: z.string().min(1),
  category: z.enum([
    'inappropriate',
    'incorrect',
    'spam',
    'copyright',
    'other',
  ]),
  details: z
    .string()
    .min(10, 'Please provide a bit more detail')
    .max(1000, 'Character limit reached'),
});

export const reportRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createReportInputSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      try {
        const inserted = await ctx.db
          .insert(reports)
          .values({
            userId,
            fileId: input.fileId,
            category: input.category,
            details: input.details,
          })
          .returning({ id: reports.id });

        const created = inserted[0];
        if (!created) {
          throw new TRPCError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create report',
          });
        }

        return {
          success: true,
          id: created.id,
        };
      } catch (error) {
        console.error(error);
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message:
            'Unable to submit report. You may have already reported this note.',
        });
      }
    }),
});
