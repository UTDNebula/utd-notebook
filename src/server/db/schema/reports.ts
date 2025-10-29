// Minimal table so API can insert a report.

import { sql } from 'drizzle-orm';
import { pgTable, text, varchar, timestamp } from 'drizzle-orm/pg-core';
import { user } from './user';
import { file } from './file';

export const report = pgTable('report', {
  id: text('id')
    .default(sql`nanoid(20)`)
    .primaryKey(),

  userId: text('user_id')
    .notNull()
    .references(() => user.id),

  fileId: text('file_id')
    .notNull()
    .references(() => file.id),

  // Short category (e.g., "inappropriate", "copyright", "spam", "other")
  category: varchar('category', { length: 32 }).notNull().default('other'),

  // Free-text explanation
  details: text('details').notNull(),

  // Created timestamp
  createdAt: timestamp('created_at', { mode: 'date' })
    .notNull()
    .default(sql`now()`),
});
