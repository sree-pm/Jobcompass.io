import React, { useState, useEffect, useRef, useCallback } from "react";
import { T } from "../common/Theme.js";
import { updateCandidate, req } from "../../lib/cloudflareApi.js";

// DELETE helper ” preserves existing data flow: DELETE /candidates/:id
async function deleteCandidateAccount(id) {
  return req(`/candidates/${id}`, { method: "DELETE" });
}

// â”€â”€ shared input styles matching Stripe Billing spec â”€â”€
const LABEL_STYLE = {
  display: "block",
  fontSize: 12,
  fontWeight: 600,
  color: T.label,
  marginBottom: 6,
  letterSpacing: 0,
  fontFamily: T.sans,
};

const INPUT_BASE = {
  width: "100%",
  height: 44,
  borderRadius: 6,
  border: `1px solid ${T.border}`,
  background: T.card,
  padding: "0 12px",
  fontSize: 14,
  fontFamily: T.sans,
  color: T.text,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function SInput({ label, value, onChange, placeholder, disabled, type = "text" }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom: 16 }}>
      {label && <label style={LABEL_STYLE}>{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => !disabled && onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          ...INPUT_BASE,
          ...(disabled
            ? { background: T.surface, color: T.muted, cursor: "not-allowed" }
            : null),
          ...(focused && !disabled
            ? {
                borderColor: T.blue,
                boxShadow: `0 0 0 3px ${T.focusRing}`,
              }
            : null),
        }}
      />
    </div>
  );
}

// â”€â”€ DELETE confirm modal â”€â”€
function DeleteConfirmModal({ onClose, onConfirm, candidateEmail }) {
  const [typed, setTyped] = useState("");
  const [confirmTick, setConfirmTick] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const canDelete = typed === "DELETE" && confirmTick && !isDeleting;

  const handleDelete = async () => {
    if (!canDelete) return;
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch {
      setIsDeleting(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: T.scrim,
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        zIndex: 999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 12,
          width: 440,
          maxWidth: "100%",
          padding: 28,
          boxShadow: T.shadowFloat,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.text, fontFamily: T.sans, letterSpacing: "-0.01em" }}>
            Delete account &amp; data
          </h3>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: T.muted, lineHeight: 1, padding: "0 0 0 12px" }}
          >
            Ã—
          </button>
        </div>

        <div
          style={{
            background: T.redLight,
            border: `1px solid ${T.redMid}`,
            borderRadius: 8,
            padding: "12px 14px",
            marginBottom: 16,
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: T.red, marginBottom: 4, fontFamily: T.sans }}>This is irreversible</div>
          <div style={{ fontSize: 12, color: T.redDark, lineHeight: 1.5, fontFamily: T.sans }}>
            This will permanently delete <strong>{candidateEmail || "your account"}</strong>, every CV, every application, and your credit history. This uses your right to be forgotten under UK GDPR and cannot be undone.
          </div>
        </div>

        <div style={{ fontSize: 12, color: T.muted, marginBottom: 8, lineHeight: 1.5, fontFamily: T.sans }}>
          To confirm, type{" "}
          <span
            style={{
              fontFamily: T.mono,
              fontWeight: 700,
              color: T.text,
              background: T.surface,
              padding: "1px 6px",
              borderRadius: 4,
              border: `1px solid ${T.border}`,
            }}
          >
            DELETE
          </span>{" "}
          in the box below, tick the acknowledgement, then press Delete.
        </div>

        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.label, letterSpacing: "0.04em", textTransform: "uppercase", marginBottom: 6, fontFamily: T.sans }}>
          Type DELETE to confirm
        </label>
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value.trim())}
          placeholder="DELETE"
          autoFocus
          style={{
            width: "100%",
            background: T.card,
            border: `1px solid ${typed && typed !== "DELETE" ? T.redMid : T.border}`,
            borderRadius: 6,
            height: 44,
            padding: "0 12px",
            fontSize: 14,
            fontFamily: T.mono,
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: T.text,
            outline: "none",
            boxSizing: "border-box",
            marginBottom: 14,
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = typed && typed !== "DELETE" ? T.redMid : T.blue;
            e.currentTarget.style.boxShadow = `0 0 0 3px ${T.focusRing}`;
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = typed && typed !== "DELETE" ? T.redMid : T.border;
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        <label
          style={{
            display: "flex",
            gap: 8,
            alignItems: "flex-start",
            cursor: "pointer",
            marginBottom: 20,
            userSelect: "none",
          }}
        >
          <input type="checkbox" checked={confirmTick} onChange={(e) => setConfirmTick(e.target.checked)} style={{ marginTop: 3, accentColor: T.blue }} />
          <span style={{ fontSize: 12, color: T.text, lineHeight: 1.5, fontFamily: T.sans }}>
            I understand this will <strong>permanently erase</strong> my data under UK GDPR, and I want to continue.
          </span>
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={onClose}
            disabled={isDeleting}
            style={{
              background: T.card,
              color: T.text,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              padding: "0 16px",
              height: 36,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: T.sans,
              cursor: isDeleting ? "not-allowed" : "pointer",
              opacity: isDeleting ? 0.5 : 1,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            disabled={!canDelete}
            style={{
              background: canDelete ? T.red : T.surfaceCool,
              color: canDelete ? T.card : T.hint,
              border: `1px solid ${canDelete ? T.red : T.border}`,
              borderRadius: 6,
              padding: "0 18px",
              height: 36,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: T.sans,
              cursor: !canDelete ? "not-allowed" : "pointer",
              opacity: !canDelete ? 0.9 : 1,
              transition: "all 0.15s",
            }}
          >
            {isDeleting ? "Deleting…" : "Permanently delete my data"}
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsView({ candidate, onUpdateCandidate }) {
  const [form, setForm] = useState({
    fullName: "",
    targetRole: "",
    location: "",
    phone: "",
    rightToWork: "",
    noticePeriod: "",
  });
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error | unsaved
  const [message, setMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const initialRef = useRef(null);
  const debounceRef = useRef(null);
  const isFirstLoad = useRef(true);

  // hydrate from candidate
  useEffect(() => {
    if (candidate) {
      const next = {
        fullName: candidate.full_name || candidate.fullName || "",
        targetRole: candidate.target_role || candidate.targetRole || "",
        location: candidate.location || "",
        phone: candidate.phone || "",
        rightToWork: candidate.right_to_work || candidate.rightToWork || "British Citizen",
        noticePeriod: candidate.notice_period || candidate.noticePeriod || "",
      };
      setForm(next);
      initialRef.current = next;
      isFirstLoad.current = true;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSaveStatus("idle");
      setMessage("");
    }
  }, [candidate]);

  const doSave = useCallback(
    async (payload) => {
      if (!candidate?.id) return;
      setSaveStatus("saving");
      setMessage("");
      try {
        await updateCandidate(candidate.id, payload);
        setSaveStatus("saved");
        setMessage("âœ“ Auto-saved");
        initialRef.current = payload;
        onUpdateCandidate?.();
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (e) {
        setSaveStatus("error");
        setMessage("âœ• Save failed: " + e.message);
      }
    },
    [candidate, onUpdateCandidate]
  );

  // debounced auto-save 800ms via useRef timer + useEffect
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    if (!initialRef.current) return;

    const isDirty = JSON.stringify(form) !== JSON.stringify(initialRef.current);
    if (!isDirty) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      // if we were showing saving/saved, let it settle; otherwise idle
      if (saveStatus !== "saving" && saveStatus !== "saved") setSaveStatus("idle");
      return;
    }

    // mark unsaved immediately, then debounce the actual save
    if (saveStatus !== "saving") setSaveStatus("unsaved");

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSave(form);
    }, 800);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, doSave]);

  const handleManualSave = async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await doSave(form);
  };

  const handleReset = () => {
    if (initialRef.current) setForm({ ...initialRef.current });
    if (debounceRef.current) clearTimeout(debounceRef.current);
  };

  const handleGdprDelete = async () => {
    await deleteCandidateAccount(candidate.id);
    localStorage.removeItem("agentic_cv_uk_token");
    setShowDeleteModal(false);
    window.location.reload();
  };

  const isDirty = initialRef.current ? JSON.stringify(form) !== JSON.stringify(initialRef.current) : false;

  // status pill config
  const pill = (() => {
    if (saveStatus === "saving") {
      return { label: "Saving…", dot: T.blue, bg: T.blueLight, border: T.blueMid, color: T.blue, pulse: true };
    }
    if (saveStatus === "saved") {
      return { label: "Saved âœ“", dot: T.green, bg: T.greenLight, border: T.greenMid, color: T.green, pulse: false };
    }
    if (saveStatus === "error") {
      return { label: "Save failed", dot: T.red, bg: T.redLight, border: T.redMid, color: T.red, pulse: false };
    }
    if (saveStatus === "unsaved" || isDirty) {
      return { label: "Unsaved", dot: T.amber, bg: T.amberLight, border: T.amberMid, color: T.amber, pulse: false };
    }
    return { label: "All saved", dot: T.hint, bg: T.card, border: T.border, color: T.hint, pulse: false };
  })();

  return (
    <div style={{ maxWidth: 1004, margin: "0 auto", padding: "32px 24px 48px", fontFamily: T.sans }}>
      {/* 2-col layout: 640 form + 320 rail */}
      <div style={{ display: "flex", gap: 24, alignItems: "flex-start", flexWrap: "wrap" }}>
        {/* LEFT 640 */}
        <div style={{ flex: "0 0 640px", maxWidth: 640, minWidth: 0, width: "100%" }}>
          {/* header with Profile + pill top-right */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 600, color: T.text, margin: "0 0 4px", letterSpacing: "-0.015em", lineHeight: 1.3, fontFamily: T.sans }}>
                Profile
              </h2>
              <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.5, fontFamily: T.sans }}>Manage your personal information and right to work.
              </p>
            </div>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "5px 12px",
                borderRadius: 999,
                border: `1px solid ${pill.border}`,
                background: pill.bg,
                color: pill.color,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                whiteSpace: "nowrap",
                flexShrink: 0,
                fontFamily: T.sans,
                letterSpacing: "0.02em",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 999,
                  background: pill.dot,
                  display: "inline-block",
                  animation: pill.pulse ? "svPulse 1s ease-in-out infinite" : "none",
                  flexShrink: 0,
                }}
              />
              {pill.label}
            </span>
          </div>

          {/* form card */}
          <div
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: 20,
              boxShadow: T.shadowSm,
            }}
          >
            <SInput label="Full name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} placeholder="Your full name" />

            <SInput label="Email ” cannot be changed here" value={candidate?.email || ""} onChange={() => {}} disabled placeholder="" />

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <SInput label="Target role" value={form.targetRole} onChange={(v) => setForm({ ...form, targetRole: v })} placeholder="e.g. Senior Engineer" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <SInput label="Preferred location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="London / Remote" />
              </div>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <SInput label="Phone number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+44 7xxx xxxxxx" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <SInput label="Notice period" value={form.noticePeriod} onChange={(v) => setForm({ ...form, noticePeriod: v })} placeholder="e.g. 1 month" />
              </div>
            </div>

            <SInput label="Right to work status" value={form.rightToWork} onChange={(v) => setForm({ ...form, rightToWork: v })} placeholder="British Citizen / Settled Status / Skilled Worker" />

            {message && (
              <div
                style={{
                  padding: "8px 12px",
                  borderRadius: 6,
                  background: message.startsWith("âœ“") ? T.greenLight : message.startsWith("âœ•") ? T.redLight : T.surface,
                  color: message.startsWith("âœ“") ? T.green : message.startsWith("âœ•") ? T.red : T.muted,
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 12,
                  border: `1px solid ${message.startsWith("âœ“") ? T.greenMid : message.startsWith("âœ•") ? T.redMid : T.border}`,
                  fontFamily: T.sans,
                }}
              >
                {message}
              </div>
            )}

            {/* Buttons: Save primary T.blue + Reset ghost + hint 12px */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: T.hint, marginRight: "auto", fontFamily: T.sans }}>Auto-save runs as you type. You can also Save manually.</span>
              <button
                onClick={handleReset}
                disabled={!isDirty || saveStatus === "saving"}
                style={{
                  background: T.card,
                  color: T.text,
                  border: `1px solid ${T.border}`,
                  borderRadius: 6,
                  padding: "0 14px",
                  height: 36,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: T.sans,
                  cursor: !isDirty || saveStatus === "saving" ? "not-allowed" : "pointer",
                  opacity: !isDirty || saveStatus === "saving" ? 0.5 : 1,
                  transition: "all 0.15s",
                }}
              >
                Reset
              </button>
              <button
                onClick={handleManualSave}
                disabled={saveStatus === "saving" || !isDirty}
                style={{
                  background: !isDirty || saveStatus === "saving" ? T.disabledBg : T.blue,
                  color: !isDirty || saveStatus === "saving" ? T.hint : T.card,
                  border: `1px solid ${!isDirty || saveStatus === "saving" ? T.border : T.blue}`,
                  borderRadius: 6,
                  padding: "0 18px",
                  height: 36,
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: T.sans,
                  cursor: !isDirty || saveStatus === "saving" ? "not-allowed" : "pointer",
                  boxShadow: !isDirty || saveStatus === "saving" ? "none" : T.shadowSm,
                  opacity: !isDirty || saveStatus === "saving" ? 0.9 : 1,
                  transition: "all 0.15s",
                }}
              >
                {saveStatus === "saving" ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT rail 320 */}
        <div style={{ flex: "0 0 320px", width: 320, display: "flex", flexDirection: "column", gap: 16, minWidth: 0 }}>
          {/* Compliance card (T.surface, 8px) */}
          <div
            style={{
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: 18,
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 8px", color: T.text, fontFamily: T.sans, letterSpacing: "-0.01em" }}>
              UK Compliance
            </h3>
            <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, margin: "0 0 12px", fontFamily: T.sans }}>
              JobCompass never adds age, marital status, gender, nationality, photos or NI numbers to your CV. That keeps it fair and keeps us on the right side of UK law.
            </p>
            <div
              style={{
                padding: "10px 12px",
                background: T.greenLight,
                color: T.green,
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
                border: `1px solid ${T.greenMid}`,
                display: "flex",
                gap: 8,
                alignItems: "center",
                fontFamily: T.sans,
                lineHeight: 1.4,
              }}
            >
              <span style={{ fontSize: 13, flexShrink: 0 }}>âœ“</span>
              <span>UK Equality Act and GDPR safeguards are always on.</span>
            </div>
          </div>

          {/* Danger zone card (white, 1px T.redBorder, 8px, red header T.red) */}
          <div
            style={{
              background: T.card,
              border: `1px solid ${T.redBorder}`,
              borderRadius: 8,
              padding: 18,
            }}
          >
            <h3 style={{ fontSize: 13, fontWeight: 800, margin: "0 0 6px", color: T.red, fontFamily: T.sans }}>Danger zone</h3>
            <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, margin: "0 0 14px", fontFamily: T.sans }}>
              Permanently delete your account and everything in it ” your profile, every CV, every job, every tailored package, and your credits. We'll sign you out straight after.
            </p>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 11, color: T.hint, fontFamily: T.sans }}>You need to type DELETE and tick the box</span>
              <button
                onClick={() => setShowDeleteModal(true)}
                style={{
                  background: T.red,
                  color: T.card,
                  border: `1px solid ${T.red}`,
                  borderRadius: 6,
                  padding: "0 14px",
                  height: 32,
                  fontSize: 12,
                  fontWeight: 700,
                  fontFamily: T.sans,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Delete my data…
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteConfirmModal candidateEmail={candidate?.email} onClose={() => setShowDeleteModal(false)} onConfirm={handleGdprDelete} />
      )}

      <style>{`@keyframes svPulse{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
    </div>
  );
}
