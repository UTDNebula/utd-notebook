'use client';

import { useThumbnails, type FileData } from '@mkholt/pdf-thumbnail';
import { Skeleton } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo } from 'react';
import { BaseCard } from '@src/components/common/BaseCard';
import RatingWidget from '@src/components/sections/RatingWidget';
import SaveButton from '@src/components/sections/SaveButton';
import type { SelectFileWithAuthorPreview } from '@src/server/db/models';
import { authClient } from '@src/utils/auth-client';
import useDebounce from '@src/utils/useDebounce';
import NoteDeleteButton from './NoteDeleteButton';
import NoteEditButton from './NoteEditButton';
import ReportButton from './ReportButton';

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

    We avoid showing "Unable to preview" immediately on first render,
    because some runs briefly report !isLoading with no thumbnail yet.
    A short debounce prevents this false-negative flash.
  */

  const shouldShowPreviewError =
    !!thumbnailUrl && !thumbData && thumbnails.length === 0 && !isLoading;
  const debouncedShowPreviewError = useDebounce(
    shouldShowPreviewError,
    shouldShowPreviewError ? 1500 : 0,
  );

  const showPreviewError = debouncedShowPreviewError && shouldShowPreviewError;

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

      <div className="mx-4 mb-2 mt-0">
        <RatingWidget fileId={file.id} />
      </div>

      <p className="px-4 pb-2 text-xs font-medium text-slate-600 dark:text-slate-400">
        Uploaded by{' '}
        {file.author?.username ? (
          <Link
            href={`/profile/${file.author.username}`}
            className="underline hover:text-slate-900 dark:hover:text-slate-200"
          >
            {authorDisplay}
          </Link>
        ) : (
          authorDisplay
        )}
      </p>

      <div className="m-4 mt-0 flex flex-row items-center space-x-2">
        {isAuthor && <NoteEditButton fileId={file.id} />}
        {isAuthor && <NoteDeleteButton fileId={file.id} />}
        {!isAuthor && <ReportButton fileId={file.id} />}
        <SaveButton fileId={file.id} />
      </div>
    </BaseCard>
  );
}
