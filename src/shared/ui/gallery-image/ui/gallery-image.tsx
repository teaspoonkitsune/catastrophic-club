'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useI18n } from '@/shared/i18n';
import { ImageViewer } from '@/shared/ui/image-viewer';
import { ImagePreview } from '@/shared/ui/image-preview';
import { useGalleryImage } from '../model/use-gallery-image';
import styles from './gallery-image.module.css';

type GalleryImageProps = {
  src: string;
  alt?: string;
  className?: string;
  style?: CSSProperties;
  previewSize?: 'small' | 'medium' | 'large' | 'full';
  previewAspectRatio?: `${number} / ${number}`;
  previewObjectFit?: 'cover' | 'contain';
  children?: ReactNode;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
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

export function GalleryImage({
  src,
  alt = '',
  className,
  style,
  previewSize = 'small',
  previewAspectRatio,
  previewObjectFit = 'cover',
  children,
  loading,
  fetchPriority,
  onLoad,
  onOpen,
  galleryItems,
}: GalleryImageProps) {
  const { messages } = useI18n();
  const { isOpen, currentSrc, hasMultiple, open, close, showPrevious, showNext } = useGalleryImage({
    src,
    galleryItems,
  });

  function handlePreviewClick() {
    if (onOpen) {
      onOpen();
      return;
    }

    open();
  }

  return (
    <>
      <ImagePreview
        className={`${styles.preview} ${previewSizeClassName[previewSize]}`}
        imageClassName={className}
        imageStyle={style}
        src={src}
        alt={alt}
        aspectRatio={previewAspectRatio}
        objectFit={previewObjectFit}
        onOpen={handlePreviewClick}
        loading={loading}
        fetchPriority={fetchPriority}
        onLoad={onLoad}
      >
        {children}
      </ImagePreview>

      {isOpen && !onOpen ? (
        <ImageViewer
          src={currentSrc}
          alt={alt}
          ariaLabel={alt || messages.images.defaultViewerAria}
          hasMultiple={hasMultiple}
          onClose={close}
          onPrevious={showPrevious}
          onNext={showNext}
        />
      ) : null}
    </>
  );
}
