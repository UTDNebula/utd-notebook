/** Drizzle can wrap the PostgreSQL error in a cause. */
export function isUsernameConflict(error: unknown): boolean {
  const seen = new Set<object>();
  while (typeof error === 'object' && error !== null && !seen.has(error)) {
    seen.add(error);
    const detail = error as {
      code?: string;
      constraint?: string;
      constraint_name?: string;
      cause?: unknown;
    };
    if (
      detail.code === '23505' &&
      (detail.constraint ?? detail.constraint_name) ===
        'user_metadata_username_unique_idx'
    ) {
      return true;
    }
    error = detail.cause;
  }
  return false;
}
