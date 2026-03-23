import { TRPCError } from '@trpc/server';
import { and, eq, ne, sql } from 'drizzle-orm';
import { headers } from 'next/headers';
import { z } from 'zod';
import { type personalCats } from '@src/constants/categories';
import { auth } from '@src/server/auth';
import { insertUserMetadata } from '@src/server/db/models';
import { admin } from '@src/server/db/schema/admin';
import { user as users } from '@src/server/db/schema/auth';
import { userMetadata } from '@src/server/db/schema/user';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

const byIdSchema = z.object({ id: z.string() });

const updateByIdSchema = z.object({
  updateUser: insertUserMetadata.partial().omit({ id: true }),
});
const nameSchema = z.object({
  name: z.string().default(''),
});

export const userMetadataRouter = createTRPCRouter({
  byId: protectedProcedure.input(byIdSchema).query(async ({ input, ctx }) => {
    const { id } = input;
    const userMetadata = await ctx.db.query.userMetadata.findFirst({
      where: (userMetadata) => eq(userMetadata.id, id),
    });

    return userMetadata;
  }),
  updateById: protectedProcedure
    .input(updateByIdSchema)
    .mutation(async ({ input, ctx }) => {
      const { updateUser } = input;
      const { user } = ctx.session;

      // Check username uniqueness if username is being changed
      if (updateUser.username) {
        const existingUser = await ctx.db.query.userMetadata.findFirst({
          where: and(
            eq(userMetadata.username, updateUser.username),
            ne(userMetadata.id, user.id),
          ),
        });
        if (existingUser) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'Username is already taken',
          });
        }
      }

      const updatedUser = (
        await ctx.db
          .update(userMetadata)
          .set(updateUser)
          .where(eq(userMetadata.id, user.id))
          .returning()
      )[0];

      // Update `name` field in BetterAuth user information to match user metadata
      const name = `${updateUser.firstName} ${updateUser.lastName}`;
      if (user.name != name) {
        try {
          await auth.api.updateUser({
            body: { name },
            headers: await headers(),
          });
        } catch (e) {
          console.error(
            `Unable to update name field for${updateUser.firstName ? ` ${name}'s` : ''} user information`,
            e,
          );
        }
      }

      return updatedUser!;
    }),
  deleteById: protectedProcedure.mutation(async ({ ctx }) => {
    const { user } = ctx.session;
    await ctx.db.delete(users).where(eq(users.id, user.id));
    await ctx.db.delete(userMetadata).where(eq(userMetadata.id, user.id));
  }),
  searchByName: publicProcedure
    .input(nameSchema)
    .query(async ({ input, ctx }) => {
      const users = ctx.db.query.userMetadata.findMany({
        where: sql`CONCAT(${userMetadata.firstName},' ',${
          userMetadata.lastName
        }) ilike ${'%' + input.name + '%'}`,
      });
      return await users;
    }),
  usernameExists: publicProcedure
    .input(z.object({ username: z.string() }))
    .query(async ({ input, ctx }) => {
      const existing = await ctx.db.query.userMetadata.findFirst({
        where: eq(userMetadata.username, input.username),
      });
      return !!existing;
    }),
  getUserSidebarCapabilities: publicProcedure.query(async ({ ctx }) => {
    const session = ctx.session;
    const capabilites: (typeof personalCats)[number][] = [];
    if (!session) return capabilites;
    const [isAdmin] = await Promise.all([
      ctx.db.query.admin.findFirst({
        where: eq(admin.userId, session.user.id),
      }),
    ]);
    if (isAdmin) capabilites.push('Admin');
    return capabilites;
  }),
});
