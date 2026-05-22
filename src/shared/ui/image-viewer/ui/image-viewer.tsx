'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode, SyntheticEvent } from 'react';
import { ImageOff } from 'lucide-react';
import { useI18n } from '@/shared/i18n';
import {
  getLoadedImageDimensions,
  isImageLoaded,
  markImageLoaded,
  type ImageDimensions,
} from '../model/preload-image';
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

type FittedImageSize = {
  width: number;
  height: number;
};

type MeasuredImage = {
  src: string;
  dimensions: ImageDimensions;
};

function getViewportBounds() {
  if (typeof window === 'undefined') {
    return { maxWidth: 960, maxHeight: 720 };
  }

  const isCompact = window.matchMedia('(max-width: 900px)').matches;

  return {
    maxWidth: window.innerWidth * (isCompact ? 0.92 : 0.8),
    maxHeight: window.innerHeight * (isCompact ? 0.66 : 0.8),
  };
}

function fitImageSize(dimensions: ImageDimensions | null): FittedImageSize | null {
  if (!dimensions) {
    return null;
  }

  const { maxWidth, maxHeight } = getViewportBounds();
  const scale = Math.min(maxWidth / dimensions.width, maxHeight / dimensions.height, 1);

  return {
    width: Math.max(1, Math.round(dimensions.width * scale)),
    height: Math.max(1, Math.round(dimensions.height * scale)),
  };
}

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
  const [visibleSrc, setVisibleSrc] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const [measuredImage, setMeasuredImage] = useState<MeasuredImage | null>(() =>
    getLoadedImageDimensions(src)
      ? { src, dimensions: getLoadedImageDimensions(src) as ImageDimensions }
      : null,
  );
  const [viewportKey, setViewportKey] = useState(0);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const isFailed = failedSrc === src;
  const isLoaded = loadedSrc === src || isImageLoaded(src);
  const imageDimensions = measuredImage?.src === src
    ? measuredImage.dimensions
    : getLoadedImageDimensions(src);
  const fittedSize = fitImageSize(imageDimensions);
  void viewportKey;
  const hasMeasuredSize = Boolean(fittedSize);
  const showMeasuringLoader = !hasMeasuredSize && !isLoaded && !isFailed;
  const showLoader = hasMeasuredSize && !isLoaded && !isFailed;
  const isVisible = visibleSrc === src && isLoaded;

  useEffect(() => {
    if (imageDimensions || isFailed) {
      return;
    }

    let isActive = true;
    let frameId = 0;

    function readNaturalSize() {
      if (!isActive) {
        return;
      }

      const image = imageRef.current;

      if (image?.naturalWidth && image.naturalHeight) {
        setMeasuredImage({
          src,
          dimensions: {
            width: image.naturalWidth,
            height: image.naturalHeight,
          },
        });
        return;
      }

      frameId = window.requestAnimationFrame(readNaturalSize);
    }

    frameId = window.requestAnimationFrame(readNaturalSize);

    return () => {
      isActive = false;
      window.cancelAnimationFrame(frameId);
    };
  }, [imageDimensions, isFailed, src]);

  useEffect(() => {
    function handleResize() {
      setViewportKey((current) => current + 1);
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    let firstFrameId = 0;
    let secondFrameId = 0;

    firstFrameId = window.requestAnimationFrame(() => {
      secondFrameId = window.requestAnimationFrame(() => {
        setVisibleSrc(src);
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrameId);
      window.cancelAnimationFrame(secondFrameId);
    };
  }, [isLoaded, src]);

  function handleImageLoad(event: SyntheticEvent<HTMLImageElement>) {
    markImageLoaded(src, event.currentTarget);
    setMeasuredImage({
      src,
      dimensions: {
        width: event.currentTarget.naturalWidth,
        height: event.currentTarget.naturalHeight,
      },
    });
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
        data-size-known={hasMeasuredSize ? 'true' : 'false'}
        data-loaded={isLoaded ? 'true' : 'false'}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? alt ?? messages.images.defaultViewerAria}
      >
        <div
          className={styles.imageFrame}
          data-with-footer={footer ? 'true' : 'false'}
        >
          <div
            className={styles.imageWrap}
            data-size-known={hasMeasuredSize ? 'true' : 'false'}
            data-loaded={isLoaded ? 'true' : 'false'}
            style={fittedSize ? {
              '--viewer-image-width': `${fittedSize.width}px`,
              '--viewer-image-height': `${fittedSize.height}px`,
            } as CSSProperties : undefined}
          >
            {showMeasuringLoader ? (
              <div className={styles.measuringState} aria-hidden="true" />
            ) : null}
            {showLoader ? (
              <div className={styles.loadingState} aria-hidden="true" />
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
              ref={imageRef}
              src={src}
              alt={alt}
              className={styles.image}
              data-loaded={isLoaded ? 'true' : 'false'}
              data-visible={isVisible ? 'true' : 'false'}
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
