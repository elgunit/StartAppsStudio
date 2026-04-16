import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { postTracking } from "@/lib/tracking";
import { useAuth } from "@/lib/auth";

/**
 * Tracks when a DOM section becomes 30%+ visible.
 * Records dwell time and reports to /api/track/section-view.
 *
 * Web-only (no-op on native).
 *
 * Usage:
 *   const ref = useSectionTracker<HTMLDivElement>("hero");
 *   <View ref={ref}>...</View>
 */
export function useSectionTracker<T extends Element = HTMLElement>(
  sectionName: string,
  threshold: number = 0.3,
) {
  const ref = useRef<T | null>(null);
  const { user } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    if (typeof IntersectionObserver === "undefined") return;
    const node = ref.current;
    if (!node) return;

    const pageLoadAt = new Date().toISOString();
    let visibleSince: number | null = null;
    let totalVisibleMs = 0;
    let reported = false;

    const reportOnce = (final: boolean) => {
      if (reported) return;
      if (visibleSince != null) {
        totalVisibleMs += Date.now() - visibleSince;
        visibleSince = null;
      }
      // Only report once per mount when first seen, but include current dwell.
      if (totalVisibleMs <= 0 && !final) return;
      reported = true;
      postTracking("/api/track/section-view", {
        sectionName,
        pageLoadAt,
        durationMs: Math.max(1, Math.round(totalVisibleMs)),
        userId,
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= threshold) {
            if (visibleSince == null) visibleSince = Date.now();
          } else {
            if (visibleSince != null) {
              totalVisibleMs += Date.now() - visibleSince;
              visibleSince = null;
              if (totalVisibleMs > 250 && !reported) reportOnce(false);
            }
          }
        }
      },
      { threshold: [0, threshold, 0.6, 1] },
    );

    observer.observe(node as Element);

    const onUnload = () => reportOnce(true);
    window.addEventListener("beforeunload", onUnload);
    window.addEventListener("pagehide", onUnload);

    return () => {
      observer.disconnect();
      window.removeEventListener("beforeunload", onUnload);
      window.removeEventListener("pagehide", onUnload);
      reportOnce(true);
    };
  }, [sectionName, threshold, userId]);

  return ref;
}
