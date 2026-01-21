## Overview
Implement a unified sidebar navigation system for dashboard, builder, and preview pages to improve user experience and reduce navigation confusion.

## Current State Analysis

### Dashboard Page (`/dashboard`)
- **Header**: Logo, Completion Badge, Theme Toggle, Profile Menu
- **Navigation**: None (static page)
- **Issues**: No easy way to navigate to builder/preview

### Builder Page (`/dashboard/builder`)
- **Header**: Logo, Save Status, Theme Toggle, Dashboard Button, Preview Button, Save Button
- **Sidebar**: BuilderProgress (form sections navigation) - only on desktop
- **Issues**: 
  - Header has too many buttons
  - Mobile navigation is limited
  - No consistent navigation pattern

### Preview Page (`/dashboard/preview`)
- **Header**: Logo, View Toggle (Portfolio/Resume), Theme Toggle, Edit Button, Print/PDF Button
- **Navigation**: None
- **Issues**: 
  - Header is cluttered
  - No easy way to navigate back to dashboard/builder
  - Theme toggle and download should be in the portfolio itself

### DevPortfolio Component
- **Current**: No navigation/controls
- **Issues**: 
  - Theme toggle and download resume are in the preview page header (not in the portfolio)
  - Top nav is irrelevant for the portfolio view

---

## Proposed Solution

### 1. Unified Sidebar Navigation

Create a shared sidebar component that appears on:
- Dashboard (`/dashboard`)
- Builder (`/dashboard/builder`)
- Preview (`/dashboard/preview`)

#### Sidebar Structure

```
┌─────────────────────────┐
│  QwikFolio.io Logo      │
├─────────────────────────┤
│  📊 Dashboard           │ ← Active state
│  ✏️  Builder            │
│  👁️  Preview            │
├─────────────────────────┤
│  👤 Profile             │
│  ⚙️  Settings            │
│  🚪 Logout              │
├─────────────────────────┤
│  🌓 Theme Toggle        │
└─────────────────────────┘
```

#### Sidebar Features
- **Persistent**: Always visible on desktop (collapsible)
- **Mobile**: Drawer/sheet that slides in from left
- **Active State**: Highlights current page
- **Icons**: Clear visual indicators for each section
- **User Info**: Profile picture/name at bottom
- **Theme Toggle**: Always accessible

### 2. Simplified Headers

#### Dashboard Header
- **Remove**: Logo (moved to sidebar)
- **Keep**: Completion Badge (or move to sidebar)
- **Remove**: Theme Toggle (moved to sidebar)
- **Remove**: Profile Menu (moved to sidebar)
- **Result**: Minimal or no header

#### Builder Header
- **Remove**: Logo (moved to sidebar)
- **Keep**: Save Status (important for user feedback)
- **Remove**: Theme Toggle (moved to sidebar)
- **Remove**: Dashboard Button (moved to sidebar)
- **Keep**: Preview Button (or move to sidebar)
- **Keep**: Save Button (primary action)
- **Result**: Focused header with save status and actions

#### Preview Header
- **Remove**: Logo (moved to sidebar)
- **Keep**: View Toggle (Portfolio/Resume) - or move to sidebar
- **Remove**: Theme Toggle (moved to sidebar)
- **Remove**: Edit Button (moved to sidebar)
- **Keep**: Print/PDF Button (or move to sidebar)
- **Result**: Minimal header with view controls

### 3. DevPortfolio Component Updates

#### Add to DevPortfolio
- **Theme Toggle**: Floating button or in portfolio header
- **Download Resume**: Button in portfolio header or floating action
- **Remove**: Top navigation (if any exists)

#### Portfolio Header (within DevPortfolio)
```
┌─────────────────────────────────────────┐
│  [Profile Photo] Name                   │
│  Headline                                │
│  [Theme Toggle] [Download Resume]       │
└─────────────────────────────────────────┘
```

---