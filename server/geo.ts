// Best-effort IP → city geolocation for visitor-notification emails.
// Uses ipapi.co (no API key required, generous free tier). Failures are
// swallowed and simply omit the city rather than blocking the email.

export interface GeoLocation {
  city: string | null;
  region: string | null;
  country: string | null;
  label: string; // human-readable "City, Region" (or "Unknown location")
}

const UNKNOWN: GeoLocation = { city: null, region: null, country: null, label: "Unknown location" };

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
    const parts = [city, region || country].filter(Boolean);
    const label = parts.length > 0 ? parts.join(", ") : UNKNOWN.label;
    return { city, region, country, label };
  } catch {
    return UNKNOWN;
  } finally {
    clearTimeout(timer);
  }
}
