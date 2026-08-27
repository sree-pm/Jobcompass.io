import type { CreditBalanceRow, CreditTransactionRow } from "./types.js";

export const CREDIT_PACKS = [
  { id: "pack_starter", name: "Starter Pack", credits: 100, priceGbp: 10.0, pricePence: 1000, perApp: "£0.10", badge: "Popular" },
  { id: "pack_active", name: "Active Searcher", credits: 250, priceGbp: 25.0, pricePence: 2500, perApp: "£0.10", badge: "Best Value" },
  { id: "pack_power", name: "Power Pack", credits: 500, priceGbp: 50.0, pricePence: 5000, perApp: "£0.10", badge: "Maximum Search" },
];

const DEFAULT_TRIAL_CREDITS = 5;

/**
 * Get or initialize candidate credit balance (default 5 trial credits on first query).
 */
export async function getCreditBalance(db: D1Database, candidateId: string): Promise<number> {
  const row = await db.prepare("SELECT balance FROM credit_balances WHERE candidate_id = ?").bind(candidateId).first<CreditBalanceRow>();
  if (row !== null && row !== undefined) {
    return row.balance;
  }

  // Initialize with 5 trial credits
  await db.prepare("INSERT INTO credit_balances (candidate_id, balance) VALUES (?, ?) ON CONFLICT(candidate_id) DO NOTHING")
    .bind(candidateId, DEFAULT_TRIAL_CREDITS)
    .run();

  await db.prepare("INSERT INTO credit_transactions (id, candidate_id, amount, type, description) VALUES (?, ?, ?, 'grant', ?)")
    .bind(crypto.randomUUID(), candidateId, DEFAULT_TRIAL_CREDITS, "Welcome bonus — 5 free tailoring credits")
    .run();

  return DEFAULT_TRIAL_CREDITS;
}

/**
 * Deduct credits atomically. Throws error if insufficient balance.
 */
export async function deductCredits(
  db: D1Database,
  candidateId: string,
  amount: number,
  description: string,
  referenceId?: string
): Promise<{ success: boolean; newBalance: number }> {
  // Ensure balance row exists (initializes with trial credits if missing)
  await getCreditBalance(db, candidateId);

  const result = await db
    .prepare("UPDATE credit_balances SET balance = balance - ? WHERE candidate_id = ? AND balance >= ?")
    .bind(amount, candidateId, amount)
    .run() as unknown as { meta: { changes: number; rowsWritten?: number }; changes?: number };

  const changes = (result as unknown as { meta?: { changes?: number; rowsWritten?: number }; changes?: number })?.meta?.changes ?? (result as unknown as { meta?: { rowsWritten?: number } })?.meta?.rowsWritten ?? (result as unknown as { changes?: number })?.changes ?? 0;

  if (changes === 0) {
    const current = await db.prepare("SELECT balance FROM credit_balances WHERE candidate_id = ?").bind(candidateId).first<CreditBalanceRow>();
    const available = current?.balance ?? 0;
    throw new Error(`Insufficient credits. Required: ${amount}, Available: ${available}. Please top up your credits.`);
  }

  const txId = crypto.randomUUID();

  await db.prepare("INSERT INTO credit_transactions (id, candidate_id, amount, type, description, reference_id) VALUES (?, ?, ?, 'consume', ?, ?)")
    .bind(txId, candidateId, -amount, description, referenceId || null)
    .run();

  const updated = await db.prepare("SELECT balance FROM credit_balances WHERE candidate_id = ?").bind(candidateId).first<CreditBalanceRow>();

  return { success: true, newBalance: updated!.balance };
}

/**
 * Add credits (purchases or refunds) — atomic via balance = balance + ? and idempotent on reference_id.
 */
export async function addCredits(
  db: D1Database,
  candidateId: string,
  amount: number,
  type: "purchase" | "refund" | "grant",
  description: string,
  referenceId?: string
): Promise<{ success: boolean; newBalance: number }> {
  // Ensure row exists (trial credits) without racing
  await getCreditBalance(db, candidateId);

  // Idempotency: if reference_id already exists, return current balance without double-crediting
  if (referenceId) {
    const existing: any = await db.prepare("SELECT id FROM credit_transactions WHERE reference_id = ? LIMIT 1").bind(referenceId).first();
    if (existing) {
      const cur: any = await db.prepare("SELECT balance FROM credit_balances WHERE candidate_id = ?").bind(candidateId).first();
      return { success: true, newBalance: cur?.balance ?? 0 };
    }
  }

  const txId = crypto.randomUUID();

  // Atomic increment — avoids read-modify-write race (cf. deductCredits:46)
  await db.prepare("INSERT INTO credit_balances (candidate_id, balance, updated_at) VALUES (?, ?, datetime('now')) ON CONFLICT(candidate_id) DO UPDATE SET balance = balance + ?, updated_at = datetime('now')")
    .bind(candidateId, amount, amount)
    .run();

  // Insert transaction — unique partial index on reference_id will block double-insert under race
  try {
    await db.prepare("INSERT INTO credit_transactions (id, candidate_id, amount, type, description, reference_id) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(txId, candidateId, amount, type, description, referenceId || null)
      .run();
  } catch (e: any) {
    // Race: another concurrent add with same reference_id won — revert the atomic increment we just did
    if (referenceId && /UNIQUE|reference_id/i.test(String(e?.message || ""))) {
      await db.prepare("UPDATE credit_balances SET balance = balance - ?, updated_at = datetime('now') WHERE candidate_id = ?").bind(amount, candidateId).run();
      const cur: any = await db.prepare("SELECT balance FROM credit_balances WHERE candidate_id = ?").bind(candidateId).first();
      return { success: true, newBalance: cur?.balance ?? 0 };
    }
    throw e;
  }

  const updated: any = await db.prepare("SELECT balance FROM credit_balances WHERE candidate_id = ?").bind(candidateId).first();
  return { success: true, newBalance: updated?.balance ?? 0 };
}

/**
 * List recent transactions for candidate.
 */
export async function listCreditTransactions(db: D1Database, candidateId: string, limit = 20): Promise<CreditTransactionRow[]> {
  const { results } = await db.prepare("SELECT * FROM credit_transactions WHERE candidate_id = ? ORDER BY created_at DESC LIMIT ?")
    .bind(candidateId, limit)
    .all();
  return results as unknown as CreditTransactionRow[];
}
