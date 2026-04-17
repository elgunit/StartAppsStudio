import { Platform } from "react-native";
import { apiRequest, getApiUrl } from "@/lib/query-client";
import { getVisitorId } from "@/lib/visitor-id";

export type TrackEndpoint =
  | "/api/track/section-view"
  | "/api/track/visitor-event"
  | "/api/track/active-visitor"
  | "/api/track/social-click";

export interface TrackPayload {
  [key: string]: unknown;
}

/**
 * Fire-and-forget tracking POST. Uses fetch with keepalive so the request
 * survives page unloads (where supported). Falls back to navigator.sendBeacon
 * when keepalive is not available. No-op outside web.
 */
export function postTracking(endpoint: TrackEndpoint, payload: TrackPayload): void {
  if (Platform.OS !== "web" || typeof window === "undefined") return;

  let url: string;
  try {
    url = new URL(endpoint, getApiUrl()).toString();
  } catch {
    return;
  }

  const body = JSON.stringify({
    ...payload,
    visitorId: payload.visitorId || getVisitorId(),
    userAgent: payload.userAgent ?? (typeof navigator !== "undefined" ? navigator.userAgent : undefined),
    referrer: payload.referrer ?? (typeof document !== "undefined" ? document.referrer : undefined),
    pagePath: payload.pagePath ?? (typeof window !== "undefined" ? window.location.pathname : undefined),
  });

  const beaconFallback = () => {
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
        const blob = new Blob([body], { type: "application/json" });
        navigator.sendBeacon(url, blob);
      }
    } catch {
      /* swallow */
    }
  };

  // Prefer fetch w/ keepalive (richer, supports JSON content-type properly).
  // Fall back to sendBeacon if the fetch promise rejects (e.g. during unload).
  try {
    if (typeof fetch === "function") {
      fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
        keepalive: true,
        credentials: "omit",
      }).catch(() => {
        beaconFallback();
      });
      return;
    }
  } catch {
    /* fall through to beacon */
  }

  beaconFallback();
}

export function getCurrentUserIdSafe(): string | null {
  return null;
}

/**
 * Cross-platform visitor event tracker. On web this uses postTracking
 * (keepalive fetch / sendBeacon). On native it falls back to apiRequest
 * since navigator/fetch keepalive aren't applicable. Fire-and-forget.
 */
export function trackVisitorEvent(
  eventType: string,
  eventData?: Record<string, unknown>,
  pagePath?: string,
): void {
  if (Platform.OS === "web") {
    postTracking("/api/track/visitor-event", {
      eventType,
      pagePath,
      eventData,
    });
    return;
  }

  apiRequest("POST", "/api/track/visitor-event", {
    eventType,
    visitorId: getVisitorId(),
    pagePath,
    eventData,
  }).catch(() => {
    /* fire-and-forget */
  });
}
