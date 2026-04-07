'use client';

import type { FavoriteCatRecord } from '@/entities/favorite-cat';
import { ImagePreview } from '@/shared/ui/image-preview';
import styles from './favorite-cat-card.module.css';

type FavoriteCatCardProps = {
  cat: FavoriteCatRecord;
  onOpen: () => void;
  isFavorite?: boolean;
};

export function FavoriteCatCard({ cat, onOpen, isFavorite = true }: FavoriteCatCardProps) {
  return (
    <ImagePreview
      renderAs="button"
      className={styles.card}
      imageClassName={styles.image}
      src={cat.imageUrl}
      alt="Котик из избранного"
      onOpen={onOpen}
      sizes="(min-width: 1024px) 24vw, (min-width: 640px) 33vw, 90vw"
      rootDataAttributes={{ 'data-favorite': isFavorite ? 'true' : 'false' }}
    >
      {!isFavorite ? <span className={styles.badge}>Убрано из избранного</span> : null}
    </ImagePreview>
  );
}
