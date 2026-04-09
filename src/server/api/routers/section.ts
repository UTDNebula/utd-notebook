import { and, eq, ilike } from 'drizzle-orm';
import { z } from 'zod';
import sectionsData from '@src/data/sections_data.json';
import { section } from '@src/server/db/schema/section';
import { normalizePrefix } from '@src/utils/section';
import type { SectionEntry } from '@src/utils/sectionEntry';
import { createTRPCRouter, publicProcedure } from '../trpc';

const termOrder: Record<string, number> = {
  Spring: 1,
  Summer: 2,
  Fall: 3,
};

// Pre-sort by year desc, term desc so search results are already ordered
const sections: SectionEntry[] = (sectionsData as SectionEntry[]).sort(
  (a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return (termOrder[b.term] ?? 0) - (termOrder[a.term] ?? 0);
  },
);

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
      with: {
        files: {
          with: {
            author: true,
          },
        },
      },
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
        with: {
          files: {
            with: {
              author: true,
            },
          },
        },
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
        with: {
          files: {
            with: {
              author: true,
            },
          },
        },
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
        with: {
          files: {
            with: {
              author: true,
            },
          },
        },
        orderBy: (sections, { desc }) => [
          desc(sections.year),
          desc(sections.term),
        ],
      });
    }),

  getAllCourses: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .selectDistinct({
        prefix: section.prefix,
        number: section.number,
      })
      .from(section)
      .orderBy(section.prefix, section.number);
  }),

  getAllProfessors: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .selectDistinct({
        profFirst: section.profFirst,
        profLast: section.profLast,
      })
      .from(section)
      .orderBy(section.profFirst, section.profLast);
  }),

  getAllCourseProfessorCombos: publicProcedure.query(async ({ ctx }) => {
    return ctx.db
      .selectDistinct({
        prefix: section.prefix,
        number: section.number,
        profFirst: section.profFirst,
        profLast: section.profLast,
      })
      .from(section)
      .orderBy(
        section.prefix,
        section.number,
        section.profFirst,
        section.profLast,
      );
  }),

  searchSections: publicProcedure
    .input(z.object({ query: z.string().min(2).max(100) }))
    .query(({ input }) => {
      const q = input.query.toUpperCase();
      const matches: SectionEntry[] = [];
      for (const s of sections) {
        if (s.label.toUpperCase().includes(q)) {
          matches.push(s);
          if (matches.length >= 20) break;
        }
      }
      return matches;
    }),
});
