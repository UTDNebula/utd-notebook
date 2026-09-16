import type { ReactNode } from 'react';
import { BaseCard } from '@nebula-library/components/BaseCard';
import type {
  SelectFileWithAuthorPreviewAndReports,
} from '@src/server/db/models';
import ReportCard from './ReportCard';

type ReportsGridProps= {
    reportedFiles:
      | SelectFileWithAuthorPreviewAndReports[];
    noFilesMessage?: ReactNode;
};

export default function ReportsGrid({ reportedFiles, noFilesMessage }: ReportsGridProps) {
  if (reportedFiles.length === 0) {
    if (noFilesMessage) {
      return noFilesMessage;
    }

    return (
      <BaseCard className="px-6 py-5 text-center">
        <h3 className="text-lg font-semibold">No reports yet</h3>
      </BaseCard>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {reportedFiles.map((reportedFile) => (
        <ReportCard key={reportedFile.id} reportedFile={reportedFile} />
      ))}
    </div>
  );
}
