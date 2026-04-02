import { MetadataRoute } from 'next';
import { api } from '@src/trpc/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://notebook.utdnebula.com';

  // fetch all existing courses, profs, and course-prof combos as arrays
  const courses = (await api.section.getAllCourses()).map((c) => [
    c.prefix,
    c.number,
  ]);
  const professors = (await api.section.getAllProfessors()).map((p) => [
    p.profFirst,
    p.profLast,
  ]);
  const combos = (await api.section.getAllCourseProfessorCombos()).map((c) => [
    c.prefix,
    c.number,
    c.profFirst,
    c.profLast,
  ]);

  // fetch note ids
  const notes = (await api.file.byName({ name: '', sortByDate: true })).map(
    (f) => [f.id, f.updatedAt],
  );

  // array of all possible note page slugs
  const noteSlugs = [...courses, ...professors, ...combos];

  return [
    {
      // homepage
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 1,
    },
    // notes pages
    ...noteSlugs.map((slugs) => ({
      url: `${baseUrl}/notes/${slugs.join('/')}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    // individual notes pages
    ...notes.map(([id, updatedAt]) => ({
      url: `${baseUrl}/notes/${id}`,
      lastModified: updatedAt,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    {
      // create note page
      url: `${baseUrl}/notes/create`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    },
  ];
}
