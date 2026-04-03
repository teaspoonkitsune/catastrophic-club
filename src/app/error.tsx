'use client';

import { useEffect } from 'react';
import { HttpCatErrorState } from '@/shared/ui/http-cat-error';

export default function Error({
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
    <main>
      <HttpCatErrorState
        status={500}
        title="Сегмент приложения упал"
        description="Поймали ошибку в App Router. Можно попробовать повторить запрос."
        actionLabel="Повторить"
        onAction={() => unstable_retry()}
      />
    </main>
  );
}
