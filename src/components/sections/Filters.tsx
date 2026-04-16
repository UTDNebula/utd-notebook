'use client';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

export default function HandwrittenFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const value = searchParams.get('handwritten') ?? '';

  const handleChange = (newValue: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (newValue === '') {
      params.delete('handwritten');
    } else {
      params.set('handwritten', newValue);
    }
    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <FormControl size="small" className="w-48">
      <InputLabel>Note type</InputLabel>
      <Select
        value={value}
        label="Note type"
        onChange={(e) => handleChange(e.target.value)}
        className="bg-white dark:bg-neutral-800"
      >
        <MenuItem value="">All Notes</MenuItem>
        <MenuItem value="true">Handwritten Only</MenuItem>
        <MenuItem value="false">Digital Only</MenuItem>
      </Select>
    </FormControl>
  );
}
