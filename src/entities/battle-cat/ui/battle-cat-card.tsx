'use client';

import { ToggleFavoriteButton } from '@/features/toggle-favorite';
import { GalleryImage } from '@/shared/ui/gallery-image';
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
      <GalleryImage
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
      </GalleryImage>

      <div className={styles.footer}>
        <p className={styles.score}>Очки: {cat.score}</p>
        <button
          type="button"
          className={styles.voteButton}
          onClick={() => onVote(cat.id)}
          disabled={disabled || !isAuthenticated}
        >
          {isAuthenticated ? 'Победа этому коту' : 'Войдите, чтобы голосовать'}
        </button>
      </div>
    </article>
  );
}
