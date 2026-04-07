'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
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
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const isLoaded = loadedSrc === src;

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
        aria-label="Закрыть просмотр"
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
            aria-label="Предыдущее фото"
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
            aria-label="Следующее фото"
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
        aria-label={ariaLabel ?? alt ?? 'Просмотр изображения'}
      >
        <div
          className={styles.imageFrame}
          data-with-footer={footer ? 'true' : 'false'}
        >
          <div className={styles.imageWrap}>
            {imageAction ? <div className={styles.imageAction}>{imageAction}</div> : null}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className={styles.image}
              data-loaded={isLoaded ? 'true' : 'false'}
              onLoad={() => setLoadedSrc(src)}
              onError={() => setLoadedSrc(src)}
            />
          </div>

          {footer ? <div className={styles.footer}>{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}
