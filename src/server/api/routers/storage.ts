import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { NOTE_MIME_TYPE, noteIdSchema } from '@src/lib/note-files/noteFile';
import { callStorageAPI, getUploadURL } from '@src/server/storage';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

const getDeleteSchema = z.object({
  objectId: noteIdSchema,
});

const createUploadSchema = z.object({
  objectId: noteIdSchema,
  mime: z.literal(NOTE_MIME_TYPE),
});

function createOwnedFileProcedure(options: { allowMissing: boolean }) {
  return protectedProcedure
    .input(getDeleteSchema)
    .use(async ({ ctx, input, next }) => {
      const file = await ctx.db.query.file.findFirst({
        where: (file, { eq }) => eq(file.id, input.objectId),
        columns: { authorId: true },
      });

      const missing = !file;
      const notYours = file && file.authorId !== ctx.session.user.id;

      if (notYours || (missing && !options.allowMissing)) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You do not own this note.',
        });
      }
      return next();
    });
}

const ownedFileProcedure = createOwnedFileProcedure({ allowMissing: false });
const ownedOrNewFileProcedure = createOwnedFileProcedure({ allowMissing: true });

export const storageRouter = createTRPCRouter({
  get: publicProcedure.input(getDeleteSchema).query(async ({ input }) => {
    const data = await callStorageAPI('GET', input.objectId);
    if (data.message !== 'success') {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Nebula API errored on request',
        cause: data,
      });
    }
    return data;
  }),
  delete: ownedFileProcedure.mutation(async ({ input }) => {
    const data = await callStorageAPI('DELETE', input.objectId);
    if (data.message !== 'success') {
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Nebula API errored on request',
        cause: data,
      });
    }
    return data;
  }),
  createUpload: ownedOrNewFileProcedure
    .input(createUploadSchema)
    .mutation(async ({ input }) => {
      const data = await getUploadURL(input.objectId, input.mime);
      if (data.message !== 'success') {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Nebula API errored on request',
          cause: data,
        });
      }
      return data;
    }),
});