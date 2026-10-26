'use client';

import KeyboardDoubleArrowUpRoundedIcon from '@mui/icons-material/KeyboardDoubleArrowUpRounded';
import Button from '@mui/material/Button';
import Link from 'next/link';
import { useState } from 'react';
import { BaseCard } from '@nebula-library/components/BaseCard';
import type { SelectFileWithAuthorPreviewAndReports } from '@src/server/db/models';
import AdminActionsPopover from './AdminActionsPopover';
import { CategoriesScroll } from './CategoriesScroll';
import { PdfThumbnail } from './PdfThumbnail';

// define allowed "arguments" / properties
type ReportCardProps = {
  // can do file w/ reports
  reportedFile: SelectFileWithAuthorPreviewAndReports;
};

// define styles for the different file report statuses
const statusStyles = {
  pending: 'bg-[#f5e9cd] text-[#dd9700]',
  dismissed: 'bg-[#e7f8cd] text-[#a6ba87]',
  hidden: 'bg-gray-100 text-gray-600',
};

const statusLabels = {
  pending: 'Pending',
  dismissed: 'Dismissed',
  hidden: 'Hidden',
};

function getStatus(
  reportedFile: SelectFileWithAuthorPreviewAndReports,
): keyof typeof statusLabels {
  // if there are ANY pending reports, then the file's reports status is pending
  if (reportedFile.reports.some((report) => report.status === 'PENDING'))
    return 'pending';

  if (reportedFile.moderationStatus === 'HIDDEN') return 'hidden';

  return 'dismissed';
}

function formatCreatedAt(
  createdAt: SelectFileWithAuthorPreviewAndReports['reports'][number]['createdAt'],
) {
  // if date is invalid, return unknown
  if (createdAt === null) {
    console.log(
      'This report does not have a valid date. Something went wrong.',
    );
    return '';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(createdAt);
}

export default function ReportCard({ reportedFile }: ReportCardProps) {
  // TEMP: until status column is given, will just hardcode status
  //const status = reportedFile.status;
  const status = getStatus(reportedFile);

  // populate array of categories for Categories component
  const categories: string[] = [];
  reportedFile.reports.map((report) => {
    categories.push(report.category);
  });

  // store admin actions button state
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);

  return (
    <BaseCard variant="interactive" className="flew grow flex-col">
      {/* PLACEHOLDER: once status column is added, its data will go here */}
      <div
        className={`m-3 w-fit rounded-full px-4 py-1.5 ${statusStyles[status]} text-xs`}
      >
        {statusLabels[status]}
      </div>

      {/* PDF THUMBNAIL */}
      <Link href={`/notes/${reportedFile.id}`} target="blank">
        <PdfThumbnail
          files={[{ file: reportedFile.publicUrl, name: reportedFile.name }]}
          className="aspect-2/1"
        />
      </Link>
      {/* NOTES HEADER: title, uploader, and reporter */}
      <div className="m-3">
        <div className="mb-4 flex flex-col gap-2">
          <Link href={`/notes/${reportedFile.id}`} target="blank">
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
                  target="blank"
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
                target="blank"
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
          <div className="flex flex-row items-center">
            <h4 className="mr-2 text-lg whitespace-nowrap">Report Details: </h4>
            <CategoriesScroll categories={categories} />
          </div>

          <section className="aspect-5/2 overflow-y-scroll">
            {reportedFile.reports.map((report) => (
              <div key={report.id} className="m-1 flex flex-col rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Link
                      href={`/profile/${report.reporter.username}`}
                      className="underline hover:text-slate-900 dark:hover:text-slate-200"
                      target="blank"
                    >
                      <h1 className="mr-2 text-base">
                        {report.reporter.username}
                      </h1>
                    </Link>
                    <time
                      dateTime={`${formatCreatedAt(report.createdAt)}`}
                      className="text-sm text-slate-600 dark:text-slate-400"
                    >
                      {formatCreatedAt(report.createdAt)}
                    </time>
                  </div>
                  <div
                    key={report.category}
                    className="my-1 ml-2 w-fit rounded-full bg-[#f6f5ff] px-4 py-1 text-xs text-[#adabd2]"
                  >
                    {report.category}
                  </div>
                </div>
                <p className="text-sm">{report.details}</p>
              </div>
            ))}
          </section>
        </div>

        {/* ADMIN ACTIONS */}
        <div className="flex justify-end">
          <Button
            className="m-1 h-9 w-9 min-w-0 border border-[#e4e3f9] bg-[#f6f5ff]"
            style={{ borderRadius: '50%' }}
            onMouseDown={(event) => {
              setAnchorElement(event.currentTarget);
            }}
          >
            <KeyboardDoubleArrowUpRoundedIcon
              className={`text-[#7c78a4] transition-transform duration-250 ease-in-out ${anchorElement ? 'rotate-180' : 'rotate-0'}`}
            />
          </Button>
          <AdminActionsPopover
            reportedFile={reportedFile}
            anchorElement={anchorElement}
            setAnchorElement={setAnchorElement}
            buttonStyles="bg-[#f6f5ff] text-[#7c78a4] border border-[#e4e3f9] h-8"
          />
        </div>
      </div>
    </BaseCard>
  );
}
