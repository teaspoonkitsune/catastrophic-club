'use client';

import { createContext, useContext } from 'react';
import type { ReactNode } from 'react';
import type { Locale, Messages } from './messages';

type I18nContextValue = {
  locale: Locale;
  messages: Messages;
};

const I18nContext = createContext<I18nContextValue | null>(null);

type I18nProviderProps = {
  locale: Locale;
  messages: Messages;
  children: ReactNode;
};

export function I18nProvider({ locale, messages, children }: I18nProviderProps) {
  return (
    <I18nContext.Provider value={{ locale, messages }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }

  return context;
}
