'use client';

import { useEffect, useState } from 'react';
import {
  addFavoriteCatToApi,
  isFavoriteCatInApi,
  removeFavoriteCatFromApi,
} from '@/entities/favorite-cat/api';
import type { FavoriteCatInput } from '@/entities/favorite-cat';
import { InlineAuthActions } from '@/shared/auth/inline-auth-actions';
import { toHttpCatError } from '@/shared/lib/http-cat';
import { HttpCatErrorState } from '@/shared/ui/http-cat-error';
import styles from './toggle-favorite-button.module.css';

type ToggleFavoriteButtonProps = FavoriteCatInput & {
  className?: string;
  size?: 'md' | 'sm';
  showOnHover?: boolean;
  isAuthenticated?: boolean;
};

function getButtonClassName(size: 'md' | 'sm', isFavorite: boolean) {
  if (size === 'sm') {
    return isFavorite
      ? `${styles.button} ${styles.small} ${styles.active}`
      : `${styles.button} ${styles.small}`;
  }

  return isFavorite ? `${styles.button} ${styles.active}` : styles.button;
}

export function ToggleFavoriteButton({
  id,
  imageUrl,
  className,
  size = 'md',
  showOnHover = true,
  isAuthenticated = false,
}: ToggleFavoriteButtonProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsFavorite(false);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadFavoriteState() {
      try {
        setErrorStatus(null);
        const next = await isFavoriteCatInApi(id);

        if (isMounted) {
          setIsFavorite(next);
        }
      } catch (error) {
        console.error('Failed to load favorite state', error);
        setErrorStatus(toHttpCatError(error).status);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadFavoriteState();

    return () => {
      isMounted = false;
    };
  }, [id, isAuthenticated]);

  async function handleClick() {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    try {
      setIsLoading(true);
      setErrorStatus(null);
      setShowAuthPrompt(false);

      if (isFavorite) {
        await removeFavoriteCatFromApi(id);
        setIsFavorite(false);
      } else {
        await addFavoriteCatToApi({ id, imageUrl });
        setIsFavorite(true);
      }
    } catch (error) {
      const httpError = toHttpCatError(error);

      console.error('Failed to toggle favorite', error);

      if (httpError.status === 401) {
        setShowAuthPrompt(true);
        setIsFavorite(false);
      } else {
        setErrorStatus(httpError.status);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const buttonClassName = getButtonClassName(size, isFavorite);
  const rootClassName = className ? `${styles.root} ${className}` : styles.root;

  return (
    <div
      className={rootClassName}
      data-hover-only={showOnHover ? 'true' : 'false'}
    >
      <button
        type="button"
        aria-pressed={isFavorite}
        aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
        onClick={handleClick}
        disabled={isLoading}
        className={buttonClassName}
      >
        ★
      </button>

      {showAuthPrompt ? (
        <div className={styles.authPopup}>
          <p className={styles.authTitle}>Чтобы сохранять котиков, нужно войти.</p>
          <p className={styles.authText}>Войди в аккаунт или создай новый.</p>
          <InlineAuthActions
            className={styles.authActions}
            loginClassName={styles.authLink}
            registerClassName={styles.authLinkAlt}
          />
        </div>
      ) : null}

      {errorStatus ? (
        <div className={styles.errorPopup}>
          <HttpCatErrorState
            compact
            status={errorStatus}
            title="Не удалось сохранить"
            description="Сервер вернул ошибку при работе с избранным."
            actionLabel="Ок"
            onAction={() => setErrorStatus(null)}
          />
        </div>
      ) : null}
    </div>
  );
}
