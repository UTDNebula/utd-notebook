import { type Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import Header from '@src/components/header/Header';
import ProfileNotes from '@src/components/profile/ProfileNotes';
import { auth } from '@src/server/auth';
import { api } from '@src/trpc/server';

type ProfilePageProps = {
  params: Promise<{
    username: string;
  }>;
};

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { username } = await params;

  return {
    title: `@${username}`,
    description: `UTD Notebook profile for @${username}.`,
    alternates: {
      canonical: `https://notebook.utdnebula.com/profile/${username}`,
    },
    openGraph: {
      url: `https://notebook.utdnebula.com/profile/${username}`,
      description: `UTD Notebook profile for @${username}.`,
    },
  };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  const [profile, uploadedNotes] = await Promise.all([
    api.userMetadata.byUsername({ username }),
    api.file.byUsername({ username }),
  ]);

  if (!profile) {
    notFound();
  }

  const isProfileOwner = session?.user.id === profile.id;
  const savedNotes = isProfileOwner ? await api.savedNote.getSavedNotes() : [];
  const displayName = profile.firstName + ' ' + profile.lastName;

  return (
    <>
      <Header />
      <main className="flex w-full flex-col items-center p-4">
        <div className="flex w-full max-w-6xl flex-col gap-4">
          <ProfileNotes
            username={username}
            displayName={displayName}
            image={profile.image}
            isProfileOwner={isProfileOwner}
            uploadedNotes={uploadedNotes}
            savedNotes={savedNotes}
          />
        </div>
      </main>
    </>
  );
}
