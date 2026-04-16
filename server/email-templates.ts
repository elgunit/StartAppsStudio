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
}

export function activeVisitorNotification(opts: ActiveVisitorOpts): { subject: string; html: string } {
  const ts = opts.timestamp || new Date().toISOString();
  const subject = `Active visitor on ${opts.pagePath}`;
  const html = baseTemplate({
    preheader: `Someone is actively browsing ${opts.pagePath} right now.`,
    title: "An active visitor is on your site",
    bodyHtml: `
      <p style="margin:0 0 18px 0;">A new visitor has scrolled past <strong style="color:${BRAND.text};">${opts.scrollPercent}%</strong> of <strong style="color:${BRAND.text};">${escapeHtml(opts.pagePath)}</strong> — they're engaged.</p>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BRAND.bg};border:1px solid ${BRAND.border};border-radius:12px;padding:16px;">
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

export interface SocialClickOpts {
  platform: string;
  pagePath: string;
  visitorId: string;
  userAgent?: string;
  referrer?: string;
  timestamp?: string;
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
