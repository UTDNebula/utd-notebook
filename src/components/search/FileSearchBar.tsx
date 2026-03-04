'use client';

import SearchIcon from '@mui/icons-material/Search';
import {
  Autocomplete,
  TextField,
  InputAdornment,
	CircularProgress,
} from '@mui/material';

import useDebounce from '@utils/useDebounce';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTRPC } from '@src/trpc/react';

export const FileSearchBar = () => {
  const [input, setInput] = useState("");
  const router = useRouter();
  const trpc = useTRPC();

  const debouncedInput = useDebounce(input, 300);

  const { data, isFetching } = useQuery(
    trpc.file.byName.queryOptions(
      { name: debouncedInput},
      {
          enabled: !!debouncedInput, // only call backend if there's non-empty string
          placeholderData: keepPreviousData,
      }
		)
  );

	return (
		<Autocomplete
			freeSolo
			autoHighlight
			disableClearable
			inputValue={input}
			options={input === '' ? [] : (data ?? [])}
			filterOptions={(o) => o}
			onChange={(event, value, reason) => {
				if (reason == 'selectOption') {
					
				} else if (reason == 'createOption') { // no match

				}
			}}
			onInputChange={(e, value) => {
				setInput(value);
			}}
			renderInput={(params) => (
				<TextField
					{...params}
					slotProps={{
						input: {
							...params.InputProps,
							endAdornment: (
								<InputAdornment position="end">
									{params.InputProps.endAdornment}
									{isFetching ? <CircularProgress color="inherit" size={24} /> : <SearchIcon />}
								</InputAdornment>
							),
							type: 'search',
							className: params.InputProps.className,
						},
					}}
					placeholder="Search for files"
				/>  
			)}
			getOptionLabel={(option) => {
				return typeof option === 'string' ? option : option.name;
			}}
			getOptionKey={(option) => {
				return typeof option === 'string' ? option : option.id;
			}}
		/>
  );
}
