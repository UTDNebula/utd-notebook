import { relations, sql } from 'drizzle-orm';
import { pgTable, text } from 'drizzle-orm/pg-core';
import { user } from './user';
import { section } from './section';

export const file = pgTable('file', {
  id: text('id')
    .default(sql`nanoid(20)`)
    .primaryKey(),
  authorId: text('author_id')
    .notNull()
    .references(() => user.id),
  sectionId: text('section_id').references(() => section.id),
  file_name: text('file_name').notNull(),
});

export const fileRelations = relations(file, ({ one }) => ({
  author: one(user),
  section: one(section),
}));
