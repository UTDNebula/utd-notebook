import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { section } from './section';
import { userMetadata } from './user';

export const file = pgTable(
  'file',
  {
    // NOTE: Use for storing in the bucket, not file name or file title.
    id: varchar('id', { length: 20 })
      .default(sql`nanoid(20)`)
      .primaryKey(),

    authorId: text('author_id')
      .notNull()
      .references(() => userMetadata.id, { onDelete: 'cascade' }), // Could be 'set null' too, depending on what we want to do with it.

    sectionId: varchar('section_id', { length: 6 }).references(
      () => section.id,
      { onDelete: 'set null' },
    ),

    fileTitle: text('file_title').notNull(),

    fileName: text('file_name').notNull(),

    publishDate: timestamp('publish_date', { withTimezone: true })
      .notNull()
      .defaultNow(),

    likes: integer('likes').notNull().default(0),
    saves: integer('saves').notNull().default(0),

    // Edit flag for future workflows
    edited: boolean('edited').notNull().default(false),

    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    editedAt: timestamp('edited_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // REVIEW: This is CASE SENSITIVE. File != file similar to Linux.
    // So a user could have "Lecture 1 Notes" and "lecture 1 notes".
    // I would recommend adding a PG extension for to support insensitivity.
    uniqueIndex('file_title_unique_idx').on(t.authorId, t.fileTitle),
    index('file_by_author_idx').on(t.authorId),
    index('file_by_section_idx').on(t.sectionId),
    index('file_by_publish_date_idx').on(t.publishDate),

    check('file_likes_nonneg', sql`${t.likes} >= 0`),
    check('file_saves_nonneg', sql`${t.saves} >= 0`),
  ],
);

export const fileRelations = relations(file, ({ one }) => ({
  author: one(userMetadata, {
    fields: [file.authorId],
    references: [userMetadata.id],
  }),
  section: one(section, {
    fields: [file.sectionId],
    references: [section.id],
  }),
}));
