import { db } from '@src/server/db';
import { section } from '@src/server/db/schema/section';
import { isPotentialPrefix, searchSections } from '@src/utils/searchSections';
import { eq, or, ilike, and, sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export interface SectionSearchResult {
  prefix: string;
  number: string;
  sectionCode: string;
  term: string;
  year: number;
  profFirst: string;
  profLast: string;
  id: string;
  source: 'database' | 'trends';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('query');
  const rawLimit = parseInt(searchParams.get('limit') ?? '20', 10);
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(rawLimit, 1), 20)
    : 20;

  if (typeof query !== 'string' || query.trim().length === 0) {
    return NextResponse.json(
      { message: 'error', data: 'Query parameter is required' },
      { status: 400 },
    );
  }

  try {
    // First, search in our database
    const dbResults = await searchDatabaseSections(query, limit);

    // If we have enough results from database, return them
    if (dbResults.length >= limit) {
      return NextResponse.json({
        message: 'success',
        data: dbResults.slice(0, limit),
      });
    }

    // Otherwise, supplement with Trends algorithm results
    const trendsResults = await searchSections(query, limit - dbResults.length);

    // Combine and deduplicate results
    const combinedResults = [...dbResults, ...trendsResults];
    const uniqueResults = deduplicateResults(combinedResults);
    return NextResponse.json({
      message: 'success',
      data: uniqueResults.slice(0, limit),
    });
  } catch (error) {
    console.error('Section search error:', error);
    return NextResponse.json(
      {
        message: 'error',
        data: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

async function searchDatabaseSections(
  query: string,
  limit: number,
): Promise<SectionSearchResult[]> {
  const trimmedQuery = query.trim();
  const normalizedQuery = trimmedQuery.toUpperCase();

  // Parse query to extract course prefix/number only when the prefix is valid
  const courseMatch = normalizedQuery.match(/^([A-Z]{2,4})(?:\s+(\d{4}))?$/);
  const prefixToken = courseMatch?.[1] ?? '';
  const hasValidPrefix =
    prefixToken.length > 0 && isPotentialPrefix(prefixToken).includes(prefixToken);

  let results: typeof section.$inferSelect[] = [];

  if (courseMatch && hasValidPrefix) {
    // Search by course code (e.g., "CS 1337" or "CS")
    const prefix = courseMatch[1]!;
    const number = courseMatch[2];

    if (number) {
      results = await db
        .select()
        .from(section)
        .where(and(eq(section.prefix, prefix), eq(section.number, number)))
        .limit(limit);
    } else {
      results = await db
        .select()
        .from(section)
        .where(eq(section.prefix, prefix))
        .limit(limit);
    }
  } else {
    // Search by professor name
    const searchPattern = `%${trimmedQuery.toUpperCase()}%`;
    results = await db
      .select()
      .from(section)
      .where(
        or(
          ilike(section.profFirst, searchPattern),
          ilike(section.profLast, searchPattern),
          sql`CONCAT(${section.profFirst}, ' ', ${section.profLast}) ILIKE ${searchPattern}`,
        ),
      )
      .limit(limit);
  }

  return results.map((r) => ({
    ...r,
    source: 'database' as const,
  }));
}

function deduplicateResults(
  results: SectionSearchResult[],
): SectionSearchResult[] {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = `${result.prefix}-${result.number}-${result.sectionCode}-${result.term}-${result.year}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
