import { storage, type AiCrawlerStatRow } from "./storage";
import { getUncachableResendClient } from "./resend";
import { journalStatsReport } from "./email-templates";

function csvEscape(val: string | number | null | undefined): string {
  const s = val === null || val === undefined ? "" : String(val);
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function buildJournalCsv(
  stats: Awaited<ReturnType<typeof storage.getJournalConversionStats>>,
  rangeLabel: string,
  fromIso: string,
  toIso: string,
): string {
  const header = ["Range", "From", "To", "Slug", "Title", "Views", "CTA Clicks", "Create Account", "Open Contact", "Guest Emails"];
  const fromStr = fromIso.slice(0, 10);
  const toStr = toIso.slice(0, 10);
  const rows = stats.map((r) => [
    rangeLabel, fromStr, toStr,
    r.slug, r.title ?? r.slug,
    r.views, r.ctaClicks, r.createAccountChoices, r.openContactChoices, r.guestEmails,
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

function buildAiCrawlerCsv(
  stats: AiCrawlerStatRow[],
  rangeLabel: string,
  fromIso: string,
  toIso: string,
): string {
  const header = ["Range", "From", "To", "Bot", "Hits", "Unique Pages", "Top Page", "Last Seen"];
  const fromStr = fromIso.slice(0, 10);
  const toStr = toIso.slice(0, 10);
  const rows = stats.map((r) => [
    rangeLabel, fromStr, toStr,
    r.botName,
    r.hits,
    r.uniquePages,
    r.topPagePath ?? "",
    r.lastSeenAt ? r.lastSeenAt.toISOString() : "",
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n");
}

export async function sendJournalStatsReport(frequency: "weekly" | "monthly", recipientEmail: string): Promise<void> {
  const days = frequency === "weekly" ? 7 : 30;
  const toDate = new Date();
  const fromDate = new Date(toDate.getTime() - days * 24 * 60 * 60 * 1000);
  const fromIso = fromDate.toISOString();
  const toIso = toDate.toISOString();

  const [stats, aiStats] = await Promise.all([
    storage.getJournalConversionStats(fromDate, toDate),
    storage.getAiCrawlerStats(fromDate, toDate),
  ]);
  const totals = stats.reduce(
    (acc, r) => {
      acc.views += r.views;
      acc.ctaClicks += r.ctaClicks;
      acc.createAccountChoices += r.createAccountChoices;
      acc.openContactChoices += r.openContactChoices;
      acc.guestEmails += r.guestEmails;
      return acc;
    },
    { views: 0, ctaClicks: 0, createAccountChoices: 0, openContactChoices: 0, guestEmails: 0 },
  );

  const fromLabel = fromIso.slice(0, 10);
  const toLabel = toIso.slice(0, 10);
  const periodLabel = `${fromLabel} – ${toLabel}`;
  const rangeLabel = frequency === "weekly" ? "7d" : "30d";
  const csvFilename = `journal-stats-${frequency}-${toLabel}.csv`;
  const csvContent = buildJournalCsv(stats, rangeLabel, fromIso, toIso);
  const csvBase64 = Buffer.from(csvContent, "utf-8").toString("base64");

  const aiCsvFilename = `ai-crawler-stats-${frequency}-${toLabel}.csv`;
  const aiCsvContent = buildAiCrawlerCsv(aiStats, rangeLabel, fromIso, toIso);
  const aiCsvBase64 = Buffer.from(aiCsvContent, "utf-8").toString("base64");

  const aiTotalHits = aiStats.reduce((acc, r) => acc + r.hits, 0);

  const { subject, html } = journalStatsReport({
    frequency,
    periodLabel,
    from: fromLabel,
    to: toLabel,
    totals,
    topArticles: stats.slice(0, 5),
    aiTraffic: {
      totalHits: aiTotalHits,
      topBots: aiStats.slice(0, 8),
    },
  });

  const attachments: Array<{ filename: string; content: string }> = [
    { filename: csvFilename, content: csvBase64 },
  ];
  if (aiStats.length > 0) {
    attachments.push({ filename: aiCsvFilename, content: aiCsvBase64 });
  }

  const { client, fromEmail } = await getUncachableResendClient();
  await client.emails.send({
    from: fromEmail,
    to: recipientEmail,
    subject,
    html,
    attachments,
  });
}
