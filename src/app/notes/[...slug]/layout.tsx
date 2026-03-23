import type { ReactNode } from 'react';
import Header from '@src/components/header/Header';

type NotesLayoutProps = {
  children: ReactNode;
};

export default function NotesLayout({ children }: NotesLayoutProps) {
  return (
    <main className="relative min-h-screen">
      <Header />

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 pb-16 pt-24 lg:pt-28">
        {children}
      </section>
    </main>
  );
}
