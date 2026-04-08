'use client';

import './globals.css';
import { useEffect } from 'react';
import { getClientLocale, getClientMessages } from '@/shared/i18n';
import { HttpCatErrorState } from '@/shared/ui/http-cat-error';

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const locale = getClientLocale();
  const messages = getClientMessages();

  return (
    <html lang={locale}>
      <body>
        <main>
          <HttpCatErrorState
            status={500}
            title={messages.errors.globalTitle}
            description={messages.errors.globalDescription}
            actionLabel={messages.common.retry}
            onAction={() => unstable_retry()}
          />
        </main>
      </body>
    </html>
  );
}
