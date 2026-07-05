'use client';

import { MenuItem } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import Panel from '@src/nebula-library/components/Panel';
import { setSnackbar } from '@src/components/global/Snackbar';
import { useTRPC } from '@src/trpc/react';
import { useAppForm } from '@src/utils/form';
import { createReportSchema } from '@src/utils/formSchemas';

type ReportFormProps = {
  fileId: string;
  fileName: string;
};

type ReportCategory =
  | 'inappropriate'
  | 'incorrect'
  | 'spam'
  | 'copyright'
  | 'other';

interface ReportDetails {
  fileId: string;
  category: ReportCategory;
  details: string;
}

export default function ReportForm({ fileId, fileName }: ReportFormProps) {
  const api = useTRPC();
  const router = useRouter();

  const createMutation = useMutation(
    api.report.create.mutationOptions({
      onSuccess: () => {
        setSnackbar({
          message: 'Report submitted successfully',
          type: 'success',
          autoHideDuration: true,
          fitContent: true,
          closeOn: ['timeout', 'escapeKeyDown', 'dismiss'],
        });
        router.push('/');
      },
      onError: (error) => {
        setSnackbar({
          message: error.message || 'Failed to submit report',
          type: 'error',
          autoHideDuration: false,
          showClose: true,
        });
      },
    }),
  );

  const defaultValues = useMemo<ReportDetails>(
    () => ({
      fileId,
      category: 'other',
      details: '',
    }),
    [fileId],
  );

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await createMutation.mutateAsync(value);
    },
    validators: {
      onChange: createReportSchema,
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="w-full max-w-6xl"
    >
      <Panel
        heading="Report Note"
        description={`Submit a report for "${fileName}"`}
      >
        <div className="flex flex-col gap-4">
          <form.AppField name="category">
            {(field) => (
              <field.TextField
                select
                label="Category"
                className="w-full"
                value={field.state.value}
                onChange={(e) =>
                  field.handleChange(e.target.value as ReportCategory)
                }
              >
                <MenuItem value="inappropriate">Inappropriate</MenuItem>
                <MenuItem value="incorrect">Incorrect</MenuItem>
                <MenuItem value="spam">Spam</MenuItem>
                <MenuItem value="copyright">Copyright (UTD Content)</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </field.TextField>
            )}
          </form.AppField>

          <form.AppField name="details">
            {(field) => (
              <field.TextField
                label="Details"
                multiline
                minRows={5}
                maxLength={1000}
                placeholder="Explain why you are reporting this note."
                className="w-full"
              />
            )}
          </form.AppField>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <form.AppForm>
            <form.ResetButton />
          </form.AppForm>
          <form.AppForm>
            <form.SubmitButton />
          </form.AppForm>
        </div>
      </Panel>
    </form>
  );
}
