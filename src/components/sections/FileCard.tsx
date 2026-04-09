'use client';

import Link from 'next/link';
import { BaseCard } from '@src/components/common/BaseCard';
import SaveButton from '@src/components/sections/SaveButton';
import type { SelectFileWithAuthorPreview } from '@src/server/db/models';
import { authClient } from '@src/utils/auth-client';
import NoteDeleteButton from './NoteDeleteButton';
import NoteEditButton from './NoteEditButton';

type FileCardProps = {
  file: SelectFileWithAuthorPreview;
};

const formatUpdatedAt = (
  updatedAt: SelectFileWithAuthorPreview['updatedAt'],
) => {
  const date =
    updatedAt instanceof Date ? updatedAt : new Date(updatedAt ?? Date.now());

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export default function FileCard({ file }: FileCardProps) {
  const { data: session } = authClient.useSession();
  const isAuthor = session?.user?.id === file.authorId;

  const authorDisplay =
    (file.author?.username ??
      `${file.author?.firstName ?? ''} ${file.author?.lastName ?? ''}`.trim()) ||
    file.authorId;

  return (
    <BaseCard variant="interactive" className="flex h-full flex-col">
      <Link
        href={file.publicUrl}
        target="_blank"
        rel="noreferrer"
        className="flex grow flex-col"
      >
        <div className="flex flex-col gap-2 p-4">
          <div className="min-w-0">
            <h3
              className="line-clamp-1 text-lg font-semibold"
              title={file.name}
            >
              {file.name}
            </h3>

            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Uploaded by {authorDisplay}
            </p>
          </div>

          {file.description && (
            <p className="line-clamp-2 text-sm text-slate-800 dark:text-slate-200">
              {file.description}
            </p>
          )}

          <div className="mt-auto text-xs text-slate-600 dark:text-slate-400">
            Updated {formatUpdatedAt(file.updatedAt)}
          </div>
        </div>
      </Link>

      <div className="m-4 mt-0 flex flex-row items-center space-x-2">
        {isAuthor && <NoteEditButton fileId={file.id} />}
        {isAuthor && <NoteDeleteButton fileId={file.id} />}
        <SaveButton fileId={file.id} />
      </div>
    </BaseCard>
  );
}
