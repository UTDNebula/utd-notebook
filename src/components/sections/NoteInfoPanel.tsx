'use client';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { Collapse, IconButton } from '@mui/material';
import Link from 'next/link'; // To link back to specific profiles
import { useRef, useState } from 'react';
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
    <div className="absolute top-0 left-0 right-0 z-15 px-20 pointer-events-none">
      <div className="pointer-events-auto bg-white dark:bg-neutral-800 rounded-b-2xl shadow-lg border-l-4 border-royal dark:border-cornflower-300">
        <Collapse in={expanded}>
          <div className="px-5 pt-4 pb-3">
            {/* Top row */}
            <div className="flex items-start justify-between gap-4">
              {/* Left: save button + [title + author + professor + description] */}
              <div className="flex items-start gap-3 min-w-0 flex-1">
                {/* Bigger save button */}
                <div className="shrink-0">
                  <SaveButton fileId={fileId} iconOnly />
                </div>

                {/* All text content aligned to the right of the save button */}
                <div className="min-w-0 flex-1">
                  <h1 className="font-bold text-lg leading-tight truncate text-royal dark:text-cornflower-300">
                    {displayTitle}
                  </h1>
                  {authorName && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      Author:{' '}
                      {authorUsername ? (
                        <Link
                          href={`/profile/${authorUsername}`}
                          className="underline hover:text-slate-900 dark:hover:text-slate-200"
                        >
                          {authorName}
                        </Link>
                      ) : (
                        authorName
                      )}
                    </p>
                  )}
                  {profFirst && profLast && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        Professor:
                      </span>{' '}
                      <Link
                        href={`/notes/${profFirst}/${profLast}`}
                        className="underline hover:text-slate-900 dark:hover:text-slate-200"
                      >
                        {profFirst} {profLast}
                      </Link>
                    </p>
                  )}
                  <div className="mt-2">
                    {description ? (
                      <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mt-2">
                        {description}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 italic mt-2">
                        No provided description.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: rating + last modified */}
              <div className="flex flex-col items-end shrink-0 gap-0.5">
                <RatingWidget fileId={fileId} />
                {updatedAt && (
                  <span className="text-xs text-slate-600 dark:text-slate-400">
                    Last modified {updatedAt}
                  </span>
                )}
              </div>
            </div>

            {/* Edit button pinned bottom-right */}
            {isAuthor && (
              <div className="flex justify-end mt-3">
                <NoteEditButton fileId={fileId} />
              </div>
            )}
          </div>
        </Collapse>

        {/* Collapsed bar — always visible when collapsed */}
        {!expanded && (
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3 min-w-0">
              <SaveButton fileId={fileId} iconOnly />
              <span className="font-semibold text-base truncate text-royal dark:text-cornflower-300">
                {displayTitle}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <RatingWidget fileId={fileId} />
              {isAuthor && <NoteEditButton fileId={fileId} />}
            </div>
          </div>
        )}

        {/* Centered chevron */}
        <div className="flex justify-center pb-1">
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
