'use client';

import { useEffect } from 'react';
import type { FavoriteCatRecord } from '@/entities/favorite-cat';
import { ImageViewer } from '@/shared/ui/image-viewer';
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
    <ImageViewer
      src={cat.imageUrl}
      alt="Котик из избранного"
      ariaLabel="Просмотр котика из избранного"
      hasMultiple={hasMultiple}
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={onNext}
      footer={formatAddedAt(cat.addedAt)}
      imageAction={(
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
      )}
    />
  );
}
