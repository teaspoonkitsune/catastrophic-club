'use client';

import type { FavoriteCatRecord } from '@/entities/favorite-cat';
import { FavoriteCatCard } from '@/entities/favorite-cat';
import styles from './favorites-grid.module.css';

type FavoritesGridProps = {
  cats: FavoriteCatRecord[];
  favoriteState: Record<string, boolean>;
  onOpen: (index: number) => void;
};

export function FavoritesGrid({ cats, favoriteState, onOpen }: FavoritesGridProps) {
  return (
    <div className={styles.grid}>
      {cats.map((cat, index) => (
        <FavoriteCatCard
          key={cat.id}
          cat={cat}
          onOpen={() => onOpen(index)}
          isFavorite={favoriteState[cat.id] ?? true}
        />
      ))}
    </div>
  );
}
