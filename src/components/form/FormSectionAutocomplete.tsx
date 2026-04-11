'use client';

import Autocomplete from '@mui/material/Autocomplete';
import CircularProgress from '@mui/material/CircularProgress';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTRPC } from '@src/trpc/react';
import { useFieldContext } from '@src/utils/form';
import type { SectionEntry } from '@src/utils/sectionEntry';
import useDebounce from '@src/utils/useDebounce';
import { StyledTextField } from './FormTextField';

type FormSectionAutocompleteProps = {
  label: string;
  className?: string;
  onSectionSelect?: (entry: SectionEntry | null) => void;
};

export function FormSectionAutocomplete({
  label,
  className,
  onSectionSelect,
}: FormSectionAutocompleteProps) {
  const field = useFieldContext<string>();
  const api = useTRPC();
  const [inputValue, setInputValue] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<SectionEntry | null>(null);
  const debouncedInput = useDebounce(inputValue, 300);

  // Normalize: insert space between letters and digits ("CS1200" -> "CS 1200")
  const normalizedQuery = debouncedInput
    .replace(/([a-zA-Z]{2,4})(\d)/, '$1 $2')
    .replace(/(\d)([a-zA-Z]{1,4})/, '$1 $2');

  const { data: options = [], isLoading } = useQuery(
    api.section.searchSections.queryOptions(
      { query: normalizedQuery },
      { enabled: normalizedQuery.length >= 2 },
    ),
  );

  const displayedOptions =
    selectedEntry && !options.some((o) => o.label === selectedEntry.label)
      ? [selectedEntry, ...options]
      : options;

  return (
    <Autocomplete
      options={displayedOptions}
      loading={isLoading}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : option.label
      }
      isOptionEqualToValue={(option, value) => option.label === value.label}
      renderOption={(props, option) => (
        <li {...props} key={option.label}>
          <div>
            <div>{option.label}</div>
            <div className="text-xs text-slate-500">
              Prof. {option.profFirst} {option.profLast}
            </div>
          </div>
        </li>
      )}
      inputValue={inputValue}
      onInputChange={(_e, newValue) => setInputValue(newValue)}
      value={selectedEntry}
      onChange={(_e, newValue) => {
        setSelectedEntry(newValue);
        field.handleChange(newValue?.label ?? '');
        onSectionSelect?.(newValue);
      }}
      onBlur={field.handleBlur}
      filterOptions={(x) => x}
      noOptionsText={
        debouncedInput.length < 2
          ? 'Type at least 2 characters'
          : 'No sections found'
      }
      className={className}
      size="small"
      renderInput={(params) => (
        <StyledTextField
          {...params}
          label={label}
          error={field.state.meta.isTouched && !field.state.meta.isValid}
          helperText={
            field.state.meta.isTouched && !field.state.meta.isValid
              ? (
                  field.state.meta.errors as unknown as {
                    message: string;
                  }[]
                )
                  .map((err) => err?.message)
                  .join('. ') + '.'
              : selectedEntry
                ? undefined
                : 'Start typing a course prefix (e.g. CS, MATH)'
          }
          className="w-full"
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
