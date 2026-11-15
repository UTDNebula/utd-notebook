'use client';

import FlagIcon from '@mui/icons-material/Flag';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { Button } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useTRPC } from '@src/lib/trpc/react';

type ReportButtonProps = {
  fileId: string;
};

export default function ReportButton({ fileId }: ReportButtonProps) {
  const api = useTRPC();
  const { data, isPending, isError } = useQuery(
    api.report.isReported.queryOptions({ fileId }),
  );
  const isReported = data?.reported ?? false;
  const disabled = isReported || isPending || isError;

  return (
    <Button
      LinkComponent={Link}
      href={
        disabled ? undefined : `/report?fileId=${encodeURIComponent(fileId)}`
      }
      disabled={disabled}
      variant="contained"
      size="small"
      className="text-haiti bg-white normal-case hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
      startIcon={isReported ? <FlagIcon /> : <FlagOutlinedIcon />}
    >
      {isReported ? 'Reported' : 'Report'}
    </Button>
  );
}
