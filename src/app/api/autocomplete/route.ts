import { and, eq, or } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import autocompleteGraph from 'src/data/autocomplete_graph.json';
import { db } from '@src/server/db';
import { file } from '@src/server/db/schema/file';
import { section } from '@src/server/db/schema/section';
import { getGraph, searchAutocomplete } from '@src/utils/autocomplete';
import type { GenericFetchedData } from '@src/utils/GenericFetchedData';
import { type SearchQueryWithTotalStudents } from '@src/utils/SearchQuery';

const graph = getGraph(autocompleteGraph as object);

const CACHE_TTL_MS = 1000 * 60 * 5;

declare global {
  var __autocompleteNotesCache:
    | {
        courseKeys: Set<string>;
        profKeys: Set<string>;
        lastUpdated: number;
        refreshPromise?: Promise<void>;
      }
    | undefined;
}

function getNotesCache() {
  if (!globalThis.__autocompleteNotesCache) {
    globalThis.__autocompleteNotesCache = {
      courseKeys: new Set(),
      profKeys: new Set(),
      lastUpdated: 0,
    };
  }
  return globalThis.__autocompleteNotesCache;
}

async function refreshNotesCache() {
  const cache = getNotesCache();
  if (cache.refreshPromise) {
    await cache.refreshPromise;
    return;
  }

  cache.refreshPromise = (async () => {
    const rows = await db
      .select({
        prefix: section.prefix,
        number: section.number,
        profFirst: section.profFirst,
        profLast: section.profLast,
      })
      .from(section)
      .innerJoin(file, eq(file.sectionId, section.id));

    const courseKeys = new Set<string>();
    const profKeys = new Set<string>();

    for (const row of rows) {
      if (row.prefix && row.number) {
        courseKeys.add(`${row.prefix.toLowerCase()}|${row.number}`);
      }
      if (row.profFirst && row.profLast) {
        profKeys.add(
          `${row.profFirst.toLowerCase()}|${row.profLast.toLowerCase()}`,
        );
      }
    }

    cache.courseKeys = courseKeys;
    cache.profKeys = profKeys;
    cache.lastUpdated = Date.now();
    cache.refreshPromise = undefined;
  })();

  await cache.refreshPromise;
}

async function ensureNotesCacheFresh() {
  const cache = getNotesCache();
  if (Date.now() - cache.lastUpdated > CACHE_TTL_MS) {
    await refreshNotesCache();
  }
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

  await ensureNotesCacheFresh();
  const cache = getNotesCache();

  for (const res of results) {
    if (res.prefix && res.number) {
      res.hasNotes = cache.courseKeys.has(
        `${res.prefix.toLowerCase()}|${res.number}`,
      );
    } else if (res.profFirst && res.profLast) {
      res.hasNotes = cache.profKeys.has(
        `${res.profFirst.toLowerCase()}|${res.profLast.toLowerCase()}`,
      );
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
