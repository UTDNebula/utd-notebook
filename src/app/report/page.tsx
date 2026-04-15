import EmptyStateCard from '@src/components/sections/EmptyStateCard';
import FileCard from '@src/components/sections/FileCard';
import { api } from '@src/trpc/server';
import ReportForm from './ReportForm';

type ReportPageProps = {
  searchParams: Promise<{ fileId?: string }>;
};

export default async function ReportPage({ searchParams }: ReportPageProps) {
  const { fileId } = await searchParams;

  if (!fileId) {
    return (
      <EmptyStateCard
        title="Missing file"
        description="No file was provided to report."
      />
    );
  }

  const file = await api.file.byId({ id: fileId });

  if (!file) {
    return (
      <EmptyStateCard
        title="File not found"
        description="We could not find the note you are trying to report."
      />
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="max-w-sm">
        <FileCard file={file} />
      </div>

      <ReportForm fileId={file.id} fileName={file.name} />
    </div>
  );
}
