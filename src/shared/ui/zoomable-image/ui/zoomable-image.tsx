'use client';

import Image from 'next/image';
import { useZoomableImage } from '../model/use-zoomable-image';
import styles from './zoomable-image.module.css';

type ZoomableImageProps = {
  src: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
  previewSize?: 'small' | 'medium' | 'large' | 'full';
  previewAspectRatio?: `${number} / ${number}`;
  previewObjectFit?: 'cover' | 'contain';
  children?: React.ReactNode;
  onLoad?: () => void;
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
}: ZoomableImageProps) {
  const { isOpen, scale, open, close, handleWheel } = useZoomableImage();

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
            borderRadius: 8,
            cursor: 'zoom-in',
          }}
          onClick={open}
          onLoad={onLoad}
          sizes="(min-width: 1024px) 25vw, 50vw"
        />

        {children}
      </div>

      {isOpen ? (
        <div
          className={styles.overlay}
          onClick={close}
          onWheel={handleWheel}
          role="presentation"
        >
          <div className={styles.canvas}>
            <Image
              src={src}
              alt={alt}
              fill
              className={styles.fullscreenImage}
              style={{
                transform: `scale(${scale})`,
              }}
              sizes="90vw"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
