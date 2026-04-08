'use client';

import SearchIcon from '@mui/icons-material/Search';
import { Autocomplete, TextField } from '@mui/material';
import InputAdornment from '@mui/material/InputAdornment';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState, type Key } from 'react';
import { searchQueryLabel, type SearchQuery } from '@src/utils/SearchQuery';

/**
 * api response type for autocomplete endpoint
 */
interface AutocompleteResponse {
  state: string;
  data: SearchQuery[];
}

/**
 * api response type for courseNameAutoComplete endpoint
 */
interface CourseNameResult {
  title: string;
  result: SearchQuery;
}

interface GenericFetchedDataResponse {
  state: string;
  data: CourseNameResult[];
}

type SearchQueryWithCourseTitle = SearchQuery & {
  courseTitle?: string;
};

/**
 * Props type used by the SearchBar component
 */
interface SearchProps {
  className?: string;
  input_className?: string;
  autoFocus?: boolean;
}

/**
 * This component returns a custom search bar component that makes use of the Material UI autocomplete component
 * Sends a new search value to the parent component when the user selects it from the options list
 *
 * Styled for the splash page
 */
const SearchBar = ({ className, input_className, autoFocus }: SearchProps) => {
  //what you can choose from
  const [options, setOptions] = useState<SearchQueryWithCourseTitle[]>([]);
  //initial loading prop for first load
  const [loading, setLoading] = useState(false);

  //text in search
  const [inputValue, _setInputValue] = useState('');
  //quick input updates for fetch (state is slow)
  const quickInputValue = useRef('');
  function setInputValue(newValue: string) {
    quickInputValue.current = newValue;
    _setInputValue(newValue);
  }
  //chosen value (single, was previously an array for multi-select)
  const [value, setValue] = useState<SearchQuery | null>(null);

  //shortcut to loading course name results if a known substring has no normal results
  const [noResult, setNoResults] = useState<null | string>(null);

  //set value from query
  const router = useRouter();
  // updateValue -> onSelect_internal -> updateQueries - clicking enter on an autocomplete suggestion in TopMenu Searchbar
  // updateValue -> onSelect_internal -> onSelect (custom function) - clicking enter on an autocomplete suggestion in home page SearchBar
  // params.inputProps.onKeyDown -> handleKeyDown -> onSelect_internal -> updateQueries/onSelect - clicking enter in the SearchBar
  // Button onClick -> onSelect_internal -> updateQueries/onSelect - Pressing the "Search" Button

  //change all values
  function updateValue(newValue: SearchQuery | null) {
    setValue(newValue);
    onSelect_internal(newValue); // clicking enter to select a autocomplete suggestion triggers a new search (it also 'Enters' for the searchbar)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' && inputValue === '') {
      event.preventDefault();
      event.stopPropagation();
      onSelect_internal(value);
    }
  }

  //update parent and queries
  function onSelect_internal(newValue: SearchQuery | null) {
    if (newValue) {
      void updateQueries(newValue);
    }
  }

  function updateQueries(term: SearchQuery) {
    // Navigate to notes page based on search term
    if (term.prefix && term.number) {
      router.push(`/notes/${term.prefix.toLowerCase()}/${term.number}`);
    } else if (term.profFirst && term.profLast) {
      router.push(
        `/notes//${term.profFirst.toLowerCase()}/${term.profLast.toLowerCase()}`,
      );
    }
  }

  //fetch new options, add tags if valid
  function loadNewCourseNameOptions(newInputValue: string) {
    fetch(
      '/api/courseNameAutoComplete?input=' + encodeURIComponent(newInputValue),
    )
      .then(
        (response) => response.json() as Promise<GenericFetchedDataResponse>,
      )
      .then((data) => {
        if (data.state !== 'done') {
          throw new Error(data.state);
        }

        const queryWords = newInputValue
          .toLowerCase()
          .trim()
          .split(/\s+/)
          .filter(Boolean);

        const scored = data.data.map((item: CourseNameResult) => {
          const courseTitle = item.title.toLowerCase();
          const allWordsMatch =
            queryWords.length > 0 &&
            queryWords.every((word) => courseTitle.includes(word));

          return {
            ...item.result,
            courseTitle: item.title,
            score: allWordsMatch ? 0 : 1,
          };
        });

        scored.sort((a, b) => a.score - b.score);

        const deduped: SearchQueryWithCourseTitle[] = [];
        const seen = new Set<string>();
        for (const item of scored) {
          const key = searchQueryLabel(item);
          if (seen.has(key)) continue;
          seen.add(key);
          deduped.push(item);
        }

        if (quickInputValue.current === newInputValue) {
          //still valid options
          setOptions(deduped);
        }
      })
      .catch((error) => {
        if (!(error instanceof DOMException)) {
          console.error('Course name autocomplete', error);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  function loadNewOptions(newInputValue: string) {
    if (noResult !== null && newInputValue.startsWith(noResult)) {
      setLoading(true);
      loadNewCourseNameOptions(newInputValue);
      return;
    }
    setLoading(true);
    if (newInputValue.trim() === '') {
      setOptions([]);
      setLoading(false);
      return;
    }
    fetch(
      '/api/autocomplete?input=' +
        encodeURIComponent(newInputValue) +
        '&searchBy=both',
      {
        method: 'GET',
      },
    )
      .then((response) => response.json() as Promise<AutocompleteResponse>)
      .then((data) => {
        if (data.state !== 'done') {
          console.error('Autocomplete API error:', data.state, data);
          throw new Error(data.state);
        }
        if (quickInputValue.current === newInputValue) {
          //still valid options
          if (!data.data.length) {
            setNoResults(newInputValue);
            loadNewCourseNameOptions(newInputValue);
          } else {
            setOptions(data.data);
            setNoResults(null);
          }
        }
      })
      .catch((error) => {
        // ignore aborts
        if (!(error instanceof DOMException)) {
          console.error('Autocomplete', error);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    void fetch('/api/autocomplete?input=someSearchTerm');
  }, []);

  return (
    <Autocomplete
      freeSolo
      loading={loading}
      //highlight first option to add with enter
      autoHighlight={true}
      clearOnBlur={false}
      className={'w-full max-w-xs md:max-w-sm lg:max-w-md ' + (className ?? '')}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }
        return searchQueryLabel(option);
      }}
      options={options}
      //don't filter options, done in fetch
      filterOptions={(options) => options}
      value={value}
      onChange={(
        event: React.SyntheticEvent,
        newValue: string | SearchQuery | null,
      ) => {
        //should never happen
        if (typeof newValue === 'string' || newValue === null) {
          return;
        }
        updateValue(newValue);
      }}
      inputValue={inputValue}
      onInputChange={(event, newInputValue) => {
        setInputValue(newInputValue);
        loadNewOptions(newInputValue);
      }}
      renderInput={(params) => {
        params.inputProps.onKeyDown = handleKeyDown;
        return (
          <TextField
            {...params}
            variant="outlined"
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <InputAdornment position="end" key="search-icon">
                    <SearchIcon className="text-royal dark:text-cornflower-300" />
                  </InputAdornment>
                ),
                className:
                  'rounded-full bg-white dark:bg-neutral-700' +
                  (input_className ?? ''),
              },
            }}
            placeholder="Search for courses or professors"
            autoFocus={autoFocus}
          />
        );
      }}
      renderOption={(props: { key: Key }, option, { inputValue }) => {
        const text =
          typeof option === 'string' ? option : searchQueryLabel(option);
        //add spaces between prefix and course number
        const matches = match(
          text,
          inputValue
            .replace(/([a-zA-Z]{2,4})([0-9][0-9V]?[0-9]{0,2})/, '$1 $2')
            .replace(/([0-9][0-9V][0-9]{2})([a-zA-Z]{1,4})/, '$1 $2'),
        );

        const parts = parse(text, matches);
        const { key, ...otherProps } = props;

        return (
          <li key={key} {...otherProps}>
            {parts.map((part, index) => (
              <span
                key={index}
                className={
                  'whitespace-pre-wrap' + (part.highlight ? ' font-bold' : '')
                }
              >
                {part.text}
              </span>
            ))}
          </li>
        );
      }}
    />
  );
};

export default SearchBar;
