'use client';

import type { FavoriteCatRecord } from '@/entities/favorite-cat';
import { FavoriteCatCard } from '@/entities/favorite-cat';
import styles from './favorites-grid.module.css';

type FavoritesGridProps = {
  cats: FavoriteCatRecord[];
  onRemove: (id: string) => void;
};

export function FavoritesGrid({ cats, onRemove }: FavoritesGridProps) {
  return (
    <div className={styles.grid}>
      {cats.map((cat) => (
        <FavoriteCatCard key={cat.id} cat={cat} onRemove={onRemove} />
      ))}
    </div>
  );
}
