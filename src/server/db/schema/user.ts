import { relations } from 'drizzle-orm';
import { pgEnum, pgTable, text } from 'drizzle-orm/pg-core';
import { file } from './file';

export const yearEnum = pgEnum('year', [
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Grad Student',
]);

export const userMetadata = pgTable('user_metadata', {
  id: text('id').notNull().primaryKey(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  major: text('major').notNull(),
  minor: text('minor'),
  year: yearEnum('year')
    .$default(() => 'Freshman')
    .notNull(),
});

export const userMetadataRelations = relations(userMetadata, ({ many }) => ({
  files: many(file),
}));
