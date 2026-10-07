'use server';

import { TRPCError } from '@trpc/server';
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
  // Signed-out and not-yet-onboarded visitors just get no personal entries
  const userSidebarCapabilities = await api.userMetadata
    .getUserSidebarCapabilities()
    .catch((error: unknown) => {
      if (
        error instanceof TRPCError &&
        (error.code === 'UNAUTHORIZED' || error.code === 'FORBIDDEN')
      ) {
        return [];
      }
      throw error;
    });
  return (
    <NewSidebar
      userCapabilities={userSidebarCapabilities}
      homepage={homepage}
      hamburgerColor={hamburgerColor}
    />
  );
};

export default Sidebar;
