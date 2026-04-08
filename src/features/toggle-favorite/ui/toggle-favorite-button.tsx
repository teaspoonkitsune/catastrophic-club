'use client';

import { useEffect, useRef, useState } from 'react';
import type { FavoriteCatInput } from '@/entities/favorite-cat';
import { HttpCatErrorState } from '@/shared/ui/http-cat-error';
import { useToggleFavorite } from '../model/use-toggle-favorite';
import { FavoriteButton, type FavoriteButtonSize } from './favorite-button';
import styles from './toggle-favorite-button.module.css';

type ToggleFavoriteButtonProps = FavoriteCatInput & {
  className?: string;
  size?: FavoriteButtonSize;
  showOnHover?: boolean;
  isAuthenticated?: boolean;
  loadOnMount?: boolean;
};

export function ToggleFavoriteButton({
  id,
  imageUrl,
  className,
  size = 'md',
  showOnHover = true,
  isAuthenticated = false,
  loadOnMount = true,
}: ToggleFavoriteButtonProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [authPromptCatId, setAuthPromptCatId] = useState<string | null>(null);
  const {
    errorStatus,
    isFavorite,
    isLoading,
    loadFavoriteState,
    resetError,
    toggleFavorite,
  } = useToggleFavorite({
    id,
    imageUrl,
    isAuthenticated,
    loadOnMount,
    onAuthRequired: () => setAuthPromptCatId(id),
  });

  useEffect(() => {
    if (authPromptCatId !== id) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (rootRef.current?.contains(event.target as Node)) {
        return;
      }

      setAuthPromptCatId(null);
    }

    document.addEventListener('pointerdown', handlePointerDown);

    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [authPromptCatId, id]);

  function handleClick() {
    setAuthPromptCatId(null);
    void toggleFavorite();
  }

  const rootClassName = className ? [styles.root, className].join(' ') : styles.root;

  return (
    <div
      ref={rootRef}
      className={rootClassName}
      data-hover-only={showOnHover ? 'true' : 'false'}
      onMouseEnter={() => {
        void loadFavoriteState();
      }}
      onFocusCapture={() => {
        void loadFavoriteState();
      }}
    >
      <FavoriteButton
        isFavorite={isFavorite}
        isLoading={isLoading}
        onClick={handleClick}
        size={size}
      />

      {authPromptCatId === id ? (
        <div
          className={styles.authPopup}
          role="status"
        >
          <p className={styles.authTitle}>Нужно войти</p>
          <p className={styles.authText}>Избранное доступно после входа.</p>
        </div>
      ) : null}

      {errorStatus ? (
        <div className={styles.errorPopup}>
          <HttpCatErrorState
            compact
            status={errorStatus}
            title="Не удалось сохранить"
            description="Попробуйте еще раз."
            actionLabel="Ок"
            onAction={resetError}
          />
        </div>
      ) : null}
    </div>
  );
}
