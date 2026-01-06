# v1 Schema Migration Guide

## Overview

This guide explains how to migrate your Supabase database from the current schema to the new v1 schema that supports enhanced portfolio features.

## Migration Files

1. **`src/db/migrations/v1-schema-migration.sql`** - SQL migration script for Supabase
2. **`src/services/portfolio/portfolio-migrations.ts`** - TypeScript migration helpers for data transformation

## Migration Steps

### Step 1: Backup Your Database

⚠️ **IMPORTANT**: Always backup your database before running migrations!

```sql
-- In Supabase Dashboard, go to Database > Backups
-- Or use pg_dump if you have direct access
```

### Step 2: Run SQL Migration

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `src/db/migrations/v1-schema-migration.sql`
4. Review the migration script
5. Click **Run** to execute

### Step 3: Verify Migration

Check that all tables and columns were created:

```sql
-- Check portfolios table has new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'portfolios';

-- Check certifications table exists
SELECT * FROM certifications LIMIT 1;

-- Check skills table has new columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'skills';
```

### Step 4: Update Application Code

The TypeScript migration helpers in `portfolio-migrations.ts` will automatically handle data transformation when loading portfolios. However, you need to:

1. Update `portfolioService.ts` to use `normalizePortfolio()` when fetching data
2. Update all form components to use new schema structure
3. Update preview components to display new fields

## What Gets Migrated

### Portfolios Table

**New Columns Added:**

- `location` - User location (city, country)
- `role_level` - junior, mid, senior, lead
- `availability` - open_to_work, freelance, not_open
- `hourly_rate` - Numeric
- `salary_range` - Text
- `profile_photo_url` - Text
- `social_links` - JSONB array `[{"type": "github", "url": "..."}]`
- `settings` - JSONB object with slug, SEO, contact settings
- `theme` - JSONB object with theme configuration
- `primary_stack` - JSONB array of skill names
- `slug` - Custom URL slug (unique)

**Legacy Columns Kept:**

- `github` - Kept for backward compatibility
- `linkedin` - Kept for backward compatibility
- `published` - Synced with `settings.isPublic`

### Skills Table

**Migration:**

- Old: `skill` (TEXT) - simple string
- New: `name` (TEXT) + `category` + `level` + `years_experience`

**Automatic Migration:**

- Existing skills are migrated: `skill` → `name`
- Default category: `tool`
- Default level: `intermediate`

### Projects Table

**New Columns:**

- `role` - Project role
- `highlights` - JSONB array of highlights
- `tags` - JSONB array of tags
- `featured` - Boolean
- `order` - Integer for sorting
- `media` - JSONB array `[{"type": "image", "url": "..."}]`

### Experience Table

**New Columns:**

- `location` - Job location
- `employment_type` - full_time, contract, internship
- `achievements` - JSONB array of achievements

**Changed:**

- `description` - Now optional (was required)

### Education Table

**New Columns:**

- `gpa` - Numeric (0-4.0)
- `coursework` - JSONB array
- `honors` - Text

### New Table: Certifications

Complete new table with:

- `name`, `issuer`, `issue_date`, `expiry_date`
- `credential_id`, `credential_url`

### Analytics Table

**Enhanced:**

- New event types: `contact_click`, `social_click`, `project_view`
- `slug` column for tracking
- `project_id` for project-specific tracking
- `event_data` JSONB for flexible event data

## Data Migration Strategy

### Automatic Migration (TypeScript)

The `normalizePortfolio()` function automatically:

1. **Detects legacy format** by checking:

   - If skills are strings instead of objects
   - If github/linkedin exist as separate fields
   - If personalInfo structure is missing

2. **Migrates data**:

   - Converts string skills to structured skills
   - Converts github/linkedin to socialLinks array
   - Applies default values for new fields
   - Preserves all existing data

3. **Applies defaults**:
   - Settings: `{isPublic: false, showContactForm: true}`
   - Theme: `{id: "emerald", primaryColor: "emerald", ...}`

### Manual Migration (If Needed)

If you need to migrate data at the database level:

```sql
-- Example: Migrate github/linkedin to social_links
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
WHERE social_links = '[]'::jsonb;

-- Example: Migrate skills
UPDATE skills
SET
  name = skill,
  category = 'tool',
  level = 'intermediate'
WHERE name IS NULL;
```

## Backward Compatibility

The migration maintains full backward compatibility:

1. **Legacy fields preserved**: `github`, `linkedin`, `published` still work
2. **Automatic conversion**: TypeScript helpers convert on-the-fly
3. **Gradual migration**: You can migrate data over time
4. **No data loss**: All existing data is preserved

## Rollback Plan

If you need to rollback:

1. **Database Rollback**:

   ```sql
   -- Drop new columns (be careful!)
   ALTER TABLE portfolios DROP COLUMN IF EXISTS location;
   ALTER TABLE portfolios DROP COLUMN IF EXISTS social_links;
   -- ... etc
   ```

2. **Code Rollback**:
   - Revert to previous version of portfolio schema
   - Remove migration helper calls
   - Old code will still work with legacy fields

## Testing Checklist

After migration, test:

- [ ] Existing portfolios load correctly
- [ ] New fields can be saved
- [ ] Social links work (both old and new format)
- [ ] Skills display correctly (migrated from strings)
- [ ] Projects with new fields save/load
- [ ] Certifications can be added
- [ ] Settings and theme work
- [ ] Public portfolios accessible via slug
- [ ] Analytics tracking works

## Next Steps

After migration:

1. **Phase 2**: Update PersonalInfoForm component
2. **Phase 3**: Update SkillsForm and ProjectsForm
3. **Phase 4**: Add CertificationsForm
4. **Phase 5**: Add SettingsForm and ThemeSettingsForm
5. **Phase 6**: Implement autosave and analytics

See `v1-implementation-phases.md` for detailed implementation plan.

## Support

If you encounter issues:

1. Check Supabase logs for SQL errors
2. Verify RLS policies are correct
3. Test with a single portfolio first
4. Review migration helper logs
