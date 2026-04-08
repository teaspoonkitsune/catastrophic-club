'use client';

import { Star } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
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
  const { messages } = useI18n();

  return (
    <button
      type="button"
      aria-pressed={isFavorite}
      aria-label={isFavorite ? messages.favoriteButton.remove : messages.favoriteButton.add}
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
