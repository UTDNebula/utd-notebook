import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  pgTable,
  primaryKey,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';
import { file } from './file';
import { userMetadata } from './user';

export const userMetadataToNotes = pgTable(
  'user_metadata_to_notes',
  {
    userId: text('user_id')
      .notNull()
      .references(() => userMetadata.id, { onDelete: 'cascade' }),

    fileId: varchar('file_id')
      .notNull()
      .references(() => file.id, { onDelete: 'cascade' }),

    saved: boolean('saved').notNull().default(true),

    savedAt: timestamp('saved_at').defaultNow().notNull(),

    rating: integer('rating'),
  },
  (t) => [primaryKey({ columns: [t.userId, t.fileId] })],
);

export const userMetadataToNotesRelations = relations(
  userMetadataToNotes,
  ({ one }) => ({
    user: one(userMetadata, {
      fields: [userMetadataToNotes.userId],
      references: [userMetadata.id],
    }),
    file: one(file, {
      fields: [userMetadataToNotes.fileId],
      references: [file.id],
    }),
  }),
);
