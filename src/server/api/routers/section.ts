import { and, eq, ilike } from 'drizzle-orm';
import { z } from 'zod';
import sectionsData from '@src/data/sections_data.json';
import { section } from '@src/server/db/schema/section';
import { normalizePrefix } from '@src/utils/section';
import type { SectionEntry } from '@src/utils/sectionEntry';
import { createTRPCRouter, publicProcedure } from '../trpc';

// Already sorted by year desc, term desc at build time (generateSectionsData.ts)
const sections: SectionEntry[] = sectionsData as SectionEntry[];

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[] = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    let prev = dp[0]!;
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j]!;
      dp[j] =
        a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[j]!, dp[j - 1]!);
      prev = temp;
    }
  }
  return dp[n]!;
}

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
      // Normalize: insert space between letters and digits ("CS1200" -> "CS 1200")
      const normalized = input.query
        .replace(/([a-zA-Z]{2,4})(\d)/, '$1 $2')
        .replace(/(\d)([a-zA-Z]{1,4})/, '$1 $2');
      const tokens = normalized.toLowerCase().split(/\s+/).filter(Boolean);
      if (tokens.length === 0) return [];

      const maxDistPerToken = 2;
      const scored: { entry: SectionEntry; score: number }[] = [];

      for (const s of sections) {
        const fields = [
          s.prefix,
          s.number,
          s.sectionCode,
          s.term,
          String(s.year),
          s.profFirst,
          s.profLast,
        ].map((f) => f.toLowerCase());

        let totalScore = 0;
        let valid = true;

        for (const token of tokens) {
          let minDist = Infinity;
          for (const field of fields) {
            if (field.includes(token)) {
              minDist = 0;
              break;
            }
            minDist = Math.min(minDist, levenshtein(token, field));
          }
          if (minDist > maxDistPerToken) {
            valid = false;
            break;
          }
          totalScore += minDist;
        }

        if (valid) {
          scored.push({ entry: s, score: totalScore });
        }
      }

      scored.sort((a, b) => a.score - b.score);
      return scored.slice(0, 20).map((s) => s.entry);
    }),
});
