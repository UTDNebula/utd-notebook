import { relations, sql } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { reportStatuses } from '@src/lib/types/moderation';
import { file } from './file';
import { userMetadata } from './user';

export const statusEnum = pgEnum('report_status', reportStatuses);

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

    // File name is stored as metadata in case a file is deleted
    fileName: text('file_name').notNull(),

    // Short category (e.g., "inappropriate", "copyright", "spam", "other")
    category: varchar('category', { length: 32 }).notNull().default('other'),

    // Free-text explanation
    details: text('details').notNull(),

    // Created timestamp
    createdAt: timestamp('created_at', { mode: 'date' })
      .notNull()
      .default(sql`now()`),

    // Record whether the report is pending review or what action was taken
    status: statusEnum('status').notNull().default('PENDING'),

    // Record who reviewed this report
    reviewerId: text('reviewer_id').references(() => userMetadata.id),

    // Record the time the report was reviewed
    reviewedAt: timestamp('reviewed_at', { mode: 'date' }),
  },
  (t) => [uniqueIndex('report_user_file_unique_idx').on(t.userId, t.fileId)],
);

export const reportRelations = relations(report, ({ one }) => ({
  reporter: one(userMetadata, {
    fields: [report.userId],
    references: [userMetadata.id],
  }),
  file: one(file, {
    fields: [report.fileId],
    references: [file.id],
  }),
  reviewer: one(userMetadata, {
    fields: [report.reviewerId],
    references: [userMetadata.id],
  }),
}));
