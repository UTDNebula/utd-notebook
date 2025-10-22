'use client';

import React from 'react';
import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import ProfileDropdown from './ProfileDropdown';

export default function Navbar() {
  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          UTD Notebook
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ProfileDropdown />
        </Box>
      </Toolbar>
    </AppBar>
  );
}
