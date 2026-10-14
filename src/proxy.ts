import { NextResponse, type NextRequest } from 'next/server';
import { REQUEST_PATH_HEADER } from '@src/lib/utils/requestPath';

// Forwards the requested path so the shared layout can send visitors back after login
export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set(
    REQUEST_PATH_HEADER,
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  // Skip API routes, Next.js internals, and files with an extension
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
