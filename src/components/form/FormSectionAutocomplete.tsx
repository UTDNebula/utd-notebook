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

function sectionLabel(entry: SectionEntry): string {
  return `${entry.prefix} ${entry.number}.${entry.sectionCode} ${entry.term} ${entry.year}`;
}

type FormSectionAutocompleteProps = {
  label: string;
  className?: string;
  onSectionSelect?: (entry: SectionEntry | null) => void;
  defaultValue?: string;
};

export function FormSectionAutocomplete({
  label,
  className,
  onSectionSelect,
  defaultValue,
}: FormSectionAutocompleteProps) {
  const field = useFieldContext<string>();
  const api = useTRPC();
  const [inputValue, setInputValue] = useState(defaultValue ?? '');
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

  const selectedLabel = selectedEntry ? sectionLabel(selectedEntry) : '';
  const displayedOptions =
    selectedEntry && !options.some((o) => sectionLabel(o) === selectedLabel)
      ? [selectedEntry, ...options]
      : options;

  return (
    <Autocomplete
      options={displayedOptions}
      loading={isLoading}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : sectionLabel(option)
      }
      isOptionEqualToValue={(option, value) =>
        sectionLabel(option) === sectionLabel(value)
      }
      renderOption={(props, option) => (
        <li {...props} key={sectionLabel(option)}>
          <div>
            <div>{sectionLabel(option)}</div>
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
        field.handleChange(newValue ? sectionLabel(newValue) : '');
        onSectionSelect?.(newValue);
      }}
      onBlur={field.handleBlur}
      clearOnBlur={false}
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
            ...params.slotProps,
            input: {
              ...params.slotProps.input,
              endAdornment: (
                <>
                  {isLoading ? <CircularProgress size={20} /> : null}
                  {params.slotProps.input.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
    />
  );
}
