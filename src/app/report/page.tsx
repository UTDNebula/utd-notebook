import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Header from '@src/components/header/Header';
import EmptyStateCard from '@src/components/sections/EmptyStateCard';
import FileCard from '@src/components/sections/FileCard';
import { auth } from '@src/server/auth';
import { api } from '@src/trpc/server';
import { signInRoute } from '@src/utils/redirect';
import ReportForm from './ReportForm';

export const metadata: Metadata = {
  title: 'Report Note',
};

type ReportPageProps = {
  searchParams: Promise<{ fileId?: string }>;
};

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const [{ fileId }, session] = await Promise.all([
    searchParams,
    auth.api.getSession({ headers: await headers() }),
  ]);

  if (!session) redirect(await signInRoute('report'));

  if (!fileId) {
    return (
      <>
        <Header />
        <main className="flex w-full flex-col items-center p-4">
          <EmptyStateCard
            title="Missing file"
            description="No file was provided to report."
          />
        </main>
      </>
    );
  }

  const file = await api.file.byId({ id: fileId });

  if (!file) {
    return (
      <>
        <Header />
        <main className="flex w-full flex-col items-center p-4">
          <EmptyStateCard
            title="File not found"
            description="We could not find the note you are trying to report."
          />
        </main>
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="flex w-full flex-col items-center p-4">
        <div className="flex w-full max-w-6xl flex-col gap-6 lg:flex-row lg:items-start">
          <div className="w-full lg:w-5/12 lg:shrink-0">
            <FileCard file={file} />
          </div>

          <div className="w-full lg:w-7/12">
            <ReportForm fileId={file.id} fileName={file.name} />
          </div>
        </div>
      </main>
    </>
  );
}
