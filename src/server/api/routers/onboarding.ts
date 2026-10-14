import { TRPCError } from '@trpc/server';
import { eq } from 'drizzle-orm';
import { headers } from 'next/headers';
import { accountOnboardingSchema } from '@src/lib/schemas/account';
import { auth } from '@src/server/auth';
import { userMetadata } from '@src/server/db/schema/user';
import { getOnboardingData, pickOnboardingData } from '@src/server/onboarding';
import { createTRPCRouter, onboardingProcedure } from '../trpc';

// Neither procedure takes a user ID, so callers can only reach their own data
export const onboardingRouter = createTRPCRouter({
  get: onboardingProcedure.query(({ ctx }) =>
    getOnboardingData(ctx.db, ctx.session.user.id),
  ),

  submit: onboardingProcedure
    .input(accountOnboardingSchema)
    .mutation(async ({ input, ctx }) => {
      const { user } = ctx.session;

      const updated = (
        await ctx.db
          .update(userMetadata)
          .set({
            firstName: input.firstName,
            lastName: input.lastName,
            major: input.major,
            minor: input.minor,
            studentClassification: input.studentClassification,
            graduationDate: input.graduationDate,
            contactEmail: input.contactEmail,
          })
          .where(eq(userMetadata.id, user.id))
          .returning()
      )[0];

      if (!updated) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Unable to save onboarding information',
        });
      }

      // Keep the Better Auth `name` in step with the profile name
      const name = `${updated.firstName} ${updated.lastName}`.trim();
      if (user.name !== name) {
        try {
          await auth.api.updateUser({
            body: { name },
            headers: await headers(),
          });
        } catch (e) {
          console.error(`Unable to update the auth name for ${name}`, e);
        }
      }

      return pickOnboardingData(updated);
    }),
});
