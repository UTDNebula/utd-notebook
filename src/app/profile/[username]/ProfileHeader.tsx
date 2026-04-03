'use client';

import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import { useQuery } from '@tanstack/react-query';
import Panel from '@src/components/common/Panel';
import { useTRPC } from '@src/trpc/react';

type ProfileHeaderProps = {
  username: string;
};

export default function ProfileHeader({ username }: ProfileHeaderProps) {
  const api = useTRPC();
  const { data, isLoading, error } = useQuery(
    api.userMetadata.getPublicProfile.queryOptions({ username }),
  );

  if (isLoading) {
    return (
      <Panel className="relative bg-linear-to-r from-[#5A49F7] from-[4.36%] via-[#9403D8] via-[49.74%] to-[#FD9365]">
        <div className="absolute inset-0 dark:bg-slightly-darken" />
        <div className="z-10">
          <div className="flex gap-4 max-sm:flex-col-reverse sm:flex-row pl-2">
            <div className="flex flex-col gap-2 text-shadow-[0_0_8px_rgb(0_0_0_/_0.4)]">
              <Skeleton variant="text" width={240} height={52} />
              <Skeleton variant="text" width={140} height={34} />
            </div>
            <div className="max-sm:mx-auto sm:ml-auto drop-shadow-[0_0_16px_rgb(0_0_0_/_0.2)]">
              <Skeleton variant="circular" width={72} height={72} />
            </div>
          </div>
        </div>
      </Panel>
    );
  }

  if (error || !data) {
    return (
      <Panel className="relative bg-linear-to-r from-[#5A49F7] from-[4.36%] via-[#9403D8] via-[49.74%] to-[#FD9365]">
        <div className="absolute inset-0 dark:bg-slightly-darken" />
        <div className="z-10">
          <div className="flex gap-4 max-sm:flex-col-reverse sm:flex-row pl-2">
            <div className="flex flex-col gap-2 text-shadow-[0_0_8px_rgb(0_0_0_/_0.4)]">
              <h1 className="font-display text-4xl font-semibold max-sm:text-center text-white">
                User not found
              </h1>
              <span className="text-xl max-sm:text-lg max-sm:text-center text-white opacity-80">
                @{username}
              </span>
            </div>
          </div>
        </div>
      </Panel>
    );
  }

  const displayName =
    `${data.firstName ?? ''} ${data.lastName ?? ''}`.trim() ||
    data.username ||
    username;

  return (
    <Panel className="relative bg-linear-to-r from-[#5A49F7] from-[4.36%] via-[#9403D8] via-[49.74%] to-[#FD9365]">
      <div className="absolute inset-0 dark:bg-slightly-darken" />
      <div className="z-10">
        <div className="flex gap-4 max-sm:flex-col-reverse sm:flex-row pl-2">
          <div className="flex flex-col gap-2 text-shadow-[0_0_8px_rgb(0_0_0_/_0.4)]">
            <h1 className="font-display text-4xl font-semibold max-sm:text-center text-white">
              {displayName}
            </h1>
            <span className="text-xl max-sm:text-lg max-sm:text-center text-white opacity-80">
              @{data.username}
            </span>
          </div>
          <div className="max-sm:mx-auto sm:ml-auto drop-shadow-[0_0_16px_rgb(0_0_0_/_0.2)]">
            <Avatar
              src={data.image ?? undefined}
              className="w-18 h-18 rounded-full"
            >
              {displayName.charAt(0)}
            </Avatar>
          </div>
        </div>
      </div>
    </Panel>
  );
}
