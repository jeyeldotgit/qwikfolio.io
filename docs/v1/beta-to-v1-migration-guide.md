# Beta to v1 Migration Guide

## Overview

This document serves as the definitive guide for transitioning from QwikFolio Beta to v1. It covers breaking changes, feature parity mapping, and data migration strategies to ensure a smooth transition.

**Last Updated**: January 2025  
**Target Audience**: Developers, DevOps, Database Administrators

---

## Table of Contents

1. [Breaking Changes](#breaking-changes)
2. [Feature Parity Map](#feature-parity-map)
3. [Data Migration Notes](#data-migration-notes)
4. [Migration Checklist](#migration-checklist)

---

## Breaking Changes

### API & Service Layer

#### ❌ Deprecated: Direct GitHub/LinkedIn Fields

**Beta (Deprecated)**:
```typescript
// Old way - direct fields
portfolio.personalInfo.github = "https://github.com/user";
portfolio.personalInfo.linkedin = "https://linkedin.com/in/user";
```

**v1 (New)**:
```typescript
// New way - social links array
portfolio.personalInfo.socialLinks = [
  { type: "github", url: "https://github.com/user" },
  { type: "linkedin", url: "https://linkedin.com/in/user" }
];
```

**Migration**: Automatic via `migrateSocialLinks()` helper. Legacy fields (`github`, `linkedin`) are preserved for backward compatibility but should not be used in new code.

---

#### ❌ Deprecated: String-Based Skills

**Beta (Deprecated)**:
```typescript
// Old way - simple string array
portfolio.skills = ["React", "TypeScript", "Node.js"];
```

**v1 (New)**:
```typescript
// New way - structured skill objects
portfolio.skills = [
  { 
    name: "React", 
    category: "framework", 
    level: "advanced",
    yearsExperience: 3
  },
  // ...
];
```

**Migration**: Automatic via `migrateSkills()` helper. Legacy string skills are converted with defaults:
- `category`: `"tool"` (default)
- `level`: `"intermediate"` (default)

---

#### ❌ Changed: Portfolio Publishing Logic

**Beta**:
```typescript
// Single published boolean
portfolio.published = true;
```

**v1**:
```typescript
// Dual system: published column + settings.isPublic
portfolio.published = true; // Database column
portfolio.settings.isPublic = true; // JSONB setting
```

**Impact**: Both fields must be checked for public access. The `updatePortfolioPublishedStatus()` function now syncs both fields automatically.

---

#### ❌ Changed: Portfolio URL Resolution

**Beta**:
```typescript
// Only username-based URLs
const url = `qwikfolio.io/${username}`;
```

**v1**:
```typescript
// Slug takes precedence, falls back to username
const identifier = portfolio.settings.slug || username;
const url = `qwikfolio.io/${identifier}`;
```

**Impact**: Public portfolio lookup (`getPublicPortfolioByUsername`) now checks slug first, then username. Custom slugs override usernames.

---

### Database Schema

#### ❌ New Required Columns (with defaults)

The following columns were added to `portfolios` table. All have defaults or are nullable, so existing data is safe:

- `location` (TEXT, nullable)
- `role_level` (TEXT, nullable)
- `availability` (TEXT, nullable)
- `hourly_rate` (NUMERIC, nullable)
- `salary_range` (TEXT, nullable)
- `profile_photo_url` (TEXT, nullable)
- `social_links` (JSONB, default: `[]`)
- `settings` (JSONB, default: `{}`)
- `theme` (JSONB, default: `{}`)
- `primary_stack` (JSONB, default: `[]`)
- `slug` (TEXT, nullable, unique)

**Migration**: SQL migration script handles all column additions safely.

---

#### ❌ Skills Table Structure Change

**Beta**:
```sql
-- Single text column
skills.skill (TEXT)
```

**v1**:
```sql
-- Structured columns
skills.name (TEXT)
skills.category (TEXT) -- enum: language, framework, tool, soft_skill
skills.level (TEXT) -- enum: beginner, intermediate, advanced
skills.years_experience (NUMERIC, nullable)
```

**Migration**: Existing `skill` values are migrated to `name` with default category/level.

---

#### ❌ New Table: Certifications

**Beta**: No certifications table existed.

**v1**: New `certifications` table with:
- `name`, `issuer`, `issue_date`, `expiry_date`
- `credential_id`, `credential_url`

**Migration**: New table, no data migration needed.

---

### UI/UX Changes

#### ❌ Removed: Builder Publish Button

**Beta**: Publish button existed in builder header.

**v1**: Publishing is now only available from the dashboard. Builder only has "Save Draft" functionality.

**Impact**: Users must navigate to dashboard to publish portfolios.

---

#### ❌ Changed: Form Field Requirements

**Beta**:
- Experience `description` was required
- Skills were simple text inputs

**v1**:
- Experience `description` is now optional
- Skills require category, level, and optional years of experience
- New fields: location, role level, availability, certifications

---

## Feature Parity Map

### "Then vs. Now" Comparison

| Feature | Beta Implementation | v1 Implementation | Migration Notes |
|---------|-------------------|-------------------|-----------------|
| **Social Links** | `github`, `linkedin` fields | `socialLinks[]` array | Auto-migrated via `migrateSocialLinks()` |
| **Skills** | `string[]` | `Skill[]` objects | Auto-migrated via `migrateSkills()` |
| **Portfolio URL** | Username only | Slug (custom) or username | Slug takes precedence if set |
| **Publishing** | `published` boolean | `published` + `settings.isPublic` | Both synced automatically |
| **Projects** | Basic fields | Enhanced with role, highlights, tags, media, featured | New fields optional, defaults applied |
| **Experience** | Basic fields | Enhanced with location, employment type, achievements | New fields optional |
| **Education** | Basic fields | Enhanced with GPA, coursework, honors | New fields optional |
| **Certifications** | Not available | Full certifications table | New feature, no migration needed |
| **Theme System** | Not available | Full theme customization | New feature, defaults applied |
| **Analytics** | Basic view tracking | Enhanced with slug, project views, social clicks | Backward compatible |
| **Autosave** | Manual save only | Debounced autosave (2s) | New feature, improves UX |

---

## Data Migration Notes

### Automatic Migration Strategy

v1 uses **on-the-fly migration** via TypeScript helpers. No manual database migration is required for data transformation.

#### Migration Functions

1. **`normalizePortfolio()`** - Main migration entry point
   - Detects legacy format automatically
   - Applies all migrations
   - Returns v1-compatible portfolio

2. **`migrateSocialLinks()`** - Converts github/linkedin to array
   - Preserves existing socialLinks if present
   - Falls back to github/linkedin if not

3. **`migrateSkills()`** - Converts string[] to Skill[]
   - Maps each string to Skill object
   - Applies defaults: category="tool", level="intermediate"

4. **`migratePersonalInfo()`** - Migrates personal info fields
   - Handles social links migration
   - Preserves legacy github/linkedin for compatibility

5. **`migrateLegacyPortfolio()`** - Full portfolio migration
   - Orchestrates all sub-migrations
   - Applies defaults for new fields

---

### Data Preservation Guarantees

✅ **No Data Loss**: All existing data is preserved
- Legacy fields (`github`, `linkedin`) remain in database
- Legacy skills are converted, not deleted
- All existing projects, experience, education entries preserved

✅ **Backward Compatibility**: Old code continues to work
- Legacy fields accessible via `personalInfo.github` / `personalInfo.linkedin`
- TypeScript helpers handle conversion transparently

✅ **Gradual Migration**: No big-bang migration required
- Data migrates automatically when loaded
- Can migrate database records over time

---

### Database Migration Script

The SQL migration (`v1-schema-migration.sql`) handles:

1. **Column Additions**: All new columns added with defaults/nullable
2. **Table Creation**: New `certifications` table
3. **Index Creation**: Indexes for performance (slug, user_id, etc.)
4. **RLS Policy Updates**: Updated policies for new fields
5. **Function Updates**: Analytics functions updated for new event types

**Safety**: All operations are additive. No data is deleted or modified.

---

### Manual Migration (If Needed)

If you need to migrate data at the database level:

```sql
-- Migrate github/linkedin to social_links (if not already done)
UPDATE portfolios
SET social_links = jsonb_build_array(
  CASE
    WHEN github IS NOT NULL AND github != ''
    THEN jsonb_build_object('type', 'github', 'url', github)
    ELSE NULL
  END,
  CASE
    WHEN linkedin IS NOT NULL AND linkedin != ''
    THEN jsonb_build_object('type', 'linkedin', 'url', linkedin)
    ELSE NULL
  END
)::jsonb
WHERE social_links = '[]'::jsonb OR social_links IS NULL;

-- Migrate skills from text to structured format
UPDATE skills
SET
  name = COALESCE(name, skill),
  category = COALESCE(category, 'tool'),
  level = COALESCE(level, 'intermediate')
WHERE name IS NULL AND skill IS NOT NULL;
```

---

## Migration Checklist

### Pre-Migration

- [ ] **Backup Database**: Create full database backup
- [ ] **Review Breaking Changes**: Understand all changes
- [ ] **Test in Staging**: Run migration on staging environment first
- [ ] **Notify Users**: Inform users of upcoming changes (if applicable)

### Database Migration

- [ ] **Run SQL Migration**: Execute `v1-schema-migration.sql` in Supabase
- [ ] **Verify Schema**: Check all new columns/tables exist
- [ ] **Check Indexes**: Verify indexes were created
- [ ] **Test RLS Policies**: Ensure policies work correctly

### Code Migration

- [ ] **Update Dependencies**: Ensure all packages are up to date
- [ ] **Deploy v1 Code**: Deploy new codebase
- [ ] **Verify Auto-Migration**: Test that `normalizePortfolio()` works
- [ ] **Test Forms**: Verify all form components work with new schema
- [ ] **Test Preview**: Verify preview components display new fields

### Post-Migration

- [ ] **Test Publishing**: Verify portfolio publishing works
- [ ] **Test Public URLs**: Verify slug-based URLs work
- [ ] **Test Analytics**: Verify analytics tracking works
- [ ] **Monitor Errors**: Watch for migration-related errors
- [ ] **User Acceptance**: Have users test their portfolios

### Rollback Plan

If issues occur:

1. **Code Rollback**: Revert to previous code version
2. **Database Rollback**: 
   - New columns can remain (they're nullable)
   - Old code will ignore new columns
   - Legacy fields still work
3. **Data Integrity**: No data is lost, old format still readable

---

## Support & Troubleshooting

### Common Issues

**Issue**: "Portfolio not found" after migration
- **Cause**: Slug/username lookup logic changed
- **Fix**: Verify portfolio has `published=true` OR `settings.isPublic=true`

**Issue**: Skills not displaying
- **Cause**: Skills migrated from string[] to objects
- **Fix**: Ensure code accesses `skill.name` not just `skill`

**Issue**: Social links missing
- **Cause**: Migration didn't run or github/linkedin were empty
- **Fix**: Check `social_links` JSONB column, verify migration ran

### Getting Help

- Check migration logs in browser console
- Review `portfolio-migrations.ts` for migration logic
- Verify database schema matches `v1-schema-migration.sql`
- Test with a fresh portfolio to isolate issues

---

## Next Steps

After successful migration:

1. **Update Documentation**: Update any custom documentation
2. **Train Team**: Ensure team understands new schema
3. **Monitor Performance**: Watch for any performance issues
4. **Plan v2**: Start planning next version improvements

---

**Document Version**: 1.0  
**Last Updated**: January 2025

