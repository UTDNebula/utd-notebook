'use client';

import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { IconButton } from '@mui/material';
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
  course?: string;
  section?: string;
  professor?: string;
  updatedAt?: string;
};

export default function NoteInfoPanel({
  fileId,
  name,
  description,
  authorId,
  authorName,
  course,
  section,
  professor,
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
      <div
        className="pointer-events-auto bg-white rounded-b-2xl overflow-hidden"
        style={{
          boxShadow:
            '0 4px 24px 0 rgba(87,61,255,0.10), 0 1px 4px 0 rgba(0,0,0,0.06)',
          borderLeft: '4px solid #7C60BF',
        }}
      >
        {/* Animating body — always rendered, height transitions via grid trick */}
        <div
          style={{
            display: 'grid',
            gridTemplateRows: expanded ? '1fr' : '0fr',
            transition: 'grid-template-rows 0.3s ease',
          }}
        >
          <div style={{ overflow: 'hidden' }}>
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
                    <h1
                      className="font-bold text-lg leading-tight truncate"
                      style={{ color: '#7C60BF' }}
                    >
                      {displayTitle}
                    </h1>
                    {authorName && (
                      <p className="text-sm text-gray-500 mt-0.5">
                        Author: {authorName}
                      </p>
                    )}
                    {professor && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="font-medium text-gray-800">
                          Professor:
                        </span>{' '}
                        {professor}
                      </p>
                    )}
                    <div className="mt-2">
                      {description ? (
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {description}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
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
                    <span className="text-xs text-gray-400">
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
          </div>
        </div>

        {/* Collapsed bar — always visible when collapsed */}
        {!expanded && (
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-3 min-w-0">
              <SaveButton fileId={fileId} iconOnly />
              <span
                className="font-semibold text-base truncate"
                style={{ color: '#7C60BF' }}
              >
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
            style={{ color: '#7C60BF' }}
          >
            {expanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </div>
      </div>
    </div>
  );
}