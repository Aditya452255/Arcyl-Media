const ratesStore = new Map();

/**
 * Sliding window in-memory rate limiter.
 * In a multi-server setup, this logic can easily scale by pointing to Redis.
 */
export class RateLimiter {
  /**
   * Checks rate limit
   * @param {string} key - Unique identifier (e.g. client IP + route)
   * @param {number} limit - Max requests allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} - True if allowed, false if limit exceeded
   */
  static limit(key, limit, windowMs) {
    const now = Date.now();
    if (!ratesStore.has(key)) {
      ratesStore.set(key, [now]);
      return true;
    }

    let timestamps = ratesStore.get(key);
    // Discard timestamps outside sliding window
    timestamps = timestamps.filter((time) => now - time < windowMs);

    if (timestamps.length >= limit) {
      ratesStore.set(key, timestamps);
      return false;
    }

    timestamps.push(now);
    ratesStore.set(key, timestamps);
    return true;
  }
}
