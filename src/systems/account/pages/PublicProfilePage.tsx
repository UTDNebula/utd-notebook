import { notFound } from 'next/navigation';
import Panel from '@nebula-library/components/Panel';
import { HOME_PAGE_GRADIENT_CLASS } from '@src/lib/styles/gradients';
import { getPublicProfile } from '@src/server/publicNotes';
import PublicFilesGrid from '@src/systems/notes/components/PublicFilesGrid';
import Header from '@src/systems/search/components/Header';

//what an anonymous visitor sees: a name and the notes uploaded, nothing else
export default async function PublicProfilePage({
  username,
}: {
  username: string;
}) {
  const profile = await getPublicProfile(username);
  if (!profile) notFound();

  return (
    <>
      <Header />
      <main className="flex w-full flex-col items-center p-4">
        <div className="flex w-full max-w-6xl flex-col gap-4">
          <Panel
            className={`relative overflow-clip ${HOME_PAGE_GRADIENT_CLASS} p-0 shadow-xl`}
          >
            <div className="dark:bg-slightly-darken absolute inset-0" />
            <div className="z-10 flex flex-col gap-2 px-6 py-5 text-shadow-[0_0_8px_rgb(0_0_0_/_0.4)]">
              <h1 className="font-display text-4xl font-semibold text-white">
                {profile.displayName}
              </h1>
              <span className="text-xl text-white opacity-80">
                @{profile.username}
              </span>
            </div>
          </Panel>

          <Panel
            heading={<span className="text-3xl font-bold">Uploaded Notes</span>}
          >
            <PublicFilesGrid
              files={profile.uploadedNotes}
              noFilesMessage={
                <div className="text-md flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-12 font-medium text-slate-600 dark:border-slate-800 dark:text-slate-400">
                  This user has not uploaded any notes yet.
                </div>
              }
            />
          </Panel>
        </div>
      </main>
    </>
  );
}
