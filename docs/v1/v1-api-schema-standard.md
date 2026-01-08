# v1 Standard API & Schema Documentation

## Overview

This document defines the v1 API contract, data dictionary, and environment configuration. This represents the stable API that v1 provides, with clear versioning policies for future changes.

**Last Updated**: January 2025  
**Target Audience**: Developers, API Consumers, New Team Members

---

## Table of Contents

1. [Versioning Policy](#versioning-policy)
2. [Data Dictionary](#data-dictionary)
3. [API Reference](#api-reference)
4. [Environment Variables](#environment-variables)
5. [Schema Reference](#schema-reference)

---

## Versioning Policy

### Version Strategy

**Current Version**: `v1.0.0`

**Version Format**: `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes (e.g., v1 → v2)
- **MINOR**: New features, backward compatible (e.g., v1.0 → v1.1)
- **PATCH**: Bug fixes, backward compatible (e.g., v1.0.0 → v1.0.1)

### Breaking Change Policy

**What Constitutes a Breaking Change**:

1. **Schema Changes**:
   - Removing required fields
   - Changing field types (e.g., string → number)
   - Removing enum values
   - Changing default values

2. **API Changes**:
   - Removing endpoints
   - Changing request/response formats
   - Removing query parameters
   - Changing authentication requirements

3. **Behavior Changes**:
   - Changing validation rules
   - Changing error response formats
   - Changing default behaviors

**Breaking Change Process**:

1. **Deprecation Period**: 6 months minimum
2. **Documentation**: Clear migration guide
3. **Version Bump**: New major version (v1 → v2)
4. **Support**: Maintain v1 for 12 months after v2 release

### Backward Compatibility Guarantee

**v1 Guarantees**:

- ✅ All v1.0.x releases are backward compatible
- ✅ Legacy fields (`github`, `linkedin`) remain accessible
- ✅ Old data formats automatically migrated
- ✅ API endpoints remain stable

**What We Reserve the Right to Change**:

- Internal implementation details
- Error message text (not structure)
- Performance characteristics
- Non-public APIs

---

## Data Dictionary

### Core Tables

#### `portfolios`

Primary portfolio data table.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | NO | - | Foreign key to `auth.users` |
| `name` | TEXT | NO | - | Full name |
| `headline` | TEXT | NO | - | Professional headline |
| `email` | TEXT | NO | - | Contact email |
| `phone` | TEXT | YES | NULL | Phone number |
| `bio` | TEXT | YES | NULL | Bio/description |
| `website` | TEXT | YES | NULL | Personal website |
| `location` | TEXT | YES | NULL | City, country |
| `role_level` | TEXT | YES | NULL | `junior`, `mid`, `senior`, `lead` |
| `availability` | TEXT | YES | NULL | `open_to_work`, `freelance`, `not_open` |
| `hourly_rate` | NUMERIC | YES | NULL | Hourly rate (if freelance) |
| `salary_range` | TEXT | YES | NULL | Salary range (if open_to_work) |
| `profile_photo_url` | TEXT | YES | NULL | Profile photo URL |
| `github` | TEXT | YES | NULL | **Deprecated** - Use `social_links` |
| `linkedin` | TEXT | YES | NULL | **Deprecated** - Use `social_links` |
| `social_links` | JSONB | YES | `[]` | Array of `{type, url}` objects |
| `settings` | JSONB | YES | `{}` | Portfolio settings (see below) |
| `theme` | JSONB | YES | `{}` | Theme configuration (see below) |
| `primary_stack` | JSONB | YES | `[]` | Array of skill names for highlighting |
| `slug` | TEXT | YES | NULL | Custom URL slug (unique) |
| `published` | BOOLEAN | NO | `false` | Published status |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Unique index on `slug`
- Index on `user_id`
- Index on `published`

**RLS Policies**:
- Users can SELECT/UPDATE/DELETE their own portfolio
- Public can SELECT if `published=true` OR `settings->>'isPublic'='true'`

---

#### `skills`

Structured skills data.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | NO | - | Foreign key to `auth.users` |
| `name` | TEXT | NO | - | Skill name (e.g., "React") |
| `category` | TEXT | NO | - | `language`, `framework`, `tool`, `soft_skill` |
| `level` | TEXT | NO | - | `beginner`, `intermediate`, `advanced` |
| `years_experience` | NUMERIC | YES | NULL | Years of experience |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Creation timestamp |

**Indexes**:
- Primary key on `id`
- Index on `user_id`

**RLS Policies**:
- Users can SELECT/INSERT/UPDATE/DELETE their own skills
- Public can SELECT if portfolio is published

---

#### `projects`

Project portfolio entries.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | NO | - | Foreign key to `auth.users` |
| `name` | TEXT | NO | - | Project name |
| `description` | TEXT | NO | - | Project description |
| `role` | TEXT | YES | NULL | Role in project |
| `highlights` | JSONB | YES | `[]` | Array of highlight strings |
| `tags` | JSONB | YES | `[]` | Array of tag strings |
| `featured` | BOOLEAN | NO | `false` | Featured project flag |
| `order` | INTEGER | NO | `0` | Display order |
| `media` | JSONB | YES | NULL | Array of `{type, url}` objects |
| `repo_url` | TEXT | YES | NULL | Repository URL |
| `live_url` | TEXT | YES | NULL | Live demo URL |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Index on `user_id`
- Index on `featured`

**RLS Policies**:
- Users can SELECT/INSERT/UPDATE/DELETE their own projects
- Public can SELECT if portfolio is published

---

#### `experience`

Work experience entries.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | NO | - | Foreign key to `auth.users` |
| `company` | TEXT | NO | - | Company name |
| `role` | TEXT | NO | - | Job title |
| `start_date` | TEXT | NO | - | Start date (YYYY-MM format) |
| `end_date` | TEXT | YES | NULL | End date (YYYY-MM format) |
| `current` | BOOLEAN | NO | `false` | Currently working here |
| `location` | TEXT | YES | NULL | Job location |
| `employment_type` | TEXT | YES | NULL | `full_time`, `contract`, `internship` |
| `description` | TEXT | YES | NULL | Job description |
| `achievements` | JSONB | YES | NULL | Array of achievement strings |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Index on `user_id`

**RLS Policies**:
- Users can SELECT/INSERT/UPDATE/DELETE their own experience
- Public can SELECT if portfolio is published

---

#### `education`

Education entries.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | NO | - | Foreign key to `auth.users` |
| `school` | TEXT | NO | - | School name |
| `degree` | TEXT | NO | - | Degree type |
| `field` | TEXT | NO | - | Field of study |
| `start_date` | TEXT | NO | - | Start date (YYYY-MM format) |
| `end_date` | TEXT | YES | NULL | End date (YYYY-MM format) |
| `current` | BOOLEAN | NO | `false` | Currently enrolled |
| `description` | TEXT | YES | NULL | Additional description |
| `gpa` | NUMERIC | YES | NULL | GPA (0-4.0 scale) |
| `coursework` | JSONB | YES | NULL | Array of course names |
| `honors` | TEXT | YES | NULL | Honors/awards |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Index on `user_id`

**RLS Policies**:
- Users can SELECT/INSERT/UPDATE/DELETE their own education
- Public can SELECT if portfolio is published

---

#### `certifications`

Professional certifications (new in v1).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | NO | - | Foreign key to `auth.users` |
| `name` | TEXT | NO | - | Certification name |
| `issuer` | TEXT | NO | - | Issuing organization |
| `issue_date` | TEXT | NO | - | Issue date (YYYY-MM format) |
| `expiry_date` | TEXT | YES | NULL | Expiry date (YYYY-MM format) |
| `credential_id` | TEXT | YES | NULL | Credential ID/verification code |
| `credential_url` | TEXT | YES | NULL | Verification URL |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | NO | `now()` | Last update timestamp |

**Indexes**:
- Primary key on `id`
- Index on `user_id`

**RLS Policies**:
- Users can SELECT/INSERT/UPDATE/DELETE their own certifications
- Public can SELECT if portfolio is published

---

#### `portfolio_analytics`

Analytics event tracking.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | NO | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | NO | - | Portfolio owner |
| `event_type` | TEXT | NO | - | `view`, `download`, `contact_click`, `social_click`, `project_view` |
| `slug` | TEXT | YES | NULL | Portfolio slug (for tracking) |
| `project_id` | UUID | YES | NULL | Project ID (for project_view events) |
| `event_data` | JSONB | YES | NULL | Additional event data |
| `created_at` | TIMESTAMPTZ | NO | `now()` | Event timestamp |

**Indexes**:
- Primary key on `id`
- Index on `user_id`
- Index on `event_type`
- Index on `created_at`

**RLS Policies**:
- Users can SELECT their own analytics
- Public can INSERT view events (for tracking)

---

### JSONB Structures

#### `settings` (portfolios.settings)

```typescript
{
  slug?: string;                    // Custom URL slug
  isPublic?: boolean;                // Public visibility (synced with published)
  seoTitle?: string;                // SEO title
  seoDescription?: string;          // SEO description
  showContactForm?: boolean;        // Show contact form
  contactEmail?: string;            // Contact email override
}
```

#### `theme` (portfolios.theme)

```typescript
{
  id?: "default" | "emerald" | "ocean" | "violet";
  primaryColor?: "emerald" | "cyan" | "violet" | "amber";
  accentStyle?: "soft" | "vibrant" | "mono";
  radius?: "none" | "md" | "xl";
  layout?: "sidebar-left" | "sidebar-top" | "one-column";
  showProfilePhoto?: boolean;
}
```

#### `social_links` (portfolios.social_links)

```typescript
Array<{
  type: "github" | "linkedin" | "twitter" | "dribbble" | "devto" | "portfolio" | "instagram" | "facebook";
  url: string;
}>
```

---

## API Reference

### Portfolio Service API

**Base Path**: `/api/portfolio` (internal service, not HTTP endpoint)

All functions are TypeScript services, not REST endpoints. They're called directly from the frontend.

#### `getPortfolio(userId: string): Promise<Portfolio | null>`

Fetches a user's portfolio.

**Parameters**:
- `userId` (string, required): Authenticated user's ID

**Returns**:
- `Portfolio | null`: Portfolio data or null if not found

**Throws**:
- `PortfolioServiceError`: If database operation fails

**Example**:
```typescript
const portfolio = await getPortfolio(user.id);
```

---

#### `getPublicPortfolioByUsername(identifier: string): Promise<{portfolio: Portfolio, userId: string} | null>`

Fetches a published portfolio by slug or username.

**Parameters**:
- `identifier` (string, required): Slug or username

**Returns**:
- `{portfolio: Portfolio, userId: string} | null`: Portfolio and owner ID, or null

**Throws**:
- `PortfolioServiceError`: If portfolio not found or not published

**Example**:
```typescript
const result = await getPublicPortfolioByUsername("my-custom-slug");
if (result) {
  const { portfolio, userId } = result;
}
```

---

#### `createOrUpdatePortfolio(userId: string, portfolio: Portfolio): Promise<Portfolio>`

Creates or updates a portfolio.

**Parameters**:
- `userId` (string, required): Authenticated user's ID
- `portfolio` (Portfolio, required): Portfolio data (validated with Zod)

**Returns**:
- `Portfolio`: Saved portfolio data

**Throws**:
- `PortfolioServiceError`: If validation fails or database operation fails

**Example**:
```typescript
const saved = await createOrUpdatePortfolio(user.id, portfolioData);
```

---

#### `updatePortfolioPublishedStatus(userId: string, published: boolean): Promise<void>`

Updates portfolio published status.

**Parameters**:
- `userId` (string, required): Authenticated user's ID
- `published` (boolean, required): Published status

**Returns**:
- `void`

**Throws**:
- `PortfolioServiceError`: If update fails

**Note**: This function syncs both `published` column and `settings.isPublic`.

**Example**:
```typescript
await updatePortfolioPublishedStatus(user.id, true);
```

---

## Environment Variables

### Required Variables

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Optional Variables

```bash
# Application Configuration
VITE_APP_NAME=QwikFolio
VITE_APP_URL=https://qwikfolio.io

# Analytics (Future)
VITE_ANALYTICS_ID=your-analytics-id

# Feature Flags (Future)
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_REALTIME=false
```

### Environment-Specific Files

```
.env                 # Default (committed)
.env.local          # Local overrides (git-ignored)
.env.development    # Development environment
.env.production     # Production environment
```

### Security Notes

⚠️ **Important**: Variables prefixed with `VITE_` are exposed to the browser!

- ✅ Safe: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (designed to be public)
- ❌ Never: Database passwords, service role keys, API secrets

---

## Schema Reference

### Zod Schemas

All schemas are defined in `src/schemas/portfolio.ts` using Zod.

#### Portfolio Schema

```typescript
const portfolioSchema = z.object({
  personalInfo: personalInfoSchema,
  skills: z.array(skillSchema).min(1),
  projects: z.array(projectSchema).min(1),
  experience: z.array(experienceSchema).optional(),
  education: z.array(educationSchema).optional(),
  certifications: z.array(certificationSchema).optional(),
  primaryStack: z.array(z.string()).optional(),
  settings: settingsSchema.default({...}),
  theme: themeSchema.default({...}),
});
```

#### Personal Info Schema

```typescript
const personalInfoSchema = z.object({
  name: z.string().min(1),
  headline: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  location: z.string().optional(),
  roleLevel: z.enum(["junior", "mid", "senior", "lead"]).optional(),
  availability: z.enum(["open_to_work", "freelance", "not_open"]).optional(),
  hourlyRate: z.number().positive().optional(),
  salaryRange: z.string().optional(),
  profilePhotoUrl: z.string().url().optional().or(z.literal("")),
  socialLinks: z.array(socialLinkSchema).default([]),
  // Legacy fields (deprecated)
  github: z.string().url().optional().or(z.literal("")),
  linkedin: z.string().url().optional().or(z.literal("")),
});
```

#### Skill Schema

```typescript
const skillSchema = z.object({
  name: z.string().min(2),
  category: z.enum(["language", "framework", "tool", "soft_skill"]),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  yearsExperience: z.number().positive().optional(),
});
```

---

## Type Exports

All types are exported from `src/schemas/portfolio.ts`:

```typescript
export type Portfolio = z.infer<typeof portfolioSchema>;
export type PersonalInfo = z.infer<typeof personalInfoSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Experience = z.infer<typeof experienceSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Certification = z.infer<typeof certificationSchema>;
export type PortfolioSettings = z.infer<typeof settingsSchema>;
export type PortfolioTheme = z.infer<typeof themeSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
```

---

## Error Handling

### PortfolioServiceError

All service errors use `PortfolioServiceError`:

```typescript
class PortfolioServiceError extends Error {
  constructor(
    message: string,
    public code?: string
  ) {
    super(message);
    this.name = "PortfolioServiceError";
  }
}
```

### Common Error Codes

- `PGRST116`: No rows returned (expected for optional queries)
- `23505`: Unique constraint violation (e.g., duplicate slug)
- `23503`: Foreign key violation
- `23502`: Not null violation

---

## Migration Helpers

All migration functions are in `src/services/portfolio/portfolio-migrations.ts`:

- `normalizePortfolio()`: Main migration entry point
- `migrateSocialLinks()`: Converts github/linkedin to array
- `migrateSkills()`: Converts string[] to Skill[]
- `migratePersonalInfo()`: Migrates personal info
- `migrateLegacyPortfolio()`: Full portfolio migration

---

**Document Version**: 1.0  
**Last Updated**: January 2025

