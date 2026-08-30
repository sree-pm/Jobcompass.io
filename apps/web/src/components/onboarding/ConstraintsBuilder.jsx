import React, { useState, useMemo, useEffect } from "react";
import { T } from "../common/Theme.js";
import { StorageMeter } from "../common/UiPrimitives.jsx";

const CONSTRAINTS_TEMPLATE = `YOUR CV DETAILS — UK

Fill this in once. Be specific about what you DID and DID NOT do.
This is your ground truth — we won't add anything you didn't write.

EMPLOYER 1
──────────────────────────────────────────
Company Name:
Industry & Scale (e.g. B2B FinTech, Series B, 150 staff):
Exact Job Title:
Dates (MM/YYYY – MM/YYYY):
Direct Reports & Team Size:

WHAT YOU ACTUALLY DID (include numbers, money, team size):
• 
• 
• 

WHAT YOU DID NOT DO (this is a hard line):
• 
• 

CONFIDENTIAL (don't name clients or proprietary algorithms):
• 

SKILLS YOU DEFINITELY HAVE:
• 

SKILLS YOU DO NOT HAVE (even if common for your title):
• 
`;

const RTW_OPTIONS = [
  "British Citizen",
  "Irish Citizen",
  "Settled Status",
  "Pre-settled Status",
  "Skilled Worker visa",
  "Graduate visa",
  "Student visa",
  "Health & Care Worker visa",
  "Global Talent visa",
  "Other — requires sponsorship",
];

function buildPreview({ didList, didNotList, rightToWork, expiry }) {
  const rtwLine = rightToWork
    ? `RIGHT TO WORK: ${rightToWork}${expiry ? ` (expiry ${expiry})` : ""}`
    : "RIGHT TO WORK: [not set]";
  return [
    "YOUR CV DETAILS — UK",
    "",
    "WHAT YOU ACTUALLY DID (verified results with numbers):",
    ...(didList.length ? didList.map((d) => `• ${d}`) : ["• [none yet]"]),
    "",
    "WHAT YOU DID NOT DO (the AI must never claim these):",
    ...(didNotList.length ? didNotList.map((d) => `• ${d}`) : ["• [none yet]"]),
    "",
    rtwLine,
    "UK RULES: one page, A4, British spelling. Nothing made up.",
  ].join("\n");
}

export function ConstraintsBuilder({
  candidateId,
  initialContent,
  constraintsDoc,
  didList = [],
  didNotList = [],
  rightToWork: initialRtw = "",
  rightToWorkExpiry: initialExpiry = "",
  onSave,
  isSaving = false,
  api,
}) {
  // resolve initial content from either initialContent (new contract) or constraintsDoc (legacy)
  const resolvedInitial = initialContent ?? constraintsDoc ?? CONSTRAINTS_TEMPLATE;

  const [content, setContent] = useState(resolvedInitial);
  const [didInput, setDidInput] = useState(didList.join("\n"));
  const [didNotInput, setDidNotInput] = useState(didNotList.join("\n"));
  const [activeMode, setActiveMode] = useState("structured");
  const [statusMsg, setStatusMsg] = useState("");
  const [rightToWork, setRightToWork] = useState(initialRtw || "British Citizen");
  const [expiry, setExpiry] = useState(initialExpiry || "");
  const [initialSnapshot, setInitialSnapshot] = useState(null);
  const [focusedField, setFocusedField] = useState(null);

  const needsExpiry = /visa/i.test(rightToWork);

  useEffect(() => {
    if (!initialSnapshot) {
      setInitialSnapshot(
        JSON.stringify({
          didInput: didList.join("\n"),
          didNotInput: didNotList.join("\n"),
          content: resolvedInitial,
          rightToWork: initialRtw || "British Citizen",
          expiry: initialExpiry || "",
        })
      );
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setContent(resolvedInitial);
  }, [resolvedInitial]);

  const parsedDid = useMemo(
    () => didInput.split("\n").map((s) => s.replace(/^[•\-\*]\s*/, "").trim()).filter(Boolean),
    [didInput]
  );
  const parsedDidNot = useMemo(
    () => didNotInput.split("\n").map((s) => s.replace(/^[•\-\*]\s*/, "").trim()).filter(Boolean),
    [didNotInput]
  );

  const previewDoc = useMemo(() => {
    if (activeMode === "raw") return content;
    return buildPreview({ didList: parsedDid, didNotList: parsedDidNot, rightToWork, expiry: needsExpiry ? expiry : "" });
  }, [activeMode, content, parsedDid, parsedDidNot, rightToWork, expiry, needsExpiry]);

  const charCount = previewDoc.length;
  const LIMIT = 8000;
  const WARN = 6000;

  const dirty = useMemo(() => {
    if (!initialSnapshot) return false;
    const current = JSON.stringify({ didInput, didNotInput, content, rightToWork, expiry });
    return current !== initialSnapshot;
  }, [initialSnapshot, didInput, didNotInput, content, rightToWork, expiry]);

  const handleSave = async () => {
    if (!dirty || isSaving) return;
    setStatusMsg("");
    try {
      const payload = {
        content: previewDoc,
        didList: activeMode === "raw" ? [] : parsedDid,
        didNotList: activeMode === "raw" ? [] : parsedDidNot,
        rightToWork,
        rightToWorkExpiry: needsExpiry ? expiry : "",
      };
      // contract: api.saveConstraints(content, didList, didNotList, rightToWork) OR onSave(payload)
      if (api && typeof api.saveConstraints === "function") {
        await api.saveConstraints(payload.content, payload.didList, payload.didNotList, payload.rightToWork, { candidateId, expiry: payload.rightToWorkExpiry });
      } else if (onSave) {
        await onSave(payload);
      }
      setInitialSnapshot(JSON.stringify({ didInput, didNotInput, content: previewDoc, rightToWork, expiry: needsExpiry ? expiry : "" }));
      setStatusMsg("✓ Saved");
    } catch (e) {
      setStatusMsg("✗ " + (e?.message || "Save failed"));
    }
  };

  // shared textarea style factory
  const taBase = (isFocused) => ({
    width: "100%",
    height: 140,
    background: T.card,
    border: `1px solid ${isFocused ? T.blue : T.border}`,
    borderRadius: T.radiusSm,
    padding: "10px 12px",
    fontSize: 13,
    fontFamily: T.sans,
    color: T.text,
    lineHeight: 1.5,
    boxSizing: "border-box",
    resize: "vertical",
    outline: "none",
    boxShadow: isFocused ? `0 0 0 3px ${T.blue}18` : "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
  });

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: T.label,
    fontFamily: T.sans,
    letterSpacing: 0,
    marginBottom: 6,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  };

  const countStyle = {
    fontSize: 11,
    fontFamily: T.mono,
    color: T.muted,
    fontWeight: 400,
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 0" }}>
      {/* Header */}
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: T.text, margin: "0 0 6px", fontFamily: T.sans, letterSpacing: "-0.01em" }}>
          Career Constraints — what we can and can’t add
        </h2>
        <p style={{ fontSize: 13, color: T.muted, margin: 0, fontFamily: T.sans, lineHeight: 1.5 }}>
          We only add things you list under <span style={{ color: T.text, fontWeight: 600 }}>WHAT YOU ACTUALLY DID</span>. Anything else stays as you wrote it.
        </p>
      </div>

      {/* Toggle — Linear pill tabs 6px, active T.blue (white text) */}
      <div style={{ display: "inline-flex", background: T.surface, border: `1px solid ${T.border}`, borderRadius: T.radiusSm, padding: 3, gap: 4, marginBottom: 16 }}>
        <button
          onClick={() => setActiveMode("structured")}
          style={{
            padding: "6px 14px",
            borderRadius: T.radiusSm,
            border: "1px solid transparent",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: T.sans,
            cursor: "pointer",
            background: activeMode === "structured" ? T.blue : "transparent",
            color: activeMode === "structured" ? T.card : T.muted,
            borderColor: activeMode === "structured" ? T.blue : "transparent",
            transition: "all 0.15s",
            lineHeight: 1,
          }}
        >
          Structured
        </button>
        <button
          onClick={() => setActiveMode("raw")}
          style={{
            padding: "6px 14px",
            borderRadius: T.radiusSm,
            border: "1px solid transparent",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: T.sans,
            cursor: "pointer",
            background: activeMode === "raw" ? T.blue : "transparent",
            color: activeMode === "raw" ? T.card : T.muted,
            borderColor: activeMode === "raw" ? T.blue : "transparent",
            transition: "all 0.15s",
            lineHeight: 1,
          }}
        >
          Raw
        </button>
      </div>

      {/* Structured vs Raw */}
      {activeMode === "structured" ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 320px", gap: 16, alignItems: "start", marginBottom: 16 }}>
          {/* DID textarea */}
          <div>
            <div style={labelStyle}>
              <span>What you actually did</span>
              <span style={countStyle}>{parsedDid.length}</span>
            </div>
            <textarea
              value={didInput}
              onChange={(e) => setDidInput(e.target.value)}
              onFocus={() => setFocusedField("did")}
              onBlur={() => setFocusedField(null)}
              placeholder={"Led Stripe migration, reducing failed payments by 18% (£1.2M recovered ARR)\nManaged £500k cloud budget across 4 AWS accounts\nShipped feature X with 40% performance gain"}
              style={taBase(focusedField === "did")}
            />
            <style>{`textarea::placeholder{ color: ${T.hint}; }`}</style>
          </div>

          {/* DID NOT textarea */}
          <div>
            <div style={labelStyle}>
              <span>What you didn't do</span>
              <span style={countStyle}>{parsedDidNot.length}</span>
            </div>
            <textarea
              value={didNotInput}
              onChange={(e) => setDidNotInput(e.target.value)}
              onFocus={() => setFocusedField("didNot")}
              onBlur={() => setFocusedField(null)}
              placeholder={"Did not write Kotlin/Swift mobile code\nDid not manage people/hiring directly\nDid not own P&L — individual contributor only"}
              style={taBase(focusedField === "didNot")}
            />
          </div>

          {/* Right-to-work panel: white card 8px border T.border p16 */}
          <div
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: T.radiusMd,
              padding: 16,
              alignSelf: "start",
            }}
          >
            <div style={{ ...labelStyle, marginBottom: 8 }}>
              <span>Right to work</span>
            </div>
            <p style={{ fontSize: 12, color: T.muted, margin: "0 0 10px", fontFamily: T.sans, lineHeight: 1.5 }}>
              UK requirement — stored with your candidate profile.
            </p>
            <select
              value={rightToWork}
              onChange={(e) => setRightToWork(e.target.value)}
              onFocus={() => setFocusedField("rtw")}
              onBlur={() => setFocusedField(null)}
              style={{
                width: "100%",
                height: 44,
                background: T.card,
                border: `1px solid ${focusedField === "rtw" ? T.blue : T.border}`,
                borderRadius: T.radiusSm,
                padding: "0 12px",
                fontSize: 13,
                fontFamily: T.sans,
                color: T.text,
                outline: "none",
                boxSizing: "border-box",
                boxShadow: focusedField === "rtw" ? `0 0 0 3px ${T.blue}18` : "none",
                transition: "border-color 0.15s, box-shadow 0.15s",
                appearance: "auto",
                marginBottom: 12,
              }}
            >
              {RTW_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>

            {needsExpiry ? (
              <div style={{ marginBottom: 12 }}>
                <div style={{ ...labelStyle, fontSize: 12, marginBottom: 6 }}>
                  <span>Visa expiry</span>
                </div>
                <input
                  type="month"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  onFocus={() => setFocusedField("expiry")}
                  onBlur={() => setFocusedField(null)}
                  style={{
                    width: "100%",
                    height: 44,
                    background: T.card,
                    border: `1px solid ${focusedField === "expiry" ? T.blue : T.border}`,
                    borderRadius: T.radiusSm,
                    padding: "0 12px",
                    fontSize: 13,
                    fontFamily: T.sans,
                    color: T.text,
                    outline: "none",
                    boxSizing: "border-box",
                    boxShadow: focusedField === "expiry" ? `0 0 0 3px ${T.blue}18` : "none",
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                />
              </div>
            ) : (
              <div
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  borderRadius: T.radiusSm,
                  padding: "10px 12px",
                  fontSize: 12,
                  color: T.muted,
                  fontFamily: T.sans,
                  lineHeight: 1.5,
                  marginBottom: 12,
                }}
              >
                {rightToWork === "British Citizen" || rightToWork === "Irish Citizen"
                  ? "No expiry — your right to work is permanent."
                  : "No expiry required for this status."}
              </div>
            )}

            <div style={{ fontSize: 11, color: T.muted, fontFamily: T.sans, lineHeight: 1.5 }}>
              <span style={{ color: T.text, fontWeight: 600 }}>Tip:</span> “Requires sponsorship” surfaces only where available.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <div style={labelStyle}>
            <span>Full constraints document</span>
            <span style={countStyle}>{content.length} chars</span>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setFocusedField("raw")}
            onBlur={() => setFocusedField(null)}
            placeholder={CONSTRAINTS_TEMPLATE.slice(0, 120) + "..."}
            style={{
              width: "100%",
              height: 220,
              background: T.card,
              border: `1px solid ${focusedField === "raw" ? T.blue : T.border}`,
              borderRadius: T.radiusSm,
              padding: "12px 14px",
              fontSize: 12,
              fontFamily: T.mono,
              color: T.text,
              lineHeight: 1.6,
              boxSizing: "border-box",
              resize: "vertical",
              outline: "none",
              boxShadow: focusedField === "raw" ? `0 0 0 3px ${T.blue}18` : "none",
              transition: "border-color 0.15s, box-shadow 0.15s",
              whiteSpace: "pre-wrap",
            }}
          />
        </div>
      )}

      {/* Live preview: mono pre 11px JetBrains, T.text, bg T.surface border T.border 8px radius */}
      <div
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          borderRadius: T.radiusMd,
          overflow: "hidden",
          marginBottom: 16,
        }}
      >
        <div
          style={{
            padding: "10px 16px",
            borderBottom: `1px solid ${T.border}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: T.surface,
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: ".06em", textTransform: "uppercase", fontFamily: T.sans }}>
            Live preview — constraintsDoc
          </span>
          <span style={{ fontSize: 11, color: T.muted, fontFamily: T.mono }}>{charCount.toLocaleString()} chars</span>
        </div>
        <pre
          style={{
            margin: 0,
            padding: 16,
            fontFamily: T.mono,
            fontSize: 11,
            lineHeight: 1.6,
            color: T.text,
            background: T.surface,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            maxHeight: 260,
            overflowY: "auto",
          }}
        >
          {previewDoc}
        </pre>
      </div>

      {/* Footer: dirty indicator (left) + StorageMeter 6px bar (center) + Save button T.blue 44px primary */}
      <div
        style={{
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: T.radiusMd,
          padding: "14px 16px",
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          {/* Left: dirty indicator ● Unsaved T.amberAccent vs ✓ Up to date T.green */}
          <div style={{ minWidth: 130, display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                fontFamily: T.sans,
                color: dirty ? T.amberAccent : T.green,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {dirty ? "● Unsaved" : "✓ Up to date"}
            </span>
            {statusMsg && (
              <span style={{ fontSize: 11, color: statusMsg.startsWith("✓") ? T.green : statusMsg.startsWith("✗") ? T.red : T.muted, fontWeight: 600, fontFamily: T.sans }}>
                {statusMsg}
              </span>
            )}
          </div>

          {/* Center: StorageMeter 6px bar */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: T.sans }}>
                Constraints doc size
              </span>
              <span style={{ fontSize: 10, fontFamily: T.mono, color: T.muted }}>
                {charCount}/{LIMIT}
              </span>
            </div>
            <div style={{ background: T.surface, borderRadius: 999, height: 6, overflow: "hidden", border: `1px solid ${T.border}` }}>
              <div
                style={{
                  background: charCount >= LIMIT ? T.red : charCount >= WARN ? T.amberAccent : T.green,
                  width: `${Math.min((charCount / LIMIT) * 100, 100)}%`,
                  height: "100%",
                  borderRadius: 999,
                  transition: "width 0.4s ease-out",
                }}
              />
            </div>
            {/* keep StorageMeter mounted hidden for contract compatibility */}
            <div style={{ display: "none" }}>
              <StorageMeter count={charCount} limit={LIMIT} warn={WARN} label="Constraints doc size" />
            </div>
          </div>

          {/* Right: Save button T.blue 44px primary (disabled ghost when clean) */}
          <button
            onClick={handleSave}
            disabled={!dirty || isSaving}
            style={{
              height: 44,
              minWidth: 180,
              padding: "0 20px",
              borderRadius: T.radiusSm,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: T.sans,
              cursor: !dirty || isSaving ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease",
              background: !dirty || isSaving ? T.card : T.blue,
              color: !dirty || isSaving ? T.muted : T.card,
              border: `1px solid ${!dirty || isSaving ? T.border : T.blue}`,
              opacity: !dirty || isSaving ? 0.9 : 1,
              boxShadow: !dirty || isSaving ? "none" : T.shadowSm,
              whiteSpace: "nowrap",
            }}
            onMouseEnter={(e) => {
              if (!dirty || isSaving) return;
              e.currentTarget.style.background = T.blueHover;
              e.currentTarget.style.borderColor = T.blueHover;
            }}
            onMouseLeave={(e) => {
              if (!dirty || isSaving) return;
              e.currentTarget.style.background = T.blue;
              e.currentTarget.style.borderColor = T.blue;
            }}
          >
            {isSaving ? "Saving…" : dirty ? "              Save changes" : "No changes to save"}
          </button>
        </div>
        {!dirty && !isSaving && (
          <div style={{ fontSize: 11, color: T.hint, marginTop: 8, fontFamily: T.sans }}>          Add to your list of what you did, or your list of things to avoid, to enable Save.</div>
        )}
      </div>
    </div>
  );
}

export default ConstraintsBuilder;
