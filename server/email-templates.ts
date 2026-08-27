// Branded transactional email templates for Start Apps Studio
// Both templates share a consistent layout, brand colors, and typography.

const BRAND = {
  name: "Start Apps Studio",
  accent: "#8b5cf6",
  accentSoft: "#a78bfa",
  bg: "#0a0a0a",
  card: "#111111",
  text: "#ffffff",
  textMuted: "#a1a1aa",
  border: "#27272a",
};

interface BaseTemplateOpts {
  preheader: string;
  title: string;
  bodyHtml: string;
  ctaText?: string;
  ctaUrl?: string;
}

function baseTemplate({ preheader, title, bodyHtml, ctaText, ctaUrl }: BaseTemplateOpts): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;padding:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.text};">
    <span style="display:none!important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:16px;overflow:hidden;">
            <tr>
              <td style="padding:28px 32px;border-bottom:1px solid ${BRAND.border};">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td style="vertical-align:middle;">
                      <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${BRAND.accent};margin-right:10px;vertical-align:middle;"></span>
                      <span style="font-size:14px;font-weight:600;letter-spacing:0.5px;color:${BRAND.text};">${BRAND.name}</span>
                    </td>
                    <td align="right" style="vertical-align:middle;">
                      <span style="font-size:11px;text-transform:uppercase;letter-spacing:1.5px;color:${BRAND.accent};font-weight:700;">Analytics</span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:36px 32px 12px 32px;">
                <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.3;font-weight:700;color:${BRAND.text};">${escapeHtml(title)}</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px 32px;color:${BRAND.textMuted};font-size:15px;line-height:1.6;">
                ${bodyHtml}
              </td>
            </tr>
            ${ctaText && ctaUrl ? `
            <tr>
              <td style="padding:0 32px 32px 32px;">
                <a href="${escapeAttr(ctaUrl)}" style="display:inline-block;background:${BRAND.accent};color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:14px;">${escapeHtml(ctaText)}</a>
              </td>
            </tr>` : ""}
            <tr>
              <td style="padding:20px 32px;border-top:1px solid ${BRAND.border};background:${BRAND.bg};">
                <p style="margin:0;font-size:12px;color:${BRAND.textMuted};line-height:1.5;">
                  You're receiving this because visitor analytics are enabled for ${BRAND.name}.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
function escapeAttr(s: string): string {
  return escapeHtml(s);
}

function row(label: string, value: string): string {
  return `<tr>
    <td style="padding:6px 0;font-size:13px;color:${BRAND.textMuted};width:120px;text-transform:uppercase;letter-spacing:1px;font-weight:600;">${escapeHtml(label)}</td>
    <td style="padding:6px 0;font-size:14px;color:${BRAND.text};">${escapeHtml(value)}</td>
  </tr>`;
}

export interface ActiveVisitorOpts {
  visitorId: string;
  pagePath: string;
  scrollPercent: number;
  userAgent?: string;
  referrer?: string;
  timestamp?: string;
  city?: string | null;
  isReturning?: boolean;
}

export function activeVisitorNotification(opts: ActiveVisitorOpts): { subject: string; html: string } {
  const ts = opts.timestamp || new Date().toISOString();
  const cityLabel = opts.city && opts.city.trim() ? opts.city.trim() : "Unknown location";
  const visitorLabel = opts.isReturning ? "Returning visitor" : "New visitor";
  const subject = `${visitorLabel} from ${cityLabel} on ${opts.pagePath}`;
  const html = baseTemplate({
    preheader: `${visitorLabel} from ${cityLabel} is actively browsing ${opts.pagePath} right now.`,
    title: "An active visitor is on your site",
    bodyHtml: `
      <p style="margin:0 0 18px 0;">A <strong style="color:${BRAND.text};">${visitorLabel.toLowerCase()}</strong> from <strong style="color:${BRAND.text};">${escapeHtml(cityLabel)}</strong> has scrolled past <strong style="color:${BRAND.text};">${opts.scrollPercent}%</strong> of <strong style="color:${BRAND.text};">${escapeHtml(opts.pagePath)}</strong> — they're engaged.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:12px;padding:16px;">
        ${row("Page", opts.pagePath)}
        ${row("City", cityLabel)}
        ${row("Visitor type", visitorLabel)}
        ${row("Visitor", opts.visitorId.slice(0, 12) + "…")}
        ${row("Referrer", opts.referrer || "Direct")}
        ${row("User Agent", (opts.userAgent || "Unknown").slice(0, 80))}
        ${row("Time", ts)}
      </table>
    `,
  });
  return { subject, html };
}

export interface SocialClickOpts {
  platform: string;
  pagePath: string;
  visitorId: string;
  userAgent?: string;
  referrer?: string;
  timestamp?: string;
}

export interface JournalLeadOpts {
  email: string;
  slug: string;
  title?: string;
  source?: string;
  timestamp?: string;
}

export function journalLeadNotification(opts: JournalLeadOpts): { subject: string; html: string } {
  const ts = opts.timestamp || new Date().toISOString();
  const articleLabel = opts.title || opts.slug;
  const subject = `New Journal lead: ${opts.email} (${articleLabel})`;
  const html = baseTemplate({
    preheader: `${opts.email} signed up from "${articleLabel}".`,
    title: "New guest lead from the Journal",
    bodyHtml: `
      <p style="margin:0 0 18px 0;">A guest just dropped their email after reading <strong style="color:${BRAND.text};">${escapeHtml(articleLabel)}</strong>.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:12px;padding:16px;">
        ${row("Email", opts.email)}
        ${row("Article", opts.title || "—")}
        ${row("Slug", opts.slug)}
        ${row("Source", opts.source || "journal_signup")}
        ${row("Time", ts)}
      </table>
    `,
    ctaText: "Reply to lead",
    ctaUrl: `mailto:${opts.email}?subject=${encodeURIComponent("Re: " + articleLabel)}`,
  });
  return { subject, html };
}

export interface JournalStatsReportOpts {
  frequency: "weekly" | "monthly";
  periodLabel: string;
  from: string;
  to: string;
  totals: {
    views: number;
    ctaClicks: number;
    createAccountChoices: number;
    openContactChoices: number;
    guestEmails: number;
  };
  topArticles: Array<{ title: string | null; slug: string; views: number; ctaClicks: number }>;
  aiTraffic?: {
    totalHits: number;
    topBots: Array<{ botName: string; hits: number; uniquePages: number; topPagePath: string | null }>;
  };
}

export function journalStatsReport(opts: JournalStatsReportOpts): { subject: string; html: string } {
  const { frequency, periodLabel, from, to, totals, topArticles, aiTraffic } = opts;
  const subject = `Journal Stats Report — ${periodLabel}`;
  const ctaPct = totals.views > 0 ? Math.round((totals.ctaClicks / totals.views) * 100) : 0;
  const topRows = topArticles.slice(0, 5).map((a) =>
    `<tr>
      <td style="padding:8px 12px;font-size:13px;color:${BRAND.text};border-bottom:1px solid ${BRAND.border};">${escapeHtml(a.title || a.slug)}</td>
      <td style="padding:8px 12px;font-size:13px;color:${BRAND.text};border-bottom:1px solid ${BRAND.border};text-align:right;">${a.views}</td>
      <td style="padding:8px 12px;font-size:13px;color:${BRAND.text};border-bottom:1px solid ${BRAND.border};text-align:right;">${a.ctaClicks}</td>
    </tr>`
  ).join("");

  const html = baseTemplate({
    preheader: `${totals.views} views, ${totals.ctaClicks} CTA clicks for ${periodLabel}.`,
    title: `${frequency === "weekly" ? "Weekly" : "Monthly"} Journal Stats`,
    bodyHtml: `
      <p style="margin:0 0 18px 0;">Here is your <strong style="color:${BRAND.text};">${frequency === "weekly" ? "weekly" : "monthly"}</strong> Journal performance report for <strong style="color:${BRAND.text};">${escapeHtml(periodLabel)}</strong>. The full CSV is attached.</p>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:12px;padding:16px;margin-bottom:20px;">
        ${row("Period", `${from} → ${to}`)}
        ${row("Views", String(totals.views))}
        ${row("CTA clicks", `${totals.ctaClicks} (${ctaPct}% of views)`)}
        ${row("Create account", String(totals.createAccountChoices))}
        ${row("Guest emails", String(totals.guestEmails))}
        ${row("Open contact", String(totals.openContactChoices))}
      </table>

      ${aiTraffic && aiTraffic.totalHits > 0 ? `
      <p style="margin:0 0 10px 0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:${BRAND.accentSoft};">AI Assistants (${aiTraffic.totalHits} hits)</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;margin-bottom:20px;">
        <thead>
          <tr style="background:${BRAND.card};">
            <th style="padding:8px 12px;font-size:11px;text-align:left;text-transform:uppercase;letter-spacing:1px;color:${BRAND.textMuted};font-weight:600;">Assistant</th>
            <th style="padding:8px 12px;font-size:11px;text-align:right;text-transform:uppercase;letter-spacing:1px;color:${BRAND.textMuted};font-weight:600;">Hits</th>
            <th style="padding:8px 12px;font-size:11px;text-align:right;text-transform:uppercase;letter-spacing:1px;color:${BRAND.textMuted};font-weight:600;">Pages</th>
            <th style="padding:8px 12px;font-size:11px;text-align:left;text-transform:uppercase;letter-spacing:1px;color:${BRAND.textMuted};font-weight:600;">Top Page</th>
          </tr>
        </thead>
        <tbody>
          ${aiTraffic.topBots.slice(0, 8).map((b) =>
            `<tr>
              <td style="padding:8px 12px;font-size:13px;color:${BRAND.text};border-bottom:1px solid ${BRAND.border};">${escapeHtml(b.botName)}</td>
              <td style="padding:8px 12px;font-size:13px;color:${BRAND.text};border-bottom:1px solid ${BRAND.border};text-align:right;">${b.hits}</td>
              <td style="padding:8px 12px;font-size:13px;color:${BRAND.text};border-bottom:1px solid ${BRAND.border};text-align:right;">${b.uniquePages}</td>
              <td style="padding:8px 12px;font-size:13px;color:${BRAND.textMuted};border-bottom:1px solid ${BRAND.border};">${escapeHtml(b.topPagePath || "—")}</td>
            </tr>`
          ).join("")}
        </tbody>
      </table>` : ""}

      ${topArticles.length > 0 ? `
      <p style="margin:0 0 10px 0;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;color:${BRAND.accentSoft};">Top Articles</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background:${BRAND.card};">
            <th style="padding:8px 12px;font-size:11px;text-align:left;text-transform:uppercase;letter-spacing:1px;color:${BRAND.textMuted};font-weight:600;">Article</th>
            <th style="padding:8px 12px;font-size:11px;text-align:right;text-transform:uppercase;letter-spacing:1px;color:${BRAND.textMuted};font-weight:600;">Views</th>
            <th style="padding:8px 12px;font-size:11px;text-align:right;text-transform:uppercase;letter-spacing:1px;color:${BRAND.textMuted};font-weight:600;">CTA</th>
          </tr>
        </thead>
        <tbody>${topRows}</tbody>
      </table>` : ""}
    `,
  });
  return { subject, html };
}

export function socialClickNotification(opts: SocialClickOpts): { subject: string; html: string } {
  const ts = opts.timestamp || new Date().toISOString();
  const subject = `${opts.platform} click from ${opts.pagePath}`;
  const html = baseTemplate({
    preheader: `Someone clicked your ${opts.platform} link.`,
    title: `New ${opts.platform} click`,
    bodyHtml: `
      <p style="margin:0 0 18px 0;">A visitor just clicked your <strong style="color:${BRAND.text};">${escapeHtml(opts.platform)}</strong> link from <strong style="color:${BRAND.text};">${escapeHtml(opts.pagePath)}</strong>.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:12px;padding:16px;">
        ${row("Platform", opts.platform)}
        ${row("Page", opts.pagePath)}
        ${row("Visitor", opts.visitorId.slice(0, 12) + "…")}
        ${row("Referrer", opts.referrer || "Direct")}
        ${row("User Agent", (opts.userAgent || "Unknown").slice(0, 80))}
        ${row("Time", ts)}
      </table>
    `,
  });
  return { subject, html };
}
