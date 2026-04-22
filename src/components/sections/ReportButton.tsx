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
      className="normal-case bg-white hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-haiti dark:text-white"
      startIcon={<FlagOutlinedIcon />}
    >
      Report
    </Button>
  );
}
