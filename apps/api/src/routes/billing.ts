import { Hono } from "hono";
import { z } from "zod";
import { Env } from "../lib/types.js";
import { getCreditBalance, listCreditTransactions, addCredits } from "../lib/credits.js";
import { sendReceiptEmail } from "../lib/email.js";

const app = new Hono<{ Bindings: Env }>();

export const CREDIT_PACKS = [
  { id: "pack_starter", name: "Starter Pack", credits: 100, priceGbp: 10.0, pricePence: 1000, perApp: "£0.10", badge: "Popular" },
  { id: "pack_active", name: "Active Searcher", credits: 250, priceGbp: 25.0, pricePence: 2500, perApp: "£0.10", badge: "Best Value" },
  { id: "pack_power", name: "Power Pack", credits: 500, priceGbp: 50.0, pricePence: 5000, perApp: "£0.10", badge: "Maximum Search" },
];

const CheckoutSchema = z.object({
  candidateId: z.string().min(1),
  packId: z.enum(["pack_starter", "pack_active", "pack_power"]),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

// GET /billing/packs
app.get("/packs", (c) => c.json({ packs: CREDIT_PACKS }));

// GET /billing/balance?candidateId=xxx
app.get("/balance", async (c) => {
  const candidateId = c.req.query("candidateId");
  if (!candidateId) return c.json({ error: "candidateId required" }, 400);

  const balance = await getCreditBalance(c.env.DB, candidateId);
  const transactions = await listCreditTransactions(c.env.DB, candidateId, 15);
  return c.json({ candidateId, balance, transactions, packs: CREDIT_PACKS });
});

// POST /billing/checkout — create Stripe checkout session (or sandbox simulation if no key)
app.post("/checkout", async (c) => {
  const b = await c.req.json();
  const parsed = CheckoutSchema.safeParse(b);
  if (!parsed.success) return c.json({ error: "Validation failed", issues: parsed.error.issues }, 400);

  const { candidateId, packId } = parsed.data;
  const pack = CREDIT_PACKS.find(p => p.id === packId)!;

  const stripeKey = c.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    if (c.env.ENVIRONMENT !== 'development') {
      return c.json({ error: 'Billing not configured — contact support' }, 503);
    }
    // Sandbox / Mock Checkout for local development — dev only
    const mockSessionId = `mock_cs_${crypto.randomUUID()}`;
    await addCredits(c.env.DB, candidateId, pack.credits, "purchase", `Purchased ${pack.name} (${pack.credits} credits) [Dev Sandbox]`, mockSessionId);
    const newBal = await getCreditBalance(c.env.DB, candidateId);
    return c.json({
      url: `${parsed.data.successUrl || "http://localhost:5173"}?payment=success&pack=${packId}`,
      sessionId: mockSessionId,
      sandbox: true,
      balance: newBal,
      message: `[Dev Mode] Automatically credited ${pack.credits} credits.`,
    });
  }

  // Real Stripe Checkout API Call
  try {
    const params = new URLSearchParams({
      "payment_method_types[0]": "card",
      "mode": "payment",
      "line_items[0][price_data][currency]": "gbp",
      "line_items[0][price_data][unit_amount]": pack.pricePence.toString(),
      "line_items[0][price_data][product_data][name]": `Agentic CV UK: ${pack.name} (${pack.credits} Credits)`,
      "line_items[0][price_data][product_data][description]": `${pack.credits} tailoring & application dossiers. Credits never expire.`,
      "line_items[0][quantity]": "1",
      "client_reference_id": candidateId,
      "metadata[candidate_id]": candidateId,
      "metadata[pack_id]": packId,
      "metadata[credits]": pack.credits.toString(),
      "success_url": parsed.data.successUrl || "http://localhost:5173?session_id={CHECKOUT_SESSION_ID}",
      "cancel_url": parsed.data.cancelUrl || "http://localhost:5173",
    });

    const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${stripeKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      return c.json({ error: "Stripe error: " + errText }, 500);
    }

    const session: any = await res.json();
    return c.json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    return c.json({ error: "Failed to initialize checkout: " + err.message }, 500);
  }
});

// POST /billing/webhook — handle Stripe checkout fulfillment (signature-verified)
app.post("/webhook", async (c) => {
  const payload = await c.req.text();
  const sig = c.req.header("stripe-signature");
  const webhookSecret = c.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET not configured — rejecting webhook");
    return c.json({ error: "Webhook not configured" }, 500);
  }
  if (!sig) return c.json({ error: "Missing stripe-signature header" }, 400);

  // Parse Stripe signature header: t=timestamp,v1=signature1,v1=signature2,...
  const parts = Object.fromEntries(
    sig.split(",").map(p => {
      const [k, ...v] = p.split("=");
      return [k.trim(), v.join("=")];
    })
  );
  const timestamp = parts["t"];
  const expectedSig = parts["v1"];
  if (!timestamp || !expectedSig) return c.json({ error: "Malformed signature" }, 400);

  // Reject stale timestamps (>5 minutes)
  const age = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
  if (isNaN(age) || age > 300 || age < -60) return c.json({ error: "Timestamp outside tolerance" }, 400);

  // Compute HMAC-SHA256
  const signedPayload = `${timestamp}.${payload}`;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(signedPayload));
  const computed = Array.from(new Uint8Array(mac)).map(b => b.toString(16).padStart(2, "0")).join("");

  if (computed !== expectedSig) {
    console.error("Stripe webhook signature mismatch");
    return c.json({ error: "Invalid signature" }, 400);
  }

  // Signature verified — process event
  let event: any;
  try {
    event = JSON.parse(payload);
  } catch {
    return c.json({ error: "Invalid JSON payload" }, 400);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data?.object;
    const candidateId = session?.client_reference_id || session?.metadata?.candidate_id;
    const credits = parseInt(session?.metadata?.credits || "0", 10);
    const packId = session?.metadata?.pack_id || "pack_custom";

    if (candidateId && credits > 0) {
      // Idempotency: Stripe may redeliver same session.id — guard on reference_id unique index
      try {
        const existing: any = await c.env.DB.prepare("SELECT id FROM credit_transactions WHERE reference_id = ? LIMIT 1").bind(session.id).first();
        if (existing) {
          console.log(`webhook idempotent hit for session ${session.id} — already credited`);
        } else {
          await addCredits(c.env.DB, candidateId, credits, "purchase", `Stripe Purchase: ${packId} (+${credits} credits)`, session.id);
        }
      } catch (e: any) {
        // If unique index violation races, treat as idempotent success
        if (/UNIQUE|reference_id/i.test(String(e?.message || ""))) {
          console.log(`webhook idempotent race for ${session.id}`);
        } else throw e;
      }
      // Send receipt email (non-blocking — never fail the webhook over email)
      try {
        const cand: any = await c.env.DB.prepare("SELECT email, full_name FROM candidates WHERE id = ?").bind(candidateId).first();
        if (cand?.email) {
          const pack = CREDIT_PACKS.find(p => p.id === packId);
          await sendReceiptEmail(cand.email, pack?.name || packId, credits, pack?.priceGbp || 0, c.env as any);
        }
      } catch (e: any) {
        console.error("Receipt email failed (webhook unaffected):", e?.message);
      }
    }
  }

  return c.json({ received: true });
});

export default app;
