import type { ReactNode } from 'react';
import { BaseCard } from '@nebula-library/components/BaseCard';
import type { SelectFileWithAuthorPreviewAndReports } from '@src/server/db/models';
import { ReportFilter } from './ModerationDashboard';
import ReportCard from './ReportCard';

type ReportsGridProps = {
  reportedFiles: SelectFileWithAuthorPreviewAndReports[];
  filter: ReportFilter; // whether to display, all, pending, dismissed, or action taken reports
  noFilesMessage?: ReactNode;
};

function filterReports(
  filter: ReportFilter,
  reportedFiles: SelectFileWithAuthorPreviewAndReports[],
): SelectFileWithAuthorPreviewAndReports[] {
  if (filter == 'ALL') return reportedFiles;

  return reportedFiles.filter((file) =>
    file.reports.some((report) => report.status === filter),
  );
}

export default function ReportsGrid({
  reportedFiles,
  filter,
  noFilesMessage,
}: ReportsGridProps) {
  const filteredFiles = filterReports(filter, reportedFiles);

  if (filteredFiles.length === 0) {
    if (noFilesMessage) {
      return noFilesMessage;
    }

    return (
      <BaseCard className="px-6 py-5 text-center">
        <h3 className="text-lg font-semibold">
          {filter === 'ALL'
            ? 'No reports yet'
            : filter === 'PENDING'
              ? 'No pending reports'
              : filter === 'DISMISSED'
                ? 'No dismissed reports'
                : 'No file hidden reports'}
        </h3>
      </BaseCard>
    );
  }

  return (
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredFiles.map((reportedFile) => (
          <ReportCard key={reportedFile.id} reportedFile={reportedFile} />
        ))}
      </div>
    </>
  );
}
