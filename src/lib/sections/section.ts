import 'server-only';
import { type SelectSection } from '@src/server/db/models';

const termOrder: Record<SelectSection['term'], number> = {
  Spring: 1,
  Summer: 2,
  Fall: 3,
};

export type SectionNumberSummary = {
  number: SelectSection['number'];
  sectionCount: number;
  latestTerm: SelectSection['term'];
  latestYear: SelectSection['year'];
};

export type SectionCodeSummary = {
  id: SelectSection['id'];
  sectionCode: SelectSection['sectionCode'];
  term: SelectSection['term'];
  year: SelectSection['year'];
  profFirst: SelectSection['profFirst'];
  profLast: SelectSection['profLast'];
  fileCount: number;
};

export const normalizePrefix = (prefix: string) => prefix.toUpperCase();

const compareLatest = (a: SelectSection, b: SelectSection) => {
  if (a.year !== b.year) {
    return b.year - a.year;
  }
  return (termOrder[b.term] ?? 0) - (termOrder[a.term] ?? 0);
};

export const pickLatestSection = <T extends SelectSection>(sections: T[]) =>
  sections.reduce<T | null>((latest, current) => {
    if (!latest) return current;
    return compareLatest(current, latest) < 0 ? latest : current;
  }, null);
