import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { eq } from 'drizzle-orm';
import { env } from '@src/env.mjs';
import { db } from './db';
import { type InsertUserMetadata } from './db/models';
import { userMetadata } from './db/schema/user';

/**
 * Options for Better Auth used to configure adapters, providers, callbacks, etc.
 *
 * @see https://www.better-auth.com/docs/introduction
 */
export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg', // or "pg" or "mysql"
  }),
  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      accessType: 'offline',
    },
    discord: {
      clientId: env.DISCORD_CLIENT_ID,
      clientSecret: env.DISCORD_CLIENT_SECRET,
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          const firstName = user.name?.split(' ')[0] ?? '';
          const lastName = user.name?.split(' ')[1] ?? '';

          // Generate a base username from the user's name
          const baseUsername = (user.name ?? 'user')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .slice(0, 24);

          // Check for collisions and append random digits if needed
          let username = baseUsername;
          while (
            await db.query.userMetadata.findFirst({
              where: eq(userMetadata.username, username),
            })
          ) {
            username = `${baseUsername}-${Math.floor(1000 + Math.random() * 9000)}`;
          }

          const insert: InsertUserMetadata = {
            firstName,
            lastName,
            id: user.id,
            major: '',
            username,
          };
          await db.insert(userMetadata).values(insert).returning();
        },
      },
      delete: {
        before: async (user) => {
          const res = await db
            .delete(userMetadata)
            .where(eq(userMetadata.id, user.id));
          return res.rowCount == 1;
        },
      },
    },
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  trustedOrigins: [
    'http://localhost:3000',
    'https://notebook.utdnebula.com',
    'https://notebook-*-utdnebula.vercel.app',
    'http://192.168.137.1:3000',
  ],
});
