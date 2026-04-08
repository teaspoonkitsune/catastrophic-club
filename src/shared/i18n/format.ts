import { defaultLocale, type Locale } from './messages';

const intlLocaleMap: Record<Locale, string> = {
  ru: 'ru-RU',
  en: 'en-US',
};

export function getIntlLocale(locale: Locale | string | null | undefined) {
  if (locale === 'ru' || locale === 'en') {
    return intlLocaleMap[locale];
  }

  return intlLocaleMap[defaultLocale];
}

export function formatDateTime(
  value: string | Date,
  locale: Locale,
  options: Intl.DateTimeFormatOptions,
) {
  return new Intl.DateTimeFormat(getIntlLocale(locale), options).format(new Date(value));
}
