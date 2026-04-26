import { MetadataRoute } from 'next';
import { api } from '@src/trpc/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://notebook.utdnebula.com';

  const [courses, professors, combos, notes, usernames] = await Promise.all([
    // Fetch all existing courses, profs, and course-prof combos as arrays
    api.section.getAllCourses(),
    api.section.getAllProfessors(),
    api.section.getAllCourseProfessorCombos(),
    // Fetch note IDs
    api.file.byName({ name: '', sortByDate: true }),
    // Fetch usernames
    api.userMetadata.getAllUsernames(),
  ]);

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
