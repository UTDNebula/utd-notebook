'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import Panel, { PanelSkeleton } from '@src/components/common/Panel';
import FormFile from '@src/components/form/FormFile';
import { useTRPC } from '@src/trpc/react';
import { useAppForm } from '@src/utils/form';
import {
  createFileFormSchema,
  editFileFormSchema,
} from '@src/utils/formSchemas';
import { useUploadToUploadURL } from '@src/utils/uploadFile';

type NoteFormProps =
  | {
      mode?: 'create';
      file?: undefined;
    }
  | {
      mode: 'edit';
      file: {
        id: string;
        name: string;
        description?: string;
        handwritten: boolean;
        publicUrl: string;
      };
    };

interface FileDetails {
  file: File | null;
  name: string;
  description?: string;
  section?: string;
  handwritten: boolean;
}

const NoteForm = ({ mode = 'create', file: existingFile }: NoteFormProps) => {
  const api = useTRPC();
  const createMutation = useMutation(api.file.create.mutationOptions());
  const updateMutation = useMutation(api.file.update.mutationOptions());
  const uploadFile = useUploadToUploadURL();
  const router = useRouter();

  const defaultValues = useMemo<FileDetails>(() => {
    if (mode === 'edit' && existingFile) {
      return {
        file: null,
        name: existingFile.name,
        description: existingFile.description ?? '',
        section: '',
        handwritten: existingFile.handwritten,
      };
    }
    return {
      file: null,
      name: '',
      description: '',
      section: '',
      handwritten: false,
    };
  }, [mode, existingFile]);

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      const { file: selectedFile, section, ...rest } = value;

      if (mode === 'edit' && existingFile) {
        let fileUrl = existingFile.publicUrl;
        const isFileDirty = !formApi.getFieldMeta('file')?.isDefaultValue;
        if (isFileDirty && selectedFile) {
          fileUrl = await uploadFile.mutateAsync({
            file: selectedFile,
            fileName: existingFile.id,
          });
        }

        return updateMutation.mutateAsync(
          {
            id: existingFile.id,
            ...rest,
            file: fileUrl,
          },
          {
            onSuccess: () => router.push(`/notes/${existingFile.id}`),
          },
        );
      }

      // Create
      return createMutation.mutateAsync(
        { ...rest, section: section ?? '' },
        {
          onSuccess: async (newId) => {
            const isFileDirty = !formApi.getFieldMeta('file')?.isDefaultValue;
            if (!isFileDirty) {
              router.push(`/notes/${newId}`);
              return;
            }

            const url = await uploadFile.mutateAsync({
              file: selectedFile,
              fileName: newId,
            });
            updateMutation.mutate(
              {
                id: newId,
                ...rest,
                file: url,
              },
              {
                onSuccess: () => router.push(`/notes/${newId}`),
              },
            );
          },
        },
      );
    },
    validators: {
      onChange:
        mode === 'create'
          ? createFileFormSchema
          : editFileFormSchema.omit({ id: true }),
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
        heading={mode === 'create' ? 'Create New Note' : 'Edit Note'}
        description={
          mode === 'create'
            ? 'Upload a new note here to help future students.'
            : 'Update your note details.'
        }
      >
        {/* responsive layout */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* LEFT: file upload */}
          <div className="w-full lg:w-5/12 lg:shrink-0">
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
                      : 'Max file size 5MB'
                  }
                />
              )}
            </form.AppField>
          </div>

          {/* RIGHT: inputs */}
          <div className="w-full lg:w-7/12">
            <div className="flex flex-col gap-4">
              <form.AppField name="name">
                {(field) => (
                  <field.TextField
                    label="Name"
                    placeholder="Example: Midterm Notes"
                    maxLength={100}
                    className="w-full"
                  />
                )}
              </form.AppField>

              <form.AppField name="description">
                {(field) => (
                  <field.TextField
                    label="Description"
                    multiline
                    minRows={4}
                    maxLength={1000}
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

              {mode === 'create' && (
                <form.AppField name="section">
                  {(field) => (
                    <field.TextField
                      label="Section"
                      className="w-full"
                      helperText="Example: CS 1200.001 Fall 2025"
                    />
                  )}
                </form.AppField>
              )}
              <form.AppField name="handwritten">
                {(field) => (
                  <field.Checkbox label="Handwritten"></field.Checkbox>
                )}
              </form.AppField>
            </div>
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

export default NoteForm;

export const NoteFormSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 max-w-full">
      <PanelSkeleton />
    </div>
  );
};
