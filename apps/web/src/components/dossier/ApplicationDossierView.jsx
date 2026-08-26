import React, { useState } from "react";
import { T } from "../common/Theme.js";
import { Card, Row, Btn, Tag, ScoreBar } from "../common/UiPrimitives.jsx";
import { useToast } from "../common/Toast.jsx";

function PillTabs({ tabs, active, onChange }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 6,
        padding: 4,
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        marginBottom: 14,
        flexWrap: "wrap",
      }}
    >
      {tabs.map(tab => {
        const isActive = active === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              border: isActive ? `1px solid ${T.stripePrimary}` : `1px solid transparent`,
              background: isActive ? T.stripePrimary : T.stripeBg,
              color: isActive ? T.card : T.textStrong,
              fontSize: 12,
              fontWeight: isActive ? 700 : 500,
              cursor: "pointer",
              fontFamily: T.sans,
              transition: "all 0.15s",
              letterSpacing: "0.01em",
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function CopyBtn({ text, label, copiedKey, copyKey, onCopy }) {
  const isCopied = copiedKey === copyKey;
  return (
    <Btn
      size="xs"
      variant={isCopied ? "success" : "subtle"}
      onClick={() => onCopy(text, copyKey)}
      title={isCopied ? "Copied!" : `Copy ${label}`}
      style={{
        minHeight: 28,
        height: 28,
        fontSize: 11,
        background: isCopied ? T.green : T.stripeBg,
        color: isCopied ? T.card : T.stripePrimary,
        border: `1px solid ${isCopied ? T.green : T.border}`,
      }}
    >
      {isCopied ? "✓ Copied" : "Copy"}
    </Btn>
  );
}

function DiffView({ operations }) {
  if (!operations?.length) return null;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {operations.map((op, i) => {
        const isRemoval = op.op === "remove" || op.op === "delete";
        const isAdd = op.op === "add" || op.op === "replace" || op.op === "update";
        const gutter = isRemoval ? T.red : T.green;
        const bg = isRemoval ? T.redLight : T.greenLight;
        return (
          <div
            key={i}
            style={{
              background: bg,
              border: `1px solid ${T.border}`,
              borderLeft: `3px solid ${gutter}`,
              borderRadius: 6,
              padding: "10px 12px",
              fontSize: 12,
              lineHeight: 1.5,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center", marginBottom: 4 }}>
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: 11,
                  color: T.muted,
                  background: T.card,
                  border: `1px solid ${T.border}`,
                  borderRadius: 4,
                  padding: "1px 6px",
                }}
              >
                <span style={{ color: gutter, fontWeight: 700, marginRight: 6 }}>{op.op}</span>
                {op.path}
              </span>
            </div>
            <div
              style={{
                color: T.textStrong,
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                fontFamily: T.sans,
                fontSize: 12,
                background: T.card,
                border: `1px solid ${T.border}`,
                borderRadius: 6,
                padding: "8px 10px",
              }}
            >
              {typeof op.value === "string" ? op.value.slice(0, 500) : JSON.stringify(op.value)?.slice(0, 500)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ApplicationDossierView({ tailorResult }) {
  const [activeTab, setActiveTab] = useState("patches");
  const [copiedKey, setCopiedKey] = useState("");
  const toast = useToast();

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopiedKey(key);
    toast?.success(key === "cover" ? "Cover letter copied" : "Copied to clipboard");
    setTimeout(() => setCopiedKey(""), 1800);
  };

  const coverLetter = tailorResult?.coverLetter || tailorResult?.dossier?.coverLetter || "";
  const qa = tailorResult?.screeningAnswers || tailorResult?.dossier?.screeningAnswers || {};
  const analysis = tailorResult?.analysis || tailorResult?.dossier?.analysis || {};
  const scores = analysis.scores || {};
  const gap = analysis.gap || {};

  const tabs = [
    { id: "patches", label: "Patches" },
    { id: "cover", label: "Cover Letter" },
    { id: "screening", label: "Screening" },
    { id: "scores", label: "Scores" },
  ];

  return (
    <div>
      <PillTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "patches" && (
        <div>
          {tailorResult?.operations?.length ? (
            <DiffView operations={tailorResult.operations} />
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "28px 10px",
                color: T.muted,
                fontSize: 12,
                border: `1px dashed ${T.border}`,
                borderRadius: 8,
                background: T.stripeBg,
              }}
            >
              No patch operations — run Tailor to generate atomic bullet patches.
            </div>
          )}
        </div>
      )}

      {activeTab === "cover" && (
        <Card style={{ padding: 14, background: T.card }}>
          <Row justify="space-between" align="center" style={{ marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div>
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.textStrong }}>UK Cover Letter</h4>
              <div style={{ fontSize: 11, color: T.muted }}>300–340 words · Understated British tone · Specific interview CTA</div>
            </div>
            <CopyBtn text={coverLetter} label="cover letter" copiedKey={copiedKey} copyKey="cover" onCopy={copyToClipboard} />
          </Row>
          <div
            style={{
              background: T.stripeBg,
              border: `1px solid ${T.border}`,
              borderRadius: 6,
              padding: 16,
              fontSize: 13,
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              color: T.textStrong,
              fontFamily: T.sans,
              maxHeight: 420,
              overflowY: "auto",
            }}
          >
            {coverLetter || "No cover letter generated yet — run Tailor first."}
          </div>
        </Card>
      )}

      {activeTab === "screening" && (
        <Card style={{ padding: 14 }}>
          <div style={{ marginBottom: 14 }}>
            <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: T.textStrong }}>Screening Q&A Helper</h4>
            <div style={{ fontSize: 11, color: T.muted }}>One-click copy answers for Workday, Greenhouse, and Lever.</div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ background: T.stripeBg, border: `1px solid ${T.border}`, borderRadius: 6, padding: 12 }}>
              <Row justify="space-between" align="center" style={{ marginBottom: 4, gap: 8 }}>
                <strong style={{ fontSize: 12, color: T.textStrong }}>1. &ldquo;Why this role &amp; company?&rdquo;</strong>
                <CopyBtn text={qa.why_this_role || "Passionate about high-impact engineering in the UK FinTech space."} label="answer 1" copiedKey={copiedKey} copyKey="qa1" onCopy={copyToClipboard} />
              </Row>
              <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
                {qa.why_this_role || "Extensive experience solving large-scale architecture challenges with measurable UK impact."}
              </div>
            </div>
            <div style={{ background: T.stripeBg, border: `1px solid ${T.border}`, borderRadius: 6, padding: 12 }}>
              <Row justify="space-between" align="center" style={{ marginBottom: 4, gap: 8 }}>
                <strong style={{ fontSize: 12, color: T.textStrong }}>2. &ldquo;Key achievement relevant to this role&rdquo;</strong>
                <CopyBtn text={qa.key_achievement || "Delivered architecture overhaul resulting in 24% reliability gain and £400k savings."} label="answer 2" copiedKey={copiedKey} copyKey="qa2" onCopy={copyToClipboard} />
              </Row>
              <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
                {qa.key_achievement || "Delivered architecture overhaul resulting in 24% reliability gain and £400k savings."}
              </div>
            </div>
            <div style={{ background: T.stripeBg, border: `1px solid ${T.border}`, borderRadius: 6, padding: 12 }}>
              <Row justify="space-between" align="center" style={{ marginBottom: 4, gap: 8 }}>
                <strong style={{ fontSize: 12, color: T.textStrong }}>3. &ldquo;Notice period &amp; salary expectations&rdquo;</strong>
                <CopyBtn text={qa.availability_salary || "1 month notice period. Expected salary £75,000 – £85,000 GBP."} label="answer 3" copiedKey={copiedKey} copyKey="qa3" onCopy={copyToClipboard} />
              </Row>
              <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.5 }}>
                {qa.availability_salary || "1 month notice period. Target salary £75,000 – £85,000 GBP."}
              </div>
            </div>
          </div>
        </Card>
      )}

      {activeTab === "scores" && (
        <Card style={{ padding: 14 }}>
          <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: T.textStrong }}>4-Vector Fit Scoring</h4>
          {scores.atsScore == null && scores.experienceScore == null && scores.readabilityScore == null && scores.constraintsScore == null ? (
            <div style={{ textAlign: "center", padding: "28px 10px", color: T.muted, fontSize: 12 }}>Run Tailor & Verifier to generate fit analysis scores.</div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 16 }}>
              <ScoreBar label="ATS Keyword Match" score={scores.atsScore ?? 0} target={75} note="Terminology parity" />
              <ScoreBar label="Experience & Seniority" score={scores.experienceScore ?? 0} target={75} note="Scope match" />
              <ScoreBar label="UK Compliance & Structure" score={scores.readabilityScore ?? 0} target={80} note="A4 2-page fit" />
              <ScoreBar label="Constraints Alignment" score={scores.constraintsScore ?? 0} target={80} note="0 Hallucination" />
            </div>
          )}
          <div style={{ borderTop: `1px solid ${T.border}`, paddingTop: 12 }}>
            <strong style={{ fontSize: 12, color: T.textStrong }}>Strengths</strong>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, margin: "6px 0 12px" }}>
              {!gap.matches || gap.matches.length === 0 ? (
                <span style={{ fontSize: 12, color: T.muted }}>Matches will appear after analysis.</span>
              ) : (
                gap.matches.map((m, i) => <Tag key={i} label={`✓ ${m}`} color={T.green} />)
              )}
            </div>
            {gap.gaps?.length > 0 && (
              <div>
                <strong style={{ fontSize: 12, color: T.textStrong }}>Gaps to address in interview</strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {gap.gaps.map((g, i) => <Tag key={i} label={`⚠ ${g}`} color={T.yellow} />)}
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
