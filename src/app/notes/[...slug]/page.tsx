import EmptyStateCard from '@src/components/sections/EmptyStateCard';
import FilesGrid from '@src/components/sections/FilesGrid';
import LinkCard from '@src/components/sections/LinkCard';
import SectionHeader from '@src/components/sections/SectionHeader';
import type { SectionWithFilesWithUserMetadata } from '@src/server/db/models';
import { api } from '@src/trpc/server';
import {
  noteQueryToDescription,
  noteQueryToTitle,
  parseNoteSlug,
  type NoteQuery,
} from '@src/utils/noteSlug';

type NotesPageProps = {
  params: Promise<{ slug: string[] }>;
};

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

export default async function NotesPage({ params }: NotesPageProps) {
  const { slug } = await params;
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
  const fileCount = totalFileCount(sections);

  return (
    <>
      <SectionHeader
        title={noteQueryToTitle(query)}
        description={noteQueryToDescription(query)}
        metaLabel={`${fileCount} note${fileCount === 1 ? '' : 's'}`}
        breadcrumbs={buildBreadcrumbs(query)}
      />

      {fileCount === 0 ? (
        <EmptyStateCard
          title="No notes yet"
          description="No notes have been uploaded for this query yet."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Links to course+prof combo pages */}
          {(query.type === 'course' || query.type === 'professor') && (
            <>
              {(() => {
                const links =
                  query.type === 'course'
                    ? getProfessorLinks(sections, query)
                    : getCourseLinks(sections, query);
                if (links.length <= 1) return null;
                return (
                  <div className="col-span-full">
                    <h2 className="mb-3 text-lg font-semibold">
                      {query.type === 'course'
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

          {/* Notes grouped by section */}
          {sections.map((s) => (
            <div key={s.id} className="col-span-full">
              <h2 className="mb-3 text-lg font-semibold">
                {s.prefix} {s.number}.{s.sectionCode} — {s.term} {s.year}
                <span className="ml-2 text-sm font-normal text-slate-600 dark:text-slate-400">
                  {s.profFirst} {s.profLast}
                </span>
              </h2>
              <FilesGrid files={s.files} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
