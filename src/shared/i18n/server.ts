import 'server-only';

import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { defaultLocale, getMessages, isLocale, localeCookieName, type Locale } from './messages';

function resolveLocaleFromAcceptLanguage(headerValue: string | null): Locale {
  if (!headerValue) {
    return defaultLocale;
  }

  const primaryLocale = headerValue
    .split(',')[0]
    ?.split(';')[0]
    ?.trim()
    .toLowerCase();

  if (primaryLocale?.startsWith('uk')) {
    return 'uk';
  }

  if (primaryLocale?.startsWith('ru')) {
    return 'ru';
  }

  return defaultLocale;
}

export const getRequestLocale = cache(async (): Promise<Locale> => {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(localeCookieName)?.value;

  if (isLocale(cookieLocale)) {
    return cookieLocale;
  }

  const headerStore = await headers();
  return resolveLocaleFromAcceptLanguage(headerStore.get('accept-language'));
});

export const getRequestI18n = cache(async () => {
  const locale = await getRequestLocale();

  return {
    locale,
    messages: getMessages(locale),
  };
});
