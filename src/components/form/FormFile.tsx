'use client';

import { useThumbnails, type FileData } from '@mkholt/pdf-thumbnail';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { FormHelperText, Skeleton } from '@mui/material';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';
import { addVersionToFile } from '@src/utils/fileCacheBust';
import useDebounce from '@src/utils/useDebounce';

interface FormFileProps {
  label?: string;
  value: File | null;
  existingFile?: {
    name: string;
    publicUrl: string;
    updatedAt: Date;
  };
  onBlur: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
  isError?: boolean;
  className?: string;
}

const FormFile = ({
  label,
  onBlur,
  value: file,
  existingFile,
  onChange,
  helperText,
  isError = false,
  className,
}: FormFileProps) => {
  const selectedFilePreviewUrl = useMemo(
    () => (file ? URL.createObjectURL(file) : null),
    [file],
  );

  useEffect(() => {
    return () => {
      if (selectedFilePreviewUrl) {
        URL.revokeObjectURL(selectedFilePreviewUrl);
      }
    };
  }, [selectedFilePreviewUrl]);

  const fileForPreview = useMemo<FileData[]>(() => {
    if (selectedFilePreviewUrl && file) {
      return [{ file: selectedFilePreviewUrl, name: file.name }];
    }

    if (existingFile) {
      return [
        {
          file: addVersionToFile(
            existingFile.publicUrl,
            existingFile.updatedAt.getTime(),
          ),
          name: existingFile.name,
        },
      ];
    }

    return [];
  }, [existingFile, file, selectedFilePreviewUrl]);

  const { thumbnails, isLoading } = useThumbnails(fileForPreview);
  const thumbData = thumbnails[0]?.thumbData;

  const shouldShowPreviewError =
    fileForPreview.length > 0 &&
    !thumbData &&
    thumbnails.length === 0 &&
    !isLoading;
  const debouncedShowPreviewError = useDebounce(
    shouldShowPreviewError,
    shouldShowPreviewError ? 1500 : 0,
  );

  const showPreview = !!thumbData;
  const showPreviewError = debouncedShowPreviewError && shouldShowPreviewError;
  const selectedFileName = file?.name ?? existingFile?.name;

  return (
    <div className={className}>
      <div className="w-full lg:h-96 max-lg:h-48 flex flex-col justify-center items-center gap-2 p-8 rounded-md bg-cornflower-50 dark:bg-cornflower-950 has-[:hover]:bg-cornflower-100 dark:has-[:hover]:bg-cornflower-900 transition-colors relative">
        {label && (
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {label}
          </p>
        )}
        {selectedFileName ? (
          <p className="text-xs text-slate-800 dark:text-slate-200">
            {selectedFileName}
          </p>
        ) : (
          <>
            <CloudUploadIcon />
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Drag or choose a file to upload
            </p>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              PDF
            </p>
          </>
        )}
        {showPreview ? (
          <div className="relative mt-2 aspect-[3/4] w-full max-w-[14rem] overflow-hidden rounded-md border border-neutral-200 bg-white dark:border-neutral-600 dark:bg-neutral-700">
            <Image
              src={thumbData}
              alt={`${selectedFileName ?? 'File'} preview`}
              fill
              sizes="(min-width: 1024px) 220px, 50vw"
              className="object-cover"
              unoptimized
            />
          </div>
        ) : showPreviewError ? (
          <div className="mt-2 text-xs text-slate-600 dark:text-slate-400">
            Unable to preview
          </div>
        ) : selectedFileName ? (
          <div className="relative mt-2 aspect-[3/4] w-full max-w-[14rem]">
            <Skeleton variant="rounded" className="h-full w-full" />
          </div>
        ) : null}
        <input
          type="file"
          accept="application/pdf"
          onBlur={onBlur}
          onChange={onChange}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
      </div>
      {helperText && (
        <FormHelperText error={isError} className="">
          {helperText}
        </FormHelperText>
      )}
    </div>
  );
};

export default FormFile;
