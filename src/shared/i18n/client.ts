'use client';

import { defaultLocale, getMessages, isLocale, localeCookieName, type Locale } from './messages';

function readCookieValue(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const match = document.cookie
    .split('; ')
    .find((item) => item.startsWith(`${name}=`));

  return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

export function getClientLocale(): Locale {
  if (typeof document !== 'undefined') {
    const htmlLocale = document.documentElement.lang.toLowerCase();

    if (isLocale(htmlLocale)) {
      return htmlLocale;
    }

    const cookieLocale = readCookieValue(localeCookieName);

    if (isLocale(cookieLocale)) {
      return cookieLocale;
    }
  }

  if (typeof navigator !== 'undefined') {
    const language = navigator.language.toLowerCase();

    if (language.startsWith('uk')) {
      return 'uk';
    }

    if (language.startsWith('ru')) {
      return 'ru';
    }

    return defaultLocale;
  }

  return defaultLocale;
}

export function getClientMessages() {
  return getMessages(getClientLocale());
}

export function setLocaleCookie(locale: Locale) {
  document.cookie = `${localeCookieName}=${locale}; path=/; max-age=31536000; samesite=lax`;
}
