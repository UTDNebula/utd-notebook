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
}

const FormFile = ({
  label,
  onBlur,
  value: file,
  onChange,
  helperText,
  className,
}: FormFileProps) => {
  return (
    <div className={className}>
      <div className="w-full lg:h-96 max-lg:h-48 flex flex-col justify-center items-center gap-2 p-8 rounded-md bg-cornflower-50 dark:bg-cornflower-950 has-[:hover]:bg-cornflower-100 dark:has-[:hover]:bg-cornflower-900 transition-colors relative">
        {label && (
          <label
            htmlFor="pdf-file-input"
            className="text-xs font-bold text-slate-800 dark:text-slate-200 z-10"
          >
            {label}
          </label>
        )}
        {file?.name ? (
          <p className="text-xs text-slate-800 dark:text-slate-200">
            {file.name}
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
        <input
          id="pdf-file-input"
          type="file"
          accept="application/pdf"
          aria-label={label ?? 'Upload PDF file'}
          onBlur={onBlur}
          onChange={onChange}
          className="absolute inset-0 cursor-pointer text-transparent"
        />
      </div>
      {helperText && (
        <FormHelperText error className="">
          {helperText}
        </FormHelperText>
      )}
    </div>
  );
};

export default FormFile;
