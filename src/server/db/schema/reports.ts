import { sql } from 'drizzle-orm';
import {
  index,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { file } from './file';
import { userMetadata } from './user';

export const report = pgTable(
  'report',
  {
    id: text('id')
      .default(sql`nanoid(20)`)
      .primaryKey(),

    userId: text('user_id')
      .notNull()
      .references(() => userMetadata.id),

    fileId: text('file_id')
      .notNull()
      .references(() => file.id),

    category: varchar('category', { length: 32 }).notNull().default('other'),

    details: text('details').notNull(),

    createdAt: timestamp('created_at', { mode: 'date' })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    uniqueIndex('report_user_file_unique_idx').on(t.userId, t.fileId),
    index('report_user_idx').on(t.userId),
    index('report_file_idx').on(t.fileId),
  ],
);
