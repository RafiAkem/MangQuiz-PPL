import rateLimit from "express-rate-limit";
import type { Response } from "express";

// Rate limiter for Gemini AI question generation
// Strict limit to protect API costs
export const geminiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 5, // 5 requests per minute
  message: {
    error: "Too many AI requests. Please wait a minute before generating more questions.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Use default keyGenerator which properly handles IPv6
  // The library handles X-Forwarded-For automatically when trustProxy is set
  validate: { xForwardedForHeader: false }, // Disable validation warning for proxied environments
  handler: (_req, res: Response) => {
    res.status(429).json({
      error: "Too many AI requests. Please wait a minute before generating more questions.",
      retryAfter: 60,
    });
  },
});

// Rate limiter for room listing (prevent scraping)
export const roomsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 30, // 30 requests per minute
  message: {
    error: "Too many requests. Please slow down.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiter for room creation (prevent spam)
export const createRoomLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 10, // 10 rooms per minute
  message: {
    error: "Too many rooms created. Please wait before creating another.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// General API rate limiter
export const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 100, // 100 requests per minute
  message: {
    error: "Too many requests. Please slow down.",
    retryAfter: 60,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
