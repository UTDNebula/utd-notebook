'use client';

import { useThumbnails, type FileData } from '@mkholt/pdf-thumbnail';
import { Skeleton } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { BaseCard } from '@src/components/common/BaseCard';
import type { SelectFile } from '@src/server/db/models';
import { authClient } from '@src/utils/auth-client';
import NoteEditButton from './NoteEditButton';

type FileCardProps = {
  file: SelectFile;
};

const formatUpdatedAt = (updatedAt: SelectFile['updatedAt']) => {
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

  const thumbnailUrl = file.publicUrl;

  const files = useMemo<FileData[]>(
    () => [{ file: thumbnailUrl, name: file.name }],
    [file.name, thumbnailUrl],
  );

  const { thumbnails, isLoading } = useThumbnails(files);
  const thumbData = thumbnails[0]?.thumbData;

  /*
    !isLoading does not mean thumbData is not null.
    Even with no errors and isLoading false, it can take a few rerenders
    for thumbData to be populated.

    On mount, isLoading is false and thumbData is null.
    So we do not want to show "Unable to preview" immediately.

    We wait until the first real fetch begins, indicated by isLoading
    turning true at least once. After that, if loading has finished and we
    still have no thumbnail data, we can treat it as a preview failure.

    We store that "has started fetching at least once" flag in state,
    because it affects rendering.

    useThumbnails.error has always been null in testing,
    so we are not relying on it for error handling here.
  */

  const [hasStartedFetching, setHasStartedFetching] = useState(false);

  if (isLoading && !hasStartedFetching) {
    setHasStartedFetching(true);
  }

  const showPreviewError =
    hasStartedFetching && !thumbData && thumbnails.length === 0 && !isLoading;

  return (
    <BaseCard variant="interactive" className="flex h-full flex-col">
      <Link
        href={file.publicUrl}
        target="_blank"
        rel="noreferrer"
        className="flex grow flex-col"
      >
        <div className="overflow-hidden rounded-t-lg border-b border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-700">
          {thumbData ? (
            <div className="relative aspect-[3/4] w-full">
              <Image
                src={thumbData}
                alt={`${file.name} preview`}
                fill
                sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
                unoptimized
              />
            </div>
          ) : showPreviewError ? (
            <div className="flex aspect-[3/4] w-full items-center justify-center text-xs font-medium text-slate-600 dark:text-slate-400">
              Unable to preview
            </div>
          ) : (
            <div className="relative aspect-[3/4] w-full">
              <Skeleton variant="rounded" className="h-full w-full" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-2 p-4">
          <div className="min-w-0">
            <h3
              className="line-clamp-1 text-lg font-semibold"
              title={file.name}
            >
              {file.name}
            </h3>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
              Uploaded by {file.authorId}
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

      {isAuthor && (
        <div className="m-4 mt-0 flex flex-row space-x-2">
          <NoteEditButton fileId={file.id} />
        </div>
      )}
    </BaseCard>
  );
}
