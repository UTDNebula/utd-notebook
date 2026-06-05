'use client';

import AddIcon from '@mui/icons-material/Add';
import ArticleIcon from '@mui/icons-material/Article';
import HistoryToggleOffIcon from '@mui/icons-material/HistoryToggleOff';
import SearchIcon from '@mui/icons-material/Search';
import {
  Autocomplete,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import match from 'autosuggest-highlight/match';
import parse from 'autosuggest-highlight/parse';
import { useRouter } from 'next/navigation';
import React, {
  useEffect,
  useRef,
  useState,
  useTransition,
  type Key,
} from 'react';
import untyped_professor_to_alias from '@src/data/professor_to_alias.json';
import {
  decodeSearchQueryLabel,
  removeDuplicates,
  searchQueryEqual,
  searchQueryLabel,
  type SearchQuery,
  type SearchQueryWithTitle,
} from '@src/utils/SearchQuery';

const professor_to_alias = untyped_professor_to_alias as {
  [key: string]: string;
};

export function getRecentSearches() {
  const searchesText =
    typeof window !== 'undefined'
      ? window.localStorage.getItem('UTDNotebookRecent')
      : null;
  let recSearches: SearchQueryWithTitle[] = [];
  if (searchesText != null) {
    recSearches = JSON.parse(searchesText) as SearchQueryWithTitle[];
  }
  return recSearches;
}

export function updateRecentSearches(newValue: SearchQueryWithTitle[]) {
  const recSearches: SearchQueryWithTitle[] = getRecentSearches();
  const concatArray = [...newValue, ...recSearches];
  const dedupArray = removeDuplicates(concatArray)
    .slice(0, 3)
    .map((el) => ({ ...el, isRecent: true }));
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(
      'UTDNotebookRecent',
      JSON.stringify(dedupArray),
    );
  }
}

/**
 * Props type used by the SearchBar component
 */
interface Props {
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
export default function SearchBar(props: Props) {
  // For spinner after router.push
  const [isPending, startTransition] = useTransition();

  // What you can choose from
  const [options, setOptions] = useState<SearchQueryWithTitle[]>(() =>
    getRecentSearches().map((entry) => ({ ...entry, isRecent: true })),
  );
  // Initial loading prop for first load
  const [loading, setLoading] = useState(false);
  const [openErrorTooltip, setErrorTooltip] = useState(false);

  // Shortcut to loading course name results if a known substring has no normal results
  const [noResult, setNoResults] = useState<null | string>(null);

  // Text in search
  const [inputValue, _setInputValue] = useState('');
  // Quick input updates for fetch (state is slow)
  const quickInputValue = useRef('');
  function setInputValue(newValue: string) {
    quickInputValue.current = newValue;
    _setInputValue(newValue);
  }

  // Chosen values
  const [value, setValue] = useState<SearchQuery | null>(null);

  // updateValue -> onSelect_internal -> updateQueries - clicking enter on an autocomplete suggestion in TopMenu Searchbar
  // updateValue -> onSelect_internal -> onSelect (custom function) - clicking enter on an autocomplete suggestion in home page SearchBar
  // params.inputProps.onKeyDown -> handleKeyDown -> onSelect_internal -> updateQueries/onSelect - clicking enter in the SearchBar
  // Button onClick -> onSelect_internal -> updateQueries/onSelect - Pressing the "Search" Button

  // Change all values
  function updateValue(newValue: SearchQuery | null) {
    onSelect(newValue); // Clicking enter to select a autocomplete suggestion triggers a new search (it also 'Enters' for the searchbar)
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key !== 'Enter') {
      return;
    }

    if (options.length == 0 || loading) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    if (inputValue === '' && !highlightedOption) {
      event.preventDefault();
      event.stopPropagation();
      onSelect(value);
      return;
    }
  }

  // Update parent and queries
  function onSelect(newValue: SearchQuery | null) {
    setErrorTooltip(!newValue);

    setValue(newValue);
    if (newValue) {
      setInputValue(searchQueryLabel(newValue));
    }

    if (newValue) {
      updateQueries(newValue);
      startTransition(() => {});
    }

    if (newValue) {
      updateRecentSearches([newValue]);
    }
  }

  const router = useRouter();

  // Update route with what's in value
  function updateQueries(term: SearchQuery) {
    if (term.prefix && term.number) {
      if (term.hasNotes === false) {
        router.push(
          `/notes/create?q=${searchQueryLabel(term)}`,
        );
        return;
      }

      // Navigate to notes page based on search term
      router.push(
        `/notes/${term.prefix.toLowerCase()}/${term.number.toLowerCase()}`,
      );
      return;
    }

    if (term.profFirst && term.profLast) {
      if (term.hasNotes === false) {
        router.push(`/notes/create?q=${searchQueryLabel(term)}`);
        return;
      }

      router.push(
        `/notes/${term.profFirst.toLowerCase()}/${term.profLast.toLowerCase()}`,
      );
    }
  }

  // Set options to recent searches only (at the start)
  function prePopulateRecents() {
    let recents: SearchQueryWithTitle[] = getRecentSearches();
    recents = recents.filter(
      (item) => !value || !searchQueryEqual(value, item),
    ); // Remove currently chosen values
    recents.forEach((el) => {
      el.isRecent = true;
    });
    setOptions(recents);
  }

  // Returns the filtered options after removing chosen values and adding recent searches that match the input
  function filterOptions(
    incomingOptions: SearchQueryWithTitle[],
    newInputValue: string,
  ): SearchQueryWithTitle[] {
    // No autocomplete options, don't waste time prepending matchedRecents (force it to call loadNewCourseNameOptions() )
    if (incomingOptions.length === 0) {
      return [];
    }

    const recents: SearchQueryWithTitle[] = getRecentSearches();
    const matchedRecents = recents.filter((item: SearchQueryWithTitle) => {
      if (value && searchQueryEqual(value, item)) {
        return false;
      } // Remove currently chosen values

      if (
        !(
          searchQueryLabel(item)
            .toLowerCase()
            .includes(newInputValue.toLowerCase()) ||
          item.subtitle?.toLowerCase().includes(newInputValue.toLowerCase()) ||
          item.title?.toLowerCase().includes(newInputValue.toLowerCase())
        )
      ) {
        return false;
      } // Remove non-matching recent options
      return true;
    });

    const filtered: SearchQueryWithTitle[] = incomingOptions.filter(
      (item: SearchQueryWithTitle) =>
        (!value || !searchQueryEqual(value, item)) && // Item must not be currently chosen
        !matchedRecents.some((rec) => searchQueryEqual(rec, item)), // Remove from filtered if it's a recent option (will add back in the return)
    );

    filtered.forEach((el) => {
      el.isRecent = recents.some((rec) => searchQueryEqual(el, rec)); // Deals with removals from recents
    });

    return [...matchedRecents, ...filtered];
  }

  // Fetch new options, add tags if valid
  function loadNewOptions(newInputValue: string) {
    if (noResult !== null && newInputValue.startsWith(noResult)) {
      loadNewCourseNameOptions(newInputValue);
      return;
    }

    setLoading(true);
    if (newInputValue.trim() === '') {
      prePopulateRecents();
      setLoading(false);
      return;
    }

    fetch(
      '/api/autocomplete?input=' +
        encodeURIComponent(newInputValue) +
        '&searchBy=both',
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.state !== 'done') {
          throw new Error(data.data ?? data.message);
        }

        const filtered = filterOptions(data.data, newInputValue);

        if (
          // If the returned options minus already selected values is 1, then this
          // means a space following should autocomplete the previous stuff to a search
          filtered.length === 1 &&
          // If the next character the user typed was a space, then the search should be autocompleted
          // this looks at quickInputValue because it is always the most recent state of the field's string input,
          // so requests that return later will still see that a space was typed after the text to be autocompleted,
          // so it should autocomplete then when this is realized
          quickInputValue.current.charAt(newInputValue.length) === ' '
        ) {
          const firstFiltered = filtered[0];
          if (!firstFiltered) {
            return;
          }

          // Only search on space when it matches the full prof name
          if (
            (typeof firstFiltered.profFirst === 'undefined' &&
              typeof firstFiltered.profLast === 'undefined') ||
            searchQueryEqual(
              {
                profFirst: firstFiltered.profFirst?.toLowerCase(),
                profLast: firstFiltered.profLast?.toLowerCase(),
              },
              decodeSearchQueryLabel(
                quickInputValue.current.toLowerCase().trim(),
              ),
            )
          ) {
            onSelect(firstFiltered);
            const rest = quickInputValue.current
              .slice(newInputValue.length)
              .trimStart();
            setInputValue(rest);
            loadNewOptions(rest.trimEnd());
          }
        } else if (quickInputValue.current === newInputValue) {
          // Still valid options
          if (!filtered.length) {
            setNoResults(newInputValue);
            loadNewCourseNameOptions(newInputValue);
          }
          setOptions(filtered);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }

  // Fetch new course name options
  function loadNewCourseNameOptions(newInputValue: string) {
    fetch(
      '/api/courseNameAutocomplete?input=' + encodeURIComponent(newInputValue),
    )
      .then((response) => response.json())
      .then((data) => {
        if (data.state !== 'done') {
          throw new Error(data.data ?? data.message);
        }

        const formatted = data.data.map(
          (item: { title: string; result: SearchQuery }) => ({
            ...item.result,
            title: item.title,
          }),
        );

        // Remove currently chosen values
        const filtered: SearchQueryWithTitle[] = filterOptions(
          formatted,
          newInputValue,
        );

        if (quickInputValue.current === newInputValue) {
          // Still valid options
          setOptions(filtered);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }

  useEffect(() => {
    void fetch('/api/autocomplete?input=someSearchTerm');
  }, []);

  const [highlightedOption, setHighlightedOption] = useState<boolean>(false);

  return (
    <Autocomplete
      freeSolo
      loading={loading}
      onFocus={() => {
        if (inputValue.trim() === '') {
          prePopulateRecents();
          return;
        }
      }}
      // Highlight first option to add with enter
      autoHighlight={true}
      clearOnBlur={false}
      className={
        'w-full max-w-xs md:max-w-sm lg:max-w-md ' + (props.className ?? '')
      }
      onHighlightChange={(option) => {
        setHighlightedOption(option !== null);
      }}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }
        return searchQueryLabel(option);
      }}
      getOptionKey={(option) => {
        if (typeof option === 'string') {
          return option;
        }
        if ('title' in option && typeof option.title !== 'undefined') {
          return option.title + searchQueryLabel(option);
        }
        return searchQueryLabel(option);
      }}
      options={options}
      // Don't filter options, done in fetch
      filterOptions={(options) => options}
      value={value}
      onChange={(
        _event: React.SyntheticEvent,
        newValue: string | SearchQuery | null,
      ) => {
        // Should never happen
        if (typeof newValue === 'string') {
          setInputValue(newValue);
          return;
        }
        if (newValue === null) {
          updateValue(null);
          return;
        }

        updateValue(newValue);
      }}
      selectOnFocus={false}
      handleHomeEndKeys={false}
      inputValue={inputValue}
      onInputChange={(_event, newInputValue) => {
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
                    <Tooltip
                      title="Select a course or professor before searching"
                      placement="top"
                      open={openErrorTooltip}
                      onOpen={() => setErrorTooltip(true)}
                      onClose={() => setErrorTooltip(false)}
                      disableFocusListener
                      disableHoverListener
                      disableTouchListener
                    >
                      <IconButton
                        size="small"
                        onClick={() => onSelect(value)}
                        className="relative"
                      >
                        <SearchIcon className={isPending ? 'opacity-0' : ''} />
                        {isPending && (
                          <CircularProgress
                            size={18}
                            className="text-royal dark:text-cornflower-300"
                          />
                        )}
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
                className:
                  'rounded-full bg-white dark:bg-neutral-700 ' +
                  (props.input_className ?? ''),
              },
            }}
            placeholder="Search for courses or professors"
            autoFocus={props.autoFocus}
          />
        );
      }}
      // For handling spaces, when options are already loaded
      onInput={(event) => {
        const rawValue = (event.target as HTMLInputElement).value;
        // If the last character in the new string is a space, check for autocomplete
        if (
          (rawValue[rawValue.length - 1] === ' ' ||
            rawValue[rawValue.length - 1] === ',') &&
          // But if the user is deleting text, don't try to autocomplete
          (event.nativeEvent as InputEvent).inputType === 'insertText'
        ) {
          if (
            rawValue.length > 0 &&
            options.length === 1 &&
            ((typeof options[0]?.profFirst === 'undefined' &&
              typeof options[0]?.profLast === 'undefined') ||
              searchQueryEqual(
                {
                  profFirst: options[0]?.profFirst?.toLowerCase(),
                  profLast: options[0]?.profLast?.toLowerCase(),
                },
                decodeSearchQueryLabel(rawValue.toLowerCase().trim()),
              ))
          ) {
            const firstOption = options[0];
            if (!firstOption) {
              return;
            }

            event.preventDefault();
            event.stopPropagation();
            onSelect(firstOption);
          }
        }
      }}
      renderOption={(
        optionProps: { key: Key },
        option: string | SearchQueryWithTitle,
        { inputValue },
      ) => {
        let text = '';
        let subtext;
        if (typeof option === 'string') {
          text = option;
        } else if (typeof option.title !== 'undefined') {
          text = option.title;
          subtext = searchQueryLabel(option);
        } else if (typeof option.subtitle !== 'undefined') {
          text = searchQueryLabel(option);
          subtext = option.subtitle;
        } else {
          text = searchQueryLabel(option);
          subtext = professor_to_alias[searchQueryLabel(option)] ?? '';
        }

        const normalizedInput = inputValue
          .replace(/([a-zA-Z]{2,4})([0-9][0-9V]?[0-9]{0,2})/, '$1 $2')
          .replace(/([0-9][0-9V][0-9]{2})([a-zA-Z]{1,4})/, '$1 $2');
        // Add spaces between prefix and course number
        const matches = match(text, normalizedInput);
        const subTextMatches = match(subtext ?? '', normalizedInput);
        const parts = parse(text, matches);
        const subtextParts = subtext ? parse(subtext, subTextMatches) : [];
        const { key, ...otherProps } = optionProps;

        return (
          <li key={key} {...otherProps}>
            {
              // If option isSearchQuery and isRecent is declared & is true
              typeof option !== 'string' ? option.isRecent == true ? (
                <HistoryToggleOffIcon className="text-gray-400 self-start mr-2 mt-0.5" />
              ) : (
                option.hasNotes ? (
                  <ArticleIcon className="text-gray-400 self-start mr-2 mt-0.5" />
                ) : (
                  <AddIcon className="text-gray-400 self-start mr-2 mt-0.5" />
                )
              )
            : null}
            <div>
              <div>
                {parts.map((part, index) => (
                  <span
                    key={index}
                    className={
                      'whitespace-pre-wrap' +
                      (part.highlight ? ' font-bold' : '')
                    }
                  >
                    {part.text}
                  </span>
                ))}
              </div>
              {subtext && (
                <Typography variant="caption">
                  {subtextParts.map((part, index) => (
                    <span
                      key={index}
                      className={
                        'whitespace-pre-wrap' +
                        (part.highlight ? ' font-bold' : '')
                      }
                    >
                      {part.text}
                    </span>
                  ))}
                </Typography>
              )}
            </div>
          </li>
        );
      }}
    />
  );
}
