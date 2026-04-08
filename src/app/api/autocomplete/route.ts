import { NextResponse } from 'next/server';
import autocompleteGraph from 'src/data/autocomplete_graph.json';
import { getGraph, searchAutocomplete } from '@src/utils/autocomplete';
import type { GenericFetchedData } from '@src/utils/GenericFetchedData';
import { type SearchQueryWithTotalStudents } from '@src/utils/SearchQuery';
import { db } from '@src/server/db';
import { section } from '@src/server/db/schema/section';
import { file } from '@src/server/db/schema/file';
import { and, eq, or } from 'drizzle-orm';

const graph = getGraph(autocompleteGraph as object);

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

  // Check DB for notes
  const courseConditions = [];
  const profConditions = [];

  for (const res of results) {
    if (res.prefix && res.number) {
      courseConditions.push(
        and(eq(section.prefix, res.prefix), eq(section.number, res.number)),
      );
    } else if (res.profFirst && res.profLast) {
      profConditions.push(
        and(
          eq(section.profFirst, res.profFirst),
          eq(section.profLast, res.profLast),
        ),
      );
    }
  }

  const queryConditions = [];
  if (courseConditions.length > 0) {
    queryConditions.push(or(...courseConditions));
  }
  if (profConditions.length > 0) {
    queryConditions.push(or(...profConditions));
  }

  if (queryConditions.length > 0) {
    const existingSections = await db
      .select({
        prefix: section.prefix,
        number: section.number,
        profFirst: section.profFirst,
        profLast: section.profLast,
      })
      .from(section)
      .innerJoin(file, eq(file.sectionId, section.id))
      .where(or(...queryConditions));

    // Then for each in results, check if it matches existingSections
    for (const res of results) {
      res.hasNotes = existingSections.some(
        (s) =>
          (res.prefix && s.prefix === res.prefix && s.number === res.number) ||
          (res.profFirst &&
            s.profFirst === res.profFirst &&
            s.profLast === res.profLast),
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
