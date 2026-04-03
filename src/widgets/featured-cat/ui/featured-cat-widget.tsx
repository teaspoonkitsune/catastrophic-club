'use client';

import Image from 'next/image';
import { useState } from 'react';
import { HttpCatError, toHttpCatError } from '@/shared/lib/http-cat';
import { HttpCatErrorState } from '@/shared/ui/http-cat-error';
import { ToggleFavoriteButton } from '@/features/toggle-favorite';
import styles from './featured-cat-widget.module.css';

type FeaturedCatWidgetProps = {
  id: string;
  imageUrl: string;
  fact: string;
  isAuthenticated?: boolean;
};

export function FeaturedCatWidget({
  id,
  imageUrl,
  fact,
  isAuthenticated = false,
}: FeaturedCatWidgetProps) {
  const [cat, setCat] = useState({
    id,
    imageUrl,
  });
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  async function handleRefreshImage() {
    try {
      setIsRefreshing(true);
      setIsLoadingImage(true);
      setErrorStatus(null);

      const response = await fetch('/api/cat-image', {
        cache: 'no-store',
      });

      if (!response.ok) {
        const payload = (await response.json()) as Partial<{
          error: string;
          status: number;
          catImageUrl: string;
        }>;

        throw new HttpCatError({
          error: payload.error,
          status: payload.status ?? response.status,
          catImageUrl: payload.catImageUrl,
        });
      }

      const nextCat = (await response.json()) as {
        id: string;
        imageUrl: string;
      };

      setCat(nextCat);
    } catch (error) {
      console.error('Failed to refresh cat image', error);
      setErrorStatus(toHttpCatError(error).status);
      setIsLoadingImage(false);
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <section className={styles.wrapper}>
      <div className={styles.imageContainer}>
        {isLoadingImage ? <div className={styles.skeleton} aria-hidden="true" /> : null}

        <Image
          key={cat.id}
          src={cat.imageUrl}
          alt="Кот дня"
          width={400}
          height={400}
          className={styles.image}
          onLoad={() => setIsLoadingImage(false)}
          sizes="(min-width: 1024px) 400px, 90vw"
        />

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.refreshButton}
            onClick={handleRefreshImage}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Обновляем...' : 'Новая картиночка'}
          </button>

          <ToggleFavoriteButton
            id={cat.id}
            imageUrl={cat.imageUrl}
            showOnHover={false}
            isAuthenticated={isAuthenticated}
          />
        </div>
      </div>

      {errorStatus ? (
        <HttpCatErrorState
          compact
          status={errorStatus}
          title="Не удалось обновить картинку"
          description="Сервис котиков ответил ошибкой."
          actionLabel="Скрыть"
          onAction={() => setErrorStatus(null)}
        />
      ) : null}

      <p className={styles.fact}>{fact}</p>
    </section>
  );
}
