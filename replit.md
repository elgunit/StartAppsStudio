# Elgar Sirajov MVP

## Overview

A premium mobile-first platform connecting a solo product designer ("Elgar Sirajov") with clients seeking MVP development. The platform emphasizes the "Solopreneur Hats" concept - one designer wearing five different expertise hats (Designer, Developer, Strategist, Manager, Analyst) to deliver complete MVP solutions. Built as an Expo React Native application with an Express backend, supporting both iOS/Android mobile clients and web deployment.

## User Preferences

Preferred communication style: Simple, everyday language.
Brand voice: Keep founder bio and positioning copy positive and constructive. Describe competitor limitations through the clarity, ownership, and outcomes this studio provides; avoid deficit-focused wording such as "waste" in the bio.

## Known Environment Issues

### Start Frontend workflow port-detection timeout (May 2026)
The `Start Frontend` workflow intermittently fails with `DIDNT_OPEN_A_PORT: didn't open port 8081` even when given a 360-second timeout. The Metro log shows the standard `Web is waiting on http://localhost:8081` banner but the workflow's port detector never sees the bind. A manual background launch (`nohup npm run expo:dev`) reliably binds port 8081 within ~22–45 seconds, so the project code and `expo:dev` script are healthy — the issue is the workflow port-detector deadline / environment. Workarounds:
- Click the Run/Restart button on the `Start Frontend` workflow from the workspace UI (UI-initiated restarts seem more lenient than agent-initiated ones).
- If the issue persists, contact Replit support and reference this note plus the workflow logs in `/tmp/logs/Start_Frontend_*.log`.

### Start Backend workflow port-detection timeout (July 2026)
The `Start Backend` workflow shows the same behavior on agent-initiated restarts: it fails with `DIDNT_OPEN_A_PORT: didn't open port 5000` even though the log clearly reaches `express server serving on port 5000` and a manual launch responds to requests within ~4 seconds. The server binds and serves fine; the workflow's port detector deadline (independent of the tool's own timeout) gives up and SIGKILLs the healthy process. Same workarounds as the Frontend note above: use the UI Run/Restart button (more lenient than agent restarts), and check `/tmp/logs/Start_Backend_*.log`. Note: the AI-bot-verifier fetches remote IP ranges during startup, which can add latency after the port bind.

## System Architecture

### Frontend Architecture
- **Framework**: Expo SDK 54 with React Native 0.81
- **Navigation**: React Navigation v7 with native stack and bottom tabs
- **State Management**: TanStack React Query for server state caching
- **Animations**: React Native Reanimated for smooth, performant animations
- **UI Components**: Custom component library with ThemedText, ThemedView, Card, Button, Input following editorial/professional minimalism design
- **Styling**: StyleSheet-based with a centralized theme system supporting light/dark modes
- **Path Aliases**: `@/` maps to `./client`, `@shared/` maps to `./shared`

### Role-Based Navigation
- **Client Role**: 4 tabs (Dashboard, Grow, Messages, Account) + project creation flow + service request flow
- **Designer Role**: 4 tabs (Projects, Messages, WorkSession, Account)
- **Auth Flow**: Stack-based (Welcome → Login/Register → Role-based home)

### Backend Architecture
- **Server**: Express 5 on Node.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Pattern**: RESTful endpoints under `/api/` prefix
- **Schema Validation**: Zod schemas generated from Drizzle for type-safe API contracts
- **Storage Layer**: Abstracted storage interface in `server/storage.ts` for data access

### Data Model
Key entities: Users (client/designer roles), Projects (with status workflow), Messages, WorkSessions, ProjectVersions, CreditPackages, CreditTransactions, ProjectHats, MarketingServices, ServiceOrders, SectionViews, VisitorEvents, JournalReportSchedules

### Visitor Analytics
- Anonymous-friendly tracking pipeline: `/api/track/section-view`, `/api/track/visitor-event`, `/api/track/active-visitor`, `/api/track/social-click`
- Admin reads (designer-only via `?adminId=`): `/api/admin/section-views`, `/api/admin/section-views/funnel`, `/api/admin/visitor-events`
- Desktop landing page (`server/templates/desktop-landing.html`) tags every major `<section>` with `data-section-name` and pings `/api/track/section-view` once per session when the section is ≥50% visible (IntersectionObserver). Funnel endpoint reports unique visitors per section + % of hero viewers who reached each section.
- Frontend hooks: `useSectionTracker`, `useScrollDepth`, `useVisitorEvent`, `useActiveVisitorNotification`
- `ScrollToTopOnNavigate` (mounted in App.tsx with shared NavigationContainer ref) drives scroll-depth tracking and one-shot per-session active-visitor email at 15% scroll
- `Footer` component (Instagram + LinkedIn) emits social-click email notifications via Resend
- Visitor IDs persisted in `localStorage` (web); session flags via `sessionStorage`

### Journal Stats Scheduled Reports
- Admins can configure a recurring weekly or monthly email that delivers the Journal conversion stats as a CSV attachment
- Configuration stored in `journal_report_schedules` DB table (one row per instance)
- API routes: `GET /api/admin/journal/report-schedule`, `POST /api/admin/journal/report-schedule`, `POST /api/admin/journal/report-schedule/send-now`
- Background scheduler in `server/index.ts` runs every hour via `setInterval`; checks `lastSentAt` vs. the configured interval to decide whether to send
- Email template: `journalStatsReport()` in `server/email-templates.ts` — includes summary table + top 5 articles, CSV attached as base64
- UI: "Scheduled Report" card on the Journal Stats screen with enabled toggle, weekly/monthly picker, recipient email input, Save and Send Now actions

Project status workflow: brief_submitted → hat_selection → discovery → design_build → client_review → iteration → completed

Service order status workflow: submitted → in_progress → delivered

Marketing service categories: SEO, Content, Ads, Social, Email, Brand

### Build & Deployment
- Development: Separate processes for Expo (`expo:dev`) and Express server (`server:dev`)
- Production: Static web build via custom build script, server bundled with esbuild
- Database migrations: Drizzle Kit with `db:push` command

## External Dependencies

### Core Services
- **Database**: PostgreSQL (connection via `DATABASE_URL` environment variable)
- **Fonts**: Google Fonts (Inter family via `@expo-google-fonts/inter`)

### Key Libraries
- **expo-image-picker**: For file/image uploads in chat and projects
- **expo-notifications**: Push notification support
- **expo-haptics**: Tactile feedback for interactions
- **expo-blur / expo-glass-effect**: iOS-style blur effects for tab bars and headers
- **date-fns**: Date formatting and manipulation
- **AsyncStorage**: Local persistence for authentication state

### Environment Variables Required
- `DATABASE_URL`: PostgreSQL connection string
- `EXPO_PUBLIC_DOMAIN`: API server domain for client requests
- `REPLIT_DEV_DOMAIN` / `REPLIT_DOMAINS`: For CORS configuration in development/production

## SEO: Sitemap & Search Engine Submission

The Express server exposes:
- `https://<prod-domain>/sitemap.xml` — generated by `renderSitemapXml` in `server/journal/render.ts`, wired in `server/routes.ts`
- `https://<prod-domain>/robots.txt` — generated by `renderRobotsTxt`, references the sitemap URL

After publishing a new Journal post, request indexing in both dashboards (≈5 minutes total).

### One-time setup (already done after first submission)
1. **Google Search Console** (https://search.google.com/search-console)
   - Add Property → URL prefix → enter `https://<prod-domain>`
   - Verify via DNS TXT record (preferred) or HTML meta tag (add to `server/templates/landing-page.html` `<head>` if needed)
   - Sitemaps → enter `sitemap.xml` → Submit
2. **Bing Webmaster Tools** (https://www.bing.com/webmasters)
   - Sign in → Add a site → enter `https://<prod-domain>`
   - Verify via XML file, meta tag, or "Import from Google Search Console" (fastest)
   - Sitemaps → Submit sitemap → `https://<prod-domain>/sitemap.xml`

### Per-post indexing request (run after each new article)
1. Confirm the new post URL appears in `https://<prod-domain>/sitemap.xml`
2. **Google**: Search Console → URL Inspection → paste full post URL → "Request Indexing"
3. **Bing**: Webmaster Tools → URL Submission → paste full post URL → Submit
4. Optional: re-submit the sitemap in both tools to nudge a fresh crawl

### Launch articles to request on first submission
The three launch posts are listed in `server/journal/posts.ts`; submit each one's full URL (e.g. `https://<prod-domain>/journal/<slug>`) through the Per-post flow above.