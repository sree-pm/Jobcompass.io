import React, { useState, useMemo } from "react";
import { T, PACK_BADGE } from "../common/Theme.js";
import { Modal, Row, Btn, Tag } from "../common/UiPrimitives.jsx";
import { createCheckoutSession } from "../../lib/cloudflareApi.js";

const PACKS = [
  {
    id: "pack_starter",
    name: "Starter Pack",
    credits: 100,
    price: "£10",
    priceNum: 10,
    perApp: "£0.10 / app",
    badge: "Most Popular",
    desc: "Ideal for focused active applications across 2–3 target job titles.",
    highlight: false,
  },
  {
    id: "pack_active",
    name: "Active Searcher",
    credits: 250,
    price: "£25",
    priceNum: 25,
    perApp: "£0.10 / app",
    badge: "Best Value",
    desc: "Best for comprehensive weekly market coverage across London & remote UK.",
    highlight: true,
  },
  {
    id: "pack_power",
    name: "Power Pack",
    credits: 500,
    price: "£50",
    priceNum: 50,
    perApp: "£0.10 / app",
    badge: "Maximum Volume",
    desc: "Extensive search with unlimited revisions and full dossier generation.",
    highlight: false,
  },
];

function isDevEnvironment() {
  // dev if localhost hostname or VITE_API_URL points at localhost
  try {
    const apiUrl = (import.meta?.env?.VITE_API_URL || "").toLowerCase();
    const host = typeof window !== "undefined" ? window.location.hostname.toLowerCase() : "";
    if (host === "localhost" || host === "127.0.0.1" || host === "") return true;
    if (apiUrl.includes("localhost") || apiUrl.includes("127.0.0.1")) return true;
    return false;
  } catch {
    return false;
  }
}

export function BuyCreditsModal({ candidateId, currentBalance = 0, onClose, onPurchased }) {
  const [selectedPack, setSelectedPack] = useState("pack_starter");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const devMode = useMemo(() => isDevEnvironment(), []);
  const selected = PACKS.find((p) => p.id === selectedPack);

  const handleCheckout = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const res = await createCheckoutSession(candidateId, selectedPack);
      if (res.sandbox) {
        setMessage(`✓ Sandbox Mode: Successfully added credits! New Balance: ${res.balance}`);
        onPurchased?.(res.balance);
        setTimeout(() => onClose(), 1400);
      } else if (res.url) {
        window.location.href = res.url;
      } else if (typeof res.balance === "number") {
        // some backends return balance directly without redirect
        setMessage(`✓ Credits added! New Balance: ${res.balance}`);
        onPurchased?.(res.balance);
        setTimeout(() => onClose(), 1200);
      }
    } catch (e) {
      setMessage("✕ Error processing checkout: " + e.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal title="Top Up Tailoring Credits" onClose={onClose} maxWidth={600}>
      {/* balance + value prop */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: T.muted, marginBottom: 10, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span>
            Current Balance: <strong style={{ color: T.text }}>🪙 {currentBalance} Credits</strong>
            <span style={{ color: T.hint }}> — 1 Credit = 1 Complete UK Application Dossier</span>
          </span>
        </div>

        {/* Dev vs Stripe indicator */}
        <div
          style={{
            padding: "9px 12px",
            borderRadius: 8,
            fontSize: 12,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: `1px solid ${devMode ? T.yellowMid : T.blueMid}`,
            background: devMode ? T.yellowLight : T.blueLight,
            color: devMode ? T.yellow : T.blue,
            marginBottom: 10,
          }}
        >
          <span style={{ fontSize: 14 }}>{devMode ? "🧪" : "🔒"}</span>
          <span>
            {devMode ? "Dev / Sandbox mode — no card charged. Credits are added instantly." : "Live Stripe checkout — GBP · Cards, Apple Pay, Google Pay"}
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 10,
              fontWeight: 800,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "3px 8px",
              borderRadius: 20,
              background: devMode ? "#fff" : T.card,
              border: `1px solid ${devMode ? T.yellowMid : T.blueMid}`,
              whiteSpace: "nowrap",
            }}
          >
            {devMode ? "DEV" : "STRIPE LIVE"}
          </span>
        </div>

        <div
          style={{
            padding: "8px 12px",
            background: T.greenLight,
            border: `1px solid ${T.greenMid}`,
            borderRadius: 6,
            fontSize: 11,
            color: T.green,
            fontWeight: 600,
            display: "flex",
            gap: 6,
          }}
        >
          <span>✓</span> Prepaid credits never expire · Includes Tailored CV + £ Metric Audit + Cover Letter + A4 PDF
        </div>
      </div>

      {/* pack cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
        {PACKS.map((pack) => {
          const isSelected = selectedPack === pack.id;
          const badgeStyle = PACK_BADGE[pack.badge] || { bg: T.surface, color: T.muted, border: T.border };
          return (
            <div
              key={pack.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPack(pack.id)}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setSelectedPack(pack.id)}
              style={{
                position: "relative",
                border: isSelected ? `2px solid ${T.blue}` : `1px solid ${T.border}`,
                background: isSelected ? "#FFFBF8" : T.card,
                borderRadius: 10,
                padding: "14px 16px",
                cursor: "pointer",
                transition: "all 0.15s ease",
                boxShadow: isSelected ? `0 2px 10px rgba(217,120,87,0.12)` : "none",
                outline: "none",
              }}
            >
              {isSelected && (
                <div
                  style={{
                    position: "absolute",
                    top: 12,
                    right: 12,
                    width: 20,
                    height: 20,
                    borderRadius: 99,
                    background: T.blue,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 800,
                    lineHeight: 1,
                  }}
                >
                  ✓
                </div>
              )}
              <Row justify="space-between" align="center" style={{ paddingRight: isSelected ? 22 : 0 }}>
                <div style={{ flex: 1, minWidth: 0, paddingRight: 12 }}>
                  <Row gap={8} align="center" style={{ flexWrap: "wrap" }}>
                    <span style={{ fontSize: 14, fontWeight: 800, color: T.text }}>{pack.name}</span>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: "0.05em",
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: 20,
                        background: badgeStyle.bg,
                        color: badgeStyle.color,
                        border: `1px solid ${badgeStyle.border}`,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {pack.badge}
                    </span>
                  </Row>
                  <div style={{ fontSize: 11.5, color: T.muted, marginTop: 4, lineHeight: 1.4 }}>{pack.desc}</div>
                </div>

                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontWeight: 800, color: T.text, letterSpacing: "-0.02em" }}>{pack.price}</div>
                  <div style={{ fontSize: 11, color: T.muted, fontWeight: 600 }}>
                    {pack.credits} Credits <span style={{ color: T.hint }}>· {pack.perApp}</span>
                  </div>
                </div>
              </Row>
            </div>
          );
        })}
      </div>

      {message && (
        <div
          style={{
            padding: "10px 12px",
            borderRadius: 8,
            background: message.startsWith("✓") ? T.greenLight : T.redLight,
            border: `1px solid ${message.startsWith("✓") ? T.greenMid : T.redMid}`,
            color: message.startsWith("✓") ? T.green : T.red,
            fontSize: 12,
            fontWeight: 600,
            marginBottom: 14,
          }}
        >
          {message}
        </div>
      )}

      <Row justify="space-between" align="center" style={{ flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 11, color: T.hint, display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 12 }}>{devMode ? "🧪" : "🔒"}</span>
          {devMode ? "Sandbox checkout (dev)" : "Powered by Stripe GBP"}
        </span>
        <Btn variant="primary" size="md" onClick={handleCheckout} disabled={isLoading} style={{ minWidth: 220, justifyContent: "center" }}>
          {isLoading ? (devMode ? "Adding credits…" : "Redirecting to Stripe…") : devMode ? `Add ${selected?.credits} Credits — Sandbox` : `Purchase with Stripe (${selected?.price}) →`}
        </Btn>
      </Row>

      <div style={{ fontSize: 10, color: T.hint, textAlign: "center", marginTop: 10 }}>
        {devMode ? "Dev indicator: API is local — no real payment will be taken." : "Secure checkout — you’ll be redirected to Stripe to complete payment in GBP."}
      </div>
    </Modal>
  );
}
