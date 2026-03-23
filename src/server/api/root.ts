import { createCallerFactory, createTRPCRouter } from '@src/server/api/trpc';
import { fileRouter } from './routers/file';
import { sectionRouter } from './routers/section';
import { storageRouter } from './routers/storage';
import { userMetadataRouter } from './routers/userMetadata';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  file: fileRouter,
  section: sectionRouter,
  userMetadata: userMetadataRouter,
  storage: storageRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
