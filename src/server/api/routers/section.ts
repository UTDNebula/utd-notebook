import { and, eq, ilike } from 'drizzle-orm';
import { z } from 'zod';
import { section } from '@src/server/db/schema/section';
import { normalizePrefix } from '@src/utils/section';
import { createTRPCRouter, publicProcedure } from '../trpc';

const byIdSchema = z.object({
  id: z.string(),
});

const byCourseSchema = z.object({
  prefix: z.string(),
  number: z.string(),
});

const byProfessorSchema = z.object({
  profFirst: z.string(),
  profLast: z.string(),
});

const byCourseAndProfessorSchema = z.object({
  prefix: z.string(),
  number: z.string(),
  profFirst: z.string(),
  profLast: z.string(),
});

export const sectionRouter = createTRPCRouter({
  getSectionById: publicProcedure.input(byIdSchema).query(({ input, ctx }) =>
    ctx.db.query.section.findFirst({
      where: eq(section.id, input.id),
      with: { files: true },
    }),
  ),

  getNotesByCourse: publicProcedure
    .input(byCourseSchema)
    .query(async ({ input, ctx }) => {
      const normalizedPrefix = normalizePrefix(input.prefix);

      return ctx.db.query.section.findMany({
        where: and(
          eq(section.prefix, normalizedPrefix),
          eq(section.number, input.number),
        ),
        with: { files: true },
        orderBy: (sections, { desc }) => [
          desc(sections.year),
          desc(sections.term),
        ],
      });
    }),

  getNotesByProfessor: publicProcedure
    .input(byProfessorSchema)
    .query(async ({ input, ctx }) => {
      return ctx.db.query.section.findMany({
        where: and(
          ilike(section.profFirst, input.profFirst),
          ilike(section.profLast, input.profLast),
        ),
        with: { files: true },
        orderBy: (sections, { desc }) => [
          desc(sections.year),
          desc(sections.term),
        ],
      });
    }),

  getNotesByCourseAndProfessor: publicProcedure
    .input(byCourseAndProfessorSchema)
    .query(async ({ input, ctx }) => {
      const normalizedPrefix = normalizePrefix(input.prefix);

      return ctx.db.query.section.findMany({
        where: and(
          eq(section.prefix, normalizedPrefix),
          eq(section.number, input.number),
          ilike(section.profFirst, input.profFirst),
          ilike(section.profLast, input.profLast),
        ),
        with: { files: true },
        orderBy: (sections, { desc }) => [
          desc(sections.year),
          desc(sections.term),
        ],
      });
    }),
});
