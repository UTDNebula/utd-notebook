// all possible file moderation statuses
export const fileModerationStatuses = [
  'VISIBLE',
  'HIDDEN',
  'AUTO_HIDDEN',
] as const;

// evaluates to 'VISIBLE' | 'HIDDEN' | 'AUTO_HIDDEN'
export type FileModerationStatus = (typeof fileModerationStatuses)[number];

// all possible report moderation statuses
export const reportStatuses = [
  'PENDING',
  'DISMISSED',
  'FILE_HIDDEN',
  'FILE_DELETED',
] as const;

// evaluates to 'PENDING' | 'DISMISSED' | 'FILE_HIDDEN' | 'FILE_DELETED'
export type ReportStatus = (typeof reportStatuses)[number];
