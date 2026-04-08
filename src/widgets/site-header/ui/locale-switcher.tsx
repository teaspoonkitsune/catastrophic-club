'use client';

import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import { setLocaleCookie } from '@/shared/i18n';
import { useI18n } from '@/shared/i18n';
import type { Locale } from '@/shared/i18n';
import styles from './site-header.module.css';

export function LocaleSwitcher() {
  const router = useRouter();
  const { locale, messages } = useI18n();

  function handleChange(nextLocale: string) {
    if (nextLocale !== 'ru' && nextLocale !== 'en') {
      return;
    }

    setLocaleCookie(nextLocale as Locale);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <label className={styles.localeSwitcher}>
      <span className={styles.localeLabel}>{messages.header.locale.label}</span>
      <select
        className={styles.localeSelect}
        value={locale}
        onChange={(event) => handleChange(event.target.value)}
        aria-label={messages.header.locale.label}
      >
        <option value="ru">{messages.header.locale.ru}</option>
        <option value="en">{messages.header.locale.en}</option>
      </select>
    </label>
  );
}
