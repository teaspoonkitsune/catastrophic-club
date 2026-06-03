import { defaultLocale, type Locale } from './messages';

const intlLocaleMap: Record<Locale, string> = {
  ru: 'ru-RU',
  en: 'en-US',
  uk: 'uk-UA',
};

export function getIntlLocale(locale: Locale | string | null | undefined) {
  if (locale === 'ru' || locale === 'en' || locale === 'uk') {
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
