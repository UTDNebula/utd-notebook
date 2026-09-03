// build table with: npm run buildcoursenames
import { writeFileSync } from 'fs';
import aggregatedDataRaw from '../data/aggregated_data.json';
import {
  convertToCourseOnly,
  searchQueryLabel,
  type SearchQuery,
} from '../utils/SearchQuery';

interface ProfessorData {
  first_name?: string;
  last_name?: string;
}

interface SectionData {
  professors: ProfessorData[];
  total_students?: number;
}

interface AcademicSessionData {
  sections: SectionData[];
}

interface CourseNumberData {
  course_number: string;
  title: string;
  academic_sessions: AcademicSessionData[];
}

interface PrefixData {
  subject_prefix: string;
  course_numbers: CourseNumberData[];
}
// tell compiler that aggregatedData DOES have data member
const aggregatedData = aggregatedDataRaw as { data: PrefixData[] };

export type TableEntry = SearchQuery & { totalStudents: number };
export type TableType = { [key: string]: TableEntry[] };

const table: TableType = {};

function addCourse(
  title: string,
  prefix: string,
  number: string,
  totalStudents: number,
) {
  const courseObject: TableEntry = { prefix, number, totalStudents };

  if (!Object.prototype.hasOwnProperty.call(table, title)) {
    table[title] = [courseObject];
  } else {
    table[title]!.push(courseObject);
  }
}

for (let prefixItr = 0; prefixItr < aggregatedData.data.length; prefixItr++) {
  const prefixData = aggregatedData.data[prefixItr];
  if (!prefixData) continue; //handle blank data)
  for (
    let courseNumberItr = 0;
    courseNumberItr < prefixData.course_numbers.length;
    courseNumberItr++
  ) {
    const courseNumberData = prefixData.course_numbers[courseNumberItr];
    if (!courseNumberData) continue; //handle blank data
    let totalStudents = 0;
    for (
      let academicSessionItr = 0;
      academicSessionItr < courseNumberData.academic_sessions.length;
      academicSessionItr++
    ) {
      const academicSessionData =
        courseNumberData.academic_sessions[academicSessionItr];
      if (!academicSessionData) continue;
      for (
        let sectionItr = 0;
        sectionItr < academicSessionData.sections.length;
        sectionItr++
      ) {
        const sectionData = academicSessionData.sections[sectionItr];
        if (!sectionData) continue;
        totalStudents += sectionData.total_students ?? 0;
      }
    }
    addCourse(
      courseNumberData.title,
      prefixData.subject_prefix,
      courseNumberData.course_number,
      totalStudents,
    );
  }
}

writeFileSync('src/data/course_name_table.json', JSON.stringify(table));

console.log('Course name table generation done.');

const reverseTable: { [key: string]: string } = {};
for (const [title, queries] of Object.entries(table)) {
  for (const query of queries) {
    if (query.prefix && query.number) {
      const key = searchQueryLabel(convertToCourseOnly(query));
      reverseTable[key] = title;
    }
  }
}

writeFileSync(
  'src/data/course_prefix_number_table.json',
  JSON.stringify(reverseTable),
);

console.log('Course prefix-number table generation done.');
