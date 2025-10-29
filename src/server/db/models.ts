import { type z } from 'zod';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { userMetadata } from './schema/user';

// Schema types for userMetadata
export const insertUserMetadata = createInsertSchema(userMetadata);
export const selectUserMetadata = createSelectSchema(userMetadata);

export type InsertUserMetadata = z.infer<typeof insertUserMetadata>;
export type SelectUserMetadata = z.infer<typeof selectUserMetadata>;
