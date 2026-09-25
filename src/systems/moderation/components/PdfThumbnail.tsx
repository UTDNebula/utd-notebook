'use client';

// component adapted from: https://www.npmjs.com/package/@mkholt/pdf-thumbnail
import { useThumbnails, type FileData } from '@mkholt/pdf-thumbnail';
import { Skeleton } from '@mui/material';
import Image from 'next/image';

export type Data = FileData & { name: string };
export type ThumbnailsProps = {
  files: Data[];
  className?: string | '';
};

export const PdfThumbnail = ({ files, className }: ThumbnailsProps) => {
  const { thumbnails, isLoading, error } = useThumbnails(files);

  if (isLoading)
    return (
      <div className={`relative w-full overflow-hidden ${className}`}>
        <Skeleton variant="rounded" className="h-full w-full" />
      </div>
    );

  if (error)
    return (
      <div
        className={`flex w-full items-center justify-center overflow-hidden text-xs font-medium text-slate-600 dark:text-slate-400 ${className}`}
      >
        Error: {error.message}
        Unable to preview
      </div>
    );

  return (
    <>
      {thumbnails.map((td) => (
        <div
          key={td.file}
          className={`relative w-full overflow-hidden ${className}`}
        >
          <Image
            src={td.thumbData}
            alt={`${td.name} preview`}
            fill
            className="object-cover object-top"
            unoptimized
          />
        </div>
      ))}
    </>
  );
};
