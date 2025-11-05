import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { IconButton, Tooltip } from '@mui/material';

export default function NavBar() {
  return (
    <>
      <div className="bg-darken relative flex flex-wrap items-center gap-x-2 gap-y-0 overflow-hidden border-b-1 px-4 py-1 sm:flex-nowrap md:gap-x-4 md:px-8 md:py-1 lg:gap-x-8 lg:px-16">
        <Image
          src={'/background.png'}
          alt="background"
          className="-z-10 object-cover"
          fill
        />

        <Link
          href="/"
          className="font-display flex items-center gap-2 text-lg font-medium md:text-xl md:font-bold"
        >
          UTD Notebook
        </Link>

        <div className="ml-auto flex items-center gap-x-2 md:gap-x-4">
          <Tooltip title="Profile">
            <IconButton size="medium" href="/profile">
              <div className="relative size-10 flex-shrink-0 md:size-12">
                <Image
                  src="/icon-white.svg"
                  alt="profile picture"
                  fill
                  className="rounded-full border-2 border-white object-cover"
                />
              </div>
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </>
  );
}
