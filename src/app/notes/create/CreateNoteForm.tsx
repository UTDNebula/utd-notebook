'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import Panel, { PanelSkeleton } from '@src/components/common/Panel';
import FormFile from '@src/components/form/FormFile';
import { useTRPC } from '@src/trpc/react';
import { useAppForm } from '@src/utils/form';
import { createFileFormSchema } from '@src/utils/formSchemas';
import { useUploadToUploadURL } from '@src/utils/uploadFile';

interface FileDetails {
  file: File | null;
  name: string;
  description?: string;
  section: string;
}

const FileForm = () => {
  const api = useTRPC();
  const createMutation = useMutation(api.file.create.mutationOptions());
  const updateMutation = useMutation(api.file.update.mutationOptions());
  const uploadFile = useUploadToUploadURL();
  const router = useRouter();

  const defaultValues: FileDetails = {
    file: null,
    name: '',
    description: '',
    section: '',
  };

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      const { file: removedFile, ...rest } = value;

      // Create
      return createMutation.mutateAsync(
        {
          ...rest,
        },
        {
          onSuccess: async (newId) => {
            // Upload file after we have an ID
            const isFileIsDirty = !formApi.getFieldMeta('file')?.isDefaultValue;
            if (!isFileIsDirty) {
              router.push(`/notes/${newId}`);
              return;
            }

            const url = await uploadFile.mutateAsync({
              file: removedFile,
              fileName: newId,
            });
            const fileUrl = url;
            updateMutation.mutate(
              {
                id: newId,
                ...rest,
                file: fileUrl,
              },
              {
                onSuccess: () => {
                  router.push(`/notes/${newId}`);
                },
              },
            );
          },
        },
      );
    },
    validators: {
      onChange: createFileFormSchema,
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
        heading="Create New Note"
        description="Upload a new note here to help future students."
      >
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="w-full lg:w-5/12">
            <form.AppField name="file">
              {(field) => (
                <FormFile
                  label="File"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    field.handleChange(file);
                  }}
                  helperText={
                    !field.state.meta.isValid
                      ? field.state.meta.errors
                          .map((err) => err?.message)
                          .join('. ') + '.'
                      : undefined
                  }
                />
              )}
            </form.AppField>
          </div>
          <div className="flex flex-col gap-4 w-full lg:w-7/12">
            <form.AppField name="name">
              {(field) => <field.TextField label="Name" className="w-full" />}
            </form.AppField>
            <form.AppField name="description">
              {(field) => (
                <field.TextField
                  label="Description"
                  multiline
                  minRows={4}
                  helperText={
                    <span>
                      We support{' '}
                      <a
                        href="https://www.markdownguide.org/basic-syntax/"
                        rel="noreferrer"
                        target="_blank"
                        className="text-royal dark:text-cornflower-300 underline"
                      >
                        Markdown
                      </a>
                      !
                    </span>
                  }
                  className="w-full"
                />
              )}
            </form.AppField>
            <form.AppField name="section">
              {(field) => (
                <field.TextField label="Section" className="w-full" />
              )}
            </form.AppField>
          </div>
        </div>
        <div className="flex flex-wrap justify-end items-center gap-2">
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
};

export default FileForm;

export const FileFormSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 max-w-full">
      <PanelSkeleton />
    </div>
  );
};
