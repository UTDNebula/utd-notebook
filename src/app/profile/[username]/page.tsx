import { type Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@src/components/header/Header';
import ProfileNotes from '@src/components/profile/ProfileNotes';
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

  const [profile, uploadedNotes, savedNotes] = await Promise.all([
    api.userMetadata.byUsername({ username }),
    api.file.byUsername({ username }),
    api.savedNote.byUsername({ username }),
  ]);

  if (!profile) {
    notFound();
  }

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
            uploadedNotes={uploadedNotes}
            savedNotes={savedNotes}
          />
        </div>
      </main>
    </>
  );
}
