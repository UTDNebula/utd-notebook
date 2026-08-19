'use client';

import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import { Button } from '@mui/material';
import Link from 'next/link';

type ReportButtonProps = {
  fileId: string;
};

export default function ReportButton({ fileId }: ReportButtonProps) {
  return (
    <Button
      LinkComponent={Link}
      href={`/report?fileId=${encodeURIComponent(fileId)}`}
      variant="contained"
      size="small"
      className="text-haiti bg-white normal-case hover:bg-neutral-200 dark:bg-neutral-800 dark:text-white dark:hover:bg-neutral-700"
      startIcon={<FlagOutlinedIcon />}
    >
      Report
    </Button>
  );
}
