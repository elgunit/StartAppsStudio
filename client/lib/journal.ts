import { getApiUrl } from "@/lib/query-client";

export type JournalPostSummary = {
  slug: string;
  title: string;
  description: string;
  excerpt: string;
  heroImage: string;
  heroAlt: string;
  publishedAt: string;
  updatedAt?: string;
  readMinutes: number;
  tags: string[];
};

export function resolveAssetUrl(src: string): string {
  if (/^https?:\/\//i.test(src)) return src;
  return new URL(src, getApiUrl()).href;
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
