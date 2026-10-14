import Link from 'next/link';
import { BaseCard } from '@nebula-library/components/BaseCard';
import type { PublicFile } from '@src/server/publicNotes';

const formatUpdatedAt = (updatedAt: Date) =>
  new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(updatedAt);

//metadata only: no thumbnail, since that would fetch the PDF
export default function PublicFileCard({ file }: { file: PublicFile }) {
  const author = file.author.username ?? file.author.displayName;

  return (
    <BaseCard variant="interactive" className="flex h-full flex-col">
      <Link href={`/notes/${file.id}`} className="flex grow flex-col gap-2 p-4">
        <h3 className="line-clamp-1 text-lg font-semibold" title={file.name}>
          {file.name}
        </h3>
        {file.description && (
          <p className="line-clamp-2 text-sm text-slate-800 dark:text-slate-200">
            {file.description}
          </p>
        )}
        <div className="mt-auto text-xs text-slate-600 dark:text-slate-400">
          Updated {formatUpdatedAt(file.updatedAt)}
        </div>
      </Link>
      <p className="px-4 pb-4 text-xs font-medium text-slate-600 dark:text-slate-400">
        By{' '}
        {file.author.username ? (
          <Link
            href={`/profile/${file.author.username}`}
            className="underline hover:text-slate-900 dark:hover:text-slate-200"
          >
            {author}
          </Link>
        ) : (
          author
        )}
      </p>
    </BaseCard>
  );
}
