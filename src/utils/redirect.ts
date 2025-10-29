import { headers } from 'next/headers';

export async function signInRoute(route: string) {
  const headerz = await headers();
  const host = headerz.get('X-Forwarded-Host');
  const proto = headerz.get('X-Forwarded-Proto');
  return `/auth?callbackUrl=${encodeURIComponent(
    `${proto}://${host}/${route}`,
  )}`;
}
