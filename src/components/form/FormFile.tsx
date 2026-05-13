'use client';

import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { FormHelperText } from '@mui/material';

interface FormFileProps {
  label?: string;
  value: File | null;
  onBlur: () => void;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
  className?: string;
  existingFile?: { name: string; publicUrl: string };
  isError?: boolean;
}

const FormFile = ({
  label,
  onBlur,
  value: file,
  onChange,
  helperText,
  className,
  existingFile,
  isError,
}: FormFileProps) => {
  return (
    <div className={className}>
      <div
        className={`w-full lg:h-96 max-lg:h-48 flex flex-col justify-center items-center gap-2 p-8 rounded-md bg-cornflower-50 dark:bg-cornflower-950 has-[:hover]:bg-cornflower-100 dark:has-[:hover]:bg-cornflower-900 transition-colors relative ${isError ? 'border-2 border-red-500' : ''}`}
      >
        {label && (
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
            {label}
          </p>
        )}
        {file?.name ? (
          <p className="text-xs text-slate-800 dark:text-slate-200">
            {file.name}
          </p>
        ) : existingFile ? (
          <>
            <CloudUploadIcon />
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Current: {existingFile.name}
            </p>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Drag or choose a new PDF to replace
            </p>
          </>
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
        <input
          type="file"
          accept="application/pdf"
          onBlur={onBlur}
          onChange={onChange}
          className="absolute inset-0 cursor-pointer text-transparent"
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
