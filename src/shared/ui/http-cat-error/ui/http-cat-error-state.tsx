'use client';

import Image from 'next/image';
import { getClientMessages } from '@/shared/i18n';
import { getHttpCatUrl } from '@/shared/lib/http-cat';
import styles from './http-cat-error-state.module.css';

type HttpCatErrorStateProps = {
  status?: number;
  title?: string;
  description?: string;
  compact?: boolean;
  actionLabel?: string;
  onAction?: () => void;
};

export function HttpCatErrorState({
  status = 500,
  title = 'Что-то пошло не так',
  description = 'Попробуй ещё раз чуть позже.',
  compact = false,
  actionLabel,
  onAction,
}: HttpCatErrorStateProps) {
  const messages = getClientMessages();

  return (
    <div className={compact ? `${styles.card} ${styles.compact}` : styles.card}>
      <div className={styles.imageFrame}>
        <Image
          src={getHttpCatUrl(status)}
          alt={`HTTP Cat ${status}`}
          fill
          className={styles.image}
          sizes={compact ? '160px' : '(min-width: 1024px) 320px, 80vw'}
        />
      </div>

      <div className={styles.content}>
        <p className={styles.code}>HTTP {status}</p>
        <h2 className={styles.title}>{title ?? messages.errors.genericTitle}</h2>
        <p className={styles.description}>{description ?? messages.errors.genericDescription}</p>

        {actionLabel && onAction ? (
          <button type="button" className={styles.action} onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}
