import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { defaultLocale, locales } from './i18n/config';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    const hasLocalePrefix = locales.some(
        (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
    );

    if (hasLocalePrefix) {
        return NextResponse.next();
    }

    const nextUrl = request.nextUrl.clone();
    nextUrl.pathname = `/${defaultLocale}${pathname}`;
    return NextResponse.redirect(nextUrl);
}

export const config = {
    matcher: ['/((?!_next|api|favicon.ico|.*\\..*).*)'],
};
