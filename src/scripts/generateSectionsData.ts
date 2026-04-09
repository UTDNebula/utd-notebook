/*
Generate a flat sections data file from aggregated_data.json for section search.
To create, run: npm run buildsections
*/
import { writeFileSync } from 'fs';
import aggregatedDataRaw from '../data/aggregated_data.json';
import type { SectionEntry } from '../utils/sectionEntry';

interface ProfessorData {
  first_name?: string;
  last_name?: string;
}

interface SectionData {
  professors: ProfessorData[];
  section_number: string;
}

interface AcademicSessionData {
  academic_session: { name: string };
  sections: SectionData[];
}

interface CourseNumberData {
  course_number: string;
  academic_sessions: AcademicSessionData[];
}

interface PrefixData {
  subject_prefix: string;
  course_numbers: CourseNumberData[];
}

const termCodeMap: Record<string, 'Spring' | 'Summer' | 'Fall'> = {
  S: 'Spring',
  U: 'Summer',
  F: 'Fall',
};

function parseSessionCode(
  code: string,
): { term: 'Spring' | 'Summer' | 'Fall'; year: number } | null {
  if (code.length < 3) return null;
  const yearPrefix = code.slice(0, -1);
  const termCode = code.slice(-1);
  const term = termCodeMap[termCode];
  if (!term) return null;
  return { term, year: 2000 + parseInt(yearPrefix) };
}

function getFirstProfessor(professors: ProfessorData[]): {
  profFirst: string;
  profLast: string;
} {
  for (const prof of professors) {
    if (
      prof.first_name &&
      prof.last_name &&
      prof.first_name.trim() !== '' &&
      prof.last_name.trim() !== ''
    ) {
      return { profFirst: prof.first_name, profLast: prof.last_name };
    }
  }
  return { profFirst: 'TBD', profLast: 'TBD' };
}

const aggregatedData = aggregatedDataRaw as { data: PrefixData[] };
const entries: SectionEntry[] = [];

for (const prefixData of aggregatedData.data) {
  if (!prefixData) continue;
  const prefix = prefixData.subject_prefix;

  for (const courseData of prefixData.course_numbers) {
    if (!courseData) continue;
    const courseNumber = courseData.course_number;

    for (const sessionData of courseData.academic_sessions) {
      if (!sessionData) continue;
      const parsed = parseSessionCode(sessionData.academic_session.name);
      if (!parsed) continue;

      for (const sectionData of sessionData.sections) {
        if (!sectionData) continue;
        const { profFirst, profLast } = getFirstProfessor(
          sectionData.professors,
        );
        const label = `${prefix} ${courseNumber}.${sectionData.section_number} ${parsed.term} ${parsed.year}`;

        entries.push({
          label,
          prefix,
          courseNumber,
          sectionCode: sectionData.section_number,
          term: parsed.term,
          year: parsed.year,
          profFirst,
          profLast,
        });
      }
    }
  }
}

writeFileSync('src/data/sections_data.json', JSON.stringify(entries));
console.log(`Sections data generation done. ${entries.length} entries.`);
