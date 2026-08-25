import { Context, Next } from "hono";
import { Env } from "./types.js";

interface RateLimitConfig {
  windowSeconds: number;
  maxRequests: number;
}

/**
 * Cloudflare KV-backed rate limiter using token bucket / rolling window.
 * Gracefully degrades if KV is unavailable in local dev.
 */
export function rateLimiter(config: RateLimitConfig) {
  return async (c: Context<{ Bindings: Env }>, next: Next) => {
    const kv = c.env.CACHE;
    if (!kv) return next();

    // Identify client by IP or API Key
    const clientIp = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown";
    const apiKey = c.req.header("x-api-key") || "";
    const key = `ratelimit:${apiKey ? `key:${apiKey}` : `ip:${clientIp}`}:${c.req.path}`;

    try {
      const current = await kv.get(key);
      const count = current ? parseInt(current, 10) : 0;

      if (count >= config.maxRequests) {
        return c.json(
          {
            error: "Rate limit exceeded. Please wait before making more requests.",
            retryAfterSeconds: config.windowSeconds,
          },
          429
        );
      }

      await kv.put(key, (count + 1).toString(), { expirationTtl: config.windowSeconds });
    } catch {
      // If KV fails (e.g. dev mode without KV setup), proceed without blocking
    }

    return next();
  };
}
