'use server';

import Alert from '@mui/material/Alert';
import CreatedNotes from '@src/components/form/CreatedNotes';
import { auth } from '@src/server/auth';
import { SelectUserMetadata } from '@src/server/db/models';
import type { SelectFile } from '@src/server/db/models';
import { api } from '@src/trpc/server';
import DeleteAccount from './forms/DeleteAccount';
import UserInfo from './forms/UserInfo';
import Username from './forms/Username';
import SettingsHeader from './SettingsHeader';

async function SettingsForm({
  session,
}: {
  session: typeof auth.$Infer.Session;
}) {
  const user = session.user;

  let userData: SelectUserMetadata | undefined = undefined;
  let createdNotes: SelectFile[] = [];
  // Concurrently run procedures
  await Promise.allSettled([
    api.userMetadata.byId({ id: user.id }),
    api.file.byAuthor({ authorId: user.id }),
  ]).then(([userDataResult, notesResult]) => {
    if (userDataResult.status === 'fulfilled' && userDataResult.value) {
      userData = userDataResult.value;
    } else if (userDataResult.status === 'rejected') {
      throw new Error(
        `Failed to fetch user data. Has the \`user_metadata\` table been migrated?\n\n${userDataResult.reason}`,
      );
    }

    if (notesResult.status === 'fulfilled' && notesResult.value) {
      createdNotes = notesResult.value;
    }
  });

  return (
    <div className="flex flex-col gap-8 w-full max-w-6xl">
      {!userData && (
        <Alert severity="error" variant="filled" className="rounded-lg">
          One or more panels were hidden because their associated data could not
          be found.
        </Alert>
      )}

      <SettingsHeader user={user} />
      {userData && <Username user={userData} />}
      {userData && <UserInfo user={userData} />}

      <CreatedNotes createdNotes={createdNotes} />

      <DeleteAccount />
    </div>
  );
}

export default SettingsForm;
