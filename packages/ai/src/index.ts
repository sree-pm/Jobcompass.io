// Agnostic AI provider — OpenAI-compatible (OpenAI, OpenRouter, Groq, Together, local vLLM, etc.)
// Env: AI_BASE_URL, AI_API_KEY, AI_MODEL
// All agents (tailor, verifier, ingest extractor) go through this.

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };
export type AIProviderConfig = {
  baseUrl: string; // e.g. https://api.openai.com/v1  or https://openrouter.ai/api/v1
  apiKey: string;
  model: string;
  defaultMaxTokens?: number;
  headersExtra?: Record<string, string>;
};

export function getAIConfig(env: Record<string, string | undefined>): AIProviderConfig {
  return {
    baseUrl: (env.AI_BASE_URL || env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""),
    apiKey: env.AI_API_KEY || env.OPENAI_API_KEY || "",
    model: env.AI_MODEL || env.OPENAI_MODEL || "gpt-4o-mini",
    defaultMaxTokens: Number(env.AI_MAX_TOKENS || 3000),
    headersExtra: env.AI_EXTRA_HEADERS ? JSON.parse(env.AI_EXTRA_HEADERS) : undefined,
  };
}

export async function chatComplete(
  messages: ChatMessage[],
  config: AIProviderConfig,
  opts: { maxTokens?: number; temperature?: number; jsonMode?: boolean; signal?: AbortSignal } = {}
): Promise<string> {
  if (!config.apiKey) throw new Error("AI_API_KEY not set — add via wrangler secret put AI_API_KEY");

  const url = `${config.baseUrl}/chat/completions`;
  const body: any = {
    model: config.model,
    messages,
    max_tokens: opts.maxTokens ?? config.defaultMaxTokens ?? 3000,
    temperature: opts.temperature ?? 0.3,
  };
  if (opts.jsonMode) body.response_format = { type: "json_object" };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      ...(config.headersExtra || {}),
    },
    body: JSON.stringify(body),
    signal: opts.signal,
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`AI provider ${res.status} at ${url}: ${text.slice(0, 800)}`);
  }
  const data: any = await res.json();
  const content = data.choices?.[0]?.message?.content ?? "";
  if (!content) throw new Error("Empty AI response — check model / quota");
  return typeof content === "string" ? content : JSON.stringify(content);
}

export function extractJson<T = any>(text: string, fallback: T): T {
  try {
    const clean = text.replace(/```json|```/g, "").trim();
    const m = clean.match(/(\{[\s\S]*?\}|\[[\s\S]*?\])/);
    const jsonStr = m ? m[0] : clean;
    return JSON.parse(jsonStr) as T;
  } catch {
    return fallback;
  }
}

// Convenience: ask for strict JSON array/object
export async function chatJson<T>(messages: ChatMessage[], config: AIProviderConfig, fallback: T, opts?: { maxTokens?: number }): Promise<T> {
  const sys: ChatMessage = { role: "system", content: "You are a JSON-only assistant. Respond with valid JSON only. No markdown, no explanation." };
  const text = await chatComplete([sys, ...messages], config, { ...opts, jsonMode: true });
  return extractJson(text, fallback);
}
