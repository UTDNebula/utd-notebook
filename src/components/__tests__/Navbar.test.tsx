import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import theme from '@src/utils/theme';
import Navbar from '../Navbar';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
}));

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
};

describe('Navbar', () => {
  it('renders the navbar with correct title', () => {
    renderWithTheme(<Navbar />);
    expect(screen.getByText('UTD NOTEBOOK')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithTheme(<Navbar />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
  });

  it('has correct navigation structure', () => {
    renderWithTheme(<Navbar />);
    const homeLink = screen.getByText('Home').closest('a');
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    const aboutLink = screen.getByText('About').closest('a');
    
    expect(homeLink).toHaveAttribute('href', '/');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
    expect(aboutLink).toHaveAttribute('href', '/about');
  });
});
