'use server';

import Alert from '@mui/material/Alert';
import { auth } from '@src/server/auth';
import { SelectUserMetadata } from '@src/server/db/models';
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

  // Concurrently run both procedures
  await Promise.allSettled([api.userMetadata.byId({ id: user.id })]).then(
    ([userDataResult]) => {
      if (userDataResult.status === 'fulfilled' && userDataResult.value) {
        userData = userDataResult.value;
      } else if (userDataResult.status === 'rejected') {
        throw new Error(
          `Failed to fetch user data. Has the \`user_metadata\` table been migrated?\n\n${userDataResult.reason}`,
        );
      }
    },
  );

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
      <DeleteAccount />
    </div>
  );
}

export default SettingsForm;
