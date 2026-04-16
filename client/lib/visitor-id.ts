import { Platform } from "react-native";

const KEY = "sas_visitor_id";

function uuid(): string {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID) {
    return (crypto as any).randomUUID();
  }
  return "v-" + Math.random().toString(36).slice(2) + "-" + Date.now().toString(36);
}

export function getVisitorId(): string {
  if (Platform.OS !== "web" || typeof window === "undefined" || !window.localStorage) {
    return "native-" + uuid();
  }
  try {
    let id = window.localStorage.getItem(KEY);
    if (!id) {
      id = uuid();
      window.localStorage.setItem(KEY, id);
    }
    return id;
  } catch {
    return "anon-" + uuid();
  }
}

const SESSION_KEY = "sas_session_flags";

export function hasSessionFlag(flag: string): boolean {
  if (Platform.OS !== "web" || typeof window === "undefined" || !window.sessionStorage) {
    return false;
  }
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    const data = raw ? JSON.parse(raw) : {};
    return Boolean(data[flag]);
  } catch {
    return false;
  }
}

export function setSessionFlag(flag: string): void {
  if (Platform.OS !== "web" || typeof window === "undefined" || !window.sessionStorage) {
    return;
  }
  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    const data = raw ? JSON.parse(raw) : {};
    data[flag] = true;
    window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(data));
  } catch {
    /* ignore */
  }
}
