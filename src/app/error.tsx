'use client';

import { useEffect } from 'react';
import { getClientMessages } from '@/shared/i18n';
import { HttpCatErrorState } from '@/shared/ui/http-cat-error';
import { PaperPanel } from '@/shared/ui/page-surface';

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

  const messages = getClientMessages();

  return (
    <PaperPanel inset>
      <HttpCatErrorState
        status={500}
        title={messages.errors.pageTitle}
        description={messages.errors.pageDescription}
        actionLabel={messages.common.retry}
        onAction={() => unstable_retry()}
      />
    </PaperPanel>
  );
}
