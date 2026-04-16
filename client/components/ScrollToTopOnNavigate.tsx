import { useEffect, useState } from "react";
import { Platform } from "react-native";
import type { NavigationContainerRefWithCurrent } from "@react-navigation/native";
import { useScrollDepth } from "@/hooks/useScrollDepth";
import { useActiveVisitorNotification } from "@/hooks/useActiveVisitorNotification";

interface Props {
  /** Shared navigation ref also passed to <NavigationContainer ref={...}> */
  navRef: NavigationContainerRefWithCurrent<any>;
}

/**
 * Mounted once inside NavigationContainer with a SHARED navigation ref.
 * Tracks the active route, scrolls to the top of the page on every route
 * change (web only), and drives the visitor analytics hooks:
 *  - useScrollDepth — route-aware max scroll tracking
 *  - useActiveVisitorNotification — one-shot per-session active-visitor email
 */
export default function ScrollToTopOnNavigate({ navRef }: Props) {
  const [routeName, setRouteName] = useState<string | null>(null);

  useEffect(() => {
    if (!navRef) return;

    const update = () => {
      try {
        if (!navRef.isReady?.()) return;
        const current = navRef.getCurrentRoute?.();
        setRouteName(current?.name ?? null);
      } catch {
        /* navigator not ready yet */
      }
    };

    // Initial state may already be ready.
    update();
    const unsub = navRef.addListener?.("state", update);
    return () => {
      unsub?.();
    };
  }, [navRef]);

  // Drive the analytics hooks (they listen to scroll/route on web).
  useScrollDepth(routeName);
  useActiveVisitorNotification();

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") return;
    if (!routeName) return;
    try {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [routeName]);

  return null;
}
