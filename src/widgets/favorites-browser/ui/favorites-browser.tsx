'use client';

import { useState } from 'react';
import { FavoriteCatCard } from '@/entities/favorite-cat';
import { addFavoriteCatToApi, removeFavoriteCatFromApi } from '@/entities/favorite-cat/api';
import type { FavoriteCatRecord } from '@/entities/favorite-cat';
import { useI18n } from '@/shared/i18n';
import { toHttpCatError } from '@/shared/lib/http-cat';
import { LazyHttpCatErrorState } from '@/shared/ui/http-cat-error';
import { FavoritesViewerModal } from './favorites-viewer-modal';
import styles from './favorites-browser.module.css';

type FavoritesBrowserProps = {
  initialCats: FavoriteCatRecord[];
};

export function FavoritesBrowser({ initialCats }: FavoritesBrowserProps) {
  const { messages } = useI18n();
  const [cats] = useState(initialCats);
  const [favoriteState, setFavoriteState] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(initialCats.map((cat) => [cat.id, true])),
  );
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isFavoritePending, setIsFavoritePending] = useState(false);

  const activeCat = activeIndex === null ? null : cats[activeIndex] ?? null;
  const activeIsFavorite = activeCat ? (favoriteState[activeCat.id] ?? true) : false;
  async function handleToggleFavorite(cat: FavoriteCatRecord) {
    try {
      setIsFavoritePending(true);
      setErrorStatus(null);

      if (favoriteState[cat.id] ?? true) {
        await removeFavoriteCatFromApi(cat.id);
        setFavoriteState((current) => ({ ...current, [cat.id]: false }));
      } else {
        await addFavoriteCatToApi({ id: cat.id, imageUrl: cat.imageUrl });
        setFavoriteState((current) => ({ ...current, [cat.id]: true }));
      }
    } catch (error) {
      console.error('Failed to update favorite cat', error);
      setErrorStatus(toHttpCatError(error).status);
    } finally {
      setIsFavoritePending(false);
    }
  }

  function openViewer(index: number) {
    setActiveIndex(index);
  }

  function closeViewer() {
    setActiveIndex(null);
  }

  function showPrevious() {
    setActiveIndex((current) => {
      if (current === null) {
        return current;
      }

      return current === 0 ? cats.length - 1 : current - 1;
    });
  }

  function showNext() {
    setActiveIndex((current) => {
      if (current === null) {
        return current;
      }

      return current === cats.length - 1 ? 0 : current + 1;
    });
  }

  if (errorStatus) {
    return (
      <LazyHttpCatErrorState
        status={errorStatus}
        title={messages.errors.genericTitle}
        description={messages.errors.genericDescription}
        actionLabel={messages.common.hide}
        onAction={() => setErrorStatus(null)}
      />
    );
  }

  if (cats.length === 0) {
    return (
      <p>{messages.favorites.empty}</p>
    );
  }

  return (
    <>
      <div className={styles.grid}>
        {cats.map((cat, index) => (
          <FavoriteCatCard
            key={cat.id}
            cat={cat}
            onOpen={() => openViewer(index)}
            isFavorite={favoriteState[cat.id] ?? true}
          />
        ))}
      </div>

      {activeCat ? (
        <FavoritesViewerModal
          cat={activeCat}
          isFavorite={activeIsFavorite}
          isPending={isFavoritePending}
          hasMultiple={cats.length > 1}
          onClose={closeViewer}
          onPrevious={showPrevious}
          onNext={showNext}
          onToggleFavorite={() => handleToggleFavorite(activeCat)}
        />
      ) : null}
    </>
  );
}
