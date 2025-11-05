import '../styles/globals.css';

import { ThemeProvider as MUIThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { Bai_Jamjuree, Inter } from 'next/font/google';
import { type Metadata } from 'next';
import { GoogleAnalytics } from '@next/third-parties/google';
import ThemeProvider from './providers/ThemeProvider';
import Navbar from '@src/components/Navbar';

import theme from '@src/utils/theme';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const baiJamjuree = Bai_Jamjuree({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://notebook.utdnebula.com'),
  title: {
    template: '%s - UTD NOTEBOOK',
    default: 'UTD NOTEBOOK',
  },
  description: '',
  openGraph: {
    title: 'UTD Notebook',
    description: '',
    type: 'website',
  },
  twitter: {
    card: 'summary',
  },
};
export const viewport = {
  //copied from globals.css
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#573dff' },
    { media: '(prefers-color-scheme: dark)', color: '#a297fd' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`bg-white dark:bg-black ${inter.variable} font-main ${baiJamjuree.variable} text-haiti dark:text-white`}>
        <ThemeProvider>
          <AppRouterCacheProvider>
            <MUIThemeProvider theme={theme}>
              <Navbar />
              {children}
            </MUIThemeProvider>
          </AppRouterCacheProvider>
        </ThemeProvider>
        {process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' && (
          <GoogleAnalytics gaId="G-3NDS0P32CZ" />
        )}
      </body>
    </html>
  );
}
