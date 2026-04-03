'use client';

import type { FavoriteCatRecord } from '@/entities/favorite-cat';
import { ZoomableImage } from '@/shared/ui/zoomable-image';
import styles from './favorite-cat-card.module.css';

type FavoriteCatCardProps = {
  cat: FavoriteCatRecord;
  onRemove: (id: string) => void;
};

export function FavoriteCatCard({ cat, onRemove }: FavoriteCatCardProps) {
  return (
    <article className={styles.card}>
      <ZoomableImage
        src={cat.imageUrl}
        alt="Favorite cat"
        previewSize="full"
      />

      <p className={styles.meta}>
        Добавлен: {new Date(cat.addedAt).toLocaleString()}
      </p>

      <button
        type="button"
        className={styles.action}
        onClick={() => onRemove(cat.id)}
      >
        Убрать из избранного
      </button>
    </article>
  );
}
