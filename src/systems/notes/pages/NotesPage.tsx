import EmptyStateCard from '@src/lib/components/EmptyStateCard';
import { api } from '@src/lib/trpc/server';
import type { SectionWithFilesWithUserMetadata } from '@src/server/db/models';
import FilesGrid from '@src/systems/notes/components/FilesGrid';
import HandwrittenFilter from '@src/systems/notes/components/Filters';
import LinkCard from '@src/systems/notes/components/LinkCard';
import SectionHeader from '@src/systems/notes/components/SectionHeader';
import {
  noteQueryToDescription,
  noteQueryToTitle,
  parseNoteSlug,
  type NoteQuery,
} from '@src/systems/notes/utils/noteSlug';

type NotesPageProps = {
  params: Promise<{ slug: string[] }>;
  searchParams: Promise<{ [key: string]: string }>;
};

type Semester = {
  term: 'Fall' | 'Spring' | 'Summer';
  year: number;
  noteGroups: NoteGroup[];
};

/**
 * A group of notes to be displayed under a header together.
 */
type NoteGroup = {
  prefix: string | undefined; /* eg. CS */
  number: string | undefined; /* eg. 2340, like CS 2340 */
  sectionCode: string | undefined; /* eg. .007, like CS 2340.007 */
  profFirst: string | undefined;
  profLast: string | undefined;

  files: SectionWithFilesWithUserMetadata['files'];
};

/**
 * Obtain a list of sections that matches a query from the database
 * @param query specifies what sections to get from database
 */
async function fetchSections(
  query: NoteQuery,
): Promise<SectionWithFilesWithUserMetadata[]> {
  switch (query.type) {
    case 'course':
      return api.section.getNotesByCourse({
        prefix: query.prefix,
        number: query.number,
      });
    case 'professor':
      return api.section.getNotesByProfessor({
        profFirst: query.profFirst,
        profLast: query.profLast,
      });
    case 'courseAndProfessor':
      return api.section.getNotesByCourseAndProfessor({
        prefix: query.prefix,
        number: query.number,
        profFirst: query.profFirst,
        profLast: query.profLast,
      });
  }
}

function canonicalizeQuery(
  query: NoteQuery,
  sections: SectionWithFilesWithUserMetadata[],
): NoteQuery {
  if (sections.length === 0) return query;
  const s = sections[0]!;
  if (query.type === 'professor') {
    return { ...query, profFirst: s.profFirst, profLast: s.profLast };
  }
  if (query.type === 'courseAndProfessor') {
    return { ...query, profFirst: s.profFirst, profLast: s.profLast };
  }
  return query;
}

function totalFileCount(sections: SectionWithFilesWithUserMetadata[]): number {
  return sections.reduce((sum, s) => sum + s.files.length, 0);
}

function buildBreadcrumbs(query: NoteQuery) {
  const items: { label: string; href?: string }[] = [{ label: 'Notes' }];

  switch (query.type) {
    case 'course':
      items.push({ label: `${query.prefix} ${query.number}` });
      break;
    case 'professor':
      items.push({ label: `${query.profFirst} ${query.profLast}` });
      break;
    case 'courseAndProfessor':
      items.push({
        label: `${query.prefix} ${query.number}`,
        href: `/notes/${query.prefix}/${query.number}`,
      });
      items.push({ label: `${query.profFirst} ${query.profLast}` });
      break;
  }

  return items;
}

function getProfessorLinks(
  sections: SectionWithFilesWithUserMetadata[],
  query: NoteQuery,
) {
  if (query.type !== 'course') return [];

  const profMap = new Map<string, { profFirst: string; profLast: string }>();
  for (const s of sections) {
    const key = `${s.profFirst}|${s.profLast}`;
    if (!profMap.has(key)) {
      profMap.set(key, { profFirst: s.profFirst, profLast: s.profLast });
    }
  }

  return Array.from(profMap.values()).map((prof) => ({
    href: `/notes/${query.prefix}/${query.number}/${prof.profFirst}/${prof.profLast}`,
    title: `${prof.profFirst} ${prof.profLast}`,
    description: `${query.prefix} ${query.number} sections taught by this professor`,
  }));
}

function getCourseLinks(
  sections: SectionWithFilesWithUserMetadata[],
  query: NoteQuery,
) {
  if (query.type !== 'professor') return [];

  const courseMap = new Map<string, { prefix: string; number: string }>();
  for (const s of sections) {
    const key = `${s.prefix}|${s.number}`;
    if (!courseMap.has(key)) {
      courseMap.set(key, { prefix: s.prefix, number: s.number });
    }
  }

  return Array.from(courseMap.values())
    .sort((a, b) =>
      `${a.prefix} ${a.number}`.localeCompare(`${b.prefix} ${b.number}`),
    )
    .map((course) => ({
      href: `/notes/${course.prefix}/${course.number}/${query.profFirst}/${query.profLast}`,
      title: `${course.prefix} ${course.number}`,
      description: `Sections taught by ${query.profFirst} ${query.profLast}`,
    }));
}

/**
 * Given a list of sections, apply the handwritten filter if relevant
 * Probably, this will also apply other filters when they're added.
 * @param sections sections to filter
 * @param handwritten 'true' or 'false' to filter, anything else to not
 */
function filterSections(
  sections: SectionWithFilesWithUserMetadata[],
  handwritten: string | undefined,
): SectionWithFilesWithUserMetadata[] {
  if (handwritten !== 'true' && handwritten !== 'false') return sections;
  const isHandwritten = handwritten === 'true';
  return sections.map((s) => ({
    ...s,
    files: s.files.filter((f) => f.handwritten === isHandwritten),
  }));
}

/**
 * Given a list of sections and a query type, group notes in those sections to
 * match how they'll be displayed.
 *
 * Notes are grouped by semester no matter the query.
 * Notes in each semester are further grouped depending on the queryType
 *  course --> by professor name
 *  professor --> by course prefix and number
 *  courseAndProfessor --> by section number
 *
 * @param sections sections to group. IMPORTANT: must already be sorted by
 * semester, then by secondary grouping (eg. by professor name for course query)
 * @param queryType
 */
function groupSections(
  sections: SectionWithFilesWithUserMetadata[],
  queryType: 'course' | 'professor' | 'courseAndProfessor',
) {
  const semesters: Semester[] = [];

  for (const section of sections) {
    const lastSemester =
      semesters.length > 0 ? semesters[semesters.length - 1] : undefined;

    // can't add section to last added semester --> create new semester
    // (can't add to prev semesters because sections are sorted)
    if (
      !lastSemester ||
      section.year != lastSemester.year ||
      section.term != lastSemester.term
    ) {
      semesters.push({
        term: section.term,
        year: section.year,
        noteGroups: [createGroup(section)],
      });
    }
    // can add this section to last added semester --> add to semester
    else {
      const lastGroup =
        lastSemester.noteGroups.length > 0
          ? lastSemester.noteGroups[lastSemester.noteGroups.length - 1]
          : undefined;

      // can add these notes to last added note group --> add to note group
      if (sectionFitsGroup(section, lastGroup, queryType)) {
        lastGroup?.files.push(...section.files);
      }
      // can't add to last added note group --> create new note group
      // (can't add to prev note groups because sections are sorted)
      else {
        lastSemester.noteGroups.push(createGroup(section));
      }
    }
  }

  // sort individual notes in each group by recency
  for (const semester of semesters) {
    for (const group of semester.noteGroups) {
      group.files.sort((a, b) => {
        return a.updatedAt < b.updatedAt ? 1 : -1;
      });
    }
  }

  // move groups with no files to bottom of each semester
  for (const semester of semesters) {
    const emptyGroups = semester.noteGroups.filter(
      (group) => group.files.length === 0,
    );
    semester.noteGroups = semester.noteGroups.filter(
      (group) => group.files.length > 0,
    );
    semester.noteGroups.push(...emptyGroups);
  }

  return semesters;
}

/**
 * Return whether notes from the given section can be added to notes in the group.
 * @param section
 * @param group
 * @param queryType
 */
function sectionFitsGroup(
  section: SectionWithFilesWithUserMetadata,
  group: NoteGroup | undefined,
  queryType: 'course' | 'professor' | 'courseAndProfessor',
): boolean {
  if (!group) {
    return false;
  }
  switch (queryType) {
    case 'course':
      return (
        section.profFirst == group.profFirst &&
        section.profLast == group.profLast
      );
    case 'professor':
      return section.prefix == group.prefix && section.number == group.number;
    case 'courseAndProfessor':
      return section.sectionCode == group.sectionCode;
  }
}

function createGroup(section: SectionWithFilesWithUserMetadata): NoteGroup {
  return {
    prefix: section.prefix,
    number: section.number,
    sectionCode: section.sectionCode,
    profFirst: section.profFirst,
    profLast: section.profLast,
    files: section.files,
  };
}

export default async function NotesPage({
  params,
  searchParams,
}: NotesPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const query = parseNoteSlug(slug);

  if (!query) {
    return (
      <EmptyStateCard
        title="Invalid URL"
        description="Could not parse the notes URL. Try /notes/CS/3341 for a course or /notes/John/Smith for a professor."
      />
    );
  }

  const sections = await fetchSections(query);
  const displayQuery = canonicalizeQuery(query, sections);
  const filteredSections = filterSections(
    sections,
    resolvedSearchParams.handwritten,
  );
  const semesters = groupSections(filteredSections, displayQuery.type);
  const fileCount = totalFileCount(filteredSections);

  return (
    <>
      <SectionHeader
        title={noteQueryToTitle(displayQuery)}
        description={noteQueryToDescription(displayQuery)}
        metaLabel={`${fileCount} note${fileCount === 1 ? '' : 's'}`}
        breadcrumbs={buildBreadcrumbs(displayQuery)}
      />

      <HandwrittenFilter />

      {fileCount === 0 ? (
        <EmptyStateCard
          title="No notes yet"
          description="No notes have been uploaded for this query yet."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Links to course+prof combo pages */}
          {(displayQuery.type === 'course' ||
            displayQuery.type === 'professor') && (
            <>
              {(() => {
                const links =
                  displayQuery.type === 'course'
                    ? getProfessorLinks(filteredSections, displayQuery)
                    : getCourseLinks(filteredSections, displayQuery);
                if (links.length <= 1) return null;
                return (
                  <div className="col-span-full">
                    <h2 className="mb-3 text-lg font-semibold">
                      {displayQuery.type === 'course'
                        ? 'Filter by professor'
                        : 'Filter by course'}
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {links.map((link) => (
                        <LinkCard
                          key={link.href}
                          href={link.href}
                          title={link.title}
                          description={link.description}
                        />
                      ))}
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/*Notes grouped by semester, then grouped again depending on query*/}
          {semesters.map((s) => (
            <div
              key={`${s.term} ${s.year}`}
              className="col-span-full grid gap-4"
            >
              <h2 className="text-xl font-semibold text-neutral-500">
                {s.term} {s.year}
              </h2>
              {s.noteGroups.map((n) => (
                <div
                  key={`${n.prefix}${n.number}${n.sectionCode}${n.profFirst}${n.profLast}`}
                  className="col-span-full"
                >
                  <h3 className="mb-3 text-lg font-semibold">
                    {displayQuery.type === 'course' &&
                      `${n.profFirst} ${n.profLast}`}
                    {displayQuery.type === 'professor' &&
                      `${n.prefix} ${n.number}`}
                    {displayQuery.type === 'courseAndProfessor' &&
                      `${n.prefix} ${n.number}.${n.sectionCode}`}
                  </h3>
                  <FilesGrid files={n.files} />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
