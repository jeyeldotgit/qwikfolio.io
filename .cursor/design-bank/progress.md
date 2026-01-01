# 📈 Progress & Roadmap

## Status Key

- 🟢 Complete
- 🟡 In Progress
- ⚪ Pending
- 🔴 Blocked

## Task List

- [ ] ⚪ Initial Project Setup
- [ ] ⚪ Core Layout (Navbar/Footer)
- [ ] ⚪ Design System Tokens in Tailwind
- [ ] ⚪ Auth Flow UI
- [x] 🟢 Portfolio Preview Refactor - DevPortfolio component
- [x] 🟢 Light/Dark Theme System - Global theme toggle

## Version History

- v1.0: Initial Design Bank structure established.
- v1.1: Created DevPortfolio.tsx - Modern dark-themed developer portfolio with:
  - Geometric grid background with gradient blurs
  - Emerald/cyan accent color scheme
  - Code-style section headers (// tech_stack, // featured_projects)
  - Animated skill tags with hover effects
  - Project cards with number indicators
  - Timeline-based experience section
  - Portfolio/Resume view toggle on preview pages
- v1.2: Added global light/dark theme system:
  - Created `useTheme` hook with localStorage persistence
  - Created `ThemeToggle` component (icon + dropdown variants)
  - DevPortfolio now supports both light and dark themes
  - Added theme toggle to all pages (Landing, Auth, Dashboard, Builder, Preview)
  - Implemented FOUC prevention in index.html
  - System preference detection with auto-follow option
