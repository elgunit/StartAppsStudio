# Design Guidelines: MVP Design Service Platform

## Brand Identity

**Purpose**: A premium platform connecting solo product designers with clients seeking MVP development, emphasizing transparency, expertise versatility, and seamless collaboration.

**Aesthetic Direction**: **Editorial/Professional Minimalism**
- Stark black-on-white with strategic use of negative space
- Typographic hierarchy as primary visual language
- Subtle shadows only on floating elements
- Icon-driven navigation with clear meaning
- "Solopreneur Hats" metaphor visualized through simple, distinctive iconography representing role versatility

**Memorable Element**: The "Hat Switching" interaction - visual indicators showing which expertise area (Designer, Developer, Strategist, Manager, Analyst) is active for each project, making the solopreneur's multidisciplinary nature tangible and dynamic.

## Navigation Architecture

**Root Navigation**: Tab Bar (5 tabs for Clients, 4 tabs for Designer)

**Client Role Tabs**:
1. Home (Dashboard) - Active projects overview
2. Discover (Portfolio/Services) - Designer's expertise showcase
3. New Project (Floating Action Button) - Submit project brief
4. Messages - Real-time chat with designer
5. Account - Profile, credits, billing

**Designer Role Tabs**:
1. Projects - All client projects management
2. Messages - Unified client communications
3. Work Session - Active work tracker
4. Account - Profile, analytics

**Authentication Flow**: Stack-only (Welcome → Login/Signup → Role-based Home)

## Screen Specifications

### Authentication Screens

**Welcome Screen**
- Purpose: Landing page introducing the "Solopreneur Hats" concept
- Layout:
  - Full-screen scrollable view with transparent header
  - Hero section: Large heading "One Designer. Five Hats. Your Complete MVP Team."
  - 5 hat icons with labels (Designer, Developer, Strategist, Manager, Analyst) in horizontal scroll
  - Portfolio preview cards (3-4 case studies)
  - Pricing tiers overview
  - CTA buttons: "Get Started" (primary) and "Sign In" (secondary)
- Safe area: top: insets.top + Spacing.xl, bottom: insets.bottom + Spacing.xl
- Components: Hero text, icon grid, pricing cards, CTAs

**Login Screen**
- Purpose: User authentication
- Layout:
  - Centered form with header showing "Welcome Back"
  - SSO buttons: Google Sign-In, Apple Sign-In (stacked, full-width)
  - Divider with "or" text
  - Email/password fields
  - "Forgot Password?" link
  - Submit button: "Sign In"
  - Footer: "New here? Create Account" link
- Header: Default navigation with back button
- Safe area: standard form insets

### Client Screens

**Client Dashboard (Home Tab)**
- Purpose: Overview of active projects and quick actions
- Layout:
  - Scrollable view with transparent header
  - Header: "Welcome back, [Name]" with credit balance badge in top-right
  - Credit balance card (prominent, shows remaining credits with "Add Credits" button)
  - "Active Projects" section (cards showing project name, current hat/phase, progress bar, designer online status)
  - "Recent Updates" feed (latest messages, iteration completions)
  - Quick action button: "Start New Project"
- Safe area: top: insets.top + Spacing.xl, bottom: tabBarHeight + Spacing.xl
- Components: Balance card, project cards with status indicators, update feed items

**Discover Screen (Portfolio Tab)**
- Purpose: Showcase designer's expertise and past work
- Layout:
  - Scrollable list with transparent header
  - Header: "Expertise" with search icon (right)
  - 5 "Hat" category cards (each expandable to show relevant case studies)
  - Case study cards include: thumbnail, title, client name, tags, "View Details" button
- Safe area: top: insets.top + Spacing.xl, bottom: tabBarHeight + Spacing.xl
- Components: Category headers with icons, expandable sections, case study cards

**New Project Screen (Modal)**
- Purpose: Submit project brief
- Layout:
  - Full-screen modal with custom header
  - Header: "New Project" with close button (left)
  - Scrollable form:
    - Project name field
    - Description textarea
    - "Select Expertise Needed" (multi-select hat chips)
    - Timeline picker
    - File upload area ("Attach references")
    - Estimated credits display (auto-calculated)
  - Submit button: Fixed at bottom "Submit Brief"
- Safe area: top: headerHeight + Spacing.xl, bottom: insets.bottom + Spacing.xl
- Components: Text inputs, multi-select chips, file picker, submit button

**Messages Screen (Tab)**
- Purpose: Real-time chat with designer
- Layout:
  - Chat list if multiple conversations, or direct chat view for single project
  - Header: "Messages" with filter icon
  - List of conversations showing: project name, last message preview, timestamp, unread badge
  - Tapping opens full chat view
- Safe area: top: insets.top + Spacing.xl, bottom: tabBarHeight + Spacing.xl
- Components: Conversation cards, message bubbles, file attachments, input field

**Project Detail Screen (Stack)**
- Purpose: View project progress and preview
- Layout:
  - Scrollable with custom header
  - Header: Project name with back button, "..." menu (right)
  - Status banner showing current phase and designer online indicator
  - Work session card (hours worked, prompts used today)
  - Embedded WebView for prototype preview
  - Version history timeline
  - "Request Changes" button (opens feedback form)
- Safe area: top: headerHeight + Spacing.xl, bottom: insets.bottom + Spacing.xl
- Components: Status indicators, WebView embed, timeline, action buttons

### Designer Screens

**Designer Projects Screen (Tab)**
- Purpose: Manage all client projects
- Layout:
  - Scrollable list with transparent header
  - Header: "Projects" with filter/sort icons
  - Project cards showing: client name, project name, status, next action, last activity
  - Floating action button: "Start Work Session" (bottom-right with shadow)
- Safe area: top: insets.top + Spacing.xl, bottom: tabBarHeight + Spacing.xl
- Components: Project management cards, status badges, FAB

**Work Session Screen (Tab)**
- Purpose: Track active work and push updates
- Layout:
  - Scrollable with non-transparent header
  - Header: "Active Session" with timer display
  - Active project card (prominent, shows client, project, selected hat)
  - Session controls: Start/Stop timer, Prompt counter (manual increment)
  - Notes textarea ("Session notes - private")
  - "Push to Client" button (primary, disabled until work is logged)
  - Session history list below
- Safe area: top: Spacing.xl, bottom: tabBarHeight + Spacing.xl
- Components: Timer display, session controls, push button, history list

**Designer Messages Screen (Tab)**
- Purpose: Unified client communications
- Layout: Same as client messages but with all client conversations
- Safe area: top: insets.top + Spacing.xl, bottom: tabBarHeight + Spacing.xl

**Account Screen (Both Roles)**
- Purpose: Profile and settings
- Layout:
  - Scrollable with header
  - Header: "Account"
  - Profile section: Avatar (customizable), display name, email
  - For clients: Credit balance, "Add Credits" button, purchase history
  - For designer: Analytics summary, earnings
  - Settings: Notifications, theme
  - "Sign Out" button
  - "Delete Account" nested under Settings > Account > Delete
- Safe area: top: insets.top + Spacing.xl, bottom: tabBarHeight + Spacing.xl

## Color Palette

**Core Colors**:
- Primary: #000000 (black - headings, icons, primary actions)
- Background: #FFFFFF (white - canvas)
- Surface: #F8F8F8 (subtle gray - cards, sections)
- Border: #E5E5E5 (dividers, card edges)

**Semantic Colors**:
- Success: #10B981 (completed phases, positive feedback)
- Warning: #F59E0B (pending actions, low credits)
- Error: #EF4444 (errors, delete actions)
- Info: #3B82F6 (online status, new messages)

**Text Colors**:
- Primary Text: #000000
- Secondary Text: #6B7280
- Tertiary Text: #9CA3AF

## Typography

**Font**: Switzer (via Google Fonts)
- Display: Switzer Bold, 32px (landing hero, major headings)
- H1: Switzer Bold, 24px (screen titles)
- H2: Switzer SemiBold, 18px (section headers, card titles)
- Body: Switzer Regular, 16px (main content)
- Caption: Switzer Regular, 14px (metadata, timestamps)
- Button: Switzer SemiBold, 16px (CTAs, actions)

## Visual Design

**Touchable Feedback**: Scale down to 0.97 on press with 150ms duration
**Floating Action Button Shadow**:
- shadowOffset: {width: 0, height: 2}
- shadowOpacity: 0.10
- shadowRadius: 2
**Card Style**: 1px border (#E5E5E5), 8px border radius, no shadow
**Icons**: Feather icon set from @expo/vector-icons, 24px default size

## Assets to Generate

1. **icon.png** - App icon featuring stylized "hat" silhouette over "ES" monogram. WHERE USED: Device home screen
2. **splash-icon.png** - Simplified logo for launch screen. WHERE USED: App launch
3. **hat-designer.png** - Designer hat icon illustration. WHERE USED: Hat selection, portfolio categories
4. **hat-developer.png** - Developer hat icon illustration. WHERE USED: Hat selection, portfolio categories
5. **hat-strategist.png** - Strategist hat icon illustration. WHERE USED: Hat selection, portfolio categories
6. **hat-manager.png** - Project Manager hat icon illustration. WHERE USED: Hat selection, portfolio categories
7. **hat-analyst.png** - Business Analyst hat icon illustration. WHERE USED: Hat selection, portfolio categories
8. **empty-projects.png** - Minimal illustration of person with multiple floating hats. WHERE USED: Empty state on client dashboard
9. **empty-messages.png** - Minimal illustration of chat bubble with hat icon. WHERE USED: Empty messages screen
10. **avatar-default.png** - Clean circular avatar placeholder. WHERE USED: Account screen, message avatars