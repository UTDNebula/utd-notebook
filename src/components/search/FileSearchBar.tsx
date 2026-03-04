'use client';

import {
  Autocomplete,
} from '@mui/material';

import useDebounce from '@utils/useDebounce';
import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTRPC } from '@src/trpc/react';

export const FileSearchBar = () => {
  const [input, setInput] = useState("");
  const trpc = useTRPC();

  const debouncedInput = useDebounce(input, 300);

  const { data } = useQuery(
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
		/>
  );
}
