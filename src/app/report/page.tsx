import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import EmptyStateCard from '@src/lib/components/EmptyStateCard';
import { api } from '@src/lib/trpc/server';
import { signInRoute } from '@src/lib/utils/redirect';
import { auth } from '@src/server/auth';
import FileCard from '@src/systems/notes/components/FileCard';
import Header from '@src/systems/search/components/Header';
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
