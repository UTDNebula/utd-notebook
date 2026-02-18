'use client';

import { Autocomplete, TextField } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Panel, { PanelSkeleton } from '@src/components/common/Panel';
import FormFile from '@src/components/form/FormFile';
import { useTRPC } from '@src/trpc/react';
import { useAppForm } from '@src/utils/form';
import { createFileFormSchema } from '@src/utils/formSchemas';
import { useUploadToUploadURL } from '@src/utils/uploadFile';
import type { SectionSearchResult } from '@src/app/api/sections/search/route';

interface FileDetails {
  file: File | null;
  name: string;
  description?: string;
  section: string;
  sectionId?: string;
}

const toSectionValue = (sectionData: SectionSearchResult): string =>
  `${sectionData.prefix} ${sectionData.number}.${sectionData.sectionCode} ${sectionData.term} ${sectionData.year}`;

const toSectionLabel = (sectionData: SectionSearchResult): string => {
  const sectionValue = toSectionValue(sectionData);
  const professor = `${sectionData.profFirst} ${sectionData.profLast}`.trim();
  return professor ? `${sectionValue} - ${professor}` : sectionValue;
};

const FileForm = () => {
  const api = useTRPC();
  const createMutation = useMutation(api.file.create.mutationOptions());
  const updateMutation = useMutation(api.file.update.mutationOptions());
  const uploadFile = useUploadToUploadURL();
  const router = useRouter();

  //state for section autocomplete
  const [sectionOptions, setSectionOptions] = useState<SectionSearchResult[]>(
    [],
  );
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionInputValue, setSectionInputValue] = useState('');
  const [selectedSection, setSelectedSection] =
    useState<SectionSearchResult | null>(null);

  const defaultValues: FileDetails = {
    file: null,
    name: '',
    description: '',
    section: '',
    sectionId: undefined,
  };

  //fetch section options when user types
  useEffect(() => {
    if (!sectionInputValue || sectionInputValue.length < 2) {
      setSectionOptions([]);
      return;
    }

    const fetchSections = async () => {
      console.log('🔍 Fetching sections for query:', sectionInputValue);
      setSectionLoading(true);
      try {
        const response = await fetch(
          `/api/sections/search?query=${encodeURIComponent(sectionInputValue)}&limit=20`,
        );
        const data = await response.json();
        console.log('📦 Received data:', data);
        if (data.message === 'success') {
          console.log('✅ Setting options:', data.data.length, 'results');
          setSectionOptions(data.data);
        }
      } catch (error) {
        console.error('❌ Failed to fetch sections:', error);
      } finally {
        setSectionLoading(false);
      }
    };

    const debounceTimer = setTimeout(fetchSections, 300);
    return () => clearTimeout(debounceTimer);
  }, [sectionInputValue]);

  const form = useAppForm({
    defaultValues,
    onSubmit: async ({ value, formApi }) => {
      const { file: removedFile, ...rest } = value;

      //create
      return createMutation.mutateAsync(
        {
          ...rest,
        },
        {
          onSuccess: async (newId) => {
            //upload file after we have an ID
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
      onBlur: createFileFormSchema,
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
        <div className="flex flex-col gap-4">
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
              <Autocomplete<SectionSearchResult, false, false, true>
                freeSolo
                loading={sectionLoading}
                options={sectionOptions}
                filterOptions={(x) => x}
                value={selectedSection}
                onChange={(_, newValue) => {
                  if (typeof newValue === 'string') {
                    //user typed a custom value
                    field.handleChange(newValue);
                    setSectionInputValue(newValue);
                    setSelectedSection(null);
                    form.setFieldValue('sectionId', undefined);
                  } else if (newValue) {
                    //user selected an option
                    const sectionValue = toSectionValue(newValue);
                    field.handleChange(sectionValue);
                    setSectionInputValue(sectionValue);
                    setSelectedSection(newValue);
                    form.setFieldValue('sectionId', newValue.id);
                  } else {
                    field.handleChange('');
                    setSectionInputValue('');
                    setSelectedSection(null);
                    form.setFieldValue('sectionId', undefined);
                  }
                }}
                inputValue={sectionInputValue}
                onInputChange={(_, newInputValue, reason) => {
                  setSectionInputValue(newInputValue);
                  if (reason === 'input') {
                    field.handleChange(newInputValue);
                  }
                }}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') {
                    return option;
                  }
                  return toSectionLabel(option);
                }}
                renderOption={(props, option) => {
                  const { key, ...otherProps } = props;
                  return (
                    <li key={key} {...otherProps}>
                      <div className="flex flex-col">
                        <div className="font-semibold">
                          {option.prefix} {option.number}.{option.sectionCode}
                          {' • '} {option.term} {option.year}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {(option.profFirst || option.profLast) && (
                            <>
                              {option.profFirst} {option.profLast}
                              {' • '}
                            </>
                          )}
                          {option.source === 'database' && (
                            <span className="ml-2 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-1.5 py-0.5 rounded">
                              In DB
                            </span>
                          )}
                        </div>
                      </div>
                    </li>
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Section"
                    placeholder="Search by course code or professor (e.g., CS 1337, John Smith)"
                    className="[&>.MuiInputBase-root]:bg-white dark:[&>.MuiInputBase-root]:bg-neutral-900"
                    size="small"
                    error={!field.state.meta.isValid}
                    helperText={
                      !field.state.meta.isValid
                        ? field.state.meta.errors
                            .map((err) => err?.message)
                            .join('. ') + '.'
                        : 'Start typing to search for a section by course code or professor name'
                    }
                    onBlur={field.handleBlur}
                  />
                )}
              />
            )}
          </form.AppField>
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
