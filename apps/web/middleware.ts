import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, isLocale, locales } from './i18n/config';

/** First supported language from the Accept-Language header, else the default. */
function pickLocale(request: NextRequest): string {
  const header = request.headers.get('accept-language');
  if (header) {
    for (const part of header.split(',')) {
      const code = part.split(';')[0]?.trim().slice(0, 2).toLowerCase();
      if (code && isLocale(code)) return code;
    }
  }
  return defaultLocale;
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const locale = pickLocale(request);
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip API routes, Next internals, and any file with an extension (static assets).
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*).*)'],
};
