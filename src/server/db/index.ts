import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '@src/env.mjs';
import * as auth from './schema/auth';
import * as file from './schema/file';
import * as report from './schema/reports';
import * as section from './schema/section';
import * as user from './schema/user';

const schema = {
  ...file,
  ...section,
  ...user,
  ...report,
  ...auth,
};

export const db = drizzle(env.DATABASE_URL, {
  schema,
});
