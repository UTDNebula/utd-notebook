'use client';

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
  searchQueryEqual,
  searchQueryLabel,
  type SearchQuery,
} from '@src/utils/SearchQuery';

const professor_to_alias = untyped_professor_to_alias as {
  [key: string]: string;
};

type SearchQueryWithTitle = SearchQuery & {
  title?: string;
  subtitle?: string;
  isRecent?: boolean;
};

/**
 * api response type for autocomplete endpoint
 */
interface AutocompleteResponse {
  state: string;
  data: SearchQueryWithTitle[];
}

interface CourseNameResponse {
  state: string;
  data: {
    title: string;
    result: SearchQuery;
  }[];
}

function removeDuplicates(input: SearchQueryWithTitle[]) {
  return input.filter(
    (option, index, self) =>
      index === self.findIndex((entry) => searchQueryEqual(entry, option)),
  );
}

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
  manageQuery?: 'onSelect';
  onSelect?: (value: SearchQuery[]) => void;
  className?: string;
  input_className?: string;
  autoFocus?: boolean;
  isPending?: boolean;
}

/**
 * This component returns a custom search bar component that makes use of the Material UI autocomplete component
 * Sends a new search value to the parent component when the user selects it from the options list
 *
 * Styled for the splash page
 */
export default function SearchBar(props: Props) {
  const [isPending, startTransition] = useTransition();

  //what you can choose from
  const [options, setOptions] = useState<SearchQueryWithTitle[]>(() =>
    getRecentSearches().map((entry) => ({ ...entry, isRecent: true })),
  );
  //initial loading prop for first load
  const [loading, setLoading] = useState(false);
  const [openErrorTooltip, setErrorTooltip] = useState(false);
  const [noResult, setNoResults] = useState<null | string>(null);
  const [inputValue, _setInputValue] = useState('');
  const quickInputValue = useRef('');
  const [value, setValue] = useState<SearchQuery | null>(null);

  function setInputValue(newValue: string) {
    quickInputValue.current = newValue;
    _setInputValue(newValue);
  }

  //set value from query
  const router = useRouter();
  // updateValue -> onSelect_internal -> updateQueries - clicking enter on an autocomplete suggestion in TopMenu Searchbar
  // updateValue -> onSelect_internal -> onSelect (custom function) - clicking enter on an autocomplete suggestion in home page SearchBar
  // params.inputProps.onKeyDown -> handleKeyDown -> onSelect_internal -> updateQueries/onSelect - clicking enter in the SearchBar
  // Button onClick -> onSelect_internal -> updateQueries/onSelect - Pressing the "Search" Button

  function updateQueries(term: SearchQuery) {
    if (term.prefix && term.number) {
      router.push(
        `/notes/${term.prefix.toLowerCase()}/${term.number.toLowerCase()}`,
      );
      return;
    }

    if (term.profFirst && term.profLast) {
      router.push(
        `/notes/${term.profFirst.toLowerCase()}/${term.profLast.toLowerCase()}`,
      );
    }
  }

  function resolveQueryFromInput(): SearchQuery | null {
    if (value && searchQueryLabel(value) === inputValue.trim()) {
      return value;
    }

    if (inputValue.trim() === '') {
      return null;
    }

    return decodeSearchQueryLabel(inputValue.trim());
  }

  //update parent and queries
  function onSelect(newValue: SearchQuery | null) {
    setErrorTooltip(!newValue);

    setValue(newValue);
    if (newValue) {
      setInputValue(searchQueryLabel(newValue));
    }

    if (typeof props.onSelect !== 'undefined' && newValue) {
      props.onSelect([newValue]);
    }

    if (
      newValue &&
      (props.manageQuery === 'onSelect' ||
        typeof props.manageQuery === 'undefined')
    ) {
      updateQueries(newValue);
      startTransition(() => {});
    }

    if (newValue) {
      updateRecentSearches([newValue]);
    }
  }

  //change all values
  function updateValue(newValue: SearchQuery | null) {
    onSelect(newValue); // clicking enter to select a autocomplete suggestion triggers a new search (it also 'Enters' for the searchbar)
  }

  function prePopulateRecents() {
    let recents: SearchQueryWithTitle[] = getRecentSearches();
    recents = recents.filter(
      (item) => !value || !searchQueryEqual(value, item),
    );
    recents.forEach((el) => {
      el.isRecent = true;
    });
    setOptions(recents);
  }

  function filterOptions(
    incomingOptions: SearchQueryWithTitle[],
    newInputValue: string,
  ): SearchQueryWithTitle[] {
    if (incomingOptions.length === 0) {
      return [];
    }

    const recents: SearchQueryWithTitle[] = getRecentSearches();
    const matchedRecents = recents.filter((item: SearchQueryWithTitle) => {
      if (value && searchQueryEqual(value, item)) {
        return false;
      }

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
      }
      return true;
    });

    const filtered: SearchQueryWithTitle[] = incomingOptions.filter(
      (item: SearchQueryWithTitle) =>
        (!value || !searchQueryEqual(value, item)) &&
        !matchedRecents.some((rec) => searchQueryEqual(rec, item)),
    );

    filtered.forEach((el) => {
      el.isRecent = recents.some((rec) => searchQueryEqual(el, rec));
    });

    return [...matchedRecents, ...filtered];
  }

  function loadNewCourseNameOptions(newInputValue: string) {
    fetch(
      '/api/courseNameAutoComplete?input=' + encodeURIComponent(newInputValue),
    )
      .then((response) => response.json() as Promise<CourseNameResponse>)
      .then((data) => {
        if (data.state !== 'done') {
          throw new Error(data.state);
        }

        const formatted = data.data.map((item) => ({
          ...item.result,
          title: item.title,
        }));

        const filtered: SearchQueryWithTitle[] = filterOptions(
          formatted,
          newInputValue,
        );

        if (quickInputValue.current === newInputValue) {
          setOptions(filtered);
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  }

  function addValue(newValue: SearchQuery) {
    onSelect(newValue);
  }

  //fetch new options, add tags if valid
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
      .then((response) => response.json() as Promise<AutocompleteResponse>)
      .then((data) => {
        if (data.state !== 'done') {
          console.error('Autocomplete API error:', data.state, data);
          throw new Error(data.state);
        }

        const filtered = filterOptions(data.data, newInputValue);

        if (
          filtered.length === 1 &&
          quickInputValue.current.charAt(newInputValue.length) === ' '
        ) {
          const firstFiltered = filtered[0];
          if (!firstFiltered) {
            return;
          }

          if (
            (typeof firstFiltered.profFirst === 'undefined' &&
              typeof firstFiltered.profLast === 'undefined') ||
            searchQueryEqual(
              {
                profFirst: firstFiltered.profFirst?.toLowerCase(),
                profLast: firstFiltered.profLast?.toLowerCase(),
              },
              decodeSearchQueryLabel(
                quickInputValue.current.toUpperCase().trim(),
              ),
            )
          ) {
            addValue(firstFiltered);
            const rest = quickInputValue.current
              .slice(newInputValue.length)
              .trimStart();
            setInputValue(rest);
            loadNewOptions(rest.trimEnd());
          }
        } else if (quickInputValue.current === newInputValue) {
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

  useEffect(() => {
    void fetch('/api/autocomplete?input=someSearchTerm');
  }, []);

  const [highlightedOption, setHighlightedOption] = useState<boolean>(false);

  return (
    <div
      className={`flex items-center w-full max-w-xs md:max-w-sm lg:max-w-md ${props.className ?? ''}`}
    >
      <Autocomplete
        freeSolo
        loading={loading}
        onFocus={() => {
          if (inputValue.trim() === '') {
            prePopulateRecents();
            return;
          }
        }}
        //highlight first option to add with enter
        autoHighlight={true}
        clearOnBlur={false}
        className="grow"
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
        //don't filter options, done in fetch
        filterOptions={(opts) => opts}
        value={value}
        onChange={(
          _event: React.SyntheticEvent,
          newValue: string | SearchQuery | null,
        ) => {
          //should never happen
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
          params.inputProps.onKeyDown = (event) => {
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
              if (value) {
                onSelect(value);
              }
              return;
            }

            const resolvedQuery = resolveQueryFromInput();
            if (resolvedQuery) {
              event.preventDefault();
              event.stopPropagation();
              onSelect(resolvedQuery);
            }
          };

          return (
            <TextField
              {...params}
              variant="outlined"
              placeholder={'Search for courses or professors'}
              autoFocus={props.autoFocus}
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
                          <SearchIcon
                            className={
                              isPending || props.isPending ? 'opacity-0' : ''
                            }
                          />
                          {(isPending || props.isPending) && (
                            <CircularProgress
                              size={18}
                              className="absolute text-cornflower-50 dark:text-haiti"
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
            />
          );
        }}
        onInput={(event) => {
          const rawValue = (event.target as HTMLInputElement).value;
          if (
            (rawValue[rawValue.length - 1] === ' ' ||
              rawValue[rawValue.length - 1] === ',') &&
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
                  decodeSearchQueryLabel(rawValue.toUpperCase().trim()),
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
          //add spaces between prefix and course number
          const matches = match(text, normalizedInput);
          const subTextMatches = match(subtext ?? '', normalizedInput);
          const parts = parse(text, matches);
          const subtextParts = subtext ? parse(subtext, subTextMatches) : [];
          const { key, ...otherProps } = optionProps;

          return (
            <li key={key} {...otherProps}>
              {typeof option !== 'string' && option.isRecent == true ? (
                <HistoryToggleOffIcon className="text-gray-400 self-start mr-2 mt-0.5" />
              ) : (
                <SearchIcon className="text-gray-400 self-start mr-2 mt-0.5" />
              )}
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
    </div>
  );
}
