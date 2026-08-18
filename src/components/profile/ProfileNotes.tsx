'use client';

import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import { useState } from 'react';
import Panel from '@src/components/common/Panel';
import NotesPanel from '@src/components/form/NotesPanel';
import { HOME_PAGE_GRADIENT_CLASS } from '@src/constants/gradients';
import type { SelectFileWithAuthorPreview } from '@src/server/db/models';

type ProfileNotesProps = {
  username: string;
  displayName: string;
  image?: string | null;
  uploadedNotes: SelectFileWithAuthorPreview[];
  savedNotes: SelectFileWithAuthorPreview[];
};

type TabKey = 'saved' | 'uploaded';

export default function ProfileNotes({
  username,
  displayName,
  image,
  uploadedNotes,
  savedNotes,
}: ProfileNotesProps) {
  const [tab, setTab] = useState<TabKey>('saved');

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
    <div className="flex w-full flex-col gap-4">
      <Panel
        className={`relative overflow-clip ${HOME_PAGE_GRADIENT_CLASS} p-0 shadow-xl`}
      >
        <div className="dark:bg-slightly-darken absolute inset-0" />
        <div className="z-10 border-b border-white/20 px-6 py-5">
          <div className="flex items-center gap-4 max-sm:flex-col-reverse max-sm:items-start sm:flex-row">
            <Avatar
              src={image ?? undefined}
              alt={displayName || username}
              className="h-24 w-24 shrink-0 drop-shadow-[0_0_16px_rgb(0_0_0/0.2)]"
            >
              {(displayName || username || '?').charAt(0)}
            </Avatar>

            <div className="flex flex-col gap-2 text-shadow-[0_0_8px_rgb(0_0_0_/_0.4)]">
              <h1 className="font-display text-4xl font-semibold text-white max-sm:text-center">
                {displayName}
              </h1>
              <span className="text-xl text-white opacity-80 max-sm:text-center max-sm:text-lg">
                @{username}
              </span>
            </div>
          </div>
        </div>

        <Box className="border-b border-white/20 px-4">
          <Tabs
            value={tab}
            onChange={(_event, value: TabKey) => setTab(value)}
            variant="fullWidth"
            defaultValue={tab}
            indicatorColor="primary"
            textColor="inherit"
            className="[&_.MuiTab-root]:min-h-0 [&_.MuiTab-root]:text-sm [&_.MuiTab-root]:text-slate-200 [&_.MuiTab-root]:normal-case [&_.MuiTab-root.Mui-selected]:font-medium [&_.MuiTab-root.Mui-selected]:text-white [&_.MuiTab-root.Mui-selected]:drop-shadow-[0_0_10px_rgba(0,0,0,0.2)] [&_.MuiTab-root:hover]:opacity-100 [&_.MuiTabs-flexContainer]:gap-4"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: '#ffffff',
                height: 3,
              },
            }}
          >
            <Tab label="Saved Notes" value="saved" />
            <Tab label="Uploaded Notes" value="uploaded" />
          </Tabs>
        </Box>
      </Panel>

      <NotesPanel
        heading={activeHeading}
        notes={activeNotes}
        noFilesMessage={
          <div className="text-md flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-12 font-medium text-slate-600 dark:border-slate-800 dark:text-slate-400">
            {emptyMessage}
          </div>
        }
      />
    </div>
  );
}
