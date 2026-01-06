# v1 Implementation Phases

## Overview

This document breaks down v1 of the QwikFolio roadmap into manageable, sequential phases. Each phase builds on the previous one and can be independently tested and reviewed.

**Total Phases**: 6  
**Estimated Complexity**: Medium to High  
**Dependencies**: Each phase depends on the previous phase's schema changes

---

## Phase 1: Schema Foundation & Data Model Updates

**Objective**: Extend the portfolio schema to support all v1 features while maintaining backward compatibility.

**Deliverables**:

1. **Update `src/schemas/portfolio.ts`**:

   - Extend `personalInfoSchema`:

     - Add `location?: string` (city, country)
     - Add `roleLevel?: "junior" | "mid" | "senior" | "lead"`
     - Add `availability?: "open_to_work" | "freelance" | "not_open"`
     - Add `hourlyRate?: number` and `salaryRange?: string` (conditional on availability)
     - Add `profilePhotoUrl?: string`
     - Replace `github` and `linkedin` with `socialLinks: z.array(socialLinkSchema)`
     - Create `socialLinkSchema`: `{ type: "github" | "linkedin" | "twitter" | "dribbble" | "devto" | "portfolio", url: string }`

   - Replace `skillSchema` (string) with structured `skillSchema`:

     - `name: string`
     - `category: "language" | "framework" | "tool" | "soft_skill"`
     - `level: "beginner" | "intermediate" | "advanced"`
     - `yearsExperience?: number`
     - Add `primaryStack?: string[]` to portfolio (array of skill names for highlighting)

   - Extend `projectSchema`:

     - Add `role?: string`
     - Add `highlights: z.array(z.string())` (2-5 items)
     - Add `tags: z.array(z.string())`
     - Add `featured: boolean` (default false)
     - Add `order: number` (default 0)
     - Add `media?: z.array(mediaSchema)` where `mediaSchema = { type: "image" | "video", url: string }`

   - Extend `experienceSchema`:

     - Add `location?: string`
     - Add `employmentType?: "full_time" | "contract" | "internship"`
     - Replace/augment `description` with `achievements?: z.array(z.string())`
     - Keep `description` for backward compatibility (optional)

   - Extend `educationSchema`:

     - Add `gpa?: number`
     - Add `coursework?: z.array(z.string())`
     - Add `honors?: string`

   - Add `certificationSchema`:
     - `id?: string`
     - `name: string`
     - `issuer: string`
     - `issueDate: string`
     - `expiryDate?: string`
     - `credentialId?: string`
     - `credentialUrl?: string`
   - Add `certifications?: z.array(certificationSchema)` to `portfolioSchema`

   - Add `settingsSchema`:
     - `slug?: string` (custom URL path, per-user unique)
     - `isPublic: boolean` (default false)
     - `seoTitle?: string`
     - `seoDescription?: string`
     - `showContactForm: boolean` (default true)
     - `contactEmail?: string`
   - Add `settings: settingsSchema` to `portfolioSchema` (with defaults)

   - Add `themeSchema`:
     - `id: "default" | "emerald" | "ocean" | "violet"` (default "emerald")
     - `primaryColor: "emerald" | "cyan" | "violet" | "amber"` (default "emerald")
     - `accentStyle: "soft" | "vibrant" | "mono"` (default "soft")
     - `radius: "none" | "md" | "xl"` (default "md")
     - `layout: "sidebar-left" | "sidebar-top" | "one-column"` (default "sidebar-left")
     - `showProfilePhoto: boolean` (default true)
   - Add `theme: themeSchema` to `portfolioSchema` (with defaults)

2. **Migration Strategy**:

   - Create migration helper functions in `src/services/portfolio/portfolio-migrations.ts`:
     - `migrateLegacyPortfolio(legacy: any): Portfolio` - converts old format to new
     - Handle backward compatibility in `getPortfolio()` service

3. **Update Type Exports**:
   - Export all new types: `SocialLink`, `StructuredSkill`, `ProjectMedia`, `Certification`, `PortfolioSettings`, `PortfolioTheme`

**Testing Checklist**:

- [ ] Schema validates new fields correctly
- [ ] Schema rejects invalid data
- [ ] Migration function converts old portfolios correctly
- [ ] Default values are applied correctly
- [ ] TypeScript types compile without errors

**Estimated Time**: 4-6 hours

---

## Phase 2: Personal Info & Social Links Enhancement

**Objective**: Update PersonalInfoForm to support new fields and migrate from separate social fields to socialLinks array.

**Deliverables**:

1. **Update `src/components/builder/PersonalInfoForm.tsx`**:

   - Add `location` input field (city, country)
   - Add `roleLevel` dropdown/select
   - Add `availability` radio group with conditional fields:
     - Show `hourlyRate` input when `availability === "freelance"`
     - Show `salaryRange` input when `availability === "open_to_work"`
   - Add profile photo upload section:
     - Use `avatarStorageService` for upload
     - Display preview of uploaded photo
     - Show current `profilePhotoUrl` if exists
   - Replace `github` and `linkedin` inputs with dynamic `socialLinks` array:
     - Add/remove social link entries
     - Each entry has: type dropdown + URL input
     - Support all types: github, linkedin, twitter, dribbble, devto, portfolio
     - Validate URLs

2. **Update `usePortfolioBuilder.ts`**:

   - Ensure `updatePersonalInfo` handles new fields
   - Add migration logic to convert old `github`/`linkedin` to `socialLinks` on load

3. **Update Preview Components**:
   - Update `DevPortfolio.tsx` to use `socialLinks` array instead of hardcoded github/linkedin
   - Display `location` in hero section
   - Show `roleLevel` in headline (e.g., "Senior Frontend Engineer")
   - Display `profilePhotoUrl` if available
   - Show availability badge/indicator

**Testing Checklist**:

- [ ] All new fields save correctly
- [ ] Social links array works (add/remove entries)
- [ ] Profile photo uploads and displays
- [ ] Conditional fields show/hide based on availability
- [ ] Old portfolios with github/linkedin migrate correctly
- [ ] Preview displays new fields correctly

**Estimated Time**: 6-8 hours

---

## Phase 3: Structured Skills & Projects Enhancement

**Objective**: Migrate from simple skill strings to structured skills and enhance projects with new fields.

**Deliverables**:

1. **Update `src/components/builder/SkillsForm.tsx`**:

   - Replace simple string input with structured skill form:
     - Skill name input
     - Category dropdown (language, framework, tool, soft_skill)
     - Level dropdown/select (beginner, intermediate, advanced)
     - Years of experience input (optional)
   - Add "Primary Stack" selector:
     - Multi-select from existing skills
     - Visual indicator for selected primary skills
     - Store in `portfolio.primaryStack` array
   - Maintain add/remove list UX similar to current implementation

2. **Update `src/components/builder/ProjectsForm.tsx`**:

   - Add `role` input field
   - Add `highlights` array input:
     - Add/remove highlight bullets (2-5 items)
     - Textarea for each highlight
   - Add `tags` array input:
     - Tag input with autocomplete/suggestions
     - Display as badges
   - Add `featured` checkbox toggle
   - Add `order` number input (for manual sorting)
   - Add `media` array section:
     - Add/remove media entries
     - Each entry: type dropdown (image/video) + URL input
     - Preview thumbnails for images
   - Update form layout to accommodate new fields

3. **Update `usePortfolioBuilder.ts`**:

   - Add migration logic for skills: convert string array to structured format
   - Ensure `updateSkills` and `updateProjects` handle new structures

4. **Update Preview Components**:
   - `DevPortfolio.tsx`:
     - Display structured skills grouped by category
     - Highlight primary stack skills
     - Show project highlights as bullet points
     - Display project tags as badges
     - Show featured projects prominently
     - Display project media (images/videos)
     - Sort projects by `order` field

**Testing Checklist**:

- [ ] Skills migration from strings works correctly
- [ ] Structured skills save and load correctly
- [ ] Primary stack selection works
- [ ] All new project fields save correctly
- [ ] Project media displays in preview
- [ ] Featured projects are highlighted
- [ ] Project sorting by order works

**Estimated Time**: 8-10 hours

---

## Phase 4: Experience, Education & Certifications Enhancement

**Objective**: Enhance experience and education forms, and add new certifications section.

**Deliverables**:

1. **Update `src/components/builder/ExperienceForm.tsx`**:

   - Add `location` input field
   - Add `employmentType` dropdown (full_time, contract, internship)
   - Replace/augment `description` textarea with `achievements` array:
     - Add/remove achievement bullets
     - Keep `description` as optional for backward compatibility
     - Show both fields (description + achievements)

2. **Update `src/components/builder/EducationForm.tsx`**:

   - Add `gpa` number input (optional)
   - Add `coursework` array input:
     - Add/remove coursework items
   - Add `honors` text input (optional)

3. **Create `src/components/builder/CertificationsForm.tsx`**:

   - New form component following same pattern as ExperienceForm/EducationForm
   - Fields:
     - Name (required)
     - Issuer (required)
     - Issue date (required)
     - Expiry date (optional)
     - Credential ID (optional)
     - Credential URL (optional)
   - Add/remove list UX
   - Validation for dates

4. **Update `src/pages/dashboard/builder.tsx`**:

   - Add CertificationsForm section
   - Add to section refs and progress tracking

5. **Update `usePortfolioBuilder.ts`**:

   - Add `updateCertifications` function
   - Add certifications to error handling

6. **Update Preview Components**:
   - `DevPortfolio.tsx`:
     - Display experience location and employment type
     - Show achievements as bullet list
     - Display education GPA, coursework, honors
     - Add "Certifications" section:
       - Show name, issuer, dates
       - Display "View credential" link when `credentialUrl` exists

**Testing Checklist**:

- [ ] All experience fields save correctly
- [ ] Achievements array works
- [ ] All education fields save correctly
- [ ] Certifications form works (add/remove)
- [ ] Certifications display in preview
- [ ] Credential links work correctly

**Estimated Time**: 6-8 hours

---

## Phase 5: Portfolio Settings & Theme System

**Objective**: Add portfolio settings form and implement theme system with builder UI.

**Deliverables**:

1. **Create `src/components/builder/SettingsForm.tsx`**:

   - Slug input with validation (alphanumeric, hyphens, unique per user)
   - `isPublic` toggle (published vs draft)
   - SEO title input
   - SEO description textarea
   - `showContactForm` toggle
   - Contact email input (optional override)

2. **Create `src/components/builder/ThemeSettingsForm.tsx`**:

   - Preset theme cards (default, emerald, ocean, violet):
     - Mini preview of each theme
     - Click to select
   - Customization toggles:
     - Primary color selector
     - Accent style selector (soft, vibrant, mono)
     - Border radius selector
     - Layout selector (sidebar-left, sidebar-top, one-column)
     - Show profile photo toggle
   - Live preview integration (update preview as user changes theme)

3. **Update `src/pages/dashboard/builder.tsx`**:

   - Add SettingsForm section
   - Add ThemeSettingsForm section
   - Add to section refs and progress tracking

4. **Update `usePortfolioBuilder.ts`**:

   - Add `updateSettings` function
   - Add `updateTheme` function
   - Add to error handling

5. **Implement Theme System**:

   - Create `src/lib/theme-utils.ts`:
     - `applyTheme(theme: PortfolioTheme): void` - maps theme to CSS variables
     - `getThemeCSSVariables(theme: PortfolioTheme): Record<string, string>`
   - Update `src/index.css`:
     - Add CSS variables for portfolio themes:
       - `--portfolio-primary`
       - `--portfolio-accent`
       - `--portfolio-radius`
       - `--portfolio-layout`
   - Update `DevPortfolio.tsx`:
     - Apply theme CSS variables on mount
     - Use `data-theme` attribute for theme-specific styling
     - Replace hardcoded Tailwind classes with CSS variables where appropriate
     - Support all layout options

6. **Update Services**:
   - Add slug uniqueness validation in `portfolioService.ts`
   - Update `getPublicPortfolioByUsername` to support slug-based lookup

**Testing Checklist**:

- [ ] Settings form saves correctly
- [ ] Slug validation works (unique per user)
- [ ] Theme presets apply correctly
- [ ] Theme customization works
- [ ] CSS variables update in preview
- [ ] All layout options render correctly
- [ ] Public portfolio accessible via slug

**Estimated Time**: 10-12 hours

---

## Phase 6: Scaling Foundations (Autosave, Onboarding, Analytics)

**Objective**: Implement autosave, profile completion tracking, and basic analytics.

**Deliverables**:

1. **Autosave & Drafts**:

   - Update `usePortfolioBuilder.ts`:
     - Add debounced autosave (use `useDebounce` hook or similar)
     - Save to `settings.isPublic = false` (draft) automatically
     - Track save state: "idle" | "saving" | "saved" | "error"
   - Update `BuilderHeader.tsx`:
     - Show autosave status: "Saving...", "Saved just now", "Last saved X ago"
     - Show error toast if autosave fails
     - Keep manual "Save & Publish" button that sets `isPublic = true`

2. **Profile Completion Tracking**:

   - Create `src/hooks/useProfileCompletion.ts`:
     - Calculate completion percentage based on filled sections
     - Track required vs optional fields
     - Return completion status and missing sections
   - Update `src/components/dashboard/CompletionBadge.tsx`:
     - Show completion percentage
     - Link to missing sections
   - Update `src/pages/dashboard/profile-completion.tsx`:
     - Show detailed completion breakdown
     - Guide users to fill missing sections
     - Show "Profile 100% complete" when done

3. **Basic Analytics**:

   - Extend `src/services/analytics/analyticsService.ts`:
     - `trackPortfolioView(slug: string, userId: string): Promise<void>`
     - `trackContactClick(slug: string, type: string): Promise<void>`
     - `trackSocialLinkClick(slug: string, type: string): Promise<void>`
     - `trackProjectView(slug: string, projectId: string): Promise<void>`
     - `getPortfolioViews(slug: string, timeRange: string): Promise<number>`
     - `getTopProjects(slug: string): Promise<Array<{ id: string, views: number }>>`
   - Update `PublicPortfolioPage.tsx`:
     - Track views on page load
     - Track clicks on contact links and social links
     - Track project views when clicked
   - Update Dashboard:
     - Show portfolio views count
     - Show top-viewed projects
     - Show recent activity (views, clicks)

4. **Database Updates** (if needed):
   - Create analytics tables in Supabase:
     - `portfolio_views` (slug, user_id, viewed_at, ip_address?)
     - `portfolio_events` (slug, event_type, event_data, created_at)

**Testing Checklist**:

- [ ] Autosave triggers on form changes (debounced)
- [ ] Autosave status displays correctly
- [ ] Manual publish works (sets isPublic = true)
- [ ] Profile completion calculates correctly
- [ ] Completion badge shows accurate percentage
- [ ] Analytics track events correctly
- [ ] Dashboard displays analytics data
- [ ] No performance issues with autosave

**Estimated Time**: 10-12 hours

---

## Summary

**Total Estimated Time**: 44-56 hours (5.5-7 days)

**Phase Dependencies**:

- Phase 1 → All other phases (schema foundation)
- Phase 2 → Phase 3 (personal info used in preview)
- Phase 3 → Phase 4 (skills/projects used in preview)
- Phase 4 → Phase 5 (certifications in preview)
- Phase 5 → Phase 6 (settings/theme needed for analytics)

**Recommended Approach**:

1. Complete phases sequentially
2. Test each phase before moving to next
3. Create feature branch per phase
4. Update progress.md after each phase completion

**Breaking Changes**:

- Phase 1: Schema changes require migration
- Phase 2: Social links migration (github/linkedin → socialLinks)
- Phase 3: Skills migration (string[] → structured skills)

**Backward Compatibility**:

- All migrations should handle old data format
- Preview should work with partial data (optional fields)
- Default values ensure existing portfolios still work
