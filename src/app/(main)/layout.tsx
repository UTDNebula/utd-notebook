// src/app/(main)/layout.tsx
import type { ReactNode } from 'react';
import NavBar from '@src/components/NavBar';

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <NavBar />
      {children}
    </>
  );
}
