'use client';

import { useEffect, useMemo, useState } from 'react';
type UseGalleryImageOptions = {
  src: string;
  galleryItems?: string[];
};

export function useGalleryImage({ src, galleryItems = [] }: UseGalleryImageOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const items = useMemo(() => {
    if (galleryItems.length === 0) {
      return [src];
    }

    return galleryItems.includes(src) ? galleryItems : [src, ...galleryItems.filter((item) => item !== src)];
  }, [galleryItems, src]);
  const [activeIndex, setActiveIndex] = useState(0);

  const hasMultiple = items.length > 1;
  const currentSrc = items[activeIndex] ?? src;

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        return;
      }

      if (hasMultiple && event.key === 'ArrowLeft') {
        event.preventDefault();
        setActiveIndex((current) => (current === 0 ? items.length - 1 : current - 1));
        return;
      }

      if (hasMultiple && event.key === 'ArrowRight') {
        event.preventDefault();
        setActiveIndex((current) => (current === items.length - 1 ? 0 : current + 1));
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasMultiple, isOpen, items.length]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const body = document.body;
    const originalOverflow = body.style.overflow;
    body.style.overflow = 'hidden';

    return () => {
      body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  function open() {
    const initialIndex = items.indexOf(src);
    setActiveIndex(initialIndex >= 0 ? initialIndex : 0);
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
  }

  function showPrevious() {
    if (!hasMultiple) {
      return;
    }

    setActiveIndex((current) => (current === 0 ? items.length - 1 : current - 1));
  }

  function showNext() {
    if (!hasMultiple) {
      return;
    }

    setActiveIndex((current) => (current === items.length - 1 ? 0 : current + 1));
  }

  return {
    isOpen,
    currentSrc,
    hasMultiple,
    open,
    close,
    showPrevious,
    showNext,
  };
}
