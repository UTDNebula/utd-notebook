'use client';

import Link from 'next/link';
import { BaseCard } from '@nebula-library/components/BaseCard';
import type { SelectFileWithAuthorPreviewAndReports } from '@src/server/db/models';
import { CategoriesScroll } from './CategoriesScroll';
import { PdfThumbnail } from './PdfThumbnail';

// define allowed "arguments" / properties
type ReportCardProps = {
  // can do file w/ reports
  reportedFile: SelectFileWithAuthorPreviewAndReports;
};

const statusStyles = {
  pending: 'bg-amber-100 text-amber-500',
  dismissed: 'bg-green-100 text-green-500',
  hidden: 'bg-gray-100 text-gray-600',
};

const statusLabels = {
  pending: 'Pending',
  dismissed: 'Dismissed',
  hidden: 'Hidden',
};

export default function ReportCard({ reportedFile }: ReportCardProps) {
  // TEMP: until status column is given, will just hardcode status
  //const status = reportedFile.status;
  const status = 'dismissed';

  // populate array of categories for Categories component
  const categories: string[] = [];
  reportedFile.reports.map((report) => {
    categories.push(report.category);
  });

  return (
    <BaseCard variant="interactive" className="flew grow flex-col">
      {/* PLACEHOLDER: once status column is added, its data will go here */}
      <div
        className={`m-3 w-fit rounded-full px-4 py-1.5 ${statusStyles[status]} text-xs`}
      >
        {statusLabels[status]}
      </div>

      {/* PDF THUMBNAIL */}
      <Link href={`/notes/${reportedFile.id}`}>
        <PdfThumbnail
          files={[{ file: reportedFile.publicUrl, name: reportedFile.name }]}
          className="aspect-2/1"
        />
      </Link>
      {/* NOTES HEADER: title, uploader, and reporter */}
      <div className="m-3">
        <div className="mb-4 flex flex-col gap-2">
          <Link href={`/notes/${reportedFile.id}`}>
            <h3
              className="line-clamp-1 text-xl font-semibold"
              title={reportedFile.name}
            >
              {reportedFile.name}
            </h3>
          </Link>
          <div className="text-sm">
            {reportedFile.author.username ? (
              <h5>
                Uploaded by{' '}
                <Link
                  href={`/profile/${reportedFile.author.username}`}
                  className="underline hover:text-slate-900 dark:hover:text-slate-200"
                >
                  {reportedFile.author.username}
                </Link>
              </h5>
            ) : (
              <h5 className="">Uploaded by unknown</h5>
            )}
            <h5>
              Reported by{' '}
              <Link
                href={`/profile/${reportedFile.reports[0]?.reporter.username}`}
                className="underline hover:text-slate-900 dark:hover:text-slate-200"
              >
                {reportedFile.reports[0]?.reporter.username}
              </Link>
              {reportedFile.reports.length > 1 ? (
                <> + {reportedFile.reports.length - 1} more </>
              ) : (
                <></>
              )}
            </h5>
          </div>
        </div>

        {/* REPORT DETAILS */}
        <div>
          <div className="flex-cols flex items-center">
            <h4 className="mr-2 text-lg whitespace-nowrap">Report Details: </h4>
            <CategoriesScroll categories={categories} />
          </div>

          <section className="aspect-5/2 overflow-y-scroll">
            {/*reportedFile.description && (
                <p className="line-clamp-2 text-sm text-slate-800 dark:text-slate-200">
                  {reportedFile.description}
                </p>
              )*/}

            {reportedFile.reports.map((report) => (
              <div key={report.id}>
                <h1 className="text-base">{report.reporter.username}</h1>
                <p className="text-sm">{report.details}</p>
              </div>
            ))}
          </section>
        </div>
      </div>
    </BaseCard>
  );
}
