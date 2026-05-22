const preloadedImages = new Set<string>();
const loadedImages = new Set<string>();
const loadedImageElements = new Map<string, HTMLImageElement>();
const MAX_MEMORY_CACHED_IMAGES = 64;

export type ImageDimensions = {
  width: number;
  height: number;
};

function rememberImageElement(src: string, image: HTMLImageElement) {
  loadedImageElements.delete(src);
  loadedImageElements.set(src, image);

  while (loadedImageElements.size > MAX_MEMORY_CACHED_IMAGES) {
    const oldestSrc = loadedImageElements.keys().next().value;

    if (!oldestSrc) {
      return;
    }

    loadedImageElements.delete(oldestSrc);
    loadedImages.delete(oldestSrc);
    preloadedImages.delete(oldestSrc);
  }
}

export function isImageLoaded(src: string) {
  return loadedImages.has(src);
}

export function getLoadedImageDimensions(src: string): ImageDimensions | null {
  const image = loadedImageElements.get(src);
  const width = image?.naturalWidth ?? 0;
  const height = image?.naturalHeight ?? 0;

  if (width <= 0 || height <= 0) {
    return null;
  }

  return { width, height };
}

export function markImageLoaded(src: string, image?: HTMLImageElement) {
  loadedImages.add(src);
  preloadedImages.add(src);

  if (image) {
    rememberImageElement(src, image);
  }
}

export function preloadImage(src: string) {
  if (typeof window === 'undefined' || preloadedImages.has(src)) {
    return;
  }

  preloadedImages.add(src);

  const image = new window.Image();

  image.onload = () => markImageLoaded(src, image);
  image.onerror = () => markImageLoaded(src, image);
  image.src = src;
}
