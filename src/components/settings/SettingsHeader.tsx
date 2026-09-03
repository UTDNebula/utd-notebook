import Avatar from '@mui/material/Avatar';
import Panel from '@nebula-library/components/Panel';
import { HOME_PAGE_GRADIENT_CLASS } from '@src/constants/gradients';
import { SelectUser } from '@src/server/db/models';

type SettingsHeaderProps = {
  user?: Omit<SelectUser, 'image'> & Partial<Pick<SelectUser, 'image'>>;
};

export default function SettingsHeader({ user }: SettingsHeaderProps) {
  return (
    <Panel className={`relative ${HOME_PAGE_GRADIENT_CLASS}`}>
      <div className="dark:bg-slightly-darken absolute inset-0" />
      <div className="z-10">
        <div className="flex gap-4 pl-2 max-sm:flex-col-reverse sm:flex-row">
          <div className="flex flex-col gap-2 text-shadow-[0_0_8px_rgb(0_0_0_/_0.4)]">
            <h1 className="font-display text-4xl font-semibold text-white max-sm:text-center">
              Settings
            </h1>
            <span className="text-xl max-sm:text-lg max-sm:text-center text-white opacity-80">
              Manage your username and account preferences
            </span>
          </div>
          {user?.image && (
            <div className="drop-shadow-[0_0_16px_rgb(0_0_0_/_0.2)] max-sm:mx-auto sm:ml-auto">
              <Avatar src={user.image} className="h-18 w-18 rounded-full">
                {user.name.charAt(0)}
              </Avatar>
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
}
