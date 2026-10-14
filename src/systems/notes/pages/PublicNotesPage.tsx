import EmptyStateCard from '@src/lib/components/EmptyStateCard';
import {
  getPublicSectionsByCourse,
  getPublicSectionsByCourseAndProfessor,
  getPublicSectionsByProfessor,
} from '@src/server/publicNotes';
import HandwrittenFilter from '@src/systems/notes/components/Filters';
import PublicFilesGrid from '@src/systems/notes/components/PublicFilesGrid';
import SectionHeader from '@src/systems/notes/components/SectionHeader';
import {
  noteQueryToDescription,
  noteQueryToTitle,
  type NoteQuery,
} from '@src/systems/notes/utils/noteSlug';

function fetchSections(query: NoteQuery) {
  switch (query.type) {
    case 'course':
      return getPublicSectionsByCourse(query.prefix, query.number);
    case 'professor':
      return getPublicSectionsByProfessor(query.profFirst, query.profLast);
    case 'courseAndProfessor':
      return getPublicSectionsByCourseAndProfessor(
        query.prefix,
        query.number,
        query.profFirst,
        query.profLast,
      );
  }
}

//an anonymous visitor sees the notes' details but not the PDFs
export default async function PublicNotesPage({
  query,
  handwritten,
}: {
  query: NoteQuery;
  handwritten?: string;
}) {
  const sections = await fetchSections(query);

  //show the professor's name as stored, not as typed in the URL
  const first = sections[0];
  const displayQuery: NoteQuery =
    first && query.type !== 'course'
      ? { ...query, profFirst: first.profFirst, profLast: first.profLast }
      : query;

  const filtered =
    handwritten === 'true' || handwritten === 'false'
      ? sections.map((s) => ({
          ...s,
          files: s.files.filter(
            (f) => f.handwritten === (handwritten === 'true'),
          ),
        }))
      : sections;
  const fileCount = filtered.reduce((sum, s) => sum + s.files.length, 0);
  const title = noteQueryToTitle(displayQuery);

  return (
    <>
      <SectionHeader
        title={title}
        description={noteQueryToDescription(displayQuery)}
        metaLabel={`${fileCount} note${fileCount === 1 ? '' : 's'}`}
        breadcrumbs={[{ label: 'Notes' }, { label: title }]}
      />

      <HandwrittenFilter />

      {fileCount === 0 ? (
        <EmptyStateCard
          title="No notes yet"
          description="No notes have been uploaded for this query yet."
        />
      ) : (
        <div className="grid gap-4">
          {filtered.map((s) => (
            <div key={s.id}>
              <h2 className="mb-3 text-lg font-semibold">
                {s.prefix} {s.number}.{s.sectionCode} — {s.term} {s.year}
                <span className="ml-2 text-sm font-normal text-slate-600 dark:text-slate-400">
                  {s.profFirst} {s.profLast}
                </span>
              </h2>
              <PublicFilesGrid files={s.files} />
            </div>
          ))}
        </div>
      )}
    </>
  );
}
