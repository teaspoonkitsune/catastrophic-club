type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type ConsumeRateLimitInput = {
  key: string;
  limit: number;
  windowMs: number;
};

type ConsumeRateLimitResult = {
  success: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const buckets = new Map<string, RateLimitBucket>();

function clearExpiredBuckets(now: number) {
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function consumeRateLimit({
  key,
  limit,
  windowMs,
}: ConsumeRateLimitInput): ConsumeRateLimitResult {
  const now = Date.now();
  clearExpiredBuckets(now);

  const currentBucket = buckets.get(key);

  if (!currentBucket || currentBucket.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      success: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (currentBucket.count >= limit) {
    return {
      success: false,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((currentBucket.resetAt - now) / 1000)),
    };
  }

  currentBucket.count += 1;

  return {
    success: true,
    remaining: Math.max(0, limit - currentBucket.count),
    retryAfterSeconds: Math.max(1, Math.ceil((currentBucket.resetAt - now) / 1000)),
  };
}
