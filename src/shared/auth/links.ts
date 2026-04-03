export function buildAuthHref(
  mode: 'login' | 'register' | 'logout',
  returnTo: string,
): string {
  const params = new URLSearchParams({ returnTo });

  return `/api/auth/${mode}?${params.toString()}`;
}
