# Elgar Sirajov MVP

## Overview

A premium mobile-first platform connecting a solo product designer ("Elgar Sirajov") with clients seeking MVP development. The platform emphasizes the "Solopreneur Hats" concept - one designer wearing five different expertise hats (Designer, Developer, Strategist, Manager, Analyst) to deliver complete MVP solutions. Built as an Expo React Native application with an Express backend, supporting both iOS/Android mobile clients and web deployment.

## User Preferences

Preferred communication style: Simple, everyday language.

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
- **Client Role**: 3 tabs (Dashboard, Messages, Account) + project creation flow
- **Designer Role**: 4 tabs (Projects, Messages, WorkSession, Account)
- **Auth Flow**: Stack-based (Welcome → Login/Register → Role-based home)

### Backend Architecture
- **Server**: Express 5 on Node.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL
- **API Pattern**: RESTful endpoints under `/api/` prefix
- **Schema Validation**: Zod schemas generated from Drizzle for type-safe API contracts
- **Storage Layer**: Abstracted storage interface in `server/storage.ts` for data access

### Data Model
Key entities: Users (client/designer roles), Projects (with status workflow), Messages, WorkSessions, ProjectVersions, CreditPackages, CreditTransactions, ProjectHats

Project status workflow: brief_submitted → hat_selection → discovery → design_build → client_review → iteration → completed

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