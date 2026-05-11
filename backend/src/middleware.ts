import rateLimit from 'express-rate-limit';

/** General read-only rate limit: 120 requests / minute */
export const readLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Anfragen – bitte kurz warten.' },
});

/** Stricter limit for write operations: 30 requests / minute */
export const writeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Zu viele Anfragen – bitte kurz warten.' },
});
