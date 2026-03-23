import { relations } from 'drizzle-orm';
import { date, pgEnum, pgTable, text, uniqueIndex } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { file } from './file';

export const studentClassificationEnum = pgEnum('student_classification', [
  'Student',
  'Graduate Student',
  'Alum',
  'Prospective Student',
  'Faculty',
  'Staff',
]);

export const userMetadata = pgTable(
  'user_metadata',
  {
    id: text('id').notNull().primaryKey(),
    username: text('username'),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    major: text('major').notNull(),
    minor: text('minor'),
    studentClassification: studentClassificationEnum('student_classification')
      .default('Student')
      .notNull(),
    graduationDate: date('graduation_date', { mode: 'date' }),
    contactEmail: text('contact_email'),
  },
  (t) => [uniqueIndex('user_metadata_username_unique_idx').on(t.username)],
);

export const userMetadataRelations = relations(userMetadata, ({ many }) => ({
  files: many(file),
}));

export const userMetadataRelation = relations(userMetadata, ({ one }) => ({
  user: one(user, {
    fields: [userMetadata.id],
    references: [user.id],
  }),
}));
