'use client';

import { useEffect } from 'react';
import type { FavoriteCatRecord } from '@/entities/favorite-cat';
import { formatDateTime, useI18n } from '@/shared/i18n';
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
  const { locale, messages } = useI18n();

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
      alt={messages.favorites.viewerAlt}
      ariaLabel={messages.favorites.viewerAria}
      hasMultiple={hasMultiple}
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={onNext}
      footer={`${messages.favorites.addedPrefix} ${formatDateTime(cat.addedAt, locale, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })}`}
      imageAction={(
        <button
          type="button"
          className={styles.favoriteButton}
          onClick={(event) => {
            event.stopPropagation();
            onToggleFavorite();
          }}
          aria-pressed={isFavorite}
          aria-label={isFavorite ? messages.favoriteButton.remove : messages.favoriteButton.add}
          disabled={isPending}
        >
          <span aria-hidden="true">{isFavorite ? '★' : '☆'}</span>
        </button>
      )}
    />
  );
}
