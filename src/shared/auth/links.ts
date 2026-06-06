export function buildAuthHref(
  mode: 'login' | 'register' | 'logout',
  returnTo: string,
): string {
  const params = new URLSearchParams({ returnTo });

  return `/api/auth/${mode}?${params.toString()}`;
}

export function sanitizeReturnTo(value: string | null) {
  if (!value || !value.startsWith('/')) {
    return '/';
  }

  // Avoid protocol-relative redirects such as //evil.example.
  if (value.startsWith('//')) {
    return '/';
  }

  return value;
}
