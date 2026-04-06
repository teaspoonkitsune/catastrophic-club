'use client';

import { useEffect } from 'react';
import type { FavoriteCatRecord } from '@/entities/favorite-cat';
import styles from './favorites-viewer-modal.module.css';

type FavoritesViewerModalProps = {
  cat: FavoriteCatRecord;
  isFavorite: boolean;
  isPending?: boolean;
  hasMultiple?: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onToggleFavorite: () => void;
};

function formatAddedAt(addedAt: string) {
  const date = new Date(addedAt);
  const datePart = new Intl.DateTimeFormat('ru-RU', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
  const timePart = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);

  return `Добавлено: ${datePart} в ${timePart}`;
}

export function FavoritesViewerModal({
  cat,
  isFavorite,
  isPending = false,
  hasMultiple = false,
  onClose,
  onPrevious,
  onNext,
  onToggleFavorite,
}: FavoritesViewerModalProps) {
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      if (hasMultiple && event.key === 'ArrowLeft') {
        event.preventDefault();
        onPrevious();
        return;
      }

      if (hasMultiple && event.key === 'ArrowRight') {
        event.preventDefault();
        onNext();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [hasMultiple, onClose, onNext, onPrevious]);

  return (
    <div className={styles.overlay} onClick={onClose} role="presentation">
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Закрыть просмотр"
      >
        x
      </button>

      <button
        type="button"
        className={styles.favoriteButton}
        onClick={(event) => {
          event.stopPropagation();
          onToggleFavorite();
        }}
        aria-pressed={isFavorite}
        aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        disabled={isPending}
      >
        {isFavorite ? '★' : '☆'}
      </button>

      {hasMultiple ? (
        <>
          <button
            type="button"
            className={`${styles.arrowButton} ${styles.arrowLeft}`}
            onClick={(event) => {
              event.stopPropagation();
              onPrevious();
            }}
            aria-label="Предыдущее фото"
          >
            {'<'}
          </button>

          <button
            type="button"
            className={`${styles.arrowButton} ${styles.arrowRight}`}
            onClick={(event) => {
              event.stopPropagation();
              onNext();
            }}
            aria-label="Следующее фото"
          >
            {'>'}
          </button>
        </>
      ) : null}

      <div className={styles.viewer} onClick={(event) => event.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={cat.imageUrl} alt="Котик из избранного" className={styles.image} />
        <div className={styles.footer}>{formatAddedAt(cat.addedAt)}</div>
      </div>
    </div>
  );
}
