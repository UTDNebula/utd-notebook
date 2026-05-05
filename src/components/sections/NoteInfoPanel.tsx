'use client';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Collapse, IconButton } from '@mui/material';
import Link from 'next/link'; // To link back to specific profiles
import { useState } from 'react';
import NoteEditButton from '@src/components/sections/NoteEditButton';
import RatingWidget from '@src/components/sections/RatingWidget';
import SaveButton from '@src/components/sections/SaveButton';
import { authClient } from '@src/utils/auth-client';

type NoteInfoPanelProps = {
  fileId: string;
  name: string;
  description?: string | null;
  authorId?: string | null;
  authorName?: string;
  authorUsername?: string; // For hyperlink, not just normal name
  course?: string;
  section?: string;
  profFirst?: string; // Had to split professor name bc breaking it up was breaking things
  profLast?: string;
  updatedAt?: string;
};

export default function NoteInfoPanel({
  fileId,
  name,
  description,
  authorId,
  authorName,
  authorUsername,
  course,
  section,
  profFirst,
  profLast,
  updatedAt,
}: NoteInfoPanelProps) {
  const [expanded, setExpanded] = useState(true);
  const { data: session } = authClient.useSession();
  const isAuthor = session?.user?.id === authorId;

  const displayTitle =
    course && section
      ? `${course}.${section} — ${name}`
      : course
        ? `${course} — ${name}`
        : name;

  return (
    <div className="w-full max-w-6xl">
      <div className="pointer-events-auto bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border-l-4 border-royal dark:border-cornflower-300">
        {/* Top piece, always visible, has the class, section, note name, and rating */}
        <div className="flex items-center justify-between px-5 pt-4 pb-2 gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <SaveButton fileId={fileId} iconOnly />
            <h1 className="font-bold text-lg leading-tight truncate text-royal dark:text-cornflower-300">
              {displayTitle}
            </h1>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <RatingWidget fileId={fileId} />
            {isAuthor && <NoteEditButton fileId={fileId} />}
          </div>
        </div>

        {/* Bottom piece, collapsible, has author, professor, description, and last modified date */}
        <Collapse in={expanded}>
          <div className="px-5 pb-4 flex flex-col gap-1">
            {authorName && (
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Author:{' '}
                {authorUsername ? (
                  <Link
                    href={`/profile/${authorUsername}`}
                    className="underline hover:text-slate-900 dark:hover:text-slate-200"
                  >
                    {authorName}
                  </Link>
                ) : (
                  authorName // Render as plain text if no username to link to
                )}
              </p>
            )}
            {profFirst && profLast && (
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                Professor:{' '}
                <Link
                  href={`/notes/${profFirst}/${profLast}`}
                  className="underline hover:text-slate-900 dark:hover:text-slate-200"
                >
                  {profFirst} {profLast}
                </Link>
              </p>
            )}
            {description ? (
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-1">
                {description}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic mt-1">
                No provided description.
              </p>
            )}
            {updatedAt && (
              <span className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Last modified {updatedAt}
              </span>
            )}
          </div>
        </Collapse>

        {/* Chevron (the arrow), below collapsible bottom section but always visible*/}
        <div className="flex justify-center">
          <IconButton
            size="small"
            onClick={() => setExpanded((v) => !v)}
            aria-label={expanded ? 'Collapse info panel' : 'Expand info panel'}
            className="text-royal dark:text-cornflower-300"
          >
            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </div>
      </div>
    </div>
  );
}
