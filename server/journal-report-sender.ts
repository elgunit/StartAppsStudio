import { storage } from "./storage";
import { getUncachableResendClient } from "./resend";
import { journalStatsReport } from "./email-templates";

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
  const escape = (val: string | number) => {
    const s = String(val);
    return s.includes(",") || s.includes('"') || s.includes("\n")
      ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [header, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

export async function sendJournalStatsReport(frequency: "weekly" | "monthly", recipientEmail: string): Promise<void> {
  const days = frequency === "weekly" ? 7 : 30;
  const toDate = new Date();
  const fromDate = new Date(toDate.getTime() - days * 24 * 60 * 60 * 1000);
  const fromIso = fromDate.toISOString();
  const toIso = toDate.toISOString();

  const stats = await storage.getJournalConversionStats(fromDate, toDate);
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

  const { subject, html } = journalStatsReport({
    frequency,
    periodLabel,
    from: fromLabel,
    to: toLabel,
    totals,
    topArticles: stats.slice(0, 5),
  });

  const { client, fromEmail } = await getUncachableResendClient();
  await client.emails.send({
    from: fromEmail,
    to: recipientEmail,
    subject,
    html,
    attachments: [{ filename: csvFilename, content: csvBase64 }],
  });
}
