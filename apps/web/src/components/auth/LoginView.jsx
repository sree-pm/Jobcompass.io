import React, { useState } from "react";
import { T } from "../common/Theme.js";
import { requestCode, verifyCode } from "../../lib/cloudflareApi.js";

export function LoginView({ onLogin }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("request"); // "request" | "verify"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [codeFocused, setCodeFocused] = useState(false);
  const [emailTouched, setEmailTouched] = useState(false);

  // Zod-style inline validation
  const emailError = (() => {
    if (!emailTouched || !email) return "";
    // Zod: invalid_string email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Invalid email address";
    return "";
  })();

  const handleRequest = async (e) => {
    e.preventDefault();
    setEmailTouched(true);
    if (!email) {
      setError("Required");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Invalid email address");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await requestCode(email);
      setStep("verify");
      if (res.devCode) {
        setMessage(res.message || `Dev code: ${res.devCode}`);
      } else {
        setMessage(res.message || "Code sent to your email.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      setError("String must contain exactly 6 character(s)");
      return;
    }
    if (!/^\d{6}$/.test(code)) {
      setError("Code must be 6 digits");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await verifyCode(email, code);
      localStorage.setItem("agentic_cv_uk_token", res.token);
      onLogin(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f6f9fc",
        padding: 20,
        fontFamily: T.sans,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@300;400;600;700&display=swap');`}</style>

      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#ffffff",
          borderRadius: 12,
          border: "1px solid #e5edf5",
          boxShadow: T.shadowFloat,
          padding: "36px 36px 28px",
          boxSizing: "border-box",
        }}
      >
        {/* Brand mark + heading */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
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
              marginBottom: 16,
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
            Welcome back
          </h1>
          <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.4, fontWeight: 400 }}>
            Sign in to Agentic CV — UK job tailoring, A4 · GDPR
          </p>
        </div>

        {step === "request" ? (
          <form onSubmit={handleRequest} noValidate>
            <label
              htmlFor="login-email"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: T.text,
                marginBottom: 6,
                letterSpacing: "0.01em",
              }}
            >
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError("");
              }}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => {
                setEmailFocused(false);
                setEmailTouched(true);
              }}
              placeholder="you@company.co.uk"
              required
              autoComplete="email"
              style={{
                width: "100%",
                height: 44,
                borderRadius: 6,
                border: `1px solid ${emailFocused ? T.blue : emailError ? T.red : "#e5edf5"}`,
                boxShadow: emailFocused ? `0 0 0 3px ${T.blue}18` : "none",
                padding: "0 13px",
                fontSize: 14,
                fontFamily: T.sans,
                color: T.text,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s, box-shadow 0.15s",
                background: "#fff",
              }}
            />
            <style>{`#login-email::placeholder{color:#94a3b8}`}</style>
            {emailError && <div style={{ color: T.red, fontSize: 12, marginTop: 6, fontWeight: 500 }}>{emailError}</div>}
            {error && !emailError && <div style={{ color: T.red, fontSize: 12, marginTop: 8, fontWeight: 600 }}>{error}</div>}

            <button
              type="submit"
              disabled={loading || !email}
              onMouseEnter={(e) => {
                if (!loading && email) e.currentTarget.style.background = "#4434d4";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#533afd";
              }}
              style={{
                width: "100%",
                height: 44,
                borderRadius: 6,
                background: "#533afd",
                color: "#fff",
                border: "1px solid #533afd",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: T.sans,
                cursor: loading || !email ? "not-allowed" : "pointer",
                opacity: loading || !email ? 0.9 : 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 16,
                transition: "background 0.15s, opacity 0.15s",
                boxShadow: "0 1px 2px rgba(83,58,253,0.18)",
              }}
            >
              {loading && (
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.35)",
                    borderTopColor: "#fff",
                    borderRadius: 999,
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              )}
              {loading ? "Sending code…" : "Continue with email"}
            </button>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>

            <div style={{ textAlign: "center", marginTop: 14 }}>
              <p style={{ fontSize: 12, color: T.muted, margin: "0 0 12px", lineHeight: 1.5 }}>
                No password — we email a 6-digit code
              </p>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  fontSize: 11,
                  color: "#94a3b8",
                  letterSpacing: "0.02em",
                  fontWeight: 500,
                  borderTop: "1px solid #f1f5f9",
                  paddingTop: 12,
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <span>GDPR</span>
                <span style={{ color: "#e2e8f0" }}>•</span>
                <span>UK-hosted</span>
                <span style={{ color: "#e2e8f0" }}>•</span>
                <span>D1 / R2</span>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify} noValidate>
            <div style={{ fontSize: 13, color: T.text, marginBottom: 14, lineHeight: 1.5 }}>
              Code sent to <strong style={{ color: T.text }}>{email}</strong>
              <span
                role="button"
                tabIndex={0}
                onClick={() => {
                  setStep("request");
                  setCode("");
                  setError("");
                  setMessage("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setStep("request");
                    setCode("");
                  }
                }}
                style={{ color: T.blue, cursor: "pointer", marginLeft: 8, fontWeight: 600, fontSize: 13 }}
              >
                Change
              </span>
            </div>

            {message && (
              <div
                style={{
                  color: T.green,
                  background: T.greenLight,
                  border: `1px solid ${T.greenMid}`,
                  padding: "10px 12px",
                  borderRadius: 6,
                  fontSize: 12,
                  marginBottom: 14,
                  lineHeight: 1.4,
                }}
              >
                {message}
              </div>
            )}

            <label
              htmlFor="login-code"
              style={{
                display: "block",
                fontSize: 12,
                fontWeight: 600,
                color: T.text,
                marginBottom: 6,
              }}
            >
              6-digit code
            </label>
            <input
              id="login-code"
              value={code}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                setCode(v);
                if (error) setError("");
              }}
              onFocus={() => setCodeFocused(true)}
              onBlur={() => setCodeFocused(false)}
              placeholder="123456"
              maxLength={6}
              inputMode="numeric"
              autoComplete="one-time-code"
              style={{
                width: "100%",
                height: 44,
                borderRadius: 6,
                border: `1px solid ${codeFocused ? T.blue : "#e5edf5"}`,
                boxShadow: codeFocused ? `0 0 0 3px ${T.blue}18` : "none",
                padding: "0 13px",
                fontSize: 16,
                letterSpacing: "0.22em",
                fontFamily: T.mono,
                color: T.text,
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.15s, box-shadow 0.15s",
                background: "#fff",
                textAlign: "center",
              }}
            />
            <style>{`#login-code::placeholder{color:#94a3b8; letter-spacing:0.08em}`}</style>

            {error && <div style={{ color: T.red, fontSize: 12, marginTop: 8, fontWeight: 600 }}>{error}</div>}

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              onMouseEnter={(e) => {
                if (!loading && code.length === 6) e.currentTarget.style.background = "#4434d4";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#533afd";
              }}
              style={{
                width: "100%",
                height: 44,
                borderRadius: 6,
                background: "#533afd",
                color: "#fff",
                border: "1px solid #533afd",
                fontSize: 14,
                fontWeight: 600,
                fontFamily: T.sans,
                cursor: loading || code.length !== 6 ? "not-allowed" : "pointer",
                opacity: loading || code.length !== 6 ? 0.7 : 1,
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 16,
                transition: "background 0.15s, opacity 0.15s",
                boxShadow: "0 1px 2px rgba(83,58,253,0.18)",
              }}
            >
              {loading && (
                <span
                  style={{
                    width: 16,
                    height: 16,
                    border: "2px solid rgba(255,255,255,0.35)",
                    borderTopColor: "#fff",
                    borderRadius: 999,
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }}
                />
              )}
              {loading ? "Verifying…" : "Sign in"}
            </button>

            <p style={{ fontSize: 11, color: "#94a3b8", textAlign: "center", margin: "12px 0 0" }}>
              Code expires in 10 minutes · Check spam folder
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
