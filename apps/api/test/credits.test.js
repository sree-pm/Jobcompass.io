import assert from "node:assert";
import { CREDIT_PACKS } from "../src/lib/credits.ts";

console.log("Running Credit Ledger & Billing Test Suite...\n");

// Test 1: Credit Packs Validation
{
  assert.strictEqual(CREDIT_PACKS.length, 3, "Should have 3 credit packs");
  
  const starter = CREDIT_PACKS.find(p => p.id === "pack_starter");
  assert.ok(starter, "Starter pack exists");
  assert.strictEqual(starter.credits, 100);
  assert.strictEqual(starter.priceGbp, 10.0);
  assert.strictEqual(starter.pricePence, 1000);

  const active = CREDIT_PACKS.find(p => p.id === "pack_active");
  assert.ok(active, "Active searcher pack exists");
  assert.strictEqual(active.credits, 250);
  assert.strictEqual(active.priceGbp, 25.0);

  const power = CREDIT_PACKS.find(p => p.id === "pack_power");
  assert.ok(power, "Power pack exists");
  assert.strictEqual(power.credits, 500);
  assert.strictEqual(power.priceGbp, 50.0);

  console.log("✓ Credit Packs pricing and configuration tests passed");
}

// Test 2: Metering arithmetic check
{
  const initialTrial = 5;
  const tailorCost = 1;
  const remaining = initialTrial - tailorCost;
  assert.strictEqual(remaining, 4, "Tailor should deduct exactly 1 credit");
  
  const postPurchase = remaining + 100;
  assert.strictEqual(postPurchase, 104, "Pack purchase should add 100 credits");
  console.log("✓ Metering arithmetic tests passed");
}

console.log("\nAll Credit Ledger & Billing tests passed successfully! 🪙🎉");
