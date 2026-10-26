'use client';

import {
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { ReactNode } from 'react';
import { ReportFilter, reportFilters } from './ModerationDashboard';

export const filterTexts = {
  ALL: 'All',
  PENDING: 'Pending',
  DISMISSED: 'Dismissed',
  FILE_HIDDEN: 'Hidden',
};

// The moderation header modifies the filter state using a passed React hook
type ModerationHeaderProps = {
  filter: ReportFilter;
  setFilter: (filter: ReportFilter) => void;
};

export default function ModerationHeader(props: ModerationHeaderProps) {
  return (
    <div className="mb-2 flex items-center">
      <h1 className="m-1 mr-4 flex-initial p-2 text-3xl">Reports</h1>
      <FormControl
        sx={{ minWidth: '10em' }}
        className="flex-initial"
        size="small"
      >
        <InputLabel id="reports-filter-label">Filter</InputLabel>
        <Select
          labelId="reports-filter-label"
          id="reports-filter"
          value={props.filter}
          label="Filter"
          onChange={(event: SelectChangeEvent) =>
            props.setFilter(event.target.value as ReportFilter)
          }
        >
          {...reportFilters.map((filter: ReportFilter): ReactNode => {
            return (
              <MenuItem value={filter} key={filter}>
                {filterTexts[filter]}
              </MenuItem>
            );
          })}
        </Select>
      </FormControl>
    </div>
  );
}
