import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { report as reports } from '@src/server/db/schema/reports';
import { createReportSchema } from '@src/utils/formSchemas';
import { createTRPCRouter, protectedProcedure } from '../trpc';

export const reportRouter = createTRPCRouter({
  create: protectedProcedure
    .input(createReportSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const existingFile = await ctx.db.query.file.findFirst({
        where: (fileRecord) => eq(fileRecord.id, input.fileId),
      });

      if (!existingFile) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'File not found',
        });
      }

      if (existingFile.authorId === userId) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You cannot report your own note.',
        });
      }

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
