'use client';

import './globals.css';
import { useEffect } from 'react';
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

  return (
    <html lang="ru">
      <body>
        <main>
          <HttpCatErrorState
            status={500}
            title="Глобальная ошибка приложения"
            description="Даже корневой слой не пережил ошибку. Можно попробовать перерисовать приложение."
            actionLabel="Повторить"
            onAction={() => unstable_retry()}
          />
        </main>
      </body>
    </html>
  );
}
