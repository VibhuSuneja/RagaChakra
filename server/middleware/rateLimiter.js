/**
 * middleware/rateLimiter.js
 * Tiered rate limiting:
 *   - Standard API: 60 requests / minute
 *   - AI endpoints: 10 requests / minute (protects Gemini quota)
 */

const rateLimit = require('express-rate-limit');

const standardLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please wait a moment and try again.',
    retryAfter: 60,
  },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'AI rate limit reached. Please wait before requesting another recommendation.',
    retryAfter: 60,
  },
});

module.exports = { standardLimiter, aiLimiter };
