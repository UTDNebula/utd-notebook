'use client';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { Albert_Sans } from 'next/font/google';
import { useState } from 'react';
import Panel from '@src/components/common/Panel';
import CreatedNotes from '@src/components/form/CreatedNotes';
import { HOME_PAGE_GRADIENT_CLASS } from '@src/constants/gradients';
import type { SelectFileWithAuthorPreview } from '@src/server/db/models';

const albertSans = Albert_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
});

type ProfileNotesProps = {
  username: string;
  displayName: string;
  image?: string | null;
  isProfileOwner: boolean;
  uploadedNotes: SelectFileWithAuthorPreview[];
  savedNotes: SelectFileWithAuthorPreview[];
};

type TabKey = 'saved' | 'uploaded';

export default function ProfileNotes({
  username,
  displayName,
  image,
  isProfileOwner,
  uploadedNotes,
  savedNotes,
}: ProfileNotesProps) {
  const [tab, setTab] = useState<TabKey>(isProfileOwner ? 'saved' : 'uploaded');

  const activeNotes = tab === 'saved' ? savedNotes : uploadedNotes;
  const activeHeading =
    tab === 'saved' ? (
      <span className="text-3xl font-bold">Saved Notes</span>
    ) : (
      <span className="text-3xl font-bold">Uploaded Notes</span>
    );
  const emptyMessage =
    tab === 'saved'
      ? 'No saved notes.'
      : 'This user has not uploaded any notes yet.';

  return (
    <div className={`${albertSans.className} flex w-full flex-col gap-4`}>
      <Panel
        className={`relative overflow-clip ${HOME_PAGE_GRADIENT_CLASS} p-0 shadow-xl`}
      >
        <div className="absolute inset-0 dark:bg-slightly-darken" />
        <div className="z-10 border-b border-white/20 px-6 py-5">
          <div className="flex items-center gap-4 max-sm:flex-col-reverse max-sm:items-start sm:flex-row">
            <Avatar
              src={image ?? undefined}
              alt={displayName || username}
              className="h-24 w-24 shrink-0 drop-shadow-[0_0_16px_rgb(0_0_0/0.2)]"
            >
              {(displayName || username || '?').charAt(0)}
            </Avatar>

            <div className="min-w-0 sm:ml-1">
              <h1 className="font-display truncate text-4xl font-semibold max-sm:text-center text-white">
                {displayName}
              </h1>
              <p className="truncate text-xl max-sm:text-lg max-sm:text-center text-white opacity-80">
                @{username}
              </p>
            </div>
          </div>
        </div>

        <Box className="border-b border-white/20 px-4">
          <Tabs
            value={tab}
            onChange={(_event, value: TabKey) => setTab(value)}
            variant="fullWidth"
            TabIndicatorProps={{
              sx: { backgroundColor: '#ffffff', height: 3 },
            }}
            sx={{
              minHeight: 0,
              '& .MuiTab-root': {
                minHeight: 0,
                textTransform: 'none',
                fontSize: '0.95rem',
                color: 'rgba(226,232,240,0.88)',
                py: 1.5,
              },
              '& .MuiTab-root.Mui-selected': {
                color: '#f8fafc !important',
                fontWeight: 500,
                textShadow: '0 0 10px rgba(0,0,0,0.2)',
              },
              '& .MuiTab-root.Mui-disabled': {
                color: 'rgba(226,232,240,0.55)',
              },
              '& .MuiTabs-flexContainer': {
                gap: '1rem',
              },
            }}
          >
            {isProfileOwner && <Tab label="Saved Notes" value="saved" />}
            <Tab label="Uploaded Notes" value="uploaded" />
          </Tabs>
        </Box>
      </Panel>

      <CreatedNotes
        heading={activeHeading}
        createdNotes={activeNotes}
        gridClassName="lg:grid-cols-4"
        noFilesMessage={
          <div className="w-full py-12 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-md font-medium text-slate-600 dark:text-slate-400">
            {emptyMessage}
          </div>
        }
      />
    </div>
  );
}