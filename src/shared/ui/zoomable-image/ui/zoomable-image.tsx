'use client';

import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import { ImageViewer } from '@/shared/ui/image-viewer';
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
  onOpen?: () => void;
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
  onOpen,
  galleryItems,
}: ZoomableImageProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const { isOpen, currentSrc, hasMultiple, open, close, showPrevious, showNext } = useZoomableImage({
    src,
    galleryItems,
  });
  const isPreviewLoading = loadedSrc !== src;

  function handlePreviewLoad() {
    setLoadedSrc(src);
    onLoad?.();
  }

  function handlePreviewError() {
    setLoadedSrc(src);
  }

  function handlePreviewClick() {
    if (onOpen) {
      onOpen();
      return;
    }

    open();
  }

  return (
    <>
      <div
        className={`${styles.preview} ${previewSizeClassName[previewSize]}`}
        data-loading={isPreviewLoading ? 'true' : 'false'}
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
          onClick={handlePreviewClick}
          onLoad={handlePreviewLoad}
          onError={handlePreviewError}
          sizes="(min-width: 1024px) 25vw, 50vw"
        />

        {isPreviewLoading ? <span className={styles.skeleton} aria-hidden="true" /> : null}

        {children}
      </div>

      {isOpen && !onOpen ? (
        <ImageViewer
          src={currentSrc}
          alt={alt}
          ariaLabel={alt || 'Просмотр изображения'}
          hasMultiple={hasMultiple}
          onClose={close}
          onPrevious={showPrevious}
          onNext={showNext}
        />
      ) : null}
    </>
  );
}
