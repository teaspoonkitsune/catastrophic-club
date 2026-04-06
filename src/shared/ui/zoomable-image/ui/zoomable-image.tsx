'use client';

import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import { useZoomableImage } from '../model/use-zoomable-image';
import styles from './zoomable-image.module.css';

type ZoomableImageProps = {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  previewSize?: 'small' | 'medium' | 'large' | 'full';
  previewAspectRatio?: `${number} / ${number}`;
  previewObjectFit?: 'cover' | 'contain';
  children?: ReactNode;
  onLoad?: () => void;
  galleryItems?: string[];
};

const previewSizeClassName = {
  small: styles.small,
  medium: styles.medium,
  large: styles.large,
  full: styles.full,
};

export function ZoomableImage({
  src,
  alt = '',
  className,
  style,
  previewSize = 'small',
  previewAspectRatio,
  previewObjectFit = 'cover',
  children,
  onLoad,
  galleryItems,
}: ZoomableImageProps) {
  const { isOpen, currentSrc, hasMultiple, open, close, showPrevious, showNext } = useZoomableImage({
    src,
    galleryItems,
  });

  function handlePreviewLoad() {
    onLoad?.();
  }

  return (
    <>
      <div
        className={`${styles.preview} ${previewSizeClassName[previewSize]}`}
        style={previewAspectRatio ? { aspectRatio: previewAspectRatio } : undefined}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className={className}
          style={{
            ...style,
            objectFit: previewObjectFit,
            cursor: 'zoom-in',
          }}
          onClick={open}
          onLoad={handlePreviewLoad}
          sizes="(min-width: 1024px) 25vw, 50vw"
        />

        {children}
      </div>

      {isOpen ? (
        <div className={styles.overlay} onClick={close} role="presentation">
          <button
            type="button"
            className={styles.closeButton}
            onClick={close}
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
                  showPrevious();
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
                  showNext();
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
            aria-label={alt || 'Просмотр изображения'}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={currentSrc} alt={alt} className={styles.fullscreenImage} />
          </div>
        </div>
      ) : null}
    </>
  );
}
