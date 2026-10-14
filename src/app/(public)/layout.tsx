import { redirect } from 'next/navigation';
import { getViewer } from '@src/server/viewer';

//anonymous visitors see metadata only. signed-in users must finish onboarding first.
export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if ((await getViewer()) === 'incomplete') redirect('/get-started');

  return <>{children}</>;
}
