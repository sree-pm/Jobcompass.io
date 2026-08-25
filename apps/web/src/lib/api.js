// LLM + job extraction helpers — UK defaults, swappable between local mock and server proxy.
// In prod, route through /api/llm proxy to avoid CORS and key exposure.

export async function callAI(messages, { model = "claude-sonnet-4-20250514", max_tokens = 2500, tools } = {}) {
  // Always proxy through server to avoid client-side key exposure
  const proxy = import.meta.env.VITE_ANTHROPIC_PROXY || (import.meta.env.VITE_API_URL || "http://localhost:8787") + "/api/llm";
  const body = { model, max_tokens, messages };
  if (tools) body.tools = tools;
  try {
    const res = await fetch(proxy, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-api-key": import.meta.env.VITE_API_KEY || "" },
      body: JSON.stringify(body)
    });
    const d = await res.json();
    if (d.error) throw new Error(d.error.message || d.error);
    // Support both Anthropic and OpenAI response formats
    if (d.content) return d.content.filter(b => b.type === "text").map(b => b.text).join("");
    if (d.choices) return d.choices[0]?.message?.content || "";
    return d.text || "";
  } catch (e) { return `[Error: ${e.message}]`; }
}

export function parseJSON(text, fb = {}) {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const m = clean.match(/({[\s\S]*?}|\[[\s\S]*?\])/);
    return m ? JSON.parse(m[0]) : JSON.parse(clean);
  } catch { return fb; }
}

export async function extractCVFromFile(file) {
  if (file.type === "text/plain") {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsText(file);
    });
  }
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = async () => {
      try {
        const base64 = r.result.split(",")[1];
        const result = await callAI([{
          role: "user",
          content: [
            { type: "document", source: { type: "base64", media_type: file.type || "application/pdf", data: base64 } },
            { type: "text", text: "Extract all text from this UK CV. Return plain text preserving structure. Do not add or infer." }
          ]
        }], { max_tokens: 3000 });
        if (!result || result.startsWith("[Error")) rej(new Error("AI could not extract text"));
        else res(result);
      } catch (e) { rej(e); }
    };
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
