'use client';

import { useEffect, useState } from 'react';
import {
  addFavoriteCatToApi,
  getCachedFavoriteCatState,
  isFavoriteCatInApi,
  removeFavoriteCatFromApi,
} from '@/entities/favorite-cat/api';
import type { FavoriteCatInput } from '@/entities/favorite-cat';
import { toHttpCatError } from '@/shared/lib/http-cat';

type UseToggleFavoriteOptions = FavoriteCatInput & {
  isAuthenticated?: boolean;
  loadOnMount?: boolean;
  onAuthRequired?: () => void;
};

export function useToggleFavorite({
  id,
  imageUrl,
  isAuthenticated = false,
  loadOnMount = true,
  onAuthRequired,
}: UseToggleFavoriteOptions) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isFavoriteLoaded, setIsFavoriteLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(loadOnMount && isAuthenticated);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    setErrorStatus(null);

    if (!isAuthenticated) {
      setIsFavorite(false);
      setIsFavoriteLoaded(true);
      setIsLoading(false);
      return;
    }

    const cachedState = getCachedFavoriteCatState(id);

    if (cachedState !== undefined) {
      setIsFavorite(cachedState);
      setIsFavoriteLoaded(true);
      setIsLoading(false);
      return;
    }

    setIsFavorite(false);
    setIsFavoriteLoaded(false);

    if (!loadOnMount) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function loadFavoriteStateOnMount() {
      try {
        setIsLoading(true);
        const next = await isFavoriteCatInApi(id);

        if (isMounted) {
          setIsFavorite(next);
          setIsFavoriteLoaded(true);
        }
      } catch (error) {
        console.error('Failed to load favorite state', error);

        if (isMounted) {
          setErrorStatus(toHttpCatError(error).status);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void loadFavoriteStateOnMount();

    return () => {
      isMounted = false;
    };
  }, [id, isAuthenticated, loadOnMount]);

  async function loadFavoriteState(): Promise<boolean | null> {
    if (!isAuthenticated) {
      setIsFavorite(false);
      setIsFavoriteLoaded(true);
      setIsLoading(false);
      return false;
    }

    const cachedState = getCachedFavoriteCatState(id);

    if (cachedState !== undefined) {
      setIsFavorite(cachedState);
      setIsFavoriteLoaded(true);
      setIsLoading(false);
      return cachedState;
    }

    try {
      setErrorStatus(null);
      setIsLoading(true);
      const next = await isFavoriteCatInApi(id);
      setIsFavorite(next);
      setIsFavoriteLoaded(true);
      return next;
    } catch (error) {
      console.error('Failed to load favorite state', error);
      setErrorStatus(toHttpCatError(error).status);
      return null;
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleFavorite() {
    if (!isAuthenticated) {
      onAuthRequired?.();
      return;
    }

    const loadedFavoriteState = isFavoriteLoaded ? isFavorite : await loadFavoriteState();

    if (loadedFavoriteState === null) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorStatus(null);

      if (loadedFavoriteState) {
        await removeFavoriteCatFromApi(id);
        setIsFavorite(false);
      } else {
        await addFavoriteCatToApi({ id, imageUrl });
        setIsFavorite(true);
      }

      setIsFavoriteLoaded(true);
    } catch (error) {
      const httpError = toHttpCatError(error);

      console.error('Failed to toggle favorite', error);

      if (httpError.status === 401) {
        setIsFavorite(false);
        setIsFavoriteLoaded(false);
        onAuthRequired?.();
      } else {
        setErrorStatus(httpError.status);
      }
    } finally {
      setIsLoading(false);
    }
  }

  return {
    errorStatus,
    isFavorite,
    isLoading,
    loadFavoriteState,
    resetError: () => setErrorStatus(null),
    toggleFavorite,
  };
}
