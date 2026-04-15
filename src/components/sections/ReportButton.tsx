'use client';

import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { authClient } from '@src/utils/auth-client';

type ReportButtonProps = {
  fileId: string;
};

export default function ReportButton({ fileId }: ReportButtonProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      router.push(
        `/auth?callbackUrl=${encodeURIComponent(window.location.href)}`,
      );
      return;
    }

    router.push(`/report?fileId=${encodeURIComponent(fileId)}`);
  };

  return (
    <Button
      variant="contained"
      size="small"
      onClick={handleClick}
      className="normal-case bg-white hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-haiti dark:text-white"
      startIcon={<FlagOutlinedIcon />}
    >
      Report
    </Button>
  );
}
