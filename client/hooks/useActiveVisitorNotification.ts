import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { postTracking } from "@/lib/tracking";
import { hasSessionFlag, setSessionFlag } from "@/lib/visitor-id";
import { useAuth } from "@/lib/auth";

const SESSION_FLAG = "active_visitor_notified";
const TRIGGER_THRESHOLD = 15; // percent

function computeScrollPercent(): number {
  if (typeof window === "undefined" || typeof document === "undefined") return 0;
  const doc = document.documentElement;
  const body = document.body;
  const scrollTop = window.scrollY || doc.scrollTop || body.scrollTop || 0;
  const scrollHeight = Math.max(
    doc.scrollHeight || 0,
    body.scrollHeight || 0,
    doc.offsetHeight || 0,
  );
  const clientHeight = window.innerHeight || doc.clientHeight || 0;
  const trackable = Math.max(1, scrollHeight - clientHeight);
  return Math.min(100, Math.max(0, Math.round((scrollTop / trackable) * 100)));
}

/**
 * Fires a single notification email per session when an anonymous visitor
 * scrolls past 15%. Web-only; no-op on native or for already-notified sessions.
 */
export function useActiveVisitorNotification() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const firedRef = useRef(false);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    if (hasSessionFlag(SESSION_FLAG)) {
      firedRef.current = true;
      return;
    }

    const onScroll = () => {
      if (firedRef.current) return;
      const pct = computeScrollPercent();
      if (pct >= TRIGGER_THRESHOLD) {
        firedRef.current = true;
        setSessionFlag(SESSION_FLAG);
        postTracking("/api/track/active-visitor", {
          scrollPercent: pct,
          pagePath: window.location.pathname,
          userId,
        });
        window.removeEventListener("scroll", onScroll);
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    // Check once in case the page is already scrolled (e.g. anchor jump).
    onScroll();

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [userId]);
}
