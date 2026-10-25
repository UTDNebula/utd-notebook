/**
 * Note: this component doesn't connect to any APIs to actually take the given actions on
 *  the associated reported file. Functionality still needs to be added.
 */

import { Popover } from '@mui/material';
import Button from '@mui/material/Button';
import type { SelectFileWithAuthorPreviewAndReports } from '@src/server/db/models';

type AdminActionsProps = {
  reportedFile: SelectFileWithAuthorPreviewAndReports;
  anchorElement: HTMLElement | null;
  setAnchorElement: (anchorElement: HTMLElement | null) => void;
  buttonStyles?: string;
};

export default function AdminActionsPopover({
  reportedFile,
  anchorElement,
  setAnchorElement,
  buttonStyles,
}: AdminActionsProps) {
  const allButtonStyles = `mb-1 min-w-0 normal-case text-sm font-normal ${buttonStyles}`;
  const buttons = [];

  switch (reportedFile.moderationStatus) {
    case 'VISIBLE':
      buttons.push(<Button className={allButtonStyles}>Hide file</Button>);

      if (reportedFile.reports.some((report) => report.status === 'PENDING'))
        buttons.push(
          <Button className={allButtonStyles}>Dismiss Reports</Button>,
        );
      break;
    case 'HIDDEN':
      buttons.push(
        <Button className={allButtonStyles}>Show file</Button>,
        <Button className={allButtonStyles}>Delete file</Button>,
      );
      break;
    case 'AUTO_HIDDEN':
      buttons.push(
        <Button className={allButtonStyles}>Keep file hidden</Button>,
        <Button className={allButtonStyles}>
          Dismiss Reports and show file
        </Button>,
      );
      break;
  }

  return (
    <Popover
      open={Boolean(anchorElement)}
      anchorEl={anchorElement}
      onClose={() => {
        setAnchorElement(null);
      }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      transformOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      className="bg-transparent"
      slotProps={{
        paper: {
          sx: {
            backgroundColor: 'transparent',
            boxShadow: 'none',
          },
        },
      }}
    >
      <div className="flex flex-col items-end bg-transparent">{...buttons}</div>
    </Popover>
  );
}
