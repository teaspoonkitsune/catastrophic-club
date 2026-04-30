'use client';

import { useEffect, useState } from 'react';
import type { ReactNode, SyntheticEvent } from 'react';
import { ImageOff, LoaderCircle } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import { isImageLoaded, markImageLoaded } from '../model/preload-image';
import styles from './image-viewer.module.css';

type ImageViewerProps = {
  src: string;
  alt: string;
  ariaLabel?: string;
  footer?: ReactNode;
  imageAction?: ReactNode;
  hasMultiple?: boolean;
  onClose: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
};

export function ImageViewer({
  src,
  alt,
  ariaLabel,
  footer,
  imageAction,
  hasMultiple = false,
  onClose,
  onPrevious,
  onNext,
}: ImageViewerProps) {
  const { messages } = useI18n();
  const [loadedSrc, setLoadedSrc] = useState<string | null>(() =>
    isImageLoaded(src) ? src : null,
  );
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [delayedLoaderSrc, setDelayedLoaderSrc] = useState<string | null>(null);
  const isFailed = failedSrc === src;
  const isLoaded = loadedSrc === src || isImageLoaded(src);
  const showLoader = delayedLoaderSrc === src && !isLoaded && !isFailed;

  useEffect(() => {
    if (isLoaded) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setDelayedLoaderSrc(src);
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isLoaded, src]);

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    markImageLoaded(src, event.currentTarget);
    setLoadedSrc(src);
    setFailedSrc((current) => current === src ? null : current);
  }

  function handleImageError() {
    setLoadedSrc(src);
    setFailedSrc(src);
  }

  return (
    <div
      className={styles.overlay}
      data-modal-overlay="true"
      onClick={onClose}
      role="presentation"
    >
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label={messages.images.closeViewer}
      >
        x
      </button>

      {hasMultiple ? (
        <>
          <button
            type="button"
            className={`${styles.arrowButton} ${styles.arrowLeft}`}
            onClick={(event) => {
              event.stopPropagation();
              onPrevious?.();
            }}
            aria-label={messages.images.previous}
          >
            {'<'}
          </button>

          <button
            type="button"
            className={`${styles.arrowButton} ${styles.arrowRight}`}
            onClick={(event) => {
              event.stopPropagation();
              onNext?.();
            }}
            aria-label={messages.images.next}
          >
            {'>'}
          </button>
        </>
      ) : null}

      <div
        className={styles.viewer}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? alt ?? messages.images.defaultViewerAria}
      >
        <div
          className={styles.imageFrame}
          data-with-footer={footer ? 'true' : 'false'}
        >
          <div className={styles.imageWrap}>
            {showLoader ? (
              <div className={styles.loadingState} aria-hidden="true">
                <LoaderCircle className={styles.loaderIcon} />
              </div>
            ) : null}
            {isFailed ? (
              <div className={styles.errorState} aria-hidden="true">
                <ImageOff className={styles.errorIcon} />
                <span>{messages.images.unavailable}</span>
              </div>
            ) : null}
            {imageAction && isLoaded && !isFailed ? <div className={styles.imageAction}>{imageAction}</div> : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={src}
              src={src}
              alt={alt}
              className={styles.image}
              data-loaded={isLoaded ? 'true' : 'false'}
              data-error={isFailed ? 'true' : 'false'}
              aria-busy={isLoaded ? undefined : true}
              onLoad={handleImageLoad}
              onError={handleImageError}
            />
          </div>

          {footer ? <div className={styles.footer}>{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
