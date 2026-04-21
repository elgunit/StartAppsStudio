// Verifies that traffic claiming to be a known AI bot really originates from
// that vendor's published IP ranges. Without this, anyone can spoof a
// `User-Agent: GPTBot` header and inflate our analytics. OpenAI, Anthropic,
// and Perplexity all publish JSON files listing the IP CIDR blocks their
// crawlers use; we fetch and cache those, then check each request's source
// IP against the matching list.
//
// Verification is best-effort: if a fetch fails we keep the previous good
// list, and bots without a published list are reported as "unverifiable"
// (neither verified nor spoof) so we never silently penalise legit traffic
// just because we lack a way to check it.

import { isIP } from "node:net";
import { promises as dns } from "node:dns";

export type VerificationStatus = "verified" | "spoofed" | "unverifiable";

interface VendorSource {
  name: string;
  bots: string[];
  url: string;
}

interface VendorReverseDns {
  name: string;
  bots: string[];
  // Hostname suffixes whose forward-confirmed reverse DNS proves the IP
  // really belongs to the vendor. Always include the leading dot to avoid
  // matching attacker-controlled domains like `notanthropic.com`.
  suffixes: string[];
}

// Order doesn't matter — each source contributes ranges to its listed bots.
// Update this list when vendors publish new endpoints; the auto-refresh
// timer (every 24h) will pick changes up without a deploy.
const VENDOR_SOURCES: VendorSource[] = [
  { name: "openai-gptbot", bots: ["GPTBot"], url: "https://openai.com/gptbot.json" },
  { name: "openai-chatgpt-user", bots: ["ChatGPT-User"], url: "https://openai.com/chatgpt-user.json" },
  { name: "openai-searchbot", bots: ["OAI-SearchBot"], url: "https://openai.com/searchbot.json" },
  { name: "perplexity-bot", bots: ["PerplexityBot"], url: "https://www.perplexity.com/perplexitybot.json" },
  { name: "perplexity-user", bots: ["Perplexity-User"], url: "https://www.perplexity.com/perplexity-user.json" },
];

// For vendors that don't publish a machine-readable IP list, fall back to
// forward-confirmed reverse DNS (FCrDNS): reverse-lookup the source IP,
// confirm the hostname ends with the vendor's suffix, then forward-lookup
// the hostname and require it to resolve back to the same IP. This is the
// same mechanism Google and Bing recommend for verifying their bots.
const VENDOR_REVERSE_DNS: VendorReverseDns[] = [
  {
    name: "anthropic",
    bots: ["ClaudeBot", "Claude-User", "Claude-Web", "Claude-SearchBot", "anthropic-ai"],
    suffixes: [".anthropic.com"],
  },
];

interface Cidr {
  value: bigint;
  prefix: number;
  bits: 32 | 128;
}

const botRanges: Map<string, Cidr[]> = new Map();
let lastRefreshAt: Date | null = null;
let lastRefreshError: string | null = null;
const REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

function expandIpv6(ip: string): string[] {
  let s = ip;
  // Handle IPv4-mapped tail (e.g. `::ffff:1.2.3.4`).
  if (s.includes(".")) {
    const idx = s.lastIndexOf(":");
    const v4 = s.slice(idx + 1);
    const parts = v4.split(".").map((n) => parseInt(n, 10));
    if (parts.length === 4 && parts.every((p) => p >= 0 && p <= 255)) {
      const hi = (((parts[0] << 8) | parts[1]) >>> 0).toString(16);
      const lo = (((parts[2] << 8) | parts[3]) >>> 0).toString(16);
      s = s.slice(0, idx + 1) + hi + ":" + lo;
    }
  }
  let head: string;
  let tail: string;
  if (s.includes("::")) {
    [head, tail] = s.split("::");
  } else {
    head = s;
    tail = "";
  }
  const headParts = head ? head.split(":") : [];
  const tailParts = tail ? tail.split(":") : [];
  const fillCount = 8 - headParts.length - tailParts.length;
  const fill = Array(Math.max(0, fillCount)).fill("0");
  const all = [...headParts, ...fill, ...tailParts];
  while (all.length < 8) all.push("0");
  if (all.length > 8) all.length = 8;
  return all.map((p) => (p === "" ? "0" : p));
}

function ipToBigInt(ip: string): { value: bigint; bits: 32 | 128 } | null {
  if (!ip) return null;
  let trimmed = ip.replace(/^\[|\]$/g, "").split("%")[0].trim();
  if (!trimmed) return null;
  // Treat IPv4-mapped IPv6 like a plain IPv4 so it can match v4 ranges.
  if (/^::ffff:/i.test(trimmed) && trimmed.includes(".")) {
    return ipToBigInt(trimmed.replace(/^::ffff:/i, ""));
  }
  const fam = isIP(trimmed);
  if (fam === 4) {
    const parts = trimmed.split(".").map((n) => parseInt(n, 10));
    if (parts.length !== 4 || parts.some((n) => isNaN(n) || n < 0 || n > 255)) return null;
    let v = 0n;
    for (const p of parts) v = (v << 8n) | BigInt(p);
    return { value: v, bits: 32 };
  }
  if (fam === 6) {
    const groups = expandIpv6(trimmed);
    let v = 0n;
    for (const g of groups) {
      const n = parseInt(g, 16);
      v = (v << 16n) | BigInt(isNaN(n) ? 0 : n);
    }
    return { value: v, bits: 128 };
  }
  return null;
}

function parseCidr(cidr: string): Cidr | null {
  const [addr, prefixStr] = cidr.split("/");
  const parsed = ipToBigInt(addr);
  if (!parsed) return null;
  const prefix = prefixStr ? parseInt(prefixStr, 10) : parsed.bits;
  if (isNaN(prefix) || prefix < 0 || prefix > parsed.bits) return null;
  const shift = BigInt(parsed.bits - prefix);
  const masked = (parsed.value >> shift) << shift;
  return { value: masked, prefix, bits: parsed.bits };
}

function ipMatchesCidr(ip: string, cidrs: Cidr[]): boolean {
  const parsed = ipToBigInt(ip);
  if (!parsed) return false;
  for (const c of cidrs) {
    if (c.bits !== parsed.bits) continue;
    const shift = BigInt(c.bits - c.prefix);
    if ((parsed.value >> shift) === (c.value >> shift)) return true;
  }
  return false;
}

// Vendor JSON shapes vary — OpenAI uses {prefixes:[{ipv4Prefix:"…"}]},
// Anthropic and Perplexity use slightly different keys. Walk the tree and
// pick out every string that looks like a CIDR.
function extractPrefixesFromJson(data: unknown): string[] {
  const out: string[] = [];
  const visit = (v: unknown) => {
    if (v === null || v === undefined) return;
    if (Array.isArray(v)) {
      v.forEach(visit);
      return;
    }
    if (typeof v === "string") {
      if (v.includes("/")) {
        const head = v.split("/")[0];
        if (isIP(head) > 0) out.push(v);
      }
      return;
    }
    if (typeof v === "object") {
      visit(Object.values(v as Record<string, unknown>));
    }
  };
  visit(data);
  return out;
}

async function fetchVendorPrefixes(source: VendorSource): Promise<string[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const res = await fetch(source.url, {
      headers: { "user-agent": "ai-traffic-verifier/1.0 (+analytics)" },
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return extractPrefixesFromJson(data);
  } finally {
    clearTimeout(timeout);
  }
}

export async function refreshAiBotIpRanges(): Promise<{
  ok: boolean;
  perVendor: Record<string, number>;
  error?: string;
}> {
  const perVendor: Record<string, number> = {};
  const next = new Map<string, Cidr[]>();
  let firstError: string | null = null;

  for (const source of VENDOR_SOURCES) {
    try {
      const prefixes = await fetchVendorPrefixes(source);
      const cidrs = prefixes
        .map(parseCidr)
        .filter((c): c is Cidr => c !== null);
      perVendor[source.name] = cidrs.length;
      for (const bot of source.bots) {
        const existing = next.get(bot) || [];
        next.set(bot, existing.concat(cidrs));
      }
      console.log(
        `[ai-bot-verifier] loaded ${cidrs.length} ranges from ${source.name}`,
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      perVendor[source.name] = 0;
      if (!firstError) firstError = `${source.name}: ${msg}`;
      console.warn(
        `[ai-bot-verifier] failed to load ${source.name}: ${msg}`,
      );
      // Preserve previously-loaded ranges for this vendor's bots so a
      // transient outage doesn't suddenly start flagging everyone as a
      // spoof.
      for (const bot of source.bots) {
        const previous = botRanges.get(bot);
        if (previous && previous.length) {
          const existing = next.get(bot) || [];
          next.set(bot, existing.concat(previous));
        }
      }
    }
  }

  botRanges.clear();
  for (const [k, v] of next) botRanges.set(k, v);
  lastRefreshAt = new Date();
  lastRefreshError = firstError;
  return { ok: !firstError, perVendor, error: firstError ?? undefined };
}

export function startAiBotVerifierAutoRefresh(): void {
  refreshAiBotIpRanges().catch((err) => {
    console.error("[ai-bot-verifier] initial refresh failed:", err);
  });
  setInterval(() => {
    refreshAiBotIpRanges().catch((err) => {
      console.error("[ai-bot-verifier] scheduled refresh failed:", err);
    });
  }, REFRESH_INTERVAL_MS);
}

export function getAiBotVerifierStatus(): {
  lastRefreshAt: string | null;
  lastError: string | null;
  botRangeCounts: Record<string, number>;
} {
  const ranges: Record<string, number> = {};
  for (const [k, v] of botRanges) ranges[k] = v.length;
  return {
    lastRefreshAt: lastRefreshAt ? lastRefreshAt.toISOString() : null,
    lastError: lastRefreshError,
    botRangeCounts: ranges,
  };
}

// Cache reverse-DNS results so the verifier doesn't issue a fresh lookup on
// every request. 6 hours is a reasonable trade-off between freshness and
// load on the resolver.
const REVERSE_DNS_TTL_MS = 6 * 60 * 60 * 1000;
const reverseDnsCache: Map<
  string,
  { result: VerificationStatus; expiresAt: number }
> = new Map();

function reverseDnsSuffixesFor(botName: string): string[] {
  const out: string[] = [];
  for (const v of VENDOR_REVERSE_DNS) {
    if (v.bots.includes(botName)) out.push(...v.suffixes);
  }
  return out;
}

async function fcrdnsVerify(
  ip: string,
  suffixes: string[],
): Promise<VerificationStatus> {
  const cacheKey = `${ip}|${suffixes.join(",")}`;
  const cached = reverseDnsCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.result;

  let result: VerificationStatus = "spoofed";
  try {
    const names = await dns.reverse(ip);
    for (const raw of names) {
      const name = raw.toLowerCase().replace(/\.$/, "");
      if (!suffixes.some((s) => name.endsWith(s))) continue;
      try {
        const addrs = await dns.lookup(name, { all: true });
        if (addrs.some((a) => a.address === ip)) {
          result = "verified";
          break;
        }
      } catch {
        // forward lookup failed; treat as not-confirmed and continue
      }
    }
  } catch {
    // No PTR record at all: can't verify, can't disprove. Mark as
    // unverifiable so we don't accidentally call legit traffic spoofed
    // when DNS is briefly unavailable.
    result = "unverifiable";
  }

  reverseDnsCache.set(cacheKey, {
    result,
    expiresAt: Date.now() + REVERSE_DNS_TTL_MS,
  });
  return result;
}

// Returns whether `ip` really belongs to `botName`'s vendor.
// "unverifiable" means we have no way to check (no published list and no
// reverse-DNS suffix) — callers should treat these neutrally rather than
// as spoofs so legit traffic from vendors that haven't published a list
// isn't excluded from headline counts.
export async function verifyAiBot(
  botName: string,
  ip: string | null | undefined,
): Promise<VerificationStatus> {
  const ranges = botRanges.get(botName);
  const suffixes = reverseDnsSuffixesFor(botName);
  const hasIpList = !!ranges && ranges.length > 0;
  const hasReverseDns = suffixes.length > 0;
  if (!hasIpList && !hasReverseDns) return "unverifiable";
  if (!ip) return "spoofed";
  if (hasIpList && ipMatchesCidr(ip, ranges!)) return "verified";
  if (hasReverseDns) {
    const r = await fcrdnsVerify(ip, suffixes);
    if (r === "verified" || r === "unverifiable") return r;
  }
  return "spoofed";
}
