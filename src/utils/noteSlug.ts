const COURSE_PREFIX_REGEX = /^[A-Z]{2,4}$/i;
const COURSE_NUMBER_REGEX = /^(?=.*\d)[0-9A-Z]{4}$/i;

export type NoteQuery =
  | { type: 'course'; prefix: string; number: string }
  | { type: 'professor'; profFirst: string; profLast: string }
  | {
      type: 'courseAndProfessor';
      prefix: string;
      number: string;
      profFirst: string;
      profLast: string;
    };

export function parseNoteSlug(slug: string[]): NoteQuery | null {
  if (slug.length === 0) return null;

  const hasCourse =
    slug.length >= 2 &&
    COURSE_PREFIX_REGEX.test(slug[0]!) &&
    COURSE_NUMBER_REGEX.test(slug[1]!);

  if (hasCourse) {
    const prefix = slug[0]!.toUpperCase();
    const number = slug[1]!.toUpperCase();
    const profTokens = slug.slice(2);

    if (profTokens.length >= 2) {
      const profLast = profTokens[profTokens.length - 1]!;
      const profFirst = profTokens.slice(0, -1).join(' ');
      return {
        type: 'courseAndProfessor',
        prefix,
        number,
        profFirst,
        profLast,
      };
    }

    return { type: 'course', prefix, number };
  }

  // No course detected — treat entire slug as professor name
  if (slug.length >= 2) {
    const profLast = slug[slug.length - 1]!;
    const profFirst = slug.slice(0, -1).join(' ');
    return { type: 'professor', profFirst, profLast };
  }

  return null;
}

export function noteQueryToTitle(query: NoteQuery): string {
  switch (query.type) {
    case 'course':
      return `${query.prefix} ${query.number}`;
    case 'professor':
      return `${query.profFirst} ${query.profLast}`;
    case 'courseAndProfessor':
      return `${query.prefix} ${query.number} — ${query.profFirst} ${query.profLast}`;
  }
}

export function noteQueryToDescription(query: NoteQuery): string {
  switch (query.type) {
    case 'course':
      return 'All notes uploaded for this course across all sections and semesters.';
    case 'professor':
      return 'All notes uploaded for sections taught by this professor.';
    case 'courseAndProfessor':
      return 'Notes for this course taught by this professor.';
  }
}
