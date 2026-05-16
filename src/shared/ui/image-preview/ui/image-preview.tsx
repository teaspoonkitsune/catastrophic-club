'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { ImageOff } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import styles from './image-preview.module.css';

type ImagePreviewProps = {
  src: string;
  alt: string;
  className?: string;
  imageClassName?: string;
  imageStyle?: CSSProperties;
  aspectRatio?: `${number} / ${number}`;
  objectFit?: 'cover' | 'contain';
  sizes?: string;
  children?: ReactNode;
  renderAs?: 'button' | 'div';
  rootDataAttributes?: Record<`data-${string}`, string | undefined>;
  loading?: 'eager' | 'lazy';
  fetchPriority?: 'high' | 'low' | 'auto';
  onOpen?: () => void;
  onLoad?: () => void;
};

export function ImagePreview({
  src,
  alt,
  className,
  imageClassName,
  imageStyle,
  aspectRatio,
  objectFit = 'cover',
  sizes = '(min-width: 1024px) 25vw, 50vw',
  children,
  renderAs = 'div',
  rootDataAttributes,
  loading,
  fetchPriority,
  onOpen,
  onLoad,
}: ImagePreviewProps) {
  const { messages } = useI18n();
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const isFailed = failedSrc === src;
  const isLoading = loadedSrc !== src && !isFailed;

  function handleLoad() {
    setLoadedSrc(src);
    setFailedSrc((current) => current === src ? null : current);
    onLoad?.();
  }

  function handleError() {
    setLoadedSrc(src);
    setFailedSrc(src);
  }

  function handleOpen() {
    onOpen?.();
  }

  const content = (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        className={imageClassName}
        style={{
          ...imageStyle,
          objectFit,
          cursor: onOpen ? 'zoom-in' : imageStyle?.cursor,
        }}
        onClick={renderAs === 'div' && onOpen ? handleOpen : undefined}
        onLoad={handleLoad}
        onError={handleError}
        sizes={sizes}
        loading={loading}
        fetchPriority={fetchPriority}
      />

      {isLoading ? <span className={styles.skeleton} aria-hidden="true" /> : null}

      {isFailed ? (
        <span className={styles.errorState} aria-hidden="true">
          <ImageOff className={styles.errorIcon} />
          <span>{messages.images.unavailable}</span>
        </span>
      ) : null}

      {children}
    </>
  );

  const rootClassName = `${styles.preview}${className ? ` ${className}` : ''}`;
  const rootStyle = aspectRatio ? { aspectRatio } : undefined;
  const dataAttributes = rootDataAttributes ?? {};

  if (renderAs === 'button') {
    return (
      <button
        type="button"
        className={rootClassName}
        data-loading={isLoading ? 'true' : 'false'}
        data-error={isFailed ? 'true' : 'false'}
        onClick={onOpen ? handleOpen : undefined}
        aria-label={`${messages.images.openImageWithAlt} ${alt}`}
        style={rootStyle}
        {...dataAttributes}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={rootClassName}
      data-loading={isLoading ? 'true' : 'false'}
      data-error={isFailed ? 'true' : 'false'}
      style={rootStyle}
      {...dataAttributes}
    >
      {content}
    </div>
  );
}
