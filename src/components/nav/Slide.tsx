'use client';

import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';
import { Drawer, IconButton, Tooltip } from '@mui/material';
import { useState } from 'react';
import type { ContentComponentColor } from '@src/components/header/BaseHeader';
import { type personalCats } from '@src/constants/categories';
import NavMenu from './NavMenu';

const NewSidebar = ({
  userCapabilities,
  homepage = false,
  hamburgerColor = 'dark',
}: {
  userCapabilities: Array<(typeof personalCats)[number]>;
  homepage?: boolean;
  hamburgerColor?: ContentComponentColor;
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Tooltip title="Menu" enterDelay={0} arrow>
        <IconButton
          onClick={() => setOpen(true)}
          className={`z-50 ${homepage ? ' drop-shadow-[0_0_4px_rgb(0_0_0_/_0.4)]' : ''}`}
          size="large"
          // title='Menu'
        >
          <MenuIcon
            fontSize="inherit"
            className={`${
              hamburgerColor?.startsWith('light') ? 'fill-white' : 'fill-haiti'
            } ${
              hamburgerColor === 'lightDark'
                ? 'dark:fill-haiti'
                : hamburgerColor === 'darkLight'
                  ? 'dark:fill-white'
                  : ''
            }`}
          />
        </IconButton>
      </Tooltip>
      <Drawer
        open={open}
        onClose={() => setOpen(false)}
        slotProps={{
          paper: {
            className:
              'w-7/8 gap-4 bg-light dark:bg-dark py-6 shadow-lg dark:shadow-xl sm:max-w-sm',
            elevation: 0,
          },
        }}
      >
        <NavMenu userCapabilites={userCapabilities} />
        <IconButton
          onClick={() => setOpen(false)}
          className="absolute top-4 right-4"
        >
          <CloseIcon />
        </IconButton>
      </Drawer>
    </>
  );
};

export default NewSidebar;
