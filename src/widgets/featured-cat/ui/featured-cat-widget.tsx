'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { ImageOff } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { HttpCatError, toHttpCatError } from '@/shared/lib/http-cat';
import { LazyHttpCatErrorState } from '@/shared/ui/http-cat-error';
import { ImageViewer } from '@/shared/ui/image-viewer';
import { ToggleFavoriteButton } from '@/features/toggle-favorite';
import styles from './featured-cat-widget.module.css';

const loadedImageUrls = new Set<string>();

type FeaturedCatWidgetProps = {
  id: string;
  imageUrl: string;
  fact: string;
  isFallbackImage?: boolean;
  isAuthenticated?: boolean;
};

export function FeaturedCatWidget({
  id,
  imageUrl,
  fact,
  isFallbackImage = false,
  isAuthenticated = false,
}: FeaturedCatWidgetProps) {
  const { messages } = useI18n();
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageAspectRatio, setImageAspectRatio] = useState<string | null>(null);
  const [cat, setCat] = useState({
    id,
    imageUrl,
  });
  const [isLoadingImage, setIsLoadingImage] = useState(!loadedImageUrls.has(imageUrl));
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);
  const isImageFailed = failedImageUrl === cat.imageUrl;

  useEffect(() => {
    setCat({ id, imageUrl });
    setImageAspectRatio(null);
    setIsLoadingImage(!loadedImageUrls.has(imageUrl));
    setFailedImageUrl(null);
  }, [id, imageUrl]);

  useEffect(() => {
    const image = imageRef.current;

    if (!image?.complete || image.naturalWidth <= 0 || image.naturalHeight <= 0) {
      return;
    }

    loadedImageUrls.add(cat.imageUrl);
    setImageAspectRatio(`${image.naturalWidth} / ${image.naturalHeight}`);
    setIsLoadingImage(false);
  }, [cat.imageUrl]);

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
      setIsLoadingImage(!loadedImageUrls.has(nextCat.imageUrl));
      setFailedImageUrl(null);
      setCat(nextCat);
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
      loadedImageUrls.add(cat.imageUrl);
    }

    setFailedImageUrl((current) => current === cat.imageUrl ? null : current);
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
            ref={imageRef}
            key={cat.id}
            src={cat.imageUrl}
            alt={messages.featuredCat.alt}
            width={400}
            height={400}
            className={styles.image}
            loading="eager"
            fetchPriority="high"
            onLoad={handleImageLoad}
            onError={() => {
              setFailedImageUrl(cat.imageUrl);
              setIsLoadingImage(false);
            }}
            sizes="(min-width: 1024px) 400px, 90vw"
          />

          {isLoadingImage && !isViewerOpen ? (
            <div className={styles.skeleton} aria-hidden="true" />
          ) : null}

          {isImageFailed ? (
            <div className={styles.imageErrorState} aria-hidden="true">
              <ImageOff className={styles.imageErrorIcon} />
              <span>{messages.images.unavailable}</span>
            </div>
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

      {isFallbackImage || isImageFailed ? (
        <p className={styles.fallbackNotice}>{messages.featuredCat.fallbackNotice}</p>
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
