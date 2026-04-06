'use client';

import { ToggleFavoriteButton } from '@/features/toggle-favorite';
import { ZoomableImage } from '@/shared/ui/zoomable-image';
import type { BattleCatRecord } from '../model/types';
import styles from './battle-cat-card.module.css';

type BattleCatCardProps = {
  cat: BattleCatRecord;
  galleryItems?: string[];
  onImageOpen?: () => void;
  onVote: (id: string) => void;
  disabled?: boolean;
  isAuthenticated?: boolean;
};

export function BattleCatCard({
  cat,
  galleryItems,
  onImageOpen,
  onVote,
  disabled = false,
  isAuthenticated = false,
}: BattleCatCardProps) {
  return (
    <article className={styles.card}>
      <ZoomableImage
        src={cat.imageUrl}
        alt="Котик для битвы"
        previewSize="full"
        galleryItems={galleryItems}
        onOpen={onImageOpen}
      >
        <ToggleFavoriteButton
          id={cat.id}
          imageUrl={cat.imageUrl}
          isAuthenticated={isAuthenticated}
        />
      </ZoomableImage>

      <div className={styles.footer}>
        <p className={styles.score}>Очки: {cat.score}</p>
        <button
          type="button"
          className={styles.voteButton}
          onClick={() => onVote(cat.id)}
          disabled={disabled}
        >
          Победа этому коту
        </button>
      </div>
    </article>
  );
}
