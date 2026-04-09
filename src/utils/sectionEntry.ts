export type SectionEntry = {
  label: string;
  prefix: string;
  courseNumber: string;
  sectionCode: string;
  term: 'Spring' | 'Summer' | 'Fall';
  year: number;
  profFirst: string;
  profLast: string;
};
