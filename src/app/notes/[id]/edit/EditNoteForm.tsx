'use client';

import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import type { FileDetails } from '@src/app/notes/create/CreateNoteForm';
import Panel, { PanelSkeleton } from '@src/components/common/Panel';
import FormFile from '@src/components/form/FormFile';
import { useTRPC } from '@src/trpc/react';
import { useAppForm } from '@src/utils/form';
import { editFileFormSchema } from '@src/utils/formSchemas';
import { useUploadToUploadURL } from '@src/utils/uploadFile';

interface NoteFormProps {
  file: {
    id: string;
    name: string;
    description?: string;
    handwritten: boolean;
    publicUrl: string;
    updatedAt: Date;
    prefix?: string;
    number?: string;
    sectionCode?: string;
    term?: string;
    year?: number;
  };
}

const NoteForm = ({ file: existingFile }: NoteFormProps) => {
  const api = useTRPC();
  const updateMutation = useMutation(api.file.update.mutationOptions());
  const uploadFile = useUploadToUploadURL();
  const router = useRouter();

  const defaultValues = useMemo<FileDetails>(() => {
    const sectionNumber = [existingFile.number, existingFile.sectionCode]
      .filter(Boolean)
      .join('.');

    return {
      file: null,
      name: existingFile.name,
      description: existingFile.description ?? '',
      section: [
        existingFile.prefix,
        sectionNumber,
        existingFile.term,
        existingFile.year,
      ]
        .filter(Boolean)
        .join(' '),
      prefix: '',
      number: '',
      sectionCode: '',
      term: '',
      year: 0,
      profFirst: '',
      profLast: '',
      handwritten: existingFile.handwritten,
    };
  }, [existingFile]);

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      const selectedFile = value.file ?? null;

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
          name: value.name,
          description: value.description,
          handwritten: value.handwritten,
          file: fileUrl,
        },
        {
          onSuccess: () => router.push(`/notes/${existingFile.id}`),
        },
      );
    },
    validators: {
      onChange: editFileFormSchema.omit({ id: true }),
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
      <Panel heading="Edit Note" description="Update your note details.">
        {/* responsive layout */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          {/* LEFT: file upload */}
          <div className="w-full lg:w-5/12 lg:shrink-0">
            <form.AppField name="file">
              {(field) => (
                <FormFile
                  label="File"
                  value={field.state.value ?? null}
                  existingFile={{
                    name: existingFile.name,
                    publicUrl: existingFile.publicUrl,
                    updatedAt: existingFile.updatedAt,
                  }}
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
                  <field.TextField
                    label="Section"
                    className="w-full"
                    helperText="Section is locked after note creation"
                    disabled
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
