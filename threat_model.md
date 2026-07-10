# Threat Model

## Project Overview

This project is a public-facing Expo React Native application with an Express 5 backend and PostgreSQL via Drizzle. It serves anonymous marketing and journal content, authenticated client and designer workflows, messaging, project management, marketing service orders, and credit-based purchasing flows. Production traffic is public on the internet, so every API route must assume the caller is untrusted unless it is authenticated and authorized on the server.

## Assets

- **User accounts and sessions** — account email addresses, password verifiers, roles, and session tokens. Compromise allows impersonation of clients or the designer account.
- **Client business data** — projects, messages, uploaded file links, service orders, work sessions, and project versions. Exposure reveals private client communications and internal delivery status.
- **Billing and credit balances** — user credit balances, credit transactions, package purchases, project plan tiers, and service-order deductions. Abuse directly impacts revenue and service entitlements.
- **Lead and inquiry data** — contact submissions, journal leads, analytics, referrers, and visitor identifiers. This includes PII and marketing intelligence that should not be public.
- **Application secrets and outbound email capability** — database access plus Resend-backed email notifications and scheduled reports. Abuse could expose private data or generate unauthorized outbound mail.

## Trust Boundaries

- **Client to API** — mobile/web clients call the Express API. The client is untrusted, so user IDs, role claims, prices, package selections, and project ownership must be derived or verified server-side.
- **API to database** — the server can read and mutate all business data. Injection or missing authorization at the API layer becomes full data compromise.
- **Public to authenticated to designer-only** — public landing/journal traffic is intentionally open, but project data, credits, messaging, and analytics must only be exposed to the owning client or the designer. Designer/admin boundaries must be enforced from the session token, never from request parameters alone.
- **API to external services** — the backend sends email through Resend and fetches AI-bot verification data from external sources. Outbound requests must not become attacker-controlled pivots.
- **Production vs dev-only tooling** — workflow startup issues and local development helpers are not production-reachable unless separately exposed.

## Scan Anchors

- **Production entry points**: `server/index.ts`, `server/routes.ts`, `client/index.js`, `client/App.tsx`.
- **Highest-risk areas**: `server/routes.ts` auth, admin analytics, credits, project/message/service-order routes; `server/storage.ts` ownership-sensitive data access; `shared/schema.ts` user/session schema.
- **Public surfaces**: landing/journal/contact/waitlist/tracking routes and static templates under `server/templates/`.
- **Authenticated surfaces**: `/api/users/:id` mutation, designer dashboards, project/message/credits flows, service orders.
- **Designer-only surfaces**: admin analytics, journal leads, report schedules, AI traffic stats, contact submissions, and any route that reveals cross-user business data.
- **Usually ignore unless proven reachable in production**: workflow startup quirks and purely local Expo/agent tooling behavior.

## Threat Categories

### Spoofing

This app uses a custom `sessionToken` model rather than a standard auth framework. The server must authenticate every protected route from the session token and must not trust client-supplied `userId`, `clientId`, `senderId`, or `adminId` fields as proof of identity. Bootstrap or default-account flows must not let an anonymous caller create or assume the designer identity.

### Tampering

The backend controls projects, work sessions, messages, plan tiers, marketing orders, and user credit balances. Any mutation route that accepts arbitrary IDs or billing-relevant values from the request without ownership checks lets an attacker alter another user’s data or mint/consume credits without authorization. Credit grants and plan upgrades must only happen after server-verified authorization and payment/business-rule checks.

### Information Disclosure

This application stores private client messages, project details, contact inquiries, marketing leads, analytics, referrers, and visitor identifiers. API responses that return another user’s records, cross-tenant lists, or designer analytics without strong server-side authorization would expose sensitive business and personal data. Public responses and logs must avoid leaking secrets, passwords, session tokens, or unnecessary PII.

### Denial of Service

Several public endpoints accept anonymous submissions, tracking events, and contact/journal lead requests. These routes must validate input sizes and avoid expensive synchronous work per request so they cannot be abused for spam, inbox flooding, or database growth. External-service interactions should remain bounded and non-blocking.

### Elevation of Privilege

The main privilege boundary is between anonymous callers, ordinary clients, and the single designer/admin role. Designer-only capabilities such as analytics, inquiry review, report scheduling, and cross-user project visibility must be enforced server-side from authenticated role checks. Password storage must resist offline cracking so a database leak does not become rapid account takeover, especially for the designer account.
