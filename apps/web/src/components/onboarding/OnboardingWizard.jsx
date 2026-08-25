import React, { useState } from "react";
import { T } from "../common/Theme.js";
import { Card, Row, Btn, Field, Label } from "../common/UiPrimitives.jsx";
import { extractCVFromFile } from "../../lib/api.js";

export function OnboardingWizard({ onComplete }) {
  const [step, setStep] = useState(1);
  const [profile, setProfile] = useState({
    fullName: "",
    email: "",
    phone: "",
    targetRole: "",
    industry: "Technology",
    location: "London, UK",
    salaryMin: 65000,
    salaryMax: 85000,
    currency: "GBP",
    noticePeriod: "1 month",
    rightToWork: "British Citizen",
  });
  const [cvText, setCvText] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsExtracting(true);
    setError("");
    try {
      const text = await extractCVFromFile(file);
      setCvText(text);
    } catch (err) {
      setError("Failed to extract CV text: " + err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleFinish = () => {
    if (!profile.fullName || !profile.email) {
      setError("Full name and email are required.");
      return;
    }
    onComplete({ profile, cvText });
  };

  return (
    <div style={{ maxWidth: 640, margin: "40px auto", padding: "0 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <span style={{ fontSize: 32 }}>🇬🇧</span>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: T.text, margin: "8px 0 4px" }}>
          Welcome to Agentic CV (UK)
        </h1>
        <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
          Step {step} of 2 · UK-Compliant Job Discovery & Tailoring
        </p>
      </div>

      <Card>
        {step === 1 ? (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 16px", color: T.text }}>
              1. Candidate Profile & UK Rights
            </h3>
            {error && <div style={{ padding: "8px 12px", background: T.redLight, color: T.red, borderRadius: 6, fontSize: 12, marginBottom: 12 }}>{error}</div>}

            <Field label="Full Name" value={profile.fullName} onChange={v => setProfile({ ...profile, fullName: v })} placeholder="e.g. Alex Morgan" />
            <Field label="Email Address" value={profile.email} onChange={v => setProfile({ ...profile, email: v })} placeholder="alex@example.co.uk" type="email" />
            <Field label="Phone Number" value={profile.phone} onChange={v => setProfile({ ...profile, phone: v })} placeholder="+44 7xxx xxxxxx" />
            
            <Row gap={12}>
              <div style={{ flex: 1 }}>
                <Field label="Target Role" value={profile.targetRole} onChange={v => setProfile({ ...profile, targetRole: v })} placeholder="e.g. Senior Product Manager" />
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Preferred Location" value={profile.location} onChange={v => setProfile({ ...profile, location: v })} placeholder="London / Hybrid / Remote" />
              </div>
            </Row>

            <Row gap={12}>
              <div style={{ flex: 1 }}>
                <Field label="Min Salary (£ GBP)" value={profile.salaryMin} onChange={v => setProfile({ ...profile, salaryMin: parseInt(v) || 0 })} type="number" />
              </div>
              <div style={{ flex: 1 }}>
                <Field label="Max Salary (£ GBP)" value={profile.salaryMax} onChange={v => setProfile({ ...profile, salaryMax: parseInt(v) || 0 })} type="number" />
              </div>
            </Row>

            <Field label="Right to Work Status" value={profile.rightToWork} onChange={v => setProfile({ ...profile, rightToWork: v })} placeholder="British Citizen / Settled Status / Skilled Worker" />

            <Row justify="flex-end" style={{ marginTop: 20 }}>
              <Btn variant="primary" onClick={() => { if (!profile.fullName || !profile.email) { setError("Name & Email required"); return; } setError(""); setStep(2); }}>
                Continue to Master CV →
              </Btn>
            </Row>
          </div>
        ) : (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 8px", color: T.text }}>
              2. Upload or Paste Master CV
            </h3>
            <p style={{ fontSize: 12, color: T.muted, marginBottom: 16 }}>
              Upload your current CV (PDF or Plaintext). We'll convert it to atomic fields with bullet-level locks.
            </p>

            <div style={{ border: `2px dashed ${T.borderStrong}`, borderRadius: 8, padding: 20, textAlign: "center", marginBottom: 16, background: T.bg }}>
              <input type="file" accept=".pdf,.txt" onChange={handleFileUpload} style={{ display: "none" }} id="cv-upload" />
              <label htmlFor="cv-upload" style={{ cursor: "pointer", display: "block" }}>
                <div style={{ fontSize: 24, marginBottom: 6 }}>📄</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.blue }}>
                  {isExtracting ? "Extracting CV with AI..." : "Click to select CV (.pdf or .txt)"}
                </div>
                <div style={{ fontSize: 11, color: T.muted, marginTop: 4 }}>Preserves A4 layout & structure</div>
              </label>
            </div>

            <Label>Or Paste Plaintext CV</Label>
            <textarea
              value={cvText}
              onChange={e => setCvText(e.target.value)}
              rows={8}
              placeholder="Paste your CV text here..."
              style={{
                width: "100%",
                background: T.bg,
                border: `1px solid ${T.border}`,
                borderRadius: 7,
                padding: 10,
                fontSize: 12,
                fontFamily: T.sans,
                boxSizing: "border-box",
              }}
            />

            <Row justify="space-between" style={{ marginTop: 20 }}>
              <Btn variant="ghost" onClick={() => setStep(1)}>← Back</Btn>
              <Btn variant="success" onClick={handleFinish} disabled={!cvText.trim() && !isExtracting}>
                Complete Setup & Launch 🚀
              </Btn>
            </Row>
          </div>
        )}
      </Card>
    </div>
  );
}
