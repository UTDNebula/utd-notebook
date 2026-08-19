import { and, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import autocompleteGraph from '@src/data/autocomplete_graph.json';
import { db } from '@src/server/db';
import { file } from '@src/server/db/schema/file';
import { section } from '@src/server/db/schema/section';
import { getGraph, searchAutocomplete } from '@src/utils/autocomplete';
import type { GenericFetchedData } from '@src/utils/GenericFetchedData';
import { type SearchQueryWithTotalStudents } from '@src/utils/SearchQuery';

const graph = getGraph(autocompleteGraph as object);

const CACHE_TTL_MS = 1000 * 60 * 1; // 1 minute

declare global {
  var __autocompleteCache:
    | Map<
        string,
        {
          hasNotes: boolean;
          timestamp: number;
        }
      >
    | undefined;
}

function getCache() {
  if (!globalThis.__autocompleteCache) {
    globalThis.__autocompleteCache = new Map();
  }
  return globalThis.__autocompleteCache;
}

async function checkHasNotesForCourse(
  prefix: string,
  number: string,
): Promise<boolean> {
  const result = await db
    .select({ id: section.id })
    .from(section)
    .innerJoin(file, eq(file.sectionId, section.id))
    .where(and(eq(section.prefix, prefix), eq(section.number, number)))
    .limit(1);
  return result.length > 0;
}

async function checkHasNotesForProf(
  profFirst: string,
  profLast: string,
): Promise<boolean> {
  const result = await db
    .select({ id: section.id })
    .from(section)
    .innerJoin(file, eq(file.sectionId, section.id))
    .where(
      and(eq(section.profFirst, profFirst), eq(section.profLast, profLast)),
    )
    .limit(1);
  return result.length > 0;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const input = searchParams.get('input');
  if (typeof input !== 'string') {
    return NextResponse.json(
      { message: 'error', data: 'Incorrect query parameters' },
      { status: 400 },
    );
  }

  let searchBy: 'any' | 'professor' | 'course' = 'any';
  const searchByParam = searchParams.get('searchBy');
  if (searchByParam === 'professor' || searchByParam === 'course') {
    searchBy = searchByParam;
  }

  let limit = 20;
  const limitParam = searchParams.get('limit');
  if (typeof limitParam === 'string' && !isNaN(Number(limitParam))) {
    limit = Number(limitParam);
  }

  const results = searchAutocomplete(graph, input, limit, searchBy);

  const cache = getCache();

  for (const res of results) {
    if (res.prefix && res.number) {
      const key = `course:${res.prefix.toLowerCase()}|${res.number}`;
      const cached = cache.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        res.hasNotes = cached.hasNotes;
      } else {
        const hasNotes = await checkHasNotesForCourse(res.prefix, res.number);
        res.hasNotes = hasNotes;
        cache.set(key, { hasNotes, timestamp: Date.now() });
      }
    } else if (res.profFirst && res.profLast) {
      const key = `prof:${res.profFirst.toLowerCase()}|${res.profLast.toLowerCase()}`;
      const cached = cache.get(key);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        res.hasNotes = cached.hasNotes;
      } else {
        const hasNotes = await checkHasNotesForProf(
          res.profFirst,
          res.profLast,
        );
        res.hasNotes = hasNotes;
        cache.set(key, { hasNotes, timestamp: Date.now() });
      }
    }
  }

  return NextResponse.json(
    {
      state: 'done',
      data: results,
    } satisfies GenericFetchedData<SearchQueryWithTotalStudents[]>,
    { status: 200 },
  );
}
