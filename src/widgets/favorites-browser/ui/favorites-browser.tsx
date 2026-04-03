'use client';

import { useState } from 'react';
import { toHttpCatError } from '@/shared/lib/http-cat';
import { HttpCatErrorState } from '@/shared/ui/http-cat-error';
import type { FavoriteCatRecord } from '@/entities/favorite-cat';
import { removeFavoriteCatFromApi } from '@/entities/favorite-cat/api';
import { FavoritesGrid } from '@/widgets/favorites-grid';

type FavoritesBrowserProps = {
  initialCats: FavoriteCatRecord[];
};

export function FavoritesBrowser({ initialCats }: FavoritesBrowserProps) {
  const [cats, setCats] = useState(initialCats);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  async function handleRemove(id: string) {
    try {
      setErrorStatus(null);
      await removeFavoriteCatFromApi(id);
      setCats((current) => current.filter((cat) => cat.id !== id));
    } catch (error) {
      console.error('Failed to remove favorite cat', error);
      setErrorStatus(toHttpCatError(error).status);
    }
  }

  if (errorStatus) {
    return (
      <HttpCatErrorState
        status={errorStatus}
        title="Не удалось обновить избранное"
        description="Сервер вернул ошибку при удалении котика из избранного."
        actionLabel="Скрыть"
        onAction={() => setErrorStatus(null)}
      />
    );
  }

  if (cats.length === 0) {
    return (
      <p>
        У тебя пока нет избранных котиков. Добавь кого-нибудь со страницы кота
        дня.
      </p>
    );
  }

  return <FavoritesGrid cats={cats} onRemove={handleRemove} />;
}
