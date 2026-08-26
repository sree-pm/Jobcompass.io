// JobCompass transactional email via Cloudflare Email Sending (binding: env.EMAIL)
// From domain: jobcompass.io (onboarded + SPF/DKIM auto-configured by Cloudflare)
// Transactional only: PIN codes, receipts, application confirmations.

export type EmailEnv = {
  EMAIL?: any; // send_email binding — env.EMAIL.send({...})
  ENVIRONMENT?: string;
};

const BRAND = "JobCompass";
const FROM = { email: "noreply@jobcompass.io", name: "JobCompass" };
const SUPPORT = "support@jobcompass.io";

function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f6f9fc;font-family:Inter,-apple-system,'Segoe UI',Roboto,sans-serif">
  <div style="max-width:480px;margin:0 auto;padding:32px 16px">
    <div style="text-align:center;padding:16px 0 24px">
      <span style="font-size:20px;font-weight:700;color:#061b31;letter-spacing:-0.02em">Job</span><span style="font-size:20px;font-weight:700;color:#533afd;letter-spacing:-0.02em">Compass</span>
    </div>
    <div style="background:#ffffff;border:1px solid #e5edf5;border-radius:12px;padding:32px;box-shadow:rgba(50,50,93,0.12) 0 4px 12px">
      ${bodyHtml}
    </div>
    <p style="text-align:center;font-size:12px;color:#94a3b8;margin-top:24px;line-height:1.6">
      ${BRAND} · UK job search, done properly<br>
      If you didn't request this email, you can safely ignore it.
    </p>
  </div>
</body></html>`;
}

export async function sendPinEmail(to: string, pin: string, env: EmailEnv): Promise<{ sent: boolean; error?: string }> {
  const html = layout(
    "Your sign-in code",
    `<h1 style="font-size:20px;font-weight:600;color:#061b31;margin:0 0 8px">Your sign-in code</h1>
     <p style="font-size:14px;color:#64748d;margin:0 0 24px">Use this code to sign in to ${BRAND}. It expires in 10 minutes.</p>
     <div style="background:#f0f0ff;border:1px solid #b9b9f9;border-radius:8px;padding:16px;text-align:center;margin:0 0 24px">
       <span style="font-size:32px;font-weight:700;letter-spacing:8px;color:#533afd;font-family:'JetBrains Mono',monospace">${pin}</span>
     </div>
     <p style="font-size:13px;color:#64748d;margin:0;line-height:1.6">For your security, never share this code. ${BRAND} staff will never ask for it.</p>`
  );
  const text = `Your ${BRAND} sign-in code is: ${pin}\n\nIt expires in 10 minutes. If you didn't request this, ignore this email.`;

  if (!env.EMAIL?.send) {
    // No binding (local dev without remote proxy) — caller decides fallback
    return { sent: false, error: "EMAIL binding not available" };
  }
  try {
    await env.EMAIL.send({
      to,
      from: FROM,
      replyTo: SUPPORT,
      subject: `${pin} is your ${BRAND} sign-in code`,
      html,
      text,
    });
    return { sent: true };
  } catch (e: any) {
    return { sent: false, error: `${e?.code || "EMAIL_ERROR"}: ${e?.message || e}` };
  }
}

export async function sendReceiptEmail(to: string, packName: string, credits: number, priceGbp: number, env: EmailEnv): Promise<{ sent: boolean; error?: string }> {
  const html = layout(
    "Payment received",
    `<h1 style="font-size:20px;font-weight:600;color:#061b31;margin:0 0 8px">Payment received — thank you!</h1>
     <p style="font-size:14px;color:#64748d;margin:0 0 20px">Your ${BRAND} credits have been added to your account.</p>
     <table style="width:100%;border-collapse:collapse;font-size:14px">
       <tr><td style="padding:8px 0;color:#64748d">Pack</td><td style="padding:8px 0;color:#061b31;font-weight:600;text-align:right">${packName}</td></tr>
       <tr><td style="padding:8px 0;color:#64748d;border-top:1px solid #f1f5f9">Credits</td><td style="padding:8px 0;color:#061b31;font-weight:600;text-align:right;border-top:1px solid #f1f5f9">${credits}</td></tr>
       <tr><td style="padding:8px 0;color:#64748d;border-top:1px solid #f1f5f9">Amount</td><td style="padding:8px 0;color:#061b31;font-weight:600;text-align:right;border-top:1px solid #f1f5f9">£${priceGbp.toFixed(2)}</td></tr>
     </table>
     <p style="font-size:13px;color:#64748d;margin:20px 0 0;line-height:1.6">Credits never expire. Good luck with your applications!</p>`
  );
  const text = `Payment received: ${packName} (${credits} credits, £${priceGbp.toFixed(2)}). Credits never expire.`;

  if (!env.EMAIL?.send) return { sent: false, error: "EMAIL binding not available" };
  try {
    await env.EMAIL.send({ to, from: FROM, replyTo: SUPPORT, subject: `${BRAND} receipt — ${packName}`, html, text });
    return { sent: true };
  } catch (e: any) {
    return { sent: false, error: `${e?.code || "EMAIL_ERROR"}: ${e?.message || e}` };
  }
}
