import { type Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import Header from '@src/components/header/Header';
import SettingsForm from '@src/components/settings/SettingsForm';
import { signInRoute } from '@src/lib/utils/redirect';
import { auth } from '@src/server/auth';

export const metadata: Metadata = {
  title: 'Settings',
  description: 'Settings for your UTD Notebook account.',
  alternates: {
    canonical: 'https://notebook.utdnebula.com/settings',
  },
  openGraph: {
    url: 'https://notebook.utdnebula.com/settings',
    description: 'Settings for your UTD Notebook account.',
  },
};
const Settings = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    redirect(await signInRoute('settings'));
  }

  return (
    <>
      <Header />
      <main className="flex w-full flex-col items-center p-4">
        <SettingsForm session={session} />
      </main>
    </>
  );
};

export default Settings;
