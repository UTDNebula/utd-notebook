import { createCallerFactory, createTRPCRouter } from '@src/server/api/trpc';
import { fileRouter } from './routers/file';
import { reportRouter } from './routers/report';
import { savedNoteRouter } from './routers/savedNote';
import { sectionRouter } from './routers/section';
import { storageRouter } from './routers/storage';
import { userMetadataRouter } from './routers/userMetadata';

/**
 * This is the primary router for your server.
 */
export const appRouter = createTRPCRouter({
  file: fileRouter,
  savedNote: savedNoteRouter,
  section: sectionRouter,
  userMetadata: userMetadataRouter,
  storage: storageRouter,
  report: reportRouter, // ✅ correct placement
});

// export type definition of API
export type AppRouter = typeof appRouter;

export const createCaller = createCallerFactory(appRouter);
