'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useI18n } from '@/shared/i18n';
import { HttpCatError, toHttpCatError } from '@/shared/lib/http-cat';
import { LazyHttpCatErrorState } from '@/shared/ui/http-cat-error';
import { ImageViewer } from '@/shared/ui/image-viewer';
import { ToggleFavoriteButton } from '@/features/toggle-favorite';
import styles from './featured-cat-widget.module.css';

const HOME_CAT_STORAGE_KEY = 'catastrophic-club:home-cat';
const HOME_CAT_TTL_MS = 1000 * 60 * 60;

type FeaturedCatWidgetProps = {
  id: string;
  imageUrl: string;
  fact: string;
  isAuthenticated?: boolean;
};

type StoredHomeCat = {
  id: string;
  imageUrl: string;
  savedAt: number;
};

// The home cat is client-cached briefly to avoid changing on every navigation refresh.
function readStoredCat(): StoredHomeCat | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(HOME_CAT_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<StoredHomeCat>;

    if (
      typeof parsed.id !== 'string'
      || typeof parsed.imageUrl !== 'string'
      || typeof parsed.savedAt !== 'number'
    ) {
      window.localStorage.removeItem(HOME_CAT_STORAGE_KEY);
      return null;
    }

    if (Date.now() - parsed.savedAt > HOME_CAT_TTL_MS) {
      window.localStorage.removeItem(HOME_CAT_STORAGE_KEY);
      return null;
    }

    return {
      id: parsed.id,
      imageUrl: parsed.imageUrl,
      savedAt: parsed.savedAt,
    };
  } catch {
    window.localStorage.removeItem(HOME_CAT_STORAGE_KEY);
    return null;
  }
}

function persistCat(cat: { id: string; imageUrl: string }) {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: StoredHomeCat = {
    ...cat,
    savedAt: Date.now(),
  };

  window.localStorage.setItem(HOME_CAT_STORAGE_KEY, JSON.stringify(payload));
}

export function FeaturedCatWidget({
  id,
  imageUrl,
  fact,
  isAuthenticated = false,
}: FeaturedCatWidgetProps) {
  const { messages } = useI18n();
  const [imageAspectRatio, setImageAspectRatio] = useState<string | null>(null);
  const [cat, setCat] = useState({
    id,
    imageUrl,
  });
  const [isLoadingImage, setIsLoadingImage] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);

  useEffect(() => {
    const storedCat = readStoredCat();

    if (storedCat) {
      if (storedCat.id !== id || storedCat.imageUrl !== imageUrl) {
        setCat({
          id: storedCat.id,
          imageUrl: storedCat.imageUrl,
        });
      }

      setImageAspectRatio(null);
      setIsLoadingImage(true);

      return;
    }

    setCat({ id, imageUrl });
    setImageAspectRatio(null);
    setIsLoadingImage(true);
    persistCat({ id, imageUrl });
  }, [id, imageUrl]);

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

      setImageAspectRatio(null);
      setCat(nextCat);
      persistCat(nextCat);
    } catch (error) {
      console.error('Failed to refresh cat image', error);
      setErrorStatus(toHttpCatError(error).status);
      setIsLoadingImage(false);
    } finally {
      setIsRefreshing(false);
    }
  }

  function handleOpenViewer() {
    setIsViewerOpen(true);
  }

  function handleImageLoad(event: React.SyntheticEvent<HTMLImageElement>) {
    const { naturalWidth, naturalHeight } = event.currentTarget;

    if (naturalWidth > 0 && naturalHeight > 0) {
      setImageAspectRatio(`${naturalWidth} / ${naturalHeight}`);
    }

    setIsLoadingImage(false);
  }

  return (
    <section className={styles.wrapper}>
      <div
        className={styles.imageContainer}
        data-loading={isLoadingImage && !isViewerOpen ? 'true' : 'false'}
      >
        <button
          type="button"
          className={styles.imageButton}
          onClick={handleOpenViewer}
          aria-label={messages.featuredCat.openAria}
          data-ready={imageAspectRatio ? 'true' : 'false'}
          style={imageAspectRatio ? { aspectRatio: imageAspectRatio } : undefined}
        >
          <Image
            key={cat.id}
            src={cat.imageUrl}
            alt={messages.featuredCat.alt}
            width={400}
            height={400}
            className={styles.image}
            loading="eager"
            fetchPriority="high"
            onLoad={handleImageLoad}
            onError={() => setIsLoadingImage(false)}
            sizes="(min-width: 1024px) 400px, 90vw"
          />

          {isLoadingImage && !isViewerOpen ? (
            <div className={styles.skeleton} aria-hidden="true" />
          ) : null}
        </button>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.refreshButton}
            onClick={handleRefreshImage}
            disabled={isRefreshing}
          >
            {isRefreshing ? messages.featuredCat.refreshing : messages.featuredCat.refresh}
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
        <LazyHttpCatErrorState
          compact
          status={errorStatus}
          title={messages.featuredCat.errorTitle}
          description={messages.featuredCat.errorDescription}
          actionLabel={messages.common.hide}
          onAction={() => setErrorStatus(null)}
        />
      ) : null}

      <p className={styles.fact}>{fact}</p>

      {isViewerOpen ? (
        <ImageViewer
          src={cat.imageUrl}
          alt={messages.featuredCat.alt}
          ariaLabel={messages.featuredCat.viewerAria}
          onClose={() => setIsViewerOpen(false)}
        />
      ) : null}
    </section>
  );
}
