import { Hono } from "hono";
import { z } from "zod";
import type { Env } from "../lib/types.js";
import { initDb } from "../lib/db.js";
import { getCreditBalance } from "../lib/credits.js";
import { sendPinEmail } from "../lib/email.js";

const app = new Hono<{ Bindings: Env }>();

const RequestCodeSchema = z.object({
  email: z.string().email(),
});

const VerifyCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().length(6),
});

/**
 * Generate a 6-digit numeric PIN code
 */
function generatePin(): string {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return String(array[0] % 1000000).padStart(6, "0");
}

/**
 * Hash a PIN via SHA-256 using Web Crypto, returning hex string
 */
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(pin));
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Sign a JWT using HMAC-SHA256 via Web Crypto
 */
async function signJwt(payload: Record<string, any>, secret: string): Promise<string> {
  const header = { alg: "HS256", typ: "JWT" };
  const encoder = new TextEncoder();

  const toBase64Url = (data: string) =>
    btoa(data).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const headerB64 = toBase64Url(JSON.stringify(header));
  const payloadB64 = toBase64Url(JSON.stringify(payload));
  const signingInput = `${headerB64}.${payloadB64}`;

  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(signingInput));
  const sigB64 = toBase64Url(String.fromCharCode(...new Uint8Array(sig)));

  return `${signingInput}.${sigB64}`;
}

/**
 * Verify a JWT and return the payload (or null if invalid)
 */
export async function verifyJwt(token: string, secret: string): Promise<Record<string, any> | null> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, sigB64] = parts;
    const encoder = new TextEncoder();

    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    // Restore base64 padding
    const fromBase64Url = (s: string) => {
      const padded = s.replace(/-/g, "+").replace(/_/g, "/");
      const pad = padded.length % 4;
      return pad ? padded + "=".repeat(4 - pad) : padded;
    };

    const sigBytes = Uint8Array.from(atob(fromBase64Url(sigB64)), (c) => c.charCodeAt(0));
    const signingInput = `${headerB64}.${payloadB64}`;

    const valid = await crypto.subtle.verify("HMAC", key, sigBytes, encoder.encode(signingInput));
    if (!valid) return null;

    const payload = JSON.parse(atob(fromBase64Url(payloadB64)));

    // Check expiry
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;

    return payload;
  } catch {
    return null;
  }
}

// POST /auth/request-code — send a 6-digit PIN to the user's email
app.post("/request-code", async (c) => {
  try {
  const b = await c.req.json();
  const parsed = RequestCodeSchema.safeParse(b);
  if (!parsed.success) return c.json({ error: "Valid email required", issues: parsed.error.issues }, 400);

  const { email } = parsed.data;
  const kv = c.env.CACHE;
  if (!kv) { console.error("[Auth] CACHE missing"); return c.json({ error: "Service temporarily unavailable" }, 500); }

  // Rate limit: max 3 requests per email per 10 minutes — check BEFORE storing PIN
  const rateLimitKey = `auth:rate:${email.toLowerCase()}`;
  const rateCount = parseInt((await kv.get(rateLimitKey)) || "0", 10);
  if (rateCount >= 3) {
    return c.json({ error: "Too many code requests. Please wait 10 minutes." }, 429);
  }
  await kv.put(rateLimitKey, (rateCount + 1).toString(), { expirationTtl: 600 });

  const pin = generatePin();

  // Hash PIN via SHA-256 using Web Crypto and store hash in KV with 10-minute TTL
  const pinHash = await hashPin(pin);
  const kvKey = `auth:pin:${email.toLowerCase()}`;
  await kv.put(kvKey, pinHash, { expirationTtl: 600 }); // 10 minutes

  // Send the PIN via Cloudflare Email Sending (noreply@jobcompass.io)
  const env = c.env.ENVIRONMENT || "production";
  const emailResult = await sendPinEmail(email, pin, c.env as any);
  if (!emailResult.sent) {
    const domain = email.split("@")[1] || "unknown";
    console.error(`[Auth] PIN email failed for domain ${domain}: ${emailResult.error}`);
    if (env !== "development") {
      await kv.delete(kvKey);
      return c.json({ error: "Could not send verification email. Please try again." }, 500);
    }
  }

  const response: any = {
    ok: true,
    message: `Verification code sent to ${email}. Check your inbox.`,
    expiresInSeconds: 600,
  };

  // In dev mode (or when email delivery is unavailable in dev), include the code directly
  if (env === "development" && !emailResult.sent) {
    response.devCode = pin;
    response.message = `[Dev Mode — email unavailable] Your code is: ${pin}`;
  }

  return c.json(response);
  } catch (e: any) {
    console.error("[Auth] request-code unhandled:", e?.message);
    return c.json({ error: "Service temporarily unavailable — please retry" }, 500);
  }
});

// POST /auth/verify-code — verify PIN and return JWT
app.post("/verify-code", async (c) => {
  const b = await c.req.json();
  const parsed = VerifyCodeSchema.safeParse(b);
  if (!parsed.success) return c.json({ error: "Valid email and 6-digit code required" }, 400);

  const { email, code } = parsed.data;
  const kv = c.env.CACHE;
  const kvKey = `auth:pin:${email.toLowerCase()}`;

  const storedPin = await kv.get(kvKey);
  if (!storedPin) return c.json({ error: "Code expired or not requested. Please request a new code." }, 401);
  // Compare hash of incoming code with stored hash, but also accept plain PIN for backward compat
  const codeHash = await hashPin(code);
  const isValid = storedPin === codeHash || storedPin === code;
  if (!isValid) return c.json({ error: "Invalid code. Please try again." }, 401);

  // PIN verified — delete it (single use)
  await kv.delete(kvKey);

  // Look up or create candidate
  await initDb(c.env.DB);
  let candidate: any = await c.env.DB.prepare("SELECT * FROM candidates WHERE email = ?").bind(email.toLowerCase()).first();

  const isNewUser = !candidate;
  if (!candidate) {
    // Auto-create candidate stub — user will complete profile in onboarding
    const id = crypto.randomUUID();
    await c.env.DB.prepare(
      "INSERT INTO candidates (id, email, full_name) VALUES (?, ?, ?)"
    ).bind(id, email.toLowerCase(), "").run();
    candidate = await c.env.DB.prepare("SELECT * FROM candidates WHERE id = ?").bind(id).first();
  }

  // Generate JWT (24-hour expiry)
  const jwtSecret = c.env.JWT_SECRET || c.env.API_KEY || "dev-jwt-secret-change-me";
  const token = await signJwt(
    {
      sub: candidate.id,
      email: email.toLowerCase(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400, // 24 hours
    },
    jwtSecret
  );

  // Get credit balance
  const balance = await getCreditBalance(c.env.DB, candidate.id).catch(() => 0);

  return c.json({
    ok: true,
    token,
    candidate,
    credits: balance,
    isNewUser,
    expiresIn: "24h",
  });
});

// GET /auth/me — validate token and return candidate info
app.get("/me", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) return c.json({ error: "No authorization header" }, 401);

  const token = authHeader.replace(/^Bearer\s+/i, "");
  const jwtSecret = c.env.JWT_SECRET || c.env.API_KEY || "dev-jwt-secret-change-me";
  const payload = await verifyJwt(token, jwtSecret);
  if (!payload) return c.json({ error: "Invalid or expired token" }, 401);

  const candidate: any = await c.env.DB.prepare("SELECT * FROM candidates WHERE id = ?").bind(payload.sub).first();
  if (!candidate) return c.json({ error: "Candidate not found" }, 404);

  const balance = await getCreditBalance(c.env.DB, candidate.id).catch(() => 0);

  return c.json({ candidate, credits: balance });
});

export default app;
