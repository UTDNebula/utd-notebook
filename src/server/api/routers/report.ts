import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { createReportSchema } from '@src/lib/schemas/moderation';
import { report as reports } from '@src/server/db/schema/reports';
import { createTRPCRouter, protectedProcedure, adminProcedure } from '../trpc';
import { SelectFileWithAuthorPreviewAndReports } from '@src/server/db/models';

const getReportByFileSchema = z.object({
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

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
    getReportsByFile: adminProcedure
      .input(getReportByFileSchema)
      .query(async ({ input, ctx }) => {
        const reports = await ctx.db.query.report.findMany({
          with: {
            file: {
              with: {
                author: {
                  columns: {
                    username: true,
                  },
                },
              },
            },
            reporter: {
              columns: {
                username: true,
              }
            },
          },
          orderBy: (report, { asc, desc }) =>
            input.sortOrder === 'asc'
              ? [asc(report.createdAt)]
              : [desc(report.createdAt)],
        });
        const reportedFiles: SelectFileWithAuthorPreviewAndReports[] = [];

        reports.map((r) => {
          // if file is already reported, store it & add to its reports list
          const existingFile = reportedFiles.find((reportedFile) => reportedFile.id === r.fileId);
          const {file, ...shortenedReport} = r;

          if (!existingFile) {
            reportedFiles.push({
                ...file,
                reports: [shortenedReport],
              })
          } else {
            existingFile.reports.push(shortenedReport);
          }
        });

        return reportedFiles;
      }),
});
