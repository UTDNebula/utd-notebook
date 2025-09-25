'use client';

import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, CssBaseline} from '@mui/material';

const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' },
    mode: 'light',
  },
});

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    );
}