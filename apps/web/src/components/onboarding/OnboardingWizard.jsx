import React, { useState, useMemo, useRef, useEffect } from "react";
import { T } from "../common/Theme.js";
import { extractCVFromFile } from "../../lib/api.js";
import { FieldLocks } from "../FieldLocks.jsx";

const STEPS = [
  { id: 1, label: "Upload CV" },
  { id: 2, label: "Locks" },
  { id: 3, label: "Constraints" },
];

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

// ——— Linear stepper ———
function Stepper({ step }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 28 }}>
      {STEPS.map((s, idx) => {
        const isActive = s.id === step;
        const isDone = s.id < step;
        const isUpcoming = s.id > step;
        return (
          <React.Fragment key={s.id}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 999,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  fontFamily: T.sans,
                  border: `1.5px solid ${isActive || isDone ? "#533afd" : "#e5edf5"}`,
                  background: isActive || isDone ? "#533afd" : "#fff",
                  color: isActive || isDone ? "#fff" : T.muted,
                  transition: "all 0.15s",
                }}
              >
                {isDone ? "✓" : s.id}
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#533afd" : isDone ? T.text : T.muted,
                  letterSpacing: "0.02em",
                }}
              >
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                style={{
                  width: 56,
                  height: 2,
                  background: s.id < step ? "#533afd" : "#e5edf5",
                  margin: "0 8px",
                  marginBottom: 18,
                  borderRadius: 999,
                  transition: "background 0.15s",
                }}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ——— Validation helpers (Zod-style messages) ———
function validateStep1({ cvText }) {
  const errs = {};
  if (!cvText || cvText.trim().length < 20) errs.cvText = "String must contain at least 20 character(s)";
  return errs;
}
function validateStep3({ profile, didList }) {
  const errs = {};
  if (!profile.fullName || !profile.fullName.trim()) errs.fullName = "String must contain at least 1 character(s)";
  if (!profile.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email)) errs.email = "Invalid email address";
  // didList optional but hint
  return errs;
}

export function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);

  // — profile + CV state
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    targetRole: "",
    location: "London, UK",
    rightToWork: "British Citizen",
    rightToWorkExpiry: "",
  });
  const [cvText, setCvText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [touched, setTouched] = useState({});

  // — constraints
  const [didInput, setDidInput] = useState("");
  const [didNotInput, setDidNotInput] = useState("");
  const parsedDid = useMemo(() => didInput.split("\n").map((s) => s.replace(/^[•\-\*]\s*/, "").trim()).filter(Boolean), [didInput]);
  const parsedDidNot = useMemo(() => didNotInput.split("\n").map((s) => s.replace(/^[•\-\*]\s*/, "").trim()).filter(Boolean), [didNotInput]);

  // — field locks (local preview)
  const [locks, setLocks] = useState({});

  // derive mock registry from cvText for preview when no server registry yet
  const previewRegistry = useMemo(() => {
    if (!cvText.trim()) return [];
    // naive split into bullets/paragraphs → fields
    const lines = cvText.split("\n").filter((l) => l.trim().length > 0).slice(0, 12);
    return lines.map((line, i) => ({
      id: `preview-${i}`,
      label: line.slice(0, 56) + (line.length > 56 ? "…" : ""),
      path: `/sections/experience/items/${i}/content`,
      section: i < 4 ? "experience" : i < 7 ? "skills" : "summary",
      editable: true,
      lockReason: "",
      bullet: line.trim().startsWith("•") || line.trim().startsWith("-"),
    }));
  }, [cvText]);

  const fileInputRef = useRef(null);
  const needsExpiry = /visa/i.test(profile.rightToWork);

  const handleFile = async (file) => {
    if (!file) return;
    setIsExtracting(true);
    setError("");
    try {
      const text = await extractCVFromFile(file);
      setCvText(text);
      setFieldErrors((prev) => ({ ...prev, cvText: undefined }));
    } catch (err) {
      setError("Failed to extract CV text: " + err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const onDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await handleFile(file);
  };

  const handleContinue = () => {
    setError("");
    if (step === 1) {
      const errs = validateStep1({ cvText });
      if (Object.keys(errs).length) {
        setFieldErrors(errs);
        setTouched({ cvText: true });
        setError(errs.cvText || "Please upload or paste your CV to continue.");
        return;
      }
      setFieldErrors({});
      setStep(2);
      return;
    }
    if (step === 2) {
      // optional locks step — always allow continue
      setStep(3);
      return;
    }
    if (step === 3) {
      const errs = validateStep3({ profile, didList: parsedDid });
      if (Object.keys(errs).length) {
        setFieldErrors(errs);
        setTouched({ fullName: true, email: true });
        setError(Object.values(errs)[0]);
        return;
      }
      if (needsExpiry && !profile.rightToWorkExpiry) {
        setError("Visa expiry is required");
        setFieldErrors({ rightToWorkExpiry: "Required" });
        return;
      }
      setFieldErrors({});
      onComplete({
        profile: {
          fullName: profile.fullName,
          email: profile.email,
          phone: profile.phone,
          targetRole: profile.targetRole,
          location: profile.location,
          rightToWork: profile.rightToWork,
          rightToWorkExpiry: needsExpiry ? profile.rightToWorkExpiry : "",
          industry: "Technology",
          salaryMin: 65000,
          salaryMax: 85000,
          currency: "GBP",
          noticePeriod: "1 month",
        },
        cvText,
        // extra context for parent that supports enriched contract
        didList: parsedDid,
        didNotList: parsedDidNot,
        fieldLocks: locks,
      });
    }
  };

  const handleBack = () => {
    setError("");
    setFieldErrors({});
    setStep((s) => Math.max(1, s - 1));
  };

  const cvChars = cvText.length;
  const cvLines = cvText ? cvText.split("\n").length : 0;

  return (
    <div style={{ minHeight: "100vh", background: "#f6f9fc", padding: "32px 16px 40px", fontFamily: T.sans }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700&display=swap');`}</style>

      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: 10,
              background: T.blue,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 700,
              fontSize: 16,
              letterSpacing: "-0.02em",
              marginBottom: 12,
              fontFamily: T.sansDisplay,
            }}
          >
            CV
          </div>
          <h1
            style={{
              fontFamily: "'Source Sans 3', Inter, sans-serif",
              fontSize: 28,
              fontWeight: 300,
              letterSpacing: "-0.6px",
              color: "#061b31",
              margin: "0 0 6px",
              lineHeight: 1.2,
            }}
          >
            Set up your master CV
          </h1>
          <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>30 seconds to start — Stripe-grade clarity, UK-compliant</p>
        </div>

        <Stepper step={step} />

        {/* Card */}
        <div
          style={{
            background: "#fff",
            border: "1px solid #e5edf5",
            borderRadius: 12,
            boxShadow: T.shadowFloat,
            overflow: "hidden",
          }}
        >
          {/* Step content */}
          <div style={{ padding: 28 }}>
            {step === 1 && (
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: "0 0 6px" }}>Upload your CV</h2>
                <p style={{ fontSize: 12, color: T.muted, margin: "0 0 16px", lineHeight: 1.5 }}>
                  PDF or plain text. We parse it into atomic fields with bullet-level locks — UK A4, no hallucination.
                </p>

                {/* Drag-drop zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragOver(true);
                  }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      fileInputRef.current?.click();
                    }
                  }}
                  style={{
                    border: `1.5px dashed ${dragOver ? "#533afd" : "#b9b9f9"}`,
                    borderRadius: 12,
                    padding: 28,
                    textAlign: "center",
                    background: dragOver ? "#f0f0ff" : "#fff",
                    cursor: "pointer",
                    transition: "background 0.15s, border-color 0.15s",
                    marginBottom: 16,
                  }}
                  onMouseEnter={(e) => {
                    if (!dragOver) e.currentTarget.style.background = "#f0f0ff";
                  }}
                  onMouseLeave={(e) => {
                    if (!dragOver) e.currentTarget.style.background = "#fff";
                  }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.docx"
                    onChange={(e) => handleFile(e.target.files?.[0])}
                    style={{ display: "none" }}
                    id="cv-upload-hidden"
                  />
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{isExtracting ? "⏳" : "📄"}</div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.blue, marginBottom: 4 }}>
                    {isExtracting ? "Extracting CV with AI…" : "Drop CV here or click to browse"}
                  </div>
                  <div style={{ fontSize: 11, color: T.muted }}>PDF, TXT or DOCX · Preserves A4 layout & structure</div>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    margin: "16px 0 12px",
                  }}
                >
                  <div style={{ flex: 1, height: 1, background: "#e5edf5" }} />
                  <span style={{ fontSize: 11, color: T.hint, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Or paste
                  </span>
                  <div style={{ flex: 1, height: 1, background: "#e5edf5" }} />
                </div>

                <label htmlFor="cv-paste" style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                  Plaintext CV
                </label>
                <textarea
                  id="cv-paste"
                  value={cvText}
                  onChange={(e) => {
                    setCvText(e.target.value);
                    if (fieldErrors.cvText) setFieldErrors((p) => ({ ...p, cvText: undefined }));
                  }}
                  onBlur={() => setTouched((t) => ({ ...t, cvText: true }))}
                  placeholder="Paste your CV text here…  — keep bullets, dates and £ metrics"
                  rows={6}
                  style={{
                    width: "100%",
                    minHeight: 140,
                    height: 140,
                    background: "#fff",
                    border: `1px solid ${fieldErrors.cvText ? T.red : "#e5edf5"}`,
                    boxShadow: fieldErrors.cvText ? `0 0 0 3px ${T.red}18` : "none",
                    borderRadius: 6,
                    padding: "10px 13px",
                    fontSize: 13,
                    fontFamily: T.mono,
                    color: T.text,
                    boxSizing: "border-box",
                    resize: "vertical",
                    outline: "none",
                    lineHeight: 1.55,
                    transition: "border-color 0.15s, box-shadow 0.15s",
                  }}
                />
                {fieldErrors.cvText && touched.cvText && <div style={{ color: T.red, fontSize: 12, marginTop: 6, fontWeight: 500 }}>{fieldErrors.cvText}</div>}

                {/* Parse preview */}
                {cvText.trim() ? (
                  <div
                    style={{
                      marginTop: 14,
                      border: "1px solid #e5edf5",
                      borderRadius: 8,
                      overflow: "hidden",
                      background: "#fff",
                    }}
                  >
                    <div style={{ padding: "9px 14px", background: "#f6f9fc", borderBottom: "1px solid #e5edf5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>Parse preview · {cvChars.toLocaleString()} chars · {cvLines} lines</span>
                      <span style={{ fontSize: 11, color: T.green, fontWeight: 700 }}>✓ Ready</span>
                    </div>
                    <pre
                      style={{
                        margin: 0,
                        padding: 14,
                        fontFamily: T.mono,
                        fontSize: 11.5,
                        lineHeight: 1.6,
                        color: T.text,
                        background: "#fff",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                        maxHeight: 160,
                        overflowY: "auto",
                      }}
                    >
                      {cvText.slice(0, 900)}
                      {cvText.length > 900 ? "\n… +" + (cvText.length - 900) + " chars" : ""}
                    </pre>
                  </div>
                ) : (
                  <div
                    style={{
                      marginTop: 14,
                      border: "1px dashed #e5edf5",
                      borderRadius: 8,
                      padding: 20,
                      textAlign: "center",
                      background: "#f6f9fc",
                    }}
                  >
                    <div style={{ fontSize: 11, color: T.muted, fontWeight: 600, letterSpacing: "0.04em" }}>No CV yet — drop a PDF or paste text above</div>
                    <div style={{ fontSize: 11, color: T.hint, marginTop: 4 }}>We’ll keep your A4 structure and bullet metrics intact</div>
                  </div>
                )}
              </div>
            )}

            {step === 2 && (
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: "0 0 6px" }}>Review field locks</h2>
                <p style={{ fontSize: 12, color: T.muted, margin: "0 0 16px", lineHeight: 1.5 }}>
                  Choose what agents may tailor. Locked bullets stay verbatim — recruiter sees them exactly as you wrote.
                </p>

                {previewRegistry.length === 0 ? (
                  <div style={{ border: "1px dashed #e5edf5", borderRadius: 8, padding: 32, textAlign: "center", background: "#f6f9fc" }}>
                    <div style={{ fontSize: 28, marginBottom: 8, opacity: 0.7 }}>🔒</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: T.text, marginBottom: 4 }}>No fields to lock yet</div>
                    <div style={{ fontSize: 12, color: T.muted, marginBottom: 12 }}>Upload your CV in the previous step to preview locks.</div>
                    <button
                      onClick={() => setStep(1)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 6,
                        border: "1px solid #e5edf5",
                        background: "#fff",
                        color: T.blue,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      ← Back to Upload
                    </button>
                  </div>
                ) : (
                  <FieldLocks registry={previewRegistry} locks={locks} onToggle={(id, locked) => setLocks((p) => ({ ...p, [id]: locked }))} />
                )}
                {previewRegistry.length > 0 && (
                  <p style={{ fontSize: 11, color: T.hint, marginTop: 10, lineHeight: 1.5 }}>
                    Preview uses local parse — server will enrich with bullet-level lockReasons (Identity, Education, Equality Act) after setup.
                  </p>
                )}
              </div>
            )}

            {step === 3 && (
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: T.text, margin: "0 0 6px" }}>Career constraints & right to work</h2>
                <p style={{ fontSize: 12, color: T.muted, margin: "0 0 16px", lineHeight: 1.5 }}>
                  Ground truth for tailoring — verifier blocks any claim not in <strong style={{ color: T.text }}>DID</strong>. Be specific: £, %, team size.
                </p>

                {/* Profile row — required for candidate contract */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div>
                    <label htmlFor="ob-fullName" style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                      Full name <span style={{ color: T.red }}>*</span>
                    </label>
                    <input
                      id="ob-fullName"
                      value={profile.fullName}
                      onChange={(e) => {
                        setProfile({ ...profile, fullName: e.target.value });
                        if (fieldErrors.fullName) setFieldErrors((p) => ({ ...p, fullName: undefined }));
                      }}
                      onBlur={() => setTouched((t) => ({ ...t, fullName: true }))}
                      placeholder="Alex Morgan"
                      style={{
                        width: "100%",
                        height: 44,
                        borderRadius: 6,
                        border: `1px solid ${fieldErrors.fullName ? T.red : "#e5edf5"}`,
                        boxShadow: fieldErrors.fullName ? `0 0 0 3px ${T.red}18` : "none",
                        padding: "0 13px",
                        fontSize: 13,
                        fontFamily: T.sans,
                        color: T.text,
                        outline: "none",
                        boxSizing: "border-box",
                        background: "#fff",
                      }}
                    />
                    {fieldErrors.fullName && touched.fullName && <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 500 }}>{fieldErrors.fullName}</div>}
                  </div>
                  <div>
                    <label htmlFor="ob-email" style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                      Email <span style={{ color: T.red }}>*</span>
                    </label>
                    <input
                      id="ob-email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => {
                        setProfile({ ...profile, email: e.target.value });
                        if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }));
                      }}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      placeholder="alex@example.co.uk"
                      style={{
                        width: "100%",
                        height: 44,
                        borderRadius: 6,
                        border: `1px solid ${fieldErrors.email ? T.red : "#e5edf5"}`,
                        padding: "0 13px",
                        fontSize: 13,
                        fontFamily: T.sans,
                        color: T.text,
                        outline: "none",
                        boxSizing: "border-box",
                        background: "#fff",
                      }}
                    />
                    {fieldErrors.email && touched.email && <div style={{ color: T.red, fontSize: 11, marginTop: 4, fontWeight: 500 }}>{fieldErrors.email}</div>}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start", marginBottom: 16 }}>
                  <div>
                    <label htmlFor="ob-did" style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                      ✅ DID — what you actually did
                    </label>
                    <div style={{ fontSize: 11, color: T.hint, marginBottom: 6 }}>One bullet per line · include £ / % / team metrics</div>
                    <textarea
                      id="ob-did"
                      value={didInput}
                      onChange={(e) => setDidInput(e.target.value)}
                      rows={7}
                      placeholder={"• Led Stripe migration, reducing failed payments by 18% (£1.2M recovered ARR)\n• Managed £500k cloud budget across 4 AWS accounts\n• Shipped feature X with 40% performance gain"}
                      style={{
                        width: "100%",
                        minHeight: 132,
                        background: "#fff",
                        border: "1px solid #e5edf5",
                        borderRadius: 6,
                        padding: "10px 12px",
                        fontSize: 13,
                        fontFamily: T.sans,
                        color: T.text,
                        boxSizing: "border-box",
                        resize: "vertical",
                        outline: "none",
                        lineHeight: 1.5,
                      }}
                    />
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>{parsedDid.length} bullets</div>
                  </div>

                  <div>
                    <label htmlFor="ob-didnot" style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                      🚫 DID NOT — guardrails
                    </label>
                    <div style={{ fontSize: 11, color: T.hint, marginBottom: 6 }}>What the AI must never claim</div>
                    <textarea
                      id="ob-didnot"
                      value={didNotInput}
                      onChange={(e) => setDidNotInput(e.target.value)}
                      rows={7}
                      placeholder={"• Did not write Kotlin/Swift mobile code\n• Did not manage people/hiring directly\n• Did not own P&L — IC only"}
                      style={{
                        width: "100%",
                        minHeight: 132,
                        background: "#fff",
                        border: "1px solid #e5edf5",
                        borderRadius: 6,
                        padding: "10px 12px",
                        fontSize: 13,
                        fontFamily: T.sans,
                        color: T.text,
                        boxSizing: "border-box",
                        resize: "vertical",
                        outline: "none",
                        lineHeight: 1.5,
                      }}
                    />
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>{parsedDidNot.length} guardrails</div>
                  </div>
                </div>

                {/* RtW panel */}
                <div style={{ background: "#f6f9fc", border: "1px solid #e5edf5", borderRadius: 8, padding: 14, marginBottom: 8 }}>
                  <label htmlFor="ob-rtw" style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                    🇬🇧 Right to work
                  </label>
                  <div style={{ fontSize: 11, color: T.hint, marginBottom: 8 }}>UK requirement — stored with your candidate profile</div>
                  <select
                    id="ob-rtw"
                    value={profile.rightToWork}
                    onChange={(e) => setProfile({ ...profile, rightToWork: e.target.value })}
                    style={{
                      width: "100%",
                      background: "#fff",
                      border: "1px solid #e5edf5",
                      borderRadius: 6,
                      padding: "10px 10px",
                      fontSize: 13,
                      color: T.text,
                      fontFamily: T.sans,
                      outline: "none",
                      marginBottom: 12,
                      height: 44,
                      boxSizing: "border-box",
                    }}
                  >
                    {RTW_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                  {needsExpiry ? (
                    <div>
                      <label htmlFor="ob-expiry" style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                        Visa expiry
                      </label>
                      <input
                        id="ob-expiry"
                        type="month"
                        value={profile.rightToWorkExpiry}
                        onChange={(e) => setProfile({ ...profile, rightToWorkExpiry: e.target.value })}
                        style={{
                          width: "100%",
                          background: "#fff",
                          border: `1px solid ${fieldErrors.rightToWorkExpiry ? T.red : "#e5edf5"}`,
                          borderRadius: 6,
                          padding: "10px 10px",
                          fontSize: 13,
                          color: T.text,
                          fontFamily: T.sans,
                          outline: "none",
                          boxSizing: "border-box",
                          height: 44,
                        }}
                      />
                      {fieldErrors.rightToWorkExpiry && <div style={{ color: T.red, fontSize: 11, marginTop: 4 }}>{fieldErrors.rightToWorkExpiry}</div>}
                    </div>
                  ) : (
                    <div style={{ fontSize: 11, color: T.muted, background: "#fff", border: "1px solid #e5edf5", borderRadius: 6, padding: "8px 10px" }}>
                      {profile.rightToWork === "British Citizen" ? "No expiry needed — British Citizen." : "No expiry required for this status."}
                    </div>
                  )}

                  {/* Optional extra fields inline */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 12 }}>
                    <div>
                      <label htmlFor="ob-targetRole" style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                        Target role
                      </label>
                      <input
                        id="ob-targetRole"
                        value={profile.targetRole}
                        onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                        placeholder="Senior Product Manager"
                        style={{
                          width: "100%",
                          height: 44,
                          borderRadius: 6,
                          border: "1px solid #e5edf5",
                          padding: "0 13px",
                          fontSize: 13,
                          fontFamily: T.sans,
                          color: T.text,
                          outline: "none",
                          boxSizing: "border-box",
                          background: "#fff",
                        }}
                      />
                    </div>
                    <div>
                      <label htmlFor="ob-location" style={{ display: "block", fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 6 }}>
                        Preferred location
                      </label>
                      <input
                        id="ob-location"
                        value={profile.location}
                        onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                        placeholder="London / Hybrid / Remote"
                        style={{
                          width: "100%",
                          height: 44,
                          borderRadius: 6,
                          border: "1px solid #e5edf5",
                          padding: "0 13px",
                          fontSize: 13,
                          fontFamily: T.sans,
                          color: T.text,
                          outline: "none",
                          boxSizing: "border-box",
                          background: "#fff",
                        }}
                      />
                    </div>
                  </div>
                </div>

                {parsedDid.length === 0 && parsedDidNot.length === 0 && (
                  <div style={{ fontSize: 11, color: T.hint, textAlign: "center", padding: "8px 0 0" }}>Empty states handled — add bullets or leave blank and edit later in Constraints.</div>
                )}
              </div>
            )}
          </div>

          {/* Global error */}
          {error && (
            <div style={{ margin: "0 28px", padding: "10px 12px", background: T.redLight, border: `1px solid ${T.redMid}`, color: T.red, borderRadius: 6, fontSize: 12, fontWeight: 600 }}>
              {error}
            </div>
          )}

          {/* Footer — Back ghost + Continue primary */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "16px 28px",
              borderTop: "1px solid #e5edf5",
              background: "#f6f9fc",
              gap: 12,
            }}
          >
            <button
              onClick={handleBack}
              disabled={step === 1}
              style={{
                height: 44,
                padding: "0 18px",
                borderRadius: 6,
                border: `1px solid ${step === 1 ? "#e5edf5" : "#e5edf5"}`,
                background: "#fff",
                color: step === 1 ? "#94a3b8" : T.text,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: T.sans,
                cursor: step === 1 ? "not-allowed" : "pointer",
                opacity: step === 1 ? 0.55 : 1,
                visibility: step === 1 ? "hidden" : "visible",
              }}
            >
              ← Back
            </button>
            <button
              onClick={handleContinue}
              style={{
                height: 44,
                padding: "0 22px",
                borderRadius: 6,
                background: "#533afd",
                color: "#fff",
                border: "1px solid #533afd",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: T.sans,
                cursor: "pointer",
                boxShadow: "0 1px 2px rgba(83,58,253,0.18)",
                transition: "background 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#4434d4")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#533afd")}
            >
              {step === 3 ? "Complete setup →" : "Continue →"}
            </button>
          </div>
        </div>

        <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", marginTop: 14 }}>GDPR • UK-hosted • D1 / R2 · Stripe Checkout UX — 30s to start</p>
      </div>
    </div>
  );
}
