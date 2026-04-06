'use client';

import type { FavoriteCatRecord } from '@/entities/favorite-cat';
import styles from './favorite-cat-card.module.css';

type FavoriteCatCardProps = {
  cat: FavoriteCatRecord;
  onOpen: () => void;
  isFavorite?: boolean;
};

export function FavoriteCatCard({ cat, onOpen, isFavorite = true }: FavoriteCatCardProps) {
  return (
    <button
      type="button"
      className={styles.card}
      onClick={onOpen}
      aria-label="Открыть изображение котика"
      data-favorite={isFavorite ? 'true' : 'false'}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={cat.imageUrl} alt="Котик из избранного" className={styles.image} />

      {!isFavorite ? <span className={styles.badge}>Убрано из избранного</span> : null}
    </button>
  );
}
