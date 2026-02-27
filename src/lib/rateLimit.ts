interface Entry {
  count: number;
  resetAt: number;
}

const store = new Map<string, Entry>();
const MAX = parseInt(process.env.RATE_LIMIT_MAX ?? '10', 10);
const WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MS ?? '60000', 10);

// Prune expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now > entry.resetAt) store.delete(key);
  }
}, 5 * 60_000);

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number; // unix ms
}

export function rateLimit(ip: string): RateLimitResult {
  const now = Date.now();
  const entry = store.get(ip);

  if (!entry || now > entry.resetAt) {
    store.set(ip, { count: 1, resetAt: now + WINDOW });
    return { success: true, limit: MAX, remaining: MAX - 1, reset: now + WINDOW };
  }

  if (entry.count >= MAX) {
    return { success: false, limit: MAX, remaining: 0, reset: entry.resetAt };
  }

  entry.count++;
  return { success: true, limit: MAX, remaining: MAX - entry.count, reset: entry.resetAt };
}
