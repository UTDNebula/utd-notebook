import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { user } from './schema/auth';
import { file } from './schema/file';
import { userMetadataToNotes } from './schema/savedNote';
import { section } from './schema/section';
import { userMetadata } from './schema/user';

/* =========================
   USER
========================= */

export const insertUser = createInsertSchema(user);
export const selectUser = createSelectSchema(user);

export type InsertUser = z.infer<typeof insertUser>;
export type SelectUser = z.infer<typeof selectUser>;

/* =========================
   USER METADATA
========================= */

export const insertUserMetadata = createInsertSchema(userMetadata);
export const selectUserMetadata = createSelectSchema(userMetadata);

export type InsertUserMetadata = z.infer<typeof insertUserMetadata>;
export type SelectUserMetadata = z.infer<typeof selectUserMetadata>;

/* =========================
   SECTION
========================= */

export const insertSection = createInsertSchema(section);
export const selectSection = createSelectSchema(section);

export type InsertSection = z.infer<typeof insertSection>;
export type SelectSection = z.infer<typeof selectSection>;

/* =========================
   FILE
========================= */

export const insertFile = createInsertSchema(file);
export const selectFile = createSelectSchema(file);

export type InsertFile = z.infer<typeof insertFile>;
export type SelectFile = z.infer<typeof selectFile>;

/* =========================
   SAVED NOTE
========================= */

export const insertSavedNote = createInsertSchema(userMetadataToNotes);
export const selectSavedNote = createSelectSchema(userMetadataToNotes);
export type InsertSavedNote = z.infer<typeof insertSavedNote>;
export type SelectSavedNote = z.infer<typeof selectSavedNote>;

/* =========================
   FILE WITH USER METADATA
========================= */

export const insertFileWithUserMetadata = insertFile.extend({
  author: selectUserMetadata,
});
export const selectFileWithUserMetadata = selectFile.extend({
  author: selectUserMetadata,
});

export type InsertFileWithUserMetadata = z.infer<
  typeof insertFileWithUserMetadata
>;

export type SelectFileWithUserMetadata = z.infer<
  typeof selectFileWithUserMetadata
>;

/* =========================
   SECTION WITH FILES
========================= */

export const sectionWithFiles = selectSection.extend({
  files: z.array(selectFile),
});

export type SectionWithFiles = z.infer<typeof sectionWithFiles>;

/* =========================
   SECTION WITH FILES + AUTHOR METADATA
========================= */

export const sectionWithFilesWithUserMetadata = selectSection.extend({
  files: z.array(selectFileWithUserMetadata),
});

export type SectionWithFilesWithUserMetadata = z.infer<
  typeof sectionWithFilesWithUserMetadata
>;

export const selectFileWithAuthorPreview = selectFile.extend({
  author: selectUserMetadata.pick({
    username: true,
    firstName: true,
    lastName: true,
  }),
});

export type SelectFileWithAuthorPreview = z.infer<
  typeof selectFileWithAuthorPreview
>;
