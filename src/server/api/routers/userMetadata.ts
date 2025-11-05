import { z } from 'zod';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { eq, sql } from 'drizzle-orm';

import { insertUserMetadata } from '@src/server/db/models';
import { userMetadata, user as users } from '@src/server/db/schema/user';

const byIdSchema = z.object({ id: z.string().uuid() });

const updateByIdSchema = z.object({
  updateUser: insertUserMetadata.omit({ id: true }),
});
const nameSchema = z.object({
  name: z.string().default(''),
});

export const userMetadataRouter = createTRPCRouter({
  byId: protectedProcedure.input(byIdSchema).query(async ({ input, ctx }) => {
    const { id } = input;
    const userMetadata = await ctx.db.query.userMetadata.findFirst({
      where: (userMetadata) => eq(userMetadata.id, id),
      with: { clubs: true },
    });

    return userMetadata;
  }),
  updateById: protectedProcedure
    .input(updateByIdSchema)
    .mutation(async ({ input, ctx }) => {
      const { updateUser } = input;
      const { user } = ctx.session;

      await ctx.db
        .update(userMetadata)
        .set(updateUser)
        .where(eq(userMetadata.id, user.id));
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
});
