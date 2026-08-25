import React, { useState, useMemo, useEffect } from "react";
import { T } from "../common/Theme.js";
import { Card, Row, Btn, Label, StorageMeter } from "../common/UiPrimitives.jsx";

const CONSTRAINTS_TEMPLATE = `CAREER CONSTRAINTS DOCUMENT — UK Tech Ground Truth
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Fill this in for every employer. Be specific about what you DID and DID NOT do.
This is the strict ground-truth for Agentic Tailoring — preventing AI hallucination.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

EMPLOYER 1
──────────────────────────────────────────────────
Company Name:
Industry & Scale (e.g. B2B FinTech, Series B, 150 headcount):
Exact Job Title:
Dates (MM/YYYY – MM/YYYY):
Direct Reports & Team:

WHAT YOU ACTUALLY DID (Include £, %, or team metrics):
• 
• 
• 

WHAT YOU DID NOT DO (Strict boundary for AI):
• 
• 

CONFIDENTIALITY (Do not disclose client names/proprietary algorithms):
• 

SKILLS YOU DEFINITELY HAVE:
• 

SKILLS YOU DO NOT HAVE (Even if common for your title):
• 
`;

const RTW_OPTIONS = [
  "British Citizen",
  "Settled Status",
  "Pre-settled Status",
  "Indefinite Leave to Remain",
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
    "CAREER CONSTRAINTS — UK CANDIDATE GROUND TRUTH",
    "",
    "DID (Verified Experience & Metrics):",
    ...(didList.length ? didList.map(d => `• ${d}`) : ["• [none yet]"]),
    "",
    "DID NOT (Strictly Forbidden for AI to Claim):",
    ...(didNotList.length ? didNotList.map(d => `• ${d}`) : ["• [none yet]"]),
    "",
    rtwLine,
    "UK RULES: A4 format, British English spelling, £ metrics, 0 hallucination.",
  ].join("\n");
}

export function ConstraintsBuilder({
  constraintsDoc,
  didList = [],
  didNotList = [],
  rightToWork: initialRtw = "",
  rightToWorkExpiry: initialExpiry = "",
  onSave,
  isSaving,
}) {
  const [content, setContent] = useState(constraintsDoc || CONSTRAINTS_TEMPLATE);
  const [didInput, setDidInput] = useState(didList.join("\n"));
  const [didNotInput, setDidNotInput] = useState(didNotList.join("\n"));
  const [activeMode, setActiveMode] = useState("structured"); // "structured" or "raw"
  const [statusMsg, setStatusMsg] = useState("");
  const [rightToWork, setRightToWork] = useState(initialRtw || "British Citizen");
  const [expiry, setExpiry] = useState(initialExpiry || "");
  const [initialSnapshot, setInitialSnapshot] = useState(null);

  const needsExpiry = /visa/i.test(rightToWork);

  // hydrate snapshot once
  useEffect(() => {
    if (!initialSnapshot) {
      setInitialSnapshot(JSON.stringify({ didInput: didList.join("\n"), didNotInput: didNotList.join("\n"), content: constraintsDoc || CONSTRAINTS_TEMPLATE, rightToWork: initialRtw || "British Citizen", expiry: initialExpiry || "" }));
    }
  }, []);

  // keep inputs in sync if props change externally
  useEffect(() => { setContent(constraintsDoc || CONSTRAINTS_TEMPLATE); }, [constraintsDoc]);
  // don't overwrite didInput on every didList change if user is editing; only on first mount handled above

  const parsedDid = useMemo(() => didInput.split("\n").map(s => s.replace(/^[•\-\*]\s*/, "").trim()).filter(Boolean), [didInput]);
  const parsedDidNot = useMemo(() => didNotInput.split("\n").map(s => s.replace(/^[•\-\*]\s*/, "").trim()).filter(Boolean), [didNotInput]);

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

  const handleDownload = () => {
    const blob = new Blob([previewDoc], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "career-constraints.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSave = async () => {
    setStatusMsg("");
    try {
      const payload = {
        content: previewDoc,
        didList: parsedDid,
        didNotList: parsedDidNot,
        rightToWork,
        rightToWorkExpiry: needsExpiry ? expiry : "",
      };
      await onSave(payload);
      setInitialSnapshot(JSON.stringify({ didInput, didNotInput, content: previewDoc, rightToWork, expiry }));
      setStatusMsg("✓ Constraints saved securely to D1. Agentic tailoring is guarded.");
    } catch (e) {
      setStatusMsg("✗ Error saving: " + e.message);
    }
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 0" }}>
      <div style={{ marginBottom: 18 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: "0 0 6px" }}>
          🛡️ Career Constraints — Source of Truth
        </h2>
        <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
          This document is the boundary for all AI tailoring. If an achievement or metric isn't in your <b>DID</b> list, the verifier blocks it.
        </p>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Row justify="space-between" style={{ marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
          <Row gap={8}>
            <Btn size="sm" variant={activeMode === "structured" ? "primary" : "ghost"} onClick={() => setActiveMode("structured")}>Structured (Recommended)</Btn>
            <Btn size="sm" variant={activeMode === "raw" ? "primary" : "ghost"} onClick={() => setActiveMode("raw")}>Full Document Editor</Btn>
          </Row>
          <Row gap={8}>
            <Btn size="sm" variant="outline" onClick={handleDownload}>📥 Download (.txt)</Btn>
          </Row>
        </Row>

        {activeMode === "structured" ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 320px", gap: 16, alignItems: "start" }}>
            {/* DID */}
            <div>
              <Label>✅ DID — What you actually did</Label>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>One bullet per line · include £ / % / team metrics</div>
              <textarea
                value={didInput}
                onChange={e => setDidInput(e.target.value)}
                rows={10}
                placeholder={"• Led Stripe migration, reducing failed payments by 18% (£1.2M recovered ARR)\n• Managed £500k cloud budget across 4 AWS accounts\n• Shipped feature X with 40% performance gain"}
                style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: T.sans, color: T.text, boxSizing: "border-box", resize: "vertical" }}
              />
              <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>{parsedDid.length} bullets</div>
            </div>

            {/* DID NOT */}
            <div>
              <Label>🚫 DID NOT — Strict AI guardrails</Label>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 6 }}>What the AI must never claim on your behalf</div>
              <textarea
                value={didNotInput}
                onChange={e => setDidNotInput(e.target.value)}
                rows={10}
                placeholder={"• Did not write Kotlin/Swift mobile code\n• Did not manage people/hiring directly\n• Did not own P&L — individual contributor only"}
                style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, fontFamily: T.sans, color: T.text, boxSizing: "border-box", resize: "vertical" }}
              />
              <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>{parsedDidNot.length} guardrails</div>
            </div>

            {/* Right-to-work */}
            <div style={{ background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: 14 }}>
              <Label>🇬🇧 Right to Work</Label>
              <div style={{ fontSize: 11, color: T.muted, marginBottom: 8 }}>UK requirement — stored with your candidate profile. Verbatim in constraintsDoc.</div>
              <select
                value={rightToWork}
                onChange={e => setRightToWork(e.target.value)}
                style={{ width: "100%", background: "#fff", border: `1px solid ${T.border}`, borderRadius: 7, padding: "9px 10px", fontSize: 13, color: T.text, fontFamily: T.sans, marginBottom: 12 }}
              >
                {RTW_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
              </select>

              {needsExpiry && (
                <div style={{ marginBottom: 12 }}>
                  <Label>Visa Expiry</Label>
                  <input
                    type="month"
                    value={expiry}
                    onChange={e => setExpiry(e.target.value)}
                    placeholder="YYYY-MM"
                    style={{ width: "100%", background: "#fff", border: `1px solid ${T.border}`, borderRadius: 7, padding: "9px 10px", fontSize: 13, color: T.text, fontFamily: T.sans, boxSizing: "border-box" }}
                  />
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>Stored as MM/YYYY in constraintsDoc</div>
                </div>
              )}

              {!needsExpiry && (
                <div style={{ fontSize: 11, color: T.muted, background: "#fff", border: `1px solid ${T.border}`, borderRadius: 6, padding: "8px 10px", marginBottom: 12 }}>
                  {rightToWork === "British Citizen" ? "No expiry needed — British Citizen." : "No expiry required for this status."}
                </div>
              )}

              <div style={{ fontSize: 11, color: T.muted, lineHeight: 1.5 }}>
                <b style={{ color: T.text }}>Tip:</b> “Requires sponsorship” will surface only where sponsorship is available.
              </div>
            </div>
          </div>
        ) : (
          <div>
            <Label>📄 Full Constraints Document</Label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={18}
              style={{ width: "100%", background: T.bg, border: `1px solid ${T.border}`, borderRadius: 8, padding: 14, fontSize: 12, fontFamily: T.mono, color: T.text, lineHeight: 1.6, boxSizing: "border-box", resize: "vertical" }}
            />
          </div>
        )}
      </Card>

      {/* Live preview */}
      <Card style={{ marginBottom: 16, padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "10px 16px", background: T.bg, borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: ".06em", textTransform: "uppercase" }}>Live Preview — constraintsDoc (monospace)</span>
          <span style={{ fontSize: 11, color: T.muted, fontFamily: T.mono }}>{charCount.toLocaleString()} chars</span>
        </div>
        <pre style={{ margin: 0, padding: 16, fontFamily: T.mono, fontSize: 11.5, lineHeight: 1.6, color: T.text, background: "#fff", whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 260, overflowY: "auto" }}>
          {previewDoc}
        </pre>
      </Card>

      {/* Save bar + StorageMeter */}
      <Card style={{ padding: "14px 16px" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <StorageMeter count={charCount} limit={LIMIT} warn={WARN} label="Constraints doc size" />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, color: dirty ? T.yellow : T.muted, fontWeight: 600 }}>{dirty ? "● Unsaved changes" : "✓ Up to date"}</span>
          </div>
          <span style={{ fontSize: 12, color: statusMsg.startsWith("✓") ? T.green : statusMsg.startsWith("✗") ? T.red : T.muted, fontWeight: 600, flex: "1 1 100%", order: 10, marginTop: statusMsg ? 4 : 0 }}>{statusMsg}</span>
          <Btn onClick={handleSave} disabled={isSaving || !dirty} variant={dirty ? "success" : "ghost"} size="md" style={{ minWidth: 190 }}>
            {isSaving ? "Saving to Cloudflare D1..." : dirty ? "Save Career Constraints" : "No changes to save"}
          </Btn>
        </div>
        {!dirty && <div style={{ fontSize: 11, color: T.hint, marginTop: 8 }}>Edit DID / DID NOT or Right-to-work to enable Save (dirty check active).</div>}
      </Card>
    </div>
  );
}
