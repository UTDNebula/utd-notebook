'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import Panel, { PanelSkeleton } from '@nebula-library/components/Panel';
import FormFile from '@src/components/form/FormFile';
import { useTRPC } from '@src/trpc/react';
import { useAppForm } from '@src/utils/form';
import { createFileFormSchema } from '@src/utils/formSchemas';
import { useUploadToUploadURL } from '@src/utils/uploadFile';

export type FileDetails = {
  file?: File | null;
  name: string;
  description?: string;
  section?: string;
  prefix?: string;
  number?: string;
  sectionCode?: string;
  term?: string;
  year?: number;
  profFirst?: string;
  profLast?: string;
  handwritten: boolean;
};

const defaultValues: FileDetails = {
  file: null,
  name: '',
  description: '',
  section: '',
  prefix: '',
  number: '',
  sectionCode: '',
  term: '',
  year: 0,
  profFirst: '',
  profLast: '',
  handwritten: false,
};

const NoteForm = () => {
  const api = useTRPC();
  const createMutation = useMutation(api.file.create.mutationOptions());
  const updateMutation = useMutation(api.file.update.mutationOptions());
  const uploadFile = useUploadToUploadURL();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultQuery = searchParams.get('q');

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      const selectedFile = value.file ?? null;

      // Create
      return createMutation.mutateAsync(
        {
          name: value.name,
          description: value.description,
          handwritten: value.handwritten,
          prefix: value.prefix ?? '',
          number: value.number ?? '',
          sectionCode: value.sectionCode ?? '',
          term: (value.term ?? '') as 'Spring' | 'Summer' | 'Fall',
          year: value.year ?? 0,
          profFirst: value.profFirst ?? '',
          profLast: value.profLast ?? '',
        },
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
                name: value.name,
                description: value.description,
                handwritten: value.handwritten,
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
        {/* responsive layout */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* LEFT: file upload */}
          <div className="w-full lg:w-5/12 lg:shrink-0">
            <form.AppField name="file">
              {(field) => (
                <FormFile
                  label="File"
                  value={field.state.value ?? null}
                  existingFile={undefined}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const file = e.target.files?.[0] ?? null;
                    field.handleChange(file);
                  }}
                  isError={!field.state.meta.isValid}
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

              <form.AppField name="section">
                {(field) => (
                  <field.SectionAutocomplete
                    label="Section"
                    className="w-full"
                    defaultValue={defaultQuery ?? undefined}
                    onSectionSelect={(entry) => {
                      form.setFieldValue('prefix', entry?.prefix ?? '');
                      form.setFieldValue('number', entry?.number ?? '');
                      form.setFieldValue(
                        'sectionCode',
                        entry?.sectionCode ?? '',
                      );
                      form.setFieldValue('term', entry?.term ?? '');
                      form.setFieldValue('year', entry?.year ?? 0);
                      form.setFieldValue('profFirst', entry?.profFirst ?? '');
                      form.setFieldValue('profLast', entry?.profLast ?? '');
                    }}
                  />
                )}
              </form.AppField>

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
