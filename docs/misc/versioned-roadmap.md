## QwikFolio Versioned Roadmap (v1–v4)

### Overview

- **Goal**: Evolve QwikFolio from a single developer-focused portfolio into a flexible platform for developers, designers, freelancers, and creators, while keeping the codebase simple and scalable.
- **Approach**: Ship value in small, additive versions; keep one core data model (portfolio) and add capabilities via schemas, templates, and configuration.

---

## v1 – Core Portfolio & Theme Foundations

### Objectives

- **Deepen the existing portfolio builder** so profiles feel “hire-ready” across roles.
- **Introduce a data-driven theme system** (presets + safe customization knobs).
- **Lay initial scaling foundations** (autosave, onboarding, basic analytics).

### 1. Builder Form Enhancements

- **Personal Info**

  - Add `location` (city, country) for hero and metadata.
  - Add `roleLevel` enum (`junior`, `mid`, `senior`, `lead`) to drive copy (“Senior Frontend Engineer”).
  - Add `availability` enum (`open_to_work`, `freelance`, `not_open`) with optional `hourlyRate` / `salaryRange`.
  - Add `profilePhotoUrl` (optional) wired to `avatarStorageService`.
  - Replace separate `github` / `linkedin` with `socialLinks[]`:
    - Shape: `{ type: "github" | "linkedin" | "twitter" | "dribbble" | "devto" | "portfolio", url }`.

- **Skills**

  - Change from simple string array to structured skills:
    - `category`: `language` | `framework` | `tool` | `soft_skill`.
    - `level`: `beginner` | `intermediate` | `advanced` (or 1–5).
    - `yearsExperience` (optional number).
  - Add a “Primary stack” selector (e.g., React / Node / Python) for highlighting in the hero and summary.

- **Projects**

  - Add `role` (e.g., “Frontend Engineer”, “Solo developer”).
  - Add `highlights[]`: short, impact-focused bullet points (2–5).
  - Add `tags[]`: flexible strings (e.g., “Open Source”, “SaaS”, “Fintech”) to drive badges and filters.
  - Add `featured` (boolean) and `order` (number) to pin and sort key projects.
  - Add optional `media[]` for visual portfolios:
    - Shape: `{ type: "image" | "video", url }`.

- **Experience & Education**

  - Add `location` and `employmentType` (`full_time`, `contract`, `internship`) to experience items.
  - Replace/augment single `description` with `achievements[]` (bullet list).
  - For education:
    - Add `gpa` (optional).
    - Add `coursework[]` (array of strings).
    - Add `honors` fields.

- **Certifications**

  - Introduce a dedicated `certificationSchema` and `certifications[]` on `portfolioSchema`:
    - Shape: `{ id?, name, issuer, issueDate, expiryDate?, credentialId?, credentialUrl? }`.
  - Builder:
    - New “Certifications” section in the builder with add/remove list UX (similar to experience/projects).
  - Preview:
    - Show a “Certifications” section that highlights `name`, `issuer`, dates, and an optional “View credential” link when `credentialUrl` is present.

- **Portfolio Settings**
  - Introduce a `settingsSchema` attached to `portfolioSchema`:
    - `slug`: custom URL path (per-user unique).
    - `isPublic`: boolean (published vs draft).
    - `seoTitle` / `seoDescription`: for social and SEO metadata.
    - `showContactForm`: boolean.
    - `contactEmail`: optional override (different from auth email).

### 2. Theme System (Customizable but Simple)

- **Theme Data Model**

  - Add `themeSchema` in `portfolio.ts`:
    - `id`: `"default" | "emerald" | "ocean" | "violet"`.
    - `primaryColor`: `"emerald" | "cyan" | "violet" | "amber"`.
    - `accentStyle`: `"soft" | "vibrant" | "mono"`.
    - `radius`: `"none" | "md" | "xl"`.
    - `layout`: `"sidebar-left" | "sidebar-top" | "one-column"`.
    - `showProfilePhoto`: `boolean` (default `true`).
  - Add `theme: themeSchema` to `portfolioSchema`, with a sensible default.

- **Builder UI**

  - New `ThemeSettingsForm` under `components/builder/`:
    - Shows preset theme cards (using live mini-previews).
    - Simple toggles for primary color, radius, and layout.
  - Integrate with existing builder flow via `usePortfolioBuilder` and save mutations.

- **Styling Implementation**
  - Define CSS variables for portfolio presentation (e.g., `--portfolio-primary`, `--portfolio-accent`, `--portfolio-radius`).
  - Apply variables to the portfolio preview root (`<div data-theme="emerald-soft">`).
  - Map `themeSchema` → CSS variables with a helper in `lib/utils.ts`.
  - Ensure preview templates read from variables instead of hard-coded Tailwind classes where appropriate.

### 3. Scaling Foundations (Phase 1)

- **Autosave & Drafts**

  - Implement debounced autosave of portfolio changes to Supabase.
  - Maintain `draft` vs `published` state via `settings.isPublic`.
  - Provide clear UI state (e.g., “Saved just now”, “Saving…”, error toasts).

- **Onboarding & Completion**

  - Use existing dashboard components (`CompletionBadge`, `QuickActions`) to:
    - Guide new users through filling out each major section.
    - Show progress towards a “Profile 100% complete” goal.

- **Basic Analytics**
  - Use `analyticsService` to track:
    - Portfolio views (per slug).
    - Clicks on contact links / social links.
    - Top-viewed projects.
  - Surface high-level stats on the dashboard.

---

## v2 – Multi-Template Foundations

### Objectives

- **Support multiple portfolio templates** without changing the core data model.
- **Introduce personas** (developer, designer, freelancer, creator) and connect them to templates.

### Key Workstreams

- **Template Schema**

  - Add `templateSchema` to `portfolio.ts`:
    - `id`: `"dev-chronological" | "designer-gallery" | "freelancer-services" | "creator-reel"` (initial set).
    - `persona`: `"developer" | "designer" | "freelancer" | "creator"`.
  - Attach `template` to `portfolioSchema` with a default (e.g., `"dev-chronological"`).

- **Preview Templates**

  - Create `components/preview/templates/*` for each template:
    - `DevChronologicalTemplate`.
    - `DesignerGalleryTemplate`.
    - `FreelancerServicesTemplate`.
    - `CreatorReelTemplate`.
  - In `PortfolioPreview`, switch on `portfolio.template.id` and render the appropriate template component.

- **Template Picker UX**
  - Add a “Choose your template” step in the builder:
    - Card-based selector with screenshot, persona label, short description.
    - Updating the selection immediately updates the live preview.
  - Store the chosen template in the portfolio and respect it on public routes.

---

## v3 – Template-Aware Sections & Personas

### Objectives

- **Make templates smarter** by surfacing the right fields for each persona.
- **Reuse the same core schema** while changing how data is displayed and edited.

### Key Workstreams

- **Schema Extensions (Non-Breaking)**

  - Refine existing v1 fields to better serve multiple personas:
    - `projects.type`: `"product" | "case_study" | "artwork" | "animation"`.
    - `projects.media[]`: more prominent and better validated for visual templates.
    - `personalInfo.roleCategory`: `"developer" | "designer" | "freelancer" | "creator"`.
    - `personalInfo.services[]`: for freelancers (e.g., “Web design”, “Brand identity”).

- **Template-Aware Builder UI**

  - Conditionally show/reorder sections based on `template.persona`:
    - Designers: emphasize projects-as-gallery and media.
    - Freelancers: highlight services, pricing, testimonials.
    - Creators/animators: focus on reels, embeds, and media.
  - Keep all fields available under an “Advanced” or “All sections” view so data is not siloed.

- **Persona-Specific Copy & Defaults**
  - Adjust copy on the builder and preview (headings, placeholders) per persona.
  - Provide sample content templates (e.g., sample project highlight bullets per persona).

---

## v4 – Block-Based Layouts, Multi-Tenant & Monetization

### Objectives

- **Unlock advanced layout flexibility** for power users via blocks/sections.
- **Scale the platform** with multi-portfolio, teams, and monetization paths.

### Key Workstreams

- **Block-Based Layout System (Optional for Power Users)**

  - Introduce a `blocks[]` or `sections[]` model:
    - Each block: `{ id, type: "hero" | "grid" | "timeline" | "testimonials" | "cta", dataRef }`.
  - Make existing templates just “starter configurations” for these blocks.
  - Provide a lightweight drag-and-drop or reorder UI in the builder.

- **Multi-Portfolio & Teams**

  - Allow multiple portfolios per user (`portfolios` table keyed by `user_id`).
  - Team/workspace support:
    - Shared access to portfolios.
    - Roles/permissions (owner, editor, viewer).

- **Monetization**

  - Paid tiers:
    - Custom domains.
    - Advanced analytics (referrers, devices, locations).
    - More templates/themes & private portfolios.
  - Implement rate limiting and abuse protection on public endpoints and contact forms.

- **Technical Scaling & Observability**
  - Lazy-load routes (`pages/dashboard/*`, `PublicPortfolioPage`) with `React.lazy` and `Suspense`.
  - Centralize data loading patterns in `services/*` with consistent error handling and `useToast` integration.
  - Add structured event logging via `analyticsService` (sign-ups, publishes, views, template switches).
  - Introduce a simple feature-flag mechanism (e.g., `feature_flags` table) to roll out new templates and blocks gradually.
