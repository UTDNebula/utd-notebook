import { relations, sql } from 'drizzle-orm';
import {
  boolean,
  index,
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
    id: varchar('id')
      .default(sql`nanoid(20)`)
      .primaryKey(),

    authorId: text('author_id')
      .notNull()
      .references(() => userMetadata.id, { onDelete: 'cascade' }),

    sectionId: varchar('section_id').references(() => section.id, {
      onDelete: 'set null',
    }),

    name: text('name').notNull(),
    description: text('description'),

    publicUrl: text('public_url').notNull(),

    handwritten: boolean('handwritten').notNull().default(false),

    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('file_name_unique_idx').on(t.authorId, t.name),
    index('file_by_author_idx').on(t.authorId),
    index('file_by_section_idx').on(t.sectionId),
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
