'use client';

import { useEffect, useState } from 'react';

const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const SCALE_STEP = 0.1;

export function useZoomableImage() {
  const [isOpen, setIsOpen] = useState(false);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setScale(1);
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

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
    setIsOpen(true);
  }

  function close() {
    setIsOpen(false);
    setScale(1);
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();

    setScale((current) => {
      const next = event.deltaY < 0 ? current + SCALE_STEP : current - SCALE_STEP;

      return Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
    });
  }

  return {
    isOpen,
    scale,
    open,
    close,
    handleWheel,
  };
}
