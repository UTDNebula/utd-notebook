'use client';

import {
  Autocomplete,
} from '@mui/material';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { useTRPC } from '@src/trpc/react';

export const FileSearchBar = () => {
  const [input, setInput] = useState("");
  const trpc = useTRPC();

  const { data } = useQuery(
    trpc.file.byName.queryOptions(
      { name: input},
      {
          enabled: !!input, // only call backend if there's non-empty string
          placeholderData: keepPreviousData,
      }
		)
  );

	return (
		<Autocomplete
		/>
  );
}
