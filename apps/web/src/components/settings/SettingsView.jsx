import React, { useState, useEffect, useRef, useCallback } from "react";
import { T } from "../common/Theme.js";
import { Card, Row, Btn, Field, Modal } from "../common/UiPrimitives.jsx";
import { updateCandidate, req } from "../../lib/cloudflareApi.js";

// ---- GDPR delete helper (tries DELETE /candidates/:id, falls back to req) ----
async function deleteCandidateAccount(id) {
  try {
    return await req(`/candidates/${id}`, { method: "DELETE" });
  } catch (e) {
    throw e;
  }
}

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
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Modal title="Delete account & data — GDPR" onClose={onClose} maxWidth={480}>
      <div
        style={{
          background: T.redLight,
          border: `1px solid ${T.redMid}`,
          borderRadius: 8,
          padding: "12px 14px",
          marginBottom: 16,
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 700, color: T.red, marginBottom: 4 }}>⚠️ This is irreversible</div>
        <div style={{ fontSize: 12, color: "#7f1d1d", lineHeight: 1.5 }}>
          This will permanently delete <strong>{candidateEmail || "your account"}</strong>, all resumes, applications,
          tailored dossiers and credit history. This action exercises your <strong>Right to Erasure (GDPR Art. 17)</strong>{" "}
          and cannot be undone.
        </div>
      </div>

      <div style={{ fontSize: 12, color: T.muted, marginBottom: 8, lineHeight: 1.5 }}>
        To confirm, type <span style={{ fontFamily: T.mono, fontWeight: 700, color: T.text, background: T.surface, padding: "1px 6px", borderRadius: 4 }}>DELETE</span> in the box
        below, tick the acknowledgement, then press Delete.
      </div>

      <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 6 }}>
        Type DELETE to confirm
      </label>
      <input
        value={typed}
        onChange={(e) => setTyped(e.target.value.trim())}
        placeholder="DELETE"
        autoFocus
        style={{
          width: "100%",
          background: T.bg,
          border: `1px solid ${typed && typed !== "DELETE" ? T.redMid : T.border}`,
          borderRadius: 7,
          padding: "10px 13px",
          fontSize: 14,
          fontFamily: T.mono,
          fontWeight: 700,
          letterSpacing: "0.08em",
          color: T.text,
          outline: "none",
          boxSizing: "border-box",
          marginBottom: 14,
        }}
      />

      <label
        style={{
          display: "flex",
          gap: 8,
          alignItems: "flex-start",
          cursor: "pointer",
          marginBottom: 18,
          userSelect: "none",
        }}
      >
        <input type="checkbox" checked={confirmTick} onChange={(e) => setConfirmTick(e.target.checked)} style={{ marginTop: 3 }} />
        <span style={{ fontSize: 12, color: T.text, lineHeight: 1.5 }}>
          I understand this will <strong>permanently erase</strong> my personal data and generated documents under GDPR and I want to proceed.
        </span>
      </label>

      <Row justify="flex-end" gap={10}>
        <Btn variant="ghost" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Btn>
        <Btn variant="danger" onClick={handleDelete} disabled={!canDelete}>
          {isDeleting ? "Deleting…" : "Permanently delete my data"}
        </Btn>
      </Row>
    </Modal>
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
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error
  const [message, setMessage] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // keep initial snapshot to detect real changes
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
      // clear debounce on candidate switch
      if (debounceRef.current) clearTimeout(debounceRef.current);
      setSaveStatus("idle");
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
        setMessage("✓ Auto-saved");
        initialRef.current = payload;
        onUpdateCandidate?.();
        // fade the badge back to idle after 2s
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (e) {
        setSaveStatus("error");
        setMessage("✕ Save failed: " + e.message);
      }
    },
    [candidate, onUpdateCandidate]
  );

  // debounced auto-save whenever form changes (skip first hydration)
  useEffect(() => {
    if (isFirstLoad.current) {
      isFirstLoad.current = false;
      return;
    }
    if (!initialRef.current) return;
    // no change vs last saved → stay idle
    const same =
      JSON.stringify(form) === JSON.stringify(initialRef.current) ||
      (saveStatus === "saving");
    if (same && saveStatus !== "saving") {
      // still schedule if user is typing, but avoid noop saves
      // compare with initialRef to decide; if identical we just reset status
      if (JSON.stringify(form) === JSON.stringify(initialRef.current)) {
        setSaveStatus("idle");
        if (debounceRef.current) clearTimeout(debounceRef.current);
        return;
      }
    }
    setSaveStatus("saving");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSave(form);
    }, 800);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [form, doSave, saveStatus]);

  const handleManualSave = async () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    await doSave(form);
  };

  const handleGdprDelete = async () => {
    await deleteCandidateAccount(candidate.id);
    localStorage.removeItem("agentic_cv_uk_token");
    setShowDeleteModal(false);
    // hard reload to login
    window.location.reload();
  };

  const isDirty = initialRef.current ? JSON.stringify(form) !== JSON.stringify(initialRef.current) : false;

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "24px 0 40px" }}>
      {/* header */}
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: "0 0 6px", letterSpacing: "-0.02em" }}>
          ⚙️ Settings & Compliance
        </h2>
        <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.5 }}>
          Manage your UK profile, privacy preferences, and API configuration. Profile fields auto-save — no need to press Save.
        </p>
      </div>

      {/* profile card */}
      <Card style={{ marginBottom: 16, boxShadow: T.shadowSm }}>
        <Row justify="space-between" align="center" style={{ marginBottom: 14 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: T.text }}>Candidate Profile</h3>
          {/* auto-save indicator */}
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 20,
              border: `1px solid ${saveStatus === "error" ? T.redMid : saveStatus === "saved" ? T.greenMid : T.border}`,
              background: saveStatus === "error" ? T.redLight : saveStatus === "saved" ? T.greenLight : saveStatus === "saving" ? T.surface : T.card,
              color: saveStatus === "error" ? T.red : saveStatus === "saved" ? T.green : saveStatus === "saving" ? T.muted : T.hint,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              minWidth: 90,
              justifyContent: "center",
            }}
          >
            <span
              style={{
                width: 6,
                height: 6,
                borderRadius: 99,
                background: saveStatus === "saving" ? T.yellow : saveStatus === "saved" ? T.green : saveStatus === "error" ? T.red : T.hint,
                display: "inline-block",
                animation: saveStatus === "saving" ? "pulse 1s ease-in-out infinite" : "none",
              }}
            />
            {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved ✓" : saveStatus === "error" ? "Save failed" : isDirty ? "Unsaved changes" : "All saved"}
          </span>
        </Row>

        <Field label="Full Name" value={form.fullName} onChange={(v) => setForm({ ...form, fullName: v })} placeholder="Your full name" />
        {/* Email is immutable — show as disabled */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, color: T.muted, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 5 }}>
            Email (cannot be changed here)
          </div>
          <input
            value={candidate?.email || ""}
            disabled
            style={{
              width: "100%",
              background: T.surface,
              border: `1px solid ${T.border}`,
              borderRadius: 7,
              padding: "9px 13px",
              color: T.muted,
              fontSize: 13,
              fontFamily: T.sans,
              boxSizing: "border-box",
              cursor: "not-allowed",
            }}
          />
        </div>

        <Row gap={12} style={{ alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <Field label="Target Role" value={form.targetRole} onChange={(v) => setForm({ ...form, targetRole: v })} placeholder="e.g. Senior Engineer" />
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Preferred Location" value={form.location} onChange={(v) => setForm({ ...form, location: v })} placeholder="London / Remote" />
          </div>
        </Row>

        <Row gap={12} style={{ alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            <Field label="Phone Number" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} placeholder="+44 7xxx xxxxxx" />
          </div>
          <div style={{ flex: 1 }}>
            <Field label="Notice Period" value={form.noticePeriod} onChange={(v) => setForm({ ...form, noticePeriod: v })} placeholder="e.g. 1 month" />
          </div>
        </Row>

        <Field
          label="Right to Work Status"
          value={form.rightToWork}
          onChange={(v) => setForm({ ...form, rightToWork: v })}
          placeholder="British Citizen / Settled Status / Skilled Worker"
        />

        {message && (
          <div
            style={{
              padding: "8px 12px",
              borderRadius: 6,
              background: message.startsWith("✓") ? T.greenLight : message.startsWith("✕") ? T.redLight : T.surface,
              color: message.startsWith("✓") ? T.green : message.startsWith("✕") ? T.red : T.muted,
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 12,
              border: `1px solid ${message.startsWith("✓") ? T.greenMid : message.startsWith("✕") ? T.redMid : T.border}`,
            }}
          >
            {message}
          </div>
        )}

        <Row justify="flex-end" gap={10} style={{ marginTop: 8 }}>
          <span style={{ fontSize: 11, color: T.hint, marginRight: "auto" }}>
            Auto-save debounced 800 ms · manual save also available
          </span>
          <Btn variant="ghost" size="sm" onClick={() => candidate && setForm({ ...initialRef.current })} disabled={!isDirty || saveStatus === "saving"}>
            Reset
          </Btn>
          <Btn variant="primary" onClick={handleManualSave} disabled={saveStatus === "saving" || !isDirty}>
            {saveStatus === "saving" ? "Saving…" : "Save now"}
          </Btn>
        </Row>
      </Card>

      {/* compliance card */}
      <Card style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 8px", color: T.text }}>UK Compliance (Equality Act 2010 & GDPR)</h3>
        <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.6, margin: "0 0 12px" }}>
          Agentic CV UK strictly prohibits age, marital status, gender, nationality, photos, or NI numbers in résumé patches.
          This prevents discrimination and keeps processing compliant with <strong>ICO</strong> data-privacy regulations. Your
          constraints and locks are the ground truth — the agent never invents facts.
        </p>
        <div style={{ padding: "10px 12px", background: T.greenLight, color: T.green, borderRadius: 8, fontSize: 12, fontWeight: 600, border: `1px solid ${T.greenMid}`, display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 14 }}>✓</span> All Equality Act & GDPR safeguards are actively enforced at the patch layer.
        </div>
      </Card>

      {/* GDPR danger zone */}
      <Card style={{ borderColor: T.redMid, background: "#fff" }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, margin: "0 0 6px", color: T.red }}>Danger zone — GDPR Article 17</h3>
        <p style={{ fontSize: 12, color: T.muted, lineHeight: 1.5, margin: "0 0 14px" }}>
          Permanently delete your account and all associated data (profile, Master CV, applications, tailored dossiers, credits).
          You will be logged out immediately. This exercises your <strong>Right to Erasure</strong>.
        </p>
        <Row justify="space-between" align="center">
          <span style={{ fontSize: 11, color: T.hint }}>Requires typing DELETE + second confirmation</span>
          <Btn variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
            Delete my data…
          </Btn>
        </Row>
      </Card>

      {showDeleteModal && (
        <DeleteConfirmModal
          candidateEmail={candidate?.email}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleGdprDelete}
        />
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.35}}`}</style>
    </div>
  );
}
