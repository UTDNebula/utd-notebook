import { MetadataRoute } from 'next';
import { db } from '@src/server/db';
import { section } from '@src/server/db/schema/section';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://notebook.utdnebula.com';

  // Crawlers have no session, so read the database directly instead of through tRPC
  const [courses, professors, combos, notes, userRows] = await Promise.all([
    // Fetch all existing courses, profs, and course-prof combos as arrays
    db
      .selectDistinct({ prefix: section.prefix, number: section.number })
      .from(section)
      .orderBy(section.prefix, section.number),
    db
      .selectDistinct({
        profFirst: section.profFirst,
        profLast: section.profLast,
      })
      .from(section)
      .orderBy(section.profFirst, section.profLast),
    db
      .selectDistinct({
        prefix: section.prefix,
        number: section.number,
        profFirst: section.profFirst,
        profLast: section.profLast,
      })
      .from(section)
      .orderBy(
        section.prefix,
        section.number,
        section.profFirst,
        section.profLast,
      ),
    // Fetch note IDs
    db.query.file.findMany({
      columns: { id: true, updatedAt: true },
      orderBy: (file, { desc }) => [desc(file.updatedAt)],
    }),
    // Fetch usernames
    db.query.userMetadata.findMany({ columns: { username: true } }),
  ]);
  const usernames = userRows.map((u) => u.username).filter((u) => u !== null);

  // array of all possible note page slugs
  const noteSlugs = [
    ...courses.map((c) => [c.prefix, c.number]),
    ...professors.map((p) => [p.profFirst, p.profLast]),
    ...combos.map((c) => [c.prefix, c.number, c.profFirst, c.profLast]),
  ];

  return [
    {
      // Homepage
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
    // Notes pages
    ...noteSlugs.map((slugs) => ({
      url: `${baseUrl}/notes/${slugs.join('/')}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    // Individual notes pages
    ...notes.map(({ id, updatedAt }) => ({
      url: `${baseUrl}/notes/${id}`,
      lastModified: updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    // Profile pages
    ...usernames.map((username) => ({
      url: `${baseUrl}/profile/${username}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
    {
      // Create note page
      url: `${baseUrl}/notes/create`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];
}
