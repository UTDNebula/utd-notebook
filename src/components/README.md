# Components

This directory contains reusable React components for the UTD Notebook application.

## Navbar

The `Navbar` component is a responsive navigation bar built with Material-UI (MUI) that provides navigation between the main pages of the application.

### Features

- **Responsive Design**: Automatically adapts to mobile and desktop viewports
- **Mobile Drawer**: Hamburger menu for mobile devices with a slide-out drawer
- **Active State**: Highlights the current active page
- **Material-UI Integration**: Uses MUI components and theming system
- **Next.js Integration**: Built with Next.js App Router and Link components

### Navigation Items

- **Home** (`/`) - Landing page
- **Dashboard** (`/dashboard`) - User dashboard (placeholder)
- **About** (`/about`) - About page with project information

### Usage

The Navbar is automatically included in the root layout (`src/app/layout.tsx`) and appears on all pages.

### Props

No props are required - the component is self-contained and uses Next.js navigation hooks.

### Styling

The component uses MUI's `sx` prop for styling and integrates with the application's theme system. It automatically adapts to light/dark mode based on the theme configuration.

### Mobile Behavior

On mobile devices (screen width < 768px):
- Navigation links are hidden
- A hamburger menu icon is displayed
- Clicking the menu opens a slide-out drawer
- The drawer contains all navigation options

### Desktop Behavior

On desktop devices (screen width ≥ 768px):
- Navigation links are displayed horizontally in the toolbar
- No drawer is shown
- Active page is highlighted with the primary color
