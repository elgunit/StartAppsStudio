// Best-effort IP → city geolocation for visitor-notification emails.
// Uses ipapi.co (no API key required, generous free tier). Failures are
// swallowed and simply omit the city rather than blocking the email.

export interface GeoLocation {
  city: string | null;
  region: string | null;
  country: string | null;
  isp: string | null;
  asn: string | null;
  isProxy: boolean;
  label: string; // human-readable "City, Region" (or "Unknown location")
}

const UNKNOWN: GeoLocation = {
  city: null,
  region: null,
  country: null,
  isp: null,
  asn: null,
  isProxy: false,
  label: "Unknown location",
};

const NETWORK_PRIVACY_KEYWORDS = [
  "vpn",
  "proxy",
  "hosting",
  "cloud",
  "datacenter",
  "data center",
  "digitalocean",
  "amazon",
  "aws",
  "google cloud",
  "microsoft azure",
  "ovh",
  "hetzner",
  "linode",
  "tor",
];

function looksLikeProxyOrDatacenter(data: any): boolean {
  if (data?.proxy === true || data?.hosting === true || data?.vpn === true || data?.tor === true) {
    return true;
  }
  const network = [data?.org, data?.isp, data?.asn, data?.as].filter(Boolean).join(" ").toLowerCase();
  return NETWORK_PRIVACY_KEYWORDS.some((keyword) => network.includes(keyword));
}

function isPrivateOrLocalIp(ip: string): boolean {
  if (!ip) return true;
  const v = ip.trim();
  return (
    v === "" ||
    v === "::1" ||
    v === "127.0.0.1" ||
    v.startsWith("10.") ||
    v.startsWith("192.168.") ||
    v.startsWith("172.16.") ||
    v.startsWith("172.17.") ||
    v.startsWith("172.18.") ||
    v.startsWith("172.19.") ||
    v.startsWith("172.2") ||
    v.startsWith("172.30.") ||
    v.startsWith("172.31.") ||
    v.startsWith("::ffff:127.") ||
    v.startsWith("fc") ||
    v.startsWith("fd")
  );
}

export async function lookupCityFromIp(ipRaw: string, timeoutMs = 2500): Promise<GeoLocation> {
  const ip = (ipRaw || "").trim();
  if (isPrivateOrLocalIp(ip)) return UNKNOWN;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return UNKNOWN;
    const data: any = await res.json();
    if (!data || data.error) return UNKNOWN;
    const city: string | null = data.city || null;
    const region: string | null = data.region || null;
    const country: string | null = data.country_name || data.country || null;
    const isp: string | null = data.org || data.isp || null;
    const asn: string | null = data.asn || data.as || null;
    const parts = [city, region || country].filter(Boolean);
    const label = parts.length > 0 ? parts.join(", ") : UNKNOWN.label;
    return { city, region, country, isp, asn, isProxy: looksLikeProxyOrDatacenter(data), label };
  } catch {
    return UNKNOWN;
  } finally {
    clearTimeout(timer);
  }
}
