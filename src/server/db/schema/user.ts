import { relations } from 'drizzle-orm';
import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { type AdapterAccount } from 'next-auth/adapters';
import { file } from './file';

export const yearEnum = pgEnum('year', [
  'Freshman',
  'Sophomore',
  'Junior',
  'Senior',
  'Grad Student',
]);

export const user = pgTable('user', {
  id: text('id').notNull().primaryKey(),
  name: text('name'),
  email: text('email').notNull(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
});

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

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccount['type']>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').notNull().primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (vt) => [primaryKey({ columns: [vt.identifier, vt.token] })],
);
export const userMetadataRelations = relations(user, ({ many }) => ({
  files: many(file),
}));
