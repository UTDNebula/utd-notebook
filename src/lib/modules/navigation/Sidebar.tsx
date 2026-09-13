'use server';

import { api } from '@src/lib/trpc/server';
import type { ContentComponentColor } from './BaseHeader';
import NewSidebar from './Slide';

// Keep in mind that in all routes we need pl-72 for the sidebar
const Sidebar = async ({
  homepage = false,
  hamburgerColor = 'darkLight',
}: {
  homepage?: boolean;
  hamburgerColor?: ContentComponentColor;
}) => {
  const userSidebarCapabilities =
    await api.userMetadata.getUserSidebarCapabilities();
  return (
    <NewSidebar
      userCapabilities={userSidebarCapabilities}
      homepage={homepage}
      hamburgerColor={hamburgerColor}
    />
  );
};

export default Sidebar;
