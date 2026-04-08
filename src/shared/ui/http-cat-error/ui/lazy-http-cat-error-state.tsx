'use client';

import dynamic from 'next/dynamic';

export const LazyHttpCatErrorState = dynamic(
  () => import('./http-cat-error-state').then((module) => module.HttpCatErrorState),
  { ssr: false },
);
