import { searchQueryLabel, type SearchQuery } from './SearchQuery';

// Percent-encoded so it is also valid as a login callback URL
export function searchDestination(term: SearchQuery): string | null {
  const createNote = `/notes/create?q=${encodeURIComponent(searchQueryLabel(term))}`;

  if (term.prefix && term.number) {
    if (term.hasNotes === false) return createNote;
    return `/notes/${encodeURIComponent(term.prefix.toLowerCase())}/${encodeURIComponent(term.number.toLowerCase())}`;
  }

  if (term.profFirst && term.profLast) {
    if (term.hasNotes === false) return createNote;
    return `/notes/${encodeURIComponent(term.profFirst.toLowerCase())}/${encodeURIComponent(term.profLast.toLowerCase())}`;
  }

  return null;
}

export type SearchNavigation =
  | { action: 'login'; callbackUrl: string }
  | { action: 'navigate'; href: string };

// The login callback is absolute because the auth server rejects relative paths with encoded characters
export function resolveSearchNavigation(
  term: SearchQuery,
  signedIn: boolean,
  origin: string,
): SearchNavigation | null {
  const destination = searchDestination(term);
  if (destination === null) return null;
  return signedIn
    ? { action: 'navigate', href: destination }
    : { action: 'login', callbackUrl: `${origin}${destination}` };
}
