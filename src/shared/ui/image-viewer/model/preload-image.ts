const preloadedImages = new Set<string>();

export function preloadImage(src: string) {
  if (typeof window === 'undefined' || preloadedImages.has(src)) {
    return;
  }

  preloadedImages.add(src);

  const image = new window.Image();
  image.src = src;
}
