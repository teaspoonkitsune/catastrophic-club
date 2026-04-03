export type HttpCatErrorPayload = {
  error: string;
  status: number;
  catImageUrl: string;
};

const FALLBACK_STATUS = 500;

export function normalizeHttpStatus(status?: number): number {
  if (!status || status < 100 || status > 599) {
    return FALLBACK_STATUS;
  }

  return status;
}

export function getHttpCatUrl(status?: number): string {
  return `https://http.cat/${normalizeHttpStatus(status)}.jpg`;
}

export function createHttpCatErrorPayload(
  status: number,
  error: string,
): HttpCatErrorPayload {
  const normalizedStatus = normalizeHttpStatus(status);

  return {
    error,
    status: normalizedStatus,
    catImageUrl: getHttpCatUrl(normalizedStatus),
  };
}

export class HttpCatError extends Error {
  status: number;
  catImageUrl: string;

  constructor(payload: Partial<HttpCatErrorPayload> & { error?: string }) {
    const status = normalizeHttpStatus(payload.status);

    super(payload.error ?? `Request failed with status ${status}`);
    this.name = 'HttpCatError';
    this.status = status;
    this.catImageUrl = payload.catImageUrl ?? getHttpCatUrl(status);
  }
}

export function toHttpCatError(error: unknown, fallbackStatus = 500): HttpCatError {
  if (error instanceof HttpCatError) {
    return error;
  }

  if (error instanceof Error) {
    return new HttpCatError({
      error: error.message,
      status: fallbackStatus,
    });
  }

  return new HttpCatError({
    error: 'Unexpected error',
    status: fallbackStatus,
  });
}
