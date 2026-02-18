import type { SectionSearchResult } from '@src/app/api/sections/search/route';

interface SearchQuery {
  prefix?: string;
  number?: string;
  profFirst?: string;
  profLast?: string;
}

type NebulaResponse<T> = {
  message: string;
  data: T;
};

type AutocompleteProfessor = {
  first_name: string;
  last_name: string;
};

type AutocompleteSection = {
  section_number: string;
  professors: AutocompleteProfessor[];
};

type AutocompleteAcademicSession = {
  academic_session: {
    name: string;
  };
  sections: AutocompleteSection[];
};

type AutocompleteCourseNumber = {
  course_number: string;
  title: string;
  academic_sessions: AutocompleteAcademicSession[];
};

type AutocompletePrefixGroup = {
  subject_prefix: string;
  course_numbers: AutocompleteCourseNumber[];
};

type TrendsSection = {
  _id: string;
  section_number?: string;
  academic_session?: { name?: string };
  course_details?: Array<{
    subject_prefix?: string;
    course_number?: string;
    title?: string;
  }>;
  professor_details?: Array<{
    first_name?: string;
    last_name?: string;
  }>;
};

type CourseNameResult = {
  title: string;
  result: SearchQuery;
};

type ResultWDistance = CourseNameResult & {
  distance: number;
};

const LIMIT = 20;

const responseCache: {
  fetchedAt: number;
  data: AutocompletePrefixGroup[];
} = {
  fetchedAt: 0,
  data: [],
};

const CACHE_TTL_MS = 1000 * 60 * 10;

/**
 * Searches for sections using a modified version of the Trends algorithm.
 * This function provides fallback search functionality when database results are insufficient.
 * 
 * Based on UTD Trends search implementation:
 * https://github.com/UTDNebula/utd-trends
 */
export async function searchSections(
  query: string,
  limit: number = 20,
): Promise<SectionSearchResult[]> {
  const trimmedInput = query.trim();
  if (trimmedInput.length === 0) return [];

  const boundedLimit = Math.min(Math.max(limit, 1), LIMIT);
  const aggregatedData = await getAutocompleteData();
  if (aggregatedData.length === 0) return [];

  const courseNameMatches = searchCourseNames(aggregatedData, trimmedInput).slice(
    0,
    Math.max(boundedLimit, 8),
  );

  const professorMatches = searchProfessors(aggregatedData, trimmedInput).slice(
    0,
    Math.max(boundedLimit, 8),
  );

  const directProfessorQueries = buildDirectProfessorQueries(trimmedInput);
  const professorQueries = deduplicateSearchQueries([
    ...professorMatches,
    ...directProfessorQueries,
  ]).slice(0, Math.max(boundedLimit, 10));

  const [courseSectionGroups, professorSectionGroups] = await Promise.all([
    Promise.allSettled(
      courseNameMatches.map((match) => fetchCourseSections(match.result)),
    ),
    Promise.allSettled(
      professorQueries.map((match) => fetchProfessorSections(match)),
    ),
  ]);

  const trendsSections = [
    ...courseSectionGroups
      .filter((item): item is PromiseFulfilledResult<TrendsSection[]> =>
        item.status === 'fulfilled',
      )
      .flatMap((item) => item.value),
    ...professorSectionGroups
      .filter((item): item is PromiseFulfilledResult<TrendsSection[]> =>
        item.status === 'fulfilled',
      )
      .flatMap((item) => item.value),
  ];

  const normalized = trendsSections
    .map(normalizeTrendsSection)
    .filter((item): item is SectionSearchResult => item !== null);

  return deduplicateSections(normalized).slice(0, boundedLimit);
}

async function getAutocompleteData(): Promise<AutocompletePrefixGroup[]> {
  const now = Date.now();
  if (
    responseCache.data.length > 0 &&
    now - responseCache.fetchedAt < CACHE_TTL_MS
  ) {
    return responseCache.data;
  }

  const apiUrl = process.env.NEBULA_API_URL;
  const apiKey = process.env.NEBULA_API_KEY;
  if (!apiUrl || !apiKey) {
    return [];
  }

  const res = await fetch(buildApiUrl(apiUrl, 'autocomplete/dag'), {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    return [];
  }

  const body = (await res.json()) as NebulaResponse<AutocompletePrefixGroup[]>;
  if (body.message !== 'success' || !Array.isArray(body.data)) {
    return [];
  }

  responseCache.fetchedAt = now;
  responseCache.data = body.data;
  return body.data;
}

function buildApiUrl(base: string, path: string): string {
  const sanitizedBase = base.endsWith('/') ? base : `${base}/`;
  const sanitizedPath = path.startsWith('/') ? path.slice(1) : path;
  return `${sanitizedBase}${sanitizedPath}`;
}

function getCourseNameTable(data: AutocompletePrefixGroup[]): {
  [key: string]: SearchQuery[];
} {
  const table: { [key: string]: SearchQuery[] } = {};

  for (const prefixData of data) {
    for (const courseData of prefixData.course_numbers) {
      const title = courseData.title?.trim();
      if (!title) continue;

      const query: SearchQuery = {
        prefix: prefixData.subject_prefix,
        number: courseData.course_number,
      };

      if (!Object.prototype.hasOwnProperty.call(table, title)) {
        table[title] = [query];
      } else {
        table[title]!.push(query);
      }
    }
  }

  return table;
}

function searchCourseNames(
  data: AutocompletePrefixGroup[],
  input: string,
): CourseNameResult[] {
  const courseNameTable = getCourseNameTable(data);
  const coursePrefixes = Array.from(
    new Set(
      Object.values(courseNameTable)
        .flat()
        .map((query) => query.prefix),
    ),
  ).filter(
    (prefix): prefix is string => typeof prefix === 'string' && prefix.length > 0,
  );

  const normalizedInput = input.toLowerCase();
  const inputWords = normalizedInput.split(' ').filter((word) => word.length > 0);
  const inputArr = inputWords.filter(
    (word) =>
      isPotentialPrefixWithList(word, coursePrefixes).length === 0 &&
      isPotentialCourseNumber(word).length === 0,
  );

  const prefixes = inputWords
    .map((word) => isPotentialPrefixWithList(word, coursePrefixes))
    .flat();
  const courseNumbers = inputWords
    .map((word) => isPotentialCourseNumber(word))
    .filter((word) => word.length > 0);

  const scoredResults: ResultWDistance[] = [];

  for (const title in courseNameTable) {
    const titleWords = title.toLowerCase().split(/\s+/);
    const distances = titleWords.map((word) => minEditDistance(inputArr, word));

    const newResults: ResultWDistance[] = courseNameTable[title]!.map((result) => {
      const distanceMetric = distances
        .sort((a, b) => a - b)
        .reduce((partialSum, dist, i) => partialSum + Math.pow(0.7, i) * dist, 0);

      const smartWordCapture = inputArr
        .map((word) => {
          let bestScore = 0;

          titleWords.forEach((tw) => {
            if (tw.includes(word)) {
              bestScore = Math.min(bestScore, -10);
              return;
            }

            const similarity = findSimilarity(word, tw);
            if (similarity > 0.7) {
              bestScore = Math.min(bestScore, -8 * similarity);
            }
            if (similarity > 0.5) {
              bestScore = Math.min(bestScore, -3 * similarity);
            }
          });

          return bestScore;
        })
        .reduce((a, b) => a + b, 0);

      const prefixPriority = prefixes.includes(result.prefix ?? '') ? -10 : 0;

      const smartNumberMatch =
        courseNumbers
          .map((number) => {
            if (result.number) {
              const prefixScore = longestCommonPrefix(number, result.number);
              const similarity = findSimilarity(number, result.number);

              if (similarity > 0.9) {
                return -10 * similarity - prefixScore;
              }
              if (similarity > 0.7) {
                return -8 * similarity - prefixScore;
              }
              if (similarity > 0.5) {
                return -3 * similarity - prefixScore;
              }
            }
            return 0;
          })
          .sort((a, b) => b - a)[0] ?? 0;

      return {
        distance:
          (smartNumberMatch < 0 ? 0 : distanceMetric) +
          2 * smartWordCapture +
          prefixPriority +
          smartNumberMatch,
        title,
        result,
      };
    });

    newResults.forEach((result) => {
      if (scoredResults.length < LIMIT) {
        scoredResults.push(result);
        scoredResults.sort((a, b) => a.distance - b.distance);
      } else {
        const worstIndex = scoredResults.length - 1;
        if (result.distance < scoredResults[worstIndex]!.distance) {
          scoredResults[worstIndex] = result;
          scoredResults.sort((a, b) => a.distance - b.distance);
        }
      }
    });
  }

  if (scoredResults.length === 0) return [];

  const cut = scoredResults[0]!.distance;
  const variance =
    scoredResults.reduce((sum, d) => sum + Math.pow(d.distance - cut, 2), 0) /
    scoredResults.length;
  const stdDev = Math.sqrt(variance);
  const oneStdCutoff = cut + stdDev;

  return scoredResults
    .filter((r) => r.distance <= oneStdCutoff)
    .map((item) => ({ title: item.title, result: item.result }));
}

function searchProfessors(
  data: AutocompletePrefixGroup[],
  input: string,
): SearchQuery[] {
  const names = new Map<string, SearchQuery>();

  for (const prefixData of data) {
    for (const courseData of prefixData.course_numbers) {
      for (const session of courseData.academic_sessions ?? []) {
        for (const sectionData of session.sections ?? []) {
          for (const professor of sectionData.professors ?? []) {
            const profFirst = professor.first_name?.trim();
            const profLast = professor.last_name?.trim();
            if (!profFirst || !profLast) continue;

            const key = `${profFirst.toLowerCase()} ${profLast.toLowerCase()}`;
            names.set(key, { profFirst, profLast });
          }
        }
      }
    }
  }

  const normalizedInput = input.trim().toLowerCase();
  if (!normalizedInput) return [];
  const words = normalizedInput.split(/\s+/).filter((word) => word.length > 0);

  const scored = Array.from(names.values())
    .map((prof) => {
      const first = (prof.profFirst ?? '').toLowerCase();
      const last = (prof.profLast ?? '').toLowerCase();
      const fullName = `${first} ${last}`.trim();
      const reversedName = `${last} ${first}`.trim();

      let tokenScore = 0;
      if (words.length >= 2) {
        const [w1, ...restWords] = words;
        const w2 = restWords.join(' ');
        if (first.startsWith(w1) && last.startsWith(w2)) tokenScore -= 30;
        else if (first.includes(w1) && last.includes(w2)) tokenScore -= 24;
        else if (first.startsWith(w2) && last.startsWith(w1)) tokenScore -= 20;
        else if (first.includes(w2) && last.includes(w1)) tokenScore -= 16;
      } else if (words.length === 1) {
        const [word] = words;
        if (first.startsWith(word) || last.startsWith(word)) tokenScore -= 18;
        else if (first.includes(word) || last.includes(word)) tokenScore -= 10;
      }

      if (fullName.includes(normalizedInput) || normalizedInput.includes(fullName)) {
        return { score: -50 + tokenScore, prof };
      }

      const distanceScore = Math.min(
        editDistance(normalizedInput, fullName),
        editDistance(normalizedInput, reversedName),
      );
      return { score: distanceScore + tokenScore, prof };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, LIMIT);

  return scored.map((item) => item.prof);
}

async function fetchCourseSections(query: SearchQuery): Promise<TrendsSection[]> {
  if (!query.prefix || !query.number) return [];

  const apiUrl = process.env.NEBULA_API_URL;
  const apiKey = process.env.NEBULA_API_KEY;
  if (!apiUrl || !apiKey) return [];

  const url = new URL(buildApiUrl(apiUrl, 'course/sections/trends'));
  url.searchParams.set('subject_prefix', query.prefix);
  url.searchParams.set('course_number', query.number);

  const res = await fetch(url.href, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) return [];

  const body = (await res.json()) as NebulaResponse<TrendsSection[]>;
  return body.message === 'success' && Array.isArray(body.data) ? body.data : [];
}

async function fetchProfessorSections(query: SearchQuery): Promise<TrendsSection[]> {
  if (!query.profFirst || !query.profLast) return [];

  const apiUrl = process.env.NEBULA_API_URL;
  const apiKey = process.env.NEBULA_API_KEY;
  if (!apiUrl || !apiKey) return [];

  const url = new URL(buildApiUrl(apiUrl, 'professor/sections/trends'));
  url.searchParams.set('first_name', query.profFirst);
  url.searchParams.set('last_name', query.profLast);

  const res = await fetch(url.href, {
    method: 'GET',
    headers: {
      'x-api-key': apiKey,
      Accept: 'application/json',
    },
    cache: 'no-store',
  });

  if (!res.ok) return [];

  const body = (await res.json()) as NebulaResponse<TrendsSection[]>;
  return body.message === 'success' && Array.isArray(body.data) ? body.data : [];
}

function parseTermYear(academicSession?: string): {
  term: 'Spring' | 'Summer' | 'Fall';
  year: number;
} | null {
  if (!academicSession) return null;

  const termFirst = academicSession.match(/(Spring|Summer|Fall)\s+(\d{4})/i);
  const yearFirst = academicSession.match(/(\d{4})\s+(Spring|Summer|Fall)/i);
  const matched = termFirst ?? yearFirst;
  if (!matched) return null;

  const term = (termFirst ? matched[1] : matched[2]) as
    | 'Spring'
    | 'Summer'
    | 'Fall';
  const year = parseInt(termFirst ? matched[2] ?? '' : matched[1] ?? '', 10);
  if (!Number.isFinite(year)) return null;

  return { term, year };
}

function buildDirectProfessorQueries(input: string): SearchQuery[] {
  const words = input
    .trim()
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 0);

  if (words.length < 2) return [];

  const firstWord = words[0]!;
  const remaining = words.slice(1).join(' ');

  const toTitleCase = (value: string) =>
    value
      .toLowerCase()
      .split(' ')
      .map((part) =>
        part.length > 0 ? `${part[0]!.toUpperCase()}${part.slice(1)}` : part,
      )
      .join(' ');

  return [
    { profFirst: toTitleCase(firstWord), profLast: toTitleCase(remaining) },
    { profFirst: toTitleCase(remaining), profLast: toTitleCase(firstWord) },
  ];
}

function deduplicateSearchQueries(queries: SearchQuery[]): SearchQuery[] {
  const seen = new Set<string>();
  return queries.filter((query) => {
    const key = `${query.prefix ?? ''}|${query.number ?? ''}|${query.profFirst ?? ''}|${query.profLast ?? ''}`.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeTrendsSection(section: TrendsSection): SectionSearchResult | null {
  const parsed = parseTermYear(section.academic_session?.name);
  if (!parsed) return null;

  const course = section.course_details?.[0];
  const professor = section.professor_details?.[0];
  const prefix = course?.subject_prefix?.toUpperCase();
  const number = course?.course_number;
  const sectionCode = section.section_number;

  if (!prefix || !number || !sectionCode || !section._id) {
    return null;
  }

  return {
    id: section._id,
    prefix,
    number,
    sectionCode,
    term: parsed.term,
    year: parsed.year,
    profFirst: professor?.first_name ?? '',
    profLast: professor?.last_name ?? '',
    source: 'trends',
  };
}

function deduplicateSections(
  results: SectionSearchResult[],
): SectionSearchResult[] {
  const seen = new Set<string>();
  return results.filter((result) => {
    const key = `${result.prefix}-${result.number}-${result.sectionCode}-${result.term}-${result.year}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function longestCommonPrefix(str1: string, str2: string): number {
  let count = 0;
  const minLength = Math.min(str1.length, str2.length);

  for (let i = 0; i < minLength; i++) {
    if (str1.toLowerCase()[i] === str2.toLowerCase()[i]) {
      count++;
    } else {
      break;
    }
  }

  return count;
}

function minEditDistance(queries: string[], word: string): number {
  return queries.length > 0 && word.length > 0
    ? Math.min(...queries.map((query) => editDistance(query, word)))
    : 10000;
}

/**
 * Calculate edit distance between two strings (Levenshtein distance)
 * Used for fuzzy matching in search
 */
function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () =>
    Array(b.length + 1).fill(0),
  );

  for (let i = 0; i <= a.length; i++) dp[i]![0] = i;
  for (let j = 0; j <= b.length; j++) dp[0]![j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i]![j] = dp[i - 1]![j - 1]!;
      } else {
        dp[i]![j] = Math.min(dp[i - 1]![j]!, dp[i]![j - 1]!, dp[i - 1]![j - 1]!) + 1;
      }
    }
  }

  return dp[a.length]![b.length]!;
}

/**
 * Find similarity score between two strings (0-1 range)
 */
function findSimilarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;
  const distance = editDistance(a.toLowerCase(), b.toLowerCase());
  return 1 - distance / maxLen;
}

/**
 * Check if a string starts with a potential course prefix
 */
export function isPotentialPrefix(query: string): string[] {
  const prefixMatch = query.match(/^[A-Za-z]+/);
  if (!prefixMatch) return [];
  
  // Common UTD course prefixes
  const coursePrefixes = [
    'ACCT', 'AMS', 'ARTS', 'ATCM', 'BCOM', 'BIOL', 'BIS', 'BLAW', 'CGS',
    'CHEM', 'CHIN', 'COMM', 'CS', 'DANC', 'ECON', 'ECSC', 'ECS', 'EE',
    'EMAC', 'ENGR', 'FIN', 'GEOG', 'GEOS', 'GOVT', 'HIST', 'HLTH', 'HONS',
    'HCS', 'HUHI', 'HUSL', 'IMS', 'ISAH', 'ISGS', 'ISNS', 'ITAS', 'ITSS',
    'JAPN', 'KORE', 'LIT', 'MAIS', 'MATH', 'MKT', 'MUS', 'NATS', 'OPRE',
    'PA', 'PHIL', 'PHYS', 'PPPE', 'PSY', 'PSCI', 'RHET', 'SCI', 'SE',
    'SOC', 'SPAN', 'SPAU', 'STAT', 'SYSM', 'THEA', 'UNIV', 'VPAS'
  ];
  
  const extractedPrefix = prefixMatch[0].toUpperCase();
  return coursePrefixes.filter((prefix) =>
    prefix.startsWith(extractedPrefix),
  );
}

function isPotentialPrefixWithList(
  query: string,
  coursePrefixes: string[],
): string[] {
  const prefixMatch = query.match(/^[A-Za-z]+/);
  if (!prefixMatch) return [];

  const extractedPrefix = prefixMatch[0].toUpperCase();
  return coursePrefixes.filter((prefix) =>
    prefix.toUpperCase().startsWith(extractedPrefix),
  );
}

/**
 * Check if a string contains a potential course number
 */
export function isPotentialCourseNumber(query: string): string {
  const numberMatch = query.match(/\d+[vV]?\d*$/);
  if (!numberMatch) return '';
  
  const extractedNumber = numberMatch[0];
  const isValid = /^(\d{1,4}|\d[vV]\d{1,2})$/.test(extractedNumber);
  return isValid ? extractedNumber : '';
}
