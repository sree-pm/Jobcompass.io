import React, { useState, useMemo, useEffect, useRef } from "react";
import { T } from "../common/Theme.js";
import { createCheckoutSession } from "../../lib/cloudflareApi.js";
// Stripe pricing table spec: overlay #061b31@40% + blur 8px, card 640px/12px/shadowFloat rgba(50,50,93,0.25), mono JetBrains Mono, hover #4434d4

const PACKS = [
  {
    id: "pack_starter",
    tier: "Starter",
    label: "Starter",
    credits: 100,
    price: "£10",
    priceNum: 10,
    perApp: "£0.10 / app",
    badgeBg: "#efeaff",
    badgeColor: "#533afd",
  },
  {
    id: "pack_active",
    tier: "Active",
    label: "Active",
    credits: 250,
    price: "£25",
    priceNum: 25,
    perApp: "£0.10 / app",
    badgeBg: "#ecfdf5",
    badgeColor: "#0e9f6e",
  },
  {
    id: "pack_power",
    tier: "Power",
    label: "Power",
    credits: 500,
    price: "£50",
    priceNum: 50,
    perApp: "£0.10 / app",
    badgeBg: "#eef2ff",
    badgeColor: "#5e6ad2",
  },
];

function isDevEnvironment() {
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
  const overlayRef = useRef(null);
  const cardRef = useRef(null);
  const closeBtnRef = useRef(null);
  const firstPackRef = useRef(null);

  // focus trap + keyboard nav
  useEffect(() => {
    const prevActive = document.activeElement;
    // focus close button on open
    requestAnimationFrame(() => closeBtnRef.current?.focus());

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose?.();
        return;
      }
      // arrow nav between packs
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        const idx = PACKS.findIndex((p) => p.id === selectedPack);
        if (idx === -1) return;
        e.preventDefault();
        const dir = e.key === "ArrowRight" ? 1 : -1;
        const nextIdx = (idx + dir + PACKS.length) % PACKS.length;
        setSelectedPack(PACKS[nextIdx].id);
        // move focus to newly selected card
        const cards = cardRef.current?.querySelectorAll('[data-pack-card]');
        cards?.[nextIdx]?.focus();
        return;
      }
      // focus trap: Tab / Shift+Tab
      if (e.key === "Tab" && cardRef.current) {
        const focusable = cardRef.current.querySelectorAll(
          'button, [href], [tabindex]:not([tabindex="-1"]), input, select, textarea'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    // prevent background scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
      if (prevActive instanceof HTMLElement) prevActive.focus();
    };
  }, [onClose, selectedPack]);

  const handleCheckout = async () => {
    if (isLoading) return;
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
        setMessage(`✓ Credits added! New Balance: ${res.balance}`);
        onPurchased?.(res.balance);
        setTimeout(() => onClose(), 1200);
      }
    } catch (e) {
      setMessage("✕ Error processing checkout: " + (e?.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose?.();
  };

  return (
    <div
      ref={overlayRef}
      onMouseDown={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Buy credits"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(6,27,49,0.40)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        ref={cardRef}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 640,
          maxWidth: "calc(100vw - 32px)",
          background: T.card,
          borderRadius: 12,
          boxShadow: T.shadowFloat,
          border: `1px solid ${T.border}`,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            padding: "20px 24px 16px",
            borderBottom: `1px solid ${T.border}`,
            flexShrink: 0,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 600,
                color: T.text,
                fontFamily: T.sans,
                lineHeight: 1.2,
                letterSpacing: "-0.01em",
              }}
            >
              Buy credits
            </h2>
            <div style={{ marginTop: 4, fontSize: 13, color: T.muted, lineHeight: 1.4 }}>
              {currentBalance} credits available · 1 credit = 1 application
            </div>
          </div>
          <button
            ref={closeBtnRef}
            onClick={onClose}
            aria-label="Close"
            style={{
              width: 32,
              height: 32,
              borderRadius: 999,
              border: `1px solid ${T.border}`,
              background: T.card,
              color: T.muted,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 18,
              lineHeight: 1,
              flexShrink: 0,
              transition: "background 0.15s, border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#f6f9fc";
              e.currentTarget.style.borderColor = T.border;
              e.currentTarget.style.color = T.text;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = T.card;
              e.currentTarget.style.color = T.muted;
            }}
            onFocus={(e) => {
              e.currentTarget.style.outline = `2px solid ${T.blue}`;
              e.currentTarget.style.outlineOffset = "2px";
            }}
            onBlur={(e) => {
              e.currentTarget.style.outline = "none";
            }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, minHeight: 0 }}>
          {/* Pack grid */}
          <div
            role="radiogroup"
            aria-label="Credit packs"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 12,
            }}
          >
            {PACKS.map((pack, idx) => {
              const isSelected = selectedPack === pack.id;
              return (
                <div
                  key={pack.id}
                  ref={idx === 0 ? firstPackRef : undefined}
                  data-pack-card
                  role="radio"
                  aria-checked={isSelected}
                  tabIndex={0}
                  onClick={() => setSelectedPack(pack.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelectedPack(pack.id);
                    }
                  }}
                  style={{
                    position: "relative",
                    background: "#ffffff",
                    borderRadius: 8,
                    padding: "16px 14px",
                    cursor: "pointer",
                    border: isSelected ? `2px solid ${T.blue}` : `1px solid ${T.border}`,
                    boxShadow: isSelected ? `0 0 0 3px rgba(83,58,253,0.12)` : "none",
                    outline: "none",
                    transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
                    display: "flex",
                    flexDirection: "column",
                    gap: 0,
                    minHeight: 148,
                  }}
                  onFocus={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = T.borderStrong;
                      e.currentTarget.style.boxShadow = "0 1px 4px rgba(6,27,49,0.06)";
                    } else {
                      e.currentTarget.style.boxShadow = `0 0 0 3px rgba(83,58,253,0.18)`;
                    }
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = isSelected ? T.blue : T.border;
                    e.currentTarget.style.boxShadow = isSelected ? `0 0 0 3px rgba(83,58,253,0.12)` : "none";
                  }}
                >
                  {isSelected && (
                    <span
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        width: 20,
                        height: 20,
                        borderRadius: 999,
                        background: T.blue,
                        color: "#fff",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 800,
                        lineHeight: 1,
                      }}
                    >
                      ✓
                    </span>
                  )}

                  {/* badge pill */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      alignSelf: "flex-start",
                      padding: "3px 8px",
                      borderRadius: 999,
                      background: pack.badgeBg,
                      color: pack.badgeColor,
                      border: `1px solid ${pack.badgeBg}`,
                      fontSize: 10,
                      fontWeight: 510,
                      letterSpacing: "0.04em",
                      lineHeight: 1,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {pack.label}
                  </span>

                  {/* price */}
                  <div
                    style={{
                      marginTop: 12,
                      fontSize: 32,
                      fontWeight: 700,
                      color: T.text,
                      letterSpacing: "-0.02em",
                      lineHeight: 1,
                      fontFamily: T.sans,
                    }}
                  >
                    {pack.price}
                  </div>

                  {/* credits line */}
                  <div style={{ marginTop: 6, fontSize: 13, color: T.text, fontWeight: 600, lineHeight: 1.2 }}>
                    {pack.credits} credits
                  </div>

                  {/* perApp mono */}
                  <div
                    style={{
                      marginTop: 4,
                      fontSize: 12,
                      fontFamily: T.mono,
                      fontVariantNumeric: "tabular-nums",
                      color: T.muted,
                      lineHeight: 1,
                    }}
                  >
                    {pack.perApp}
                  </div>
                </div>
              );
            })}
          </div>

          {/* inline message */}
          {message && (
            <div
              role="status"
              style={{
                marginTop: 16,
                padding: "10px 12px",
                borderRadius: 8,
                background: message.startsWith("✓") ? T.greenLight : T.redLight,
                border: `1px solid ${message.startsWith("✓") ? T.greenMid : T.redMid}`,
                color: message.startsWith("✓") ? T.green : T.red,
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1.4,
              }}
            >
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: `1px solid ${T.border}`,
            background: T.surface,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            flexShrink: 0,
          }}
        >
          {/* banner */}
          <div
            style={{
              padding: "9px 12px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8,
              border: `1px solid ${devMode ? "#b9b9f9" : "#86efac"}`,
              background: devMode ? "#f0f0ff" : "#ecfdf5",
              color: devMode ? T.blue : T.green,
              lineHeight: 1.4,
            }}
          >
            <span style={{ fontSize: 14, lineHeight: 1 }} aria-hidden="true">
              {devMode ? "🧪" : "🔒"}
            </span>
            <span style={{ flex: 1 }}>
              {devMode ? "Sandbox — no card charged. Credits added instantly." : "Secure Stripe checkout — GBP · Cards, Apple Pay, Google Pay"}
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                padding: "3px 8px",
                borderRadius: 999,
                background: "#fff",
                border: `1px solid ${devMode ? "#b9b9f9" : "#86efac"}`,
                color: devMode ? T.blue : T.green,
                whiteSpace: "nowrap",
              }}
            >
              {devMode ? "🧪 DEV" : "🔒 STRIPE LIVE"}
            </span>
          </div>

          {/* primary CTA */}
          <button
            onClick={handleCheckout}
            disabled={isLoading}
            style={{
              width: "100%",
              height: 44,
              borderRadius: 8,
              border: `1px solid ${T.blue}`,
              background: isLoading ? T.blue : T.blue,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              fontFamily: T.sans,
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              opacity: isLoading ? 0.72 : 1,
              boxShadow: isLoading ? `0 0 0 3px rgba(83,58,253,0.18)` : "none",
              transition: "background 0.15s, box-shadow 0.15s, opacity 0.15s",
              outline: "none",
            }}
            onMouseEnter={(e) => {
              if (isLoading) return;
              e.currentTarget.style.background = T.blueHover;
              e.currentTarget.style.borderColor = T.blueHover;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = T.blue;
              e.currentTarget.style.borderColor = T.blue;
            }}
            onFocus={(e) => {
              e.currentTarget.style.boxShadow = `0 0 0 3px rgba(83,58,253,0.28)`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = isLoading ? `0 0 0 3px rgba(83,58,253,0.18)` : "none";
            }}
          >
            {isLoading ? (devMode ? "Adding credits…" : "Redirecting to Stripe…") : "Continue to checkout →"}
          </button>
          <div style={{ fontSize: 11, color: T.hint, textAlign: "center", lineHeight: 1.4 }}>
            {devMode ? "Dev indicator: API is local — no real payment will be taken." : "You’ll be redirected to Stripe to complete payment in GBP."}
          </div>
        </div>
      </div>

      {/* responsive grid fallback */}
      <style>{`@media (max-width: 560px) { [role="radiogroup"]{ grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}

export default BuyCreditsModal;
