import 'server-only';
import { and, eq, sql, type AnyColumn, type SQL } from 'drizzle-orm';
import { normalizePrefix } from '@src/lib/sections/section';
import { db } from '@src/server/db';
import { section } from '@src/server/db/schema/section';
import { userMetadata } from '@src/server/db/schema/user';

//anonymous visitors get note metadata only. every query lists the columns it returns
//so private profile fields and storage URLs cannot leak into these results.
const fileColumns = {
  id: true,
  name: true,
  description: true,
  handwritten: true,
  updatedAt: true,
} as const;
const authorColumns = {
  username: true,
  firstName: true,
  lastName: true,
} as const;
const sectionColumns = {
  id: true,
  prefix: true,
  number: true,
  sectionCode: true,
  term: true,
  year: true,
  profFirst: true,
  profLast: true,
} as const;

type SectionRow = Pick<
  typeof section.$inferSelect,
  | 'id'
  | 'prefix'
  | 'number'
  | 'sectionCode'
  | 'term'
  | 'year'
  | 'profFirst'
  | 'profLast'
>;

export type PublicFile = {
  id: string;
  name: string;
  description: string | null;
  handwritten: boolean;
  updatedAt: Date;
  author: { username: string | null; displayName: string };
};
export type PublicNote = PublicFile & { section: SectionRow | null };
export type PublicSection = SectionRow & { files: PublicFile[] };
export type PublicProfile = {
  username: string;
  displayName: string;
  uploadedNotes: PublicFile[];
};

type FileRow = {
  id: string;
  name: string;
  description: string | null;
  handwritten: boolean;
  updatedAt: Date;
  author: { username: string | null; firstName: string; lastName: string };
};

function toPublicFile(row: FileRow): PublicFile {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    handwritten: row.handwritten,
    updatedAt: row.updatedAt,
    author: {
      username: row.author.username,
      displayName: `${row.author.firstName} ${row.author.lastName}`.trim(),
    },
  };
}

export async function getPublicNote(id: string): Promise<PublicNote | null> {
  const row = await db.query.file.findFirst({
    where: (file, { eq }) => eq(file.id, id),
    columns: fileColumns,
    with: {
      author: { columns: authorColumns },
      section: { columns: sectionColumns },
    },
  });
  return row ? { ...toPublicFile(row), section: row.section } : null;
}

async function findSections(where: SQL | undefined): Promise<PublicSection[]> {
  const rows = await db.query.section.findMany({
    where,
    columns: sectionColumns,
    with: {
      files: {
        columns: fileColumns,
        with: { author: { columns: authorColumns } },
      },
    },
    orderBy: (sections, { desc }) => [desc(sections.year), desc(sections.term)],
  });
  return rows.map((row) => ({ ...row, files: row.files.map(toPublicFile) }));
}

//exact, case-insensitive match. unlike ILIKE, a "%" in the URL is not a wildcard.
const sameName = (column: AnyColumn, value: string) =>
  eq(sql`lower(${column})`, value.toLowerCase());

export const getPublicSectionsByCourse = (prefix: string, number: string) =>
  findSections(
    and(
      eq(section.prefix, normalizePrefix(prefix)),
      eq(section.number, number),
    ),
  );

export const getPublicSectionsByProfessor = (
  profFirst: string,
  profLast: string,
) =>
  findSections(
    and(
      sameName(section.profFirst, profFirst),
      sameName(section.profLast, profLast),
    ),
  );

export const getPublicSectionsByCourseAndProfessor = (
  prefix: string,
  number: string,
  profFirst: string,
  profLast: string,
) =>
  findSections(
    and(
      eq(section.prefix, normalizePrefix(prefix)),
      eq(section.number, number),
      sameName(section.profFirst, profFirst),
      sameName(section.profLast, profLast),
    ),
  );

export async function getPublicProfile(
  username: string,
): Promise<PublicProfile | null> {
  const profile = await db.query.userMetadata.findFirst({
    where: eq(userMetadata.username, username),
    columns: { id: true, username: true, firstName: true, lastName: true },
  });
  if (!profile) return null;

  const files = await db.query.file.findMany({
    where: (file, { eq }) => eq(file.authorId, profile.id),
    columns: fileColumns,
    with: { author: { columns: authorColumns } },
    orderBy: (file, { desc }) => [desc(file.updatedAt)],
  });

  return {
    username,
    displayName: `${profile.firstName} ${profile.lastName}`.trim(),
    uploadedNotes: files.map(toPublicFile),
  };
}
