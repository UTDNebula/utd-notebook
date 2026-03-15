import { and, eq } from 'drizzle-orm';
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
});
