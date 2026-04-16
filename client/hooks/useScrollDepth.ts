import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { postTracking } from "@/lib/tracking";
import { useAuth } from "@/lib/auth";

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
 * Tracks the maximum scroll depth (%) reached on the current page/route.
 * Flushes to /api/track/visitor-event when the route changes or the page
 * unloads. Web-only; no-op on native.
 */
export function useScrollDepth(routeName: string | null = null) {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const maxRef = useRef(0);
  const lastFlushedRouteRef = useRef<string | null>(null);
  const currentRouteRef = useRef<string | null>(routeName);
  const currentPathRef = useRef<string>("/");

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;

    const onScroll = () => {
      const pct = computeScrollPercent();
      if (pct > maxRef.current) maxRef.current = pct;
    };

    const flush = (reason: string) => {
      const routeKey = currentRouteRef.current || "unknown";
      if (maxRef.current <= 0) return;
      if (lastFlushedRouteRef.current === routeKey + "|" + maxRef.current) return;
      lastFlushedRouteRef.current = routeKey + "|" + maxRef.current;
      postTracking("/api/track/visitor-event", {
        eventType: "scroll_depth",
        pagePath: currentPathRef.current,
        eventData: JSON.stringify({
          maxScrollPercent: maxRef.current,
          route: routeKey,
          reason,
        }),
        userId,
      });
    };

    const onUnload = () => flush("unload");
    const onVisibility = () => {
      if (document.visibilityState === "hidden") flush("hidden");
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("pagehide", onUnload);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("pagehide", onUnload);
      document.removeEventListener("visibilitychange", onVisibility);
      flush("cleanup");
    };
  }, [userId]);

  // Route change effect — flush previous, reset for new route.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    const prevRoute = currentRouteRef.current;
    if (prevRoute && prevRoute !== routeName && maxRef.current > 0) {
      postTracking("/api/track/visitor-event", {
        eventType: "scroll_depth",
        pagePath: currentPathRef.current,
        eventData: JSON.stringify({
          maxScrollPercent: maxRef.current,
          route: prevRoute,
          reason: "route_change",
        }),
        userId,
      });
    }
    maxRef.current = 0;
    currentRouteRef.current = routeName;
    currentPathRef.current = typeof window !== "undefined" ? window.location.pathname : "/";
  }, [routeName, userId]);
}

export function getMaxScrollPercent(): number {
  return computeScrollPercent();
}
