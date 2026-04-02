import Header from '@src/components/header/Header';
import SavedNotes from '@src/components/profile/SavedNotes';
import ProfileHeader from './ProfileHeader';
import ProfileCreatedNotes from './ProfileCreatedNotes';

type ProfilePageProps = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;

  return (
    <>
      <Header />
      <main className="flex w-full flex-col items-center p-4">
        <div className="flex flex-col gap-8 w-full max-w-6xl">
          <ProfileHeader username={username} />

          <div className="w-full flex flex-col gap-y-6">
            <ProfileCreatedNotes username={username} />
            <SavedNotes />
          </div>
        </div>
      </main>
    </>
  );
}
