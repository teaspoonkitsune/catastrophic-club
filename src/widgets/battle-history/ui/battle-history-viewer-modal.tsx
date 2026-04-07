'use client';

import dynamic from 'next/dynamic';
import { useEffect } from 'react';
import { ImageViewer } from '@/shared/ui/image-viewer';
import styles from './battle-history.module.css';

const LazyToggleFavoriteButton = dynamic(
  () => import('@/features/toggle-favorite').then((module) => module.ToggleFavoriteButton),
  { ssr: false },
);

type BattleHistoryViewerImage = {
  id: string;
  imageUrl: string;
  alt: string;
};

type BattleHistoryViewerModalProps = {
  images: BattleHistoryViewerImage[];
  activeIndex: number;
  isAuthenticated: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
};

export function BattleHistoryViewerModal({
  images,
  activeIndex,
  isAuthenticated,
  onClose,
  onPrevious,
  onNext,
}: BattleHistoryViewerModalProps) {
  const activeImage = images[activeIndex];
  const hasMultiple = images.length > 1;

  useEffect(() => {
    if (!activeImage) {
      onClose();
    }
  }, [activeImage, onClose]);

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

  if (!activeImage) {
    return null;
  }

  return (
    <ImageViewer
      src={activeImage.imageUrl}
      alt={activeImage.alt}
      ariaLabel="Просмотр котика из истории битв"
      hasMultiple={hasMultiple}
      onClose={onClose}
      onPrevious={onPrevious}
      onNext={onNext}
      imageAction={(
        <div className={styles.viewerFavorite}>
          <LazyToggleFavoriteButton
            id={activeImage.id}
            imageUrl={activeImage.imageUrl}
            isAuthenticated={isAuthenticated}
            showOnHover={false}
          />
        </div>
      )}
    />
  );
}
