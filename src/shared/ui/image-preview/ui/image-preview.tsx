'use client';

import Image from 'next/image';
import { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
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
  onOpen,
  onLoad,
}: ImagePreviewProps) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const isLoading = loadedSrc !== src;

  function handleLoad() {
    setLoadedSrc(src);
    onLoad?.();
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
        onError={() => setLoadedSrc(src)}
        sizes={sizes}
      />

      {isLoading ? <span className={styles.skeleton} aria-hidden="true" /> : null}

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
        onClick={onOpen ? handleOpen : undefined}
        aria-label={`Открыть изображение: ${alt}`}
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
      style={rootStyle}
      {...dataAttributes}
    >
      {content}
    </div>
  );
}
