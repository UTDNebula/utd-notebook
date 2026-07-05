'use client';

import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Collapse, IconButton, Typography } from '@mui/material';
import Link from 'next/link'; // To link back to specific profiles
import { useState } from 'react';
import Panel from '@src/nebula-library/components/Panel';
import NoteDeleteButton from '@src/components/sections/NoteDeleteButton';
import NoteEditButton from '@src/components/sections/NoteEditButton';
import RatingWidget from '@src/components/sections/RatingWidget';
import ReportButton from '@src/components/sections/ReportButton';
import SaveButton from '@src/components/sections/SaveButton';
import type { SelectFileWithUserMetadataAndSection } from '@src/server/db/models';
import { authClient } from '@src/utils/auth-client';

type NoteInfoPanelProps = {
  file: SelectFileWithUserMetadataAndSection;
};

export default function NoteInfoPanel({ file }: NoteInfoPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const { data: session } = authClient.useSession();
  const isAuthor = session?.user?.id === file.authorId;

  return (
    <Panel
      className="w-full py-2 border-l-4 border-royal dark:border-cornflower-300 rounded-t-none gap-0"
      smallPadding
    >
      <div className="flex flex-col">
        {/* Top piece, always visible, has the name and buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center w-full md:w-auto flex-grow gap-2">
            <IconButton
              onClick={() => setExpanded((v) => !v)}
              aria-label={
                expanded ? 'Collapse info panel' : 'Expand info panel'
              }
              size="large"
            >
              <KeyboardArrowUpIcon
                fontSize="inherit"
                className={`transition ${expanded ? 'rotate-180' : 'rotate-90'}`}
              />
            </IconButton>
            <Typography variant="h2" className="text-xl font-bold">
              {file.name}
            </Typography>
          </div>
          <div className="w-full md:w-auto flex-shrink-0 flex md:ml-auto justify-end flex-wrap items-center gap-3">
            <RatingWidget fileId={file.id} />
            {isAuthor && <NoteEditButton fileId={file.id} />}
            {isAuthor && <NoteDeleteButton fileId={file.id} />}
            {!isAuthor && <ReportButton fileId={file.id} />}
            <SaveButton fileId={file.id} />
            <IconButton
              LinkComponent={Link}
              href={file.publicUrl}
              target="_blank"
              size="small"
            >
              <OpenInNewIcon fontSize="small" />
            </IconButton>
          </div>
        </div>

        {/* Bottom piece, collapsible, has author, professor, description, and last modified date */}
        <Collapse in={expanded}>
          <div className="pb-2 px-3 flex flex-col gap-1">
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              By{' '}
              {
                file.author.username ? (
                  <Link
                    href={`/profile/${file.author.username}`}
                    className="underline hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    {file.author.username}
                  </Link>
                ) : (
                  `${file.author.firstName} ${file.author.lastName}`
                ) // Render as plain text if no username to link to
              }
            </p>
            {file.section && (
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                <Link
                  href={`/notes/${file.section.prefix}/${file.section.number}`}
                  className="underline hover:text-slate-900 dark:hover:text-slate-200"
                >
                  {file.section.prefix} {file.section.number}
                </Link>
                .{file.section.sectionCode}{' '}
                <Link
                  href={`/notes/${file.section.profFirst}/${file.section.profLast}`}
                  className="underline hover:text-slate-900 dark:hover:text-slate-200"
                >
                  {file.section.profFirst} {file.section.profLast}
                </Link>{' '}
                {file.section.term} {file.section.year}
              </p>
            )}
            {file.description ? (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                {file.description}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic mt-1">
                No provided description.
              </p>
            )}
            <span className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Last modified{' '}
              {file.updatedAt.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
          </div>
        </Collapse>
      </div>
    </Panel>
  );
}
