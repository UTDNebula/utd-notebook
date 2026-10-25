'use client';

import { useState } from 'react';
import type { SelectFileWithAuthorPreviewAndReports } from '@src/server/db/models';
import ModerationHeader from './ModerationHeader';
import ReportsGrid from './ReportsGrid';

export const reportFilters = [
  'ALL',
  'PENDING',
  'DISMISSED',
  'FILE_HIDDEN',
] as const;

export type ReportFilter = (typeof reportFilters)[number];

type ModerationDashboardProps = {
  reportedFiles: SelectFileWithAuthorPreviewAndReports[];
};

export default function ModerationDashboard({
  reportedFiles,
}: ModerationDashboardProps) {
  // keep track of the user's filter choice
  const [filter, setFilter] = useState<ReportFilter>('ALL');

  return (
    <>
      <ModerationHeader filter={filter} setFilter={setFilter} />
      <ReportsGrid reportedFiles={reportedFiles} filter={filter} />
    </>
  );
}
