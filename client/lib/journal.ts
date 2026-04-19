export type JournalPostSummary = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  publishedAt: string;
  updatedAt?: string;
  readMinutes: number;
  tags: string[];
};

const ACCENT_PALETTE = [
  "#0d9488", // teal
  "#10b981", // emerald
  "#f59e0b", // amber
  "#f43f5e", // rose
  "#06b6d4", // cyan
  "#14b8a6", // teal-mint
];

export function journalAccentColor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return ACCENT_PALETTE[hash % ACCENT_PALETTE.length];
}

export function formatJournalDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
