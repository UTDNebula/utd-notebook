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

function sanitizeDisplayName(...candidates: Array<string | null | undefined>) {
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;

    const normalized = value.toLowerCase().replace(/\s+/g, ' ');
    if (
      normalized === 'undefined undefined' ||
      normalized === 'null null' ||
      normalized === 'undefined' ||
      normalized === 'null'
    ) {
      continue;
    }

    return value;
  }

  return 'Profile';
}

function sanitizeUsername(...candidates: Array<string | null | undefined>) {
  for (const candidate of candidates) {
    const value = candidate?.trim();
    if (!value) continue;

    const normalized = value.toLowerCase();
    if (
      normalized === 'undefined undefined' ||
      normalized === 'null null' ||
      normalized === 'undefined' ||
      normalized === 'null'
    ) {
      continue;
    }

    // Keep username-ish strings only.
    if (/^[a-zA-Z0-9_-]+$/.test(value)) {
      return value;
    }
  }

  return 'profile';
}

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
  const displayName = sanitizeDisplayName(
    profile.name,
    `${profile.firstName ?? ''} ${profile.lastName ?? ''}`,
    profile.username,
    session?.user.name,
  );
  const safeUsername = sanitizeUsername(profile.username, username);

  return (
    <>
      <Header />
      <main className="flex min-h-[calc(100vh-4rem)] w-full justify-center bg-light p-4 dark:bg-dark">
        <div className="flex w-full max-w-6xl flex-col gap-4">
          <ProfileNotes
            username={safeUsername}
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
