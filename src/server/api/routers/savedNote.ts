import { and, avg, count, eq, isNotNull } from 'drizzle-orm';
import { z } from 'zod';
import { userMetadataToNotes } from '@src/server/db/schema/savedNote';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

const byFileIdSchema = z.object({
  fileId: z.string(),
});

export const savedNoteRouter = createTRPCRouter({
  toggle: protectedProcedure
    .input(byFileIdSchema)
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const existing = await ctx.db.query.userMetadataToNotes.findFirst({
        where: and(
          eq(userMetadataToNotes.userId, userId),
          eq(userMetadataToNotes.fileId, input.fileId),
        ),
      });

      if (existing) {
        const newSaved = !existing.saved;
        await ctx.db
          .update(userMetadataToNotes)
          .set({ saved: newSaved })
          .where(
            and(
              eq(userMetadataToNotes.userId, userId),
              eq(userMetadataToNotes.fileId, input.fileId),
            ),
          );
        return { saved: newSaved };
      }

      await ctx.db.insert(userMetadataToNotes).values({
        userId,
        fileId: input.fileId,
        saved: true,
      });

      return { saved: true };
    }),

  isSaved: publicProcedure
    .input(byFileIdSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user) {
        return { saved: false };
      }

      const row = await ctx.db.query.userMetadataToNotes.findFirst({
        where: and(
          eq(userMetadataToNotes.userId, ctx.session.user.id),
          eq(userMetadataToNotes.fileId, input.fileId),
        ),
      });

      return { saved: row?.saved ?? false };
    }),

  getSavedNotes: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db.query.userMetadataToNotes.findMany({
      where: and(
        eq(userMetadataToNotes.userId, ctx.session.user.id),
        eq(userMetadataToNotes.saved, true),
      ),
      with: {
        file: true,
      },
    });

    return rows.map((row) => row.file);
  }),

  rate: protectedProcedure
    .input(
      z.object({
        fileId: z.string(),
        rating: z.number().int().min(1).max(5).nullable(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.session.user.id;

      const existing = await ctx.db.query.userMetadataToNotes.findFirst({
        where: and(
          eq(userMetadataToNotes.userId, userId),
          eq(userMetadataToNotes.fileId, input.fileId),
        ),
      });

      if (existing) {
        await ctx.db
          .update(userMetadataToNotes)
          .set({ rating: input.rating })
          .where(
            and(
              eq(userMetadataToNotes.userId, userId),
              eq(userMetadataToNotes.fileId, input.fileId),
            ),
          );
        return { rating: input.rating };
      }

      // Only insert a new row if setting a rating (not clearing one)
      if (input.rating !== null) {
        await ctx.db.insert(userMetadataToNotes).values({
          userId,
          fileId: input.fileId,
          saved: false,
          rating: input.rating,
        });
      }

      return { rating: input.rating };
    }),

  getUserRating: publicProcedure
    .input(byFileIdSchema)
    .query(async ({ input, ctx }) => {
      if (!ctx.session?.user) {
        return { rating: null };
      }

      const row = await ctx.db.query.userMetadataToNotes.findFirst({
        where: and(
          eq(userMetadataToNotes.userId, ctx.session.user.id),
          eq(userMetadataToNotes.fileId, input.fileId),
        ),
      });

      return { rating: row?.rating ?? null };
    }),

  getAverageRating: publicProcedure
    .input(byFileIdSchema)
    .query(async ({ input, ctx }) => {
      const [result] = await ctx.db
        .select({
          average: avg(userMetadataToNotes.rating),
          total: count(userMetadataToNotes.rating),
        })
        .from(userMetadataToNotes)
        .where(
          and(
            eq(userMetadataToNotes.fileId, input.fileId),
            isNotNull(userMetadataToNotes.rating),
          ),
        );

      return {
        average: result?.average ? parseFloat(result.average) : 0,
        total: result?.total ?? 0,
      };
    }),
});
