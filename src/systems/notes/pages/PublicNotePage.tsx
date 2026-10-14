import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BaseCard } from '@nebula-library/components/BaseCard';
import Panel from '@nebula-library/components/Panel';
import { getPublicNote } from '@src/server/publicNotes';
import SignInPrompt from '@src/systems/notes/components/SignInPrompt';
import Header from '@src/systems/search/components/Header';

const linkClass = 'underline hover:text-slate-900 dark:hover:text-slate-200';

//an anonymous visitor sees the note's details, but not the PDF
export default async function PublicNotePage({ id }: { id: string }) {
  const note = await getPublicNote(id);
  if (!note) notFound();

  const { author, section } = note;

  return (
    <div className="flex h-full flex-col">
      <Header />
      <main className="flex h-full w-full flex-col items-center gap-4 p-4 pt-0">
        <Panel
          className="border-royal dark:border-cornflower-300 w-full gap-0 rounded-t-none border-l-4 py-2"
          smallPadding
        >
          <div className="flex flex-col gap-1 px-3 py-1">
            <h2 className="text-xl font-bold">{note.name}</h2>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              By{' '}
              {author.username ? (
                <Link
                  href={`/profile/${author.username}`}
                  className={linkClass}
                >
                  {author.username}
                </Link>
              ) : (
                author.displayName
              )}
            </p>
            {section && (
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                <Link
                  href={`/notes/${section.prefix}/${section.number}`}
                  className={linkClass}
                >
                  {section.prefix} {section.number}
                </Link>
                .{section.sectionCode}{' '}
                <Link
                  href={`/notes/${section.profFirst}/${section.profLast}`}
                  className={linkClass}
                >
                  {section.profFirst} {section.profLast}
                </Link>{' '}
                {section.term} {section.year}
              </p>
            )}
            {note.description ? (
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                {note.description}
              </p>
            ) : (
              <p className="mt-1 text-sm text-slate-400 italic">
                No provided description.
              </p>
            )}
            <span className="mt-1 text-xs text-slate-600 dark:text-slate-400">
              Last modified{' '}
              {note.updatedAt.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </Panel>

        <BaseCard className="w-full max-w-6xl">
          <SignInPrompt message="Sign in to view this note, or to save, rate, or report it." />
        </BaseCard>
      </main>
    </div>
  );
}
