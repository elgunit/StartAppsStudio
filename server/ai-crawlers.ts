// AI assistant / crawler detection.
//
// Maps a request's User-Agent (and, as a fallback, its Referer) to a
// canonical bot name when it matches a known AI assistant. We log these
// hits to the database so we can see which assistants actually drive
// traffic — GA4 hides them in "Direct" / "Other" because they don't
// send standard referrers.
//
// Patterns are taken from each vendor's published crawler docs:
//   - OpenAI (GPTBot, ChatGPT-User, OAI-SearchBot)
//   - Anthropic (ClaudeBot, anthropic-ai, Claude-Web, Claude-User, Claude-SearchBot)
//   - Perplexity (PerplexityBot, Perplexity-User)
//   - Google (Google-Extended is a robots.txt token, not a UA — Googlebot
//     visits with the same UA, so we don't tag it as AI here.)
//   - Common ML/agent crawlers we still want visibility on.

export interface AiBotMatch {
  botName: string;
  source: "user-agent" | "referrer";
}

// Order matters — first match wins. More specific patterns should come
// before more general ones (e.g. "ChatGPT-User" before "GPT").
const USER_AGENT_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: "ChatGPT-User", regex: /ChatGPT-User/i },
  { name: "OAI-SearchBot", regex: /OAI-SearchBot/i },
  { name: "GPTBot", regex: /GPTBot/i },
  { name: "ClaudeBot", regex: /ClaudeBot/i },
  { name: "Claude-User", regex: /Claude-User/i },
  { name: "Claude-Web", regex: /Claude-Web/i },
  { name: "Claude-SearchBot", regex: /Claude-SearchBot/i },
  { name: "anthropic-ai", regex: /anthropic-ai/i },
  { name: "PerplexityBot", regex: /PerplexityBot/i },
  { name: "Perplexity-User", regex: /Perplexity-User/i },
  { name: "Google-Extended", regex: /Google-Extended/i },
  { name: "Applebot-Extended", regex: /Applebot-Extended/i },
  { name: "Bytespider", regex: /Bytespider/i },
  { name: "CCBot", regex: /CCBot/i },
  { name: "cohere-ai", regex: /cohere-ai/i },
  { name: "Diffbot", regex: /Diffbot/i },
  { name: "FacebookBot", regex: /FacebookBot/i },
  { name: "Meta-ExternalAgent", regex: /Meta-ExternalAgent/i },
  { name: "Amazonbot", regex: /Amazonbot/i },
  { name: "YouBot", regex: /YouBot/i },
  { name: "Mistral", regex: /MistralAI-User|Mistral/i },
];

// Referrers for human visitors arriving via an AI assistant's answer link.
// These don't always get tagged as bots in the UA, but we still want to
// attribute the visit to the assistant that sent them.
const REFERRER_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: "ChatGPT (referral)", regex: /(?:^|\.)chat\.openai\.com/i },
  { name: "ChatGPT (referral)", regex: /(?:^|\.)chatgpt\.com/i },
  { name: "Claude (referral)", regex: /(?:^|\.)claude\.ai/i },
  { name: "Perplexity (referral)", regex: /(?:^|\.)perplexity\.ai/i },
  { name: "Gemini (referral)", regex: /(?:^|\.)gemini\.google\.com/i },
  { name: "Copilot (referral)", regex: /(?:^|\.)copilot\.microsoft\.com/i },
  { name: "You.com (referral)", regex: /(?:^|\.)you\.com/i },
  { name: "Phind (referral)", regex: /(?:^|\.)phind\.com/i },
];

export function detectAiBot(
  userAgent: string | undefined | null,
  referrer: string | undefined | null,
): AiBotMatch | null {
  const ua = (userAgent || "").trim();
  if (ua) {
    for (const { name, regex } of USER_AGENT_PATTERNS) {
      if (regex.test(ua)) return { botName: name, source: "user-agent" };
    }
  }
  const ref = (referrer || "").trim();
  if (ref) {
    let host = ref;
    try {
      host = new URL(ref).hostname;
    } catch {
      // Some referrers may already be a bare hostname; fall through.
    }
    for (const { name, regex } of REFERRER_PATTERNS) {
      if (regex.test(host)) return { botName: name, source: "referrer" };
    }
  }
  return null;
}
