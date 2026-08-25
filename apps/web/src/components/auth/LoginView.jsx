import React, { useState } from "react";
import { T } from "../common/Theme.js";
import { Card, Row, Btn, Field } from "../common/UiPrimitives.jsx";
import { requestCode, verifyCode } from "../../lib/cloudflareApi.js";

export function LoginView({ onLogin }) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState("request"); // "request" | "verify"
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleRequest = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await requestCode(email);
      setStep("verify");
      if (res.devCode) {
        setMessage(res.message);
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
      setError("Please enter the 6-digit code");
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
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: T.bg, padding: 20 }}>
      <Card style={{ maxWidth: 400, width: "100%" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <span style={{ fontSize: 32 }}>🇬🇧</span>
          <h1 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: "12px 0 4px" }}>Agentic CV UK</h1>
          <p style={{ fontSize: 13, color: T.muted }}>Sign in to access your master CV and credits.</p>
        </div>

        {step === "request" ? (
          <form onSubmit={handleRequest}>
            <Field 
              label="Email Address" 
              type="email" 
              value={email} 
              onChange={setEmail} 
              placeholder="you@example.com" 
              required
            />
            {error && <div style={{ color: T.red, fontSize: 12, marginBottom: 12, fontWeight: 600 }}>{error}</div>}
            <Btn type="submit" variant="primary" style={{ width: "100%" }} disabled={loading || !email}>
              {loading ? "Sending..." : "Send Login Code"}
            </Btn>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <div style={{ fontSize: 13, color: T.text, marginBottom: 16 }}>
              Sent to <strong>{email}</strong>. 
              <span style={{ color: T.blue, cursor: "pointer", marginLeft: 8 }} onClick={() => { setStep("request"); setCode(""); }}>Change</span>
            </div>
            {message && <div style={{ color: T.green, background: T.greenLight, padding: 10, borderRadius: 6, fontSize: 12, marginBottom: 16 }}>{message}</div>}
            <Field 
              label="6-Digit Code" 
              value={code} 
              onChange={setCode} 
              placeholder="123456" 
              maxLength={6}
              required
            />
            {error && <div style={{ color: T.red, fontSize: 12, marginBottom: 12, fontWeight: 600 }}>{error}</div>}
            <Btn type="submit" variant="primary" style={{ width: "100%" }} disabled={loading || code.length !== 6}>
              {loading ? "Verifying..." : "Sign In"}
            </Btn>
          </form>
        )}
      </Card>
    </div>
  );
}
