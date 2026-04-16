import { useCallback } from "react";
import { Platform } from "react-native";
import { postTracking } from "@/lib/tracking";
import { useAuth } from "@/lib/auth";

export interface VisitorEventOpts {
  eventType: string;
  pagePath?: string;
  eventData?: Record<string, unknown> | string;
}

/**
 * Returns a fire-and-forget logger for arbitrary visitor events.
 * Click events, CTA presses, etc. Web-only; no-op on native.
 *
 *   const logEvent = useVisitorEvent();
 *   <Button onPress={() => logEvent({ eventType: 'cta_click', eventData: { id: 'hero' } })} />
 */
export function useVisitorEvent() {
  const { user } = useAuth();
  const userId = user?.id ?? null;

  return useCallback(
    (opts: VisitorEventOpts) => {
      if (Platform.OS !== "web") return;
      const data =
        typeof opts.eventData === "string"
          ? opts.eventData
          : opts.eventData
          ? JSON.stringify(opts.eventData)
          : null;
      postTracking("/api/track/visitor-event", {
        eventType: opts.eventType,
        pagePath: opts.pagePath,
        eventData: data,
        userId,
      });
    },
    [userId],
  );
}
