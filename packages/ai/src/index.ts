// JobCompass multi-provider AI router
// ─────────────────────────────────────────────────────────────────────
// Strategy 2 (Hybrid: Quality-Critical + Cheap):
//   tailor        → DeepSeek V3        ($0.27/$1.10 per 1M — excellent quality, fast)
//   verifier      → Claude 3.5 Haiku   ($0.80/$4   per 1M — catches mistakes)
//   interview/cl  → GPT-4o-mini        ($0.15/$0.60 per 1M — creative, cheap)
//   classify/verify→ Cloudflare Workers AI (Llama 3.3 70B — free tier, on-platform)
// All external calls route through AI Gateway when configured
// (caching + fallback + cost tracking + rate limiting).
// ─────────────────────────────────────────────────────────────────────

export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export type AIProviderConfig = {
  baseUrl: string;
  apiKey: string;
  model: string;
  defaultMaxTokens?: number;
  headersExtra?: Record<string, string>;
};

// Task → provider routing table (overridable via env)
export type AITask =
  | "tailor" | "verifier" | "creative"      // per-credit agents
  | "classify" | "verify_job" | "extract"   // platform agents (cheap/on-platform)
  | "embed";

const TASK_DEFAULTS: Record<AITask, { provider: "deepseek" | "anthropic" | "openai" | "workersai"; model: string }> = {
  tailor:     { provider: "deepseek",  model: "deepseek-chat" },
  verifier:   { provider: "anthropic", model: "claude-3-5-haiku-latest" },
  creative:   { provider: "openai",    model: "gpt-4o-mini" },
  classify:   { provider: "workersai", model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast" },
  verify_job: { provider: "workersai", model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast" },
  extract:    { provider: "workersai", model: "@cf/meta/llama-3.3-70b-instruct-fp8-fast" },
  embed:      { provider: "workersai", model: "@cf/baai/bge-small-en-v1.5" },
};

export type AIRouterEnv = {
  ACCOUNT_ID?: string;
  AI_GATEWAY_URL?: string;          // https://gateway.ai.cloudflare.com/v1/<account>/<gateway>
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  DEEPSEEK_API_KEY?: string;
  // Legacy single-provider compat
  AI_BASE_URL?: string;
  AI_API_KEY?: string;
  AI_MODEL?: string;
  // Workers AI binding (optional — falls back to REST)
  AI?: any;
};

function baseUrlFor(provider: string): string {
  switch (provider) {
    case "deepseek":  return "https://api.deepseek.com/v1";
    case "anthropic": return "https://api.anthropic.com/v1";
    case "openai":    return "https://api.openai.com/v1";
    default:          return "https://api.openai.com/v1";
  }
}

function apiKeyFor(provider: string, env: AIRouterEnv): string {
  switch (provider) {
    case "deepseek":  return env.DEEPSEEK_API_KEY || "";
    case "anthropic": return env.ANTHROPIC_API_KEY || "";
    case "openai":    return env.OPENAI_API_KEY || "";
    default:          return "";
  }
}

// AI Gateway prefix — all external calls get caching/observability/fallback
function throughGateway(url: string, env: AIRouterEnv, provider: string): string {
  if (!env.AI_GATEWAY_URL) return url;
  // gateway.ai.cloudflare.com/v1/<account>/<gateway>/<provider>/<endpoint>
  const gw = env.AI_GATEWAY_URL.replace(/\/$/, "");
  const path = url.replace(/^https:\/\/[^/]+/, "");
  return `${gw}/${provider}${path}`;
}

// Legacy single-provider config (kept for backward compat)
export function getAIConfig(env: Record<string, string | undefined>): AIProviderConfig {
  return {
    baseUrl: (env.AI_BASE_URL || env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, ""),
    apiKey: env.AI_API_KEY || env.OPENAI_API_KEY || "",
    model: env.AI_MODEL || env.OPENAI_MODEL || "gpt-4o-mini",
    defaultMaxTokens: Number(env.AI_MAX_TOKENS || 3000),
    headersExtra: env.AI_EXTRA_HEADERS ? JSON.parse(env.AI_EXTRA_HEADERS) : undefined,
  };
}

export type ChatOpts = { maxTokens?: number; temperature?: number; jsonMode?: boolean; signal?: AbortSignal };

// ── Workers AI (on-platform, free tier: 10K neurons/day) ────────────
export async function workersAiChat(
  messages: ChatMessage[],
  env: AIRouterEnv,
  opts: ChatOpts & { model?: string } = {}
): Promise<string> {
  const model = opts.model || TASK_DEFAULTS.classify.model;

  // Prefer binding if available
  if (env.AI?.run) {
    const res = await env.AI.run(model, {
      messages,
      max_tokens: opts.maxTokens ?? 2000,
      temperature: opts.temperature ?? 0.2,
    });
    return res?.response || JSON.stringify(res);
  }

  // REST fallback
  if (!env.ACCOUNT_ID) throw new Error("Workers AI needs ACCOUNT_ID or AI binding");
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/ai/run/${model}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.OPENAI_API_KEY || ""}` },
    body: JSON.stringify({ messages, max_tokens: opts.maxTokens ?? 2000, temperature: opts.temperature ?? 0.2 }),
    signal: opts.signal,
  });
  if (!res.ok) throw new Error(`Workers AI ${res.status}: ${(await res.text()).slice(0, 400)}`);
  const data: any = await res.json();
  return data?.result?.response || "";
}

// ── Workers AI embeddings (for A5 Matchmaker via Vectorize) ─────────
export async function workersAiEmbed(texts: string[], env: AIRouterEnv): Promise<number[][]> {
  const model = TASK_DEFAULTS.embed.model;
  if (env.AI?.run) {
    const res = await env.AI.run(model, { text: texts });
    return res?.data?.map((d: any) => d.embedding) || [];
  }
  if (!env.ACCOUNT_ID) throw new Error("Workers AI embedding needs ACCOUNT_ID or AI binding");
  const url = `https://api.cloudflare.com/client/v4/accounts/${env.ACCOUNT_ID}/ai/run/${model}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${env.OPENAI_API_KEY || ""}` },
    body: JSON.stringify({ text: texts }),
  });
  if (!res.ok) throw new Error(`Workers AI embed ${res.status}`);
  const data: any = await res.json();
  return data?.result?.data?.map((d: any) => d.embedding) || [];
}

// ── Generic chat completion (OpenAI-compatible: OpenAI/DeepSeek/Groq/etc.) ──
export async function chatComplete(
  messages: ChatMessage[],
  config: AIProviderConfig,
  opts: ChatOpts = {}
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

// ── Anthropic Messages API (native — best for Claude) ───────────────
export async function anthropicChat(
  messages: ChatMessage[],
  env: AIRouterEnv,
  opts: ChatOpts & { model?: string } = {}
): Promise<string> {
  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_API_KEY not set");
  const model = opts.model || TASK_DEFAULTS.verifier.model;

  const system = messages.filter(m => m.role === "system").map(m => m.content).join("\n");
  const convo = messages.filter(m => m.role !== "system");

  const url = throughGateway("https://api.anthropic.com/v1/messages", env, "anthropic");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: opts.maxTokens ?? 2000,
      temperature: opts.temperature ?? 0.2,
      system: system || undefined,
      messages: convo,
    }),
    signal: opts.signal,
  });
  if (!res.ok) throw new Error(`Anthropic ${res.status}: ${(await res.text()).slice(0, 600)}`);
  const data: any = await res.json();
  return data?.content?.[0]?.text || "";
}

// ── THE ROUTER: pick provider by task, with automatic fallback chain ──
export async function routeChat(
  task: AITask,
  messages: ChatMessage[],
  env: AIRouterEnv,
  opts: ChatOpts = {}
): Promise<string> {
  const { provider, model } = TASK_DEFAULTS[task];
  const errors: string[] = [];

  // 1) Primary provider for this task
  try {
    if (provider === "workersai") return await workersAiChat(messages, env, { ...opts, model });
    if (provider === "anthropic") return await anthropicChat(messages, env, { ...opts, model });

    const apiKey = apiKeyFor(provider, env);
    if (apiKey) {
      return await chatComplete(messages, {
        baseUrl: throughGateway(baseUrlFor(provider), env, provider),
        apiKey,
        model,
        defaultMaxTokens: opts.maxTokens ?? 3000,
      }, opts);
    }
    errors.push(`${provider}: no API key`);
  } catch (e: any) {
    errors.push(`${provider}: ${e.message}`);
  }

  // 2) Fallback chain: legacy single-provider → GPT-4o-mini → Workers AI
  try {
    const legacy = getAIConfig(env as any);
    if (legacy.apiKey) return await chatComplete(messages, legacy, opts);
  } catch (e: any) { errors.push(`legacy: ${e.message}`); }

  try {
    if (env.OPENAI_API_KEY) {
      return await chatComplete(messages, {
        baseUrl: throughGateway("https://api.openai.com/v1", env, "openai"),
        apiKey: env.OPENAI_API_KEY,
        model: "gpt-4o-mini",
      }, opts);
    }
  } catch (e: any) { errors.push(`openai fallback: ${e.message}`); }

  try {
    return await workersAiChat(messages, env, opts);
  } catch (e: any) { errors.push(`workersai fallback: ${e.message}`); }

  throw new Error(`All AI providers failed for task "${task}": ${errors.join(" | ")}`);
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

export async function routeJson<T>(task: AITask, messages: ChatMessage[], env: AIRouterEnv, fallback: T, opts?: ChatOpts): Promise<T> {
  const sys: ChatMessage = { role: "system", content: "You are a JSON-only assistant. Respond with valid JSON only. No markdown, no explanation." };
  const text = await routeChat(task, [sys, ...messages], env, { ...opts, jsonMode: true });
  return extractJson(text, fallback);
}

// Legacy convenience wrapper
export async function chatJson<T>(messages: ChatMessage[], config: AIProviderConfig, fallback: T, opts?: { maxTokens?: number }): Promise<T> {
  const sys: ChatMessage = { role: "system", content: "You are a JSON-only assistant. Respond with valid JSON only. No markdown, no explanation." };
  const text = await chatComplete([sys, ...messages], config, { ...opts, jsonMode: true });
  return extractJson(text, fallback);
}
