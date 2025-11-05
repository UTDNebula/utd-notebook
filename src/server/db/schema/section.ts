import { relations, sql } from 'drizzle-orm';
import {
  pgTable,
  pgEnum,
  smallint,
  integer,
  varchar,
  text,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core';
import { file } from './file';

export const termEnum = pgEnum('term', ['Spring', 'Summer', 'Fall']);

export const section = pgTable(
  'section',
  {
    id: varchar('id', { length: 6 })
      .default(sql`nanoid(6)`)
      .primaryKey(),

    // "CS" or "CE", short and indexable
    prefix: varchar('prefix', { length: 4 }).notNull(),

    // Course number like 1200
    number: varchar('number', { length: 4 }).notNull(),

    // Section code like "001"
    sectionCode: varchar('section_code', { length: 3 }).notNull(),

    // Semester split into term + year for better filtering
    term: termEnum('term').notNull(),
    year: smallint('year').notNull(),

    professor: text('professor'),
    numberOfNotes: integer('number_of_notes').notNull().default(0),

    // Not required, but good practice usually
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex('section_unique_idx').on(
      t.prefix,
      t.number,
      t.sectionCode,
      t.term,
      t.year,
    ),
    index('section_by_course_idx').on(t.prefix, t.number),
    index('section_by_professor_idx').on(t.professor),
    index('section_by_semester_idx').on(t.term, t.year),
  ],
);

export const sectionRelations = relations(section, ({ many }) => ({
  files: many(file),
}));
