'use client';

import { Star } from 'lucide-react';
import styles from './toggle-favorite-button.module.css';

export type FavoriteButtonSize = 'md' | 'sm';

type FavoriteButtonProps = {
  isFavorite: boolean;
  isLoading: boolean;
  onClick: () => void;
  size?: FavoriteButtonSize;
};

function getButtonClassName(size: FavoriteButtonSize, isFavorite: boolean) {
  if (size === 'sm') {
    return isFavorite
      ? [styles.button, styles.small, styles.active].join(' ')
      : [styles.button, styles.small].join(' ');
  }

  return isFavorite ? [styles.button, styles.active].join(' ') : styles.button;
}

export function FavoriteButton({
  isFavorite,
  isLoading,
  onClick,
  size = 'md',
}: FavoriteButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
      onClick={onClick}
      disabled={isLoading}
      className={getButtonClassName(size, isFavorite)}
    >
      <span
        className={styles.icon}
        aria-hidden="true"
      >
        {isFavorite ? <Star fill="currentColor" /> : <Star />}
      </span>
    </button>
  );
}
