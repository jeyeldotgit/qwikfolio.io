-- ============================================
-- V1 SCHEMA MIGRATION
-- ============================================
-- This migration updates the database schema to support v1 features
-- Run this migration after the initial database-schema.sql
-- 
-- Changes:
-- 1. Extend portfolios table with new personal info fields
-- 2. Migrate skills from simple TEXT to structured format
-- 3. Extend projects with new fields (highlights, tags, media, etc.)
-- 4. Extend experience and education tables
-- 5. Add certifications table
-- 6. Add settings and theme as JSONB columns
-- 7. Update analytics for enhanced tracking
--
-- IMPORTANT: This migration maintains backward compatibility
-- ============================================

-- ============================================
-- 1. PORTFOLIOS TABLE - Add New Columns
-- ============================================

-- Add new personal info fields
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS role_level TEXT CHECK (role_level IN ('junior', 'mid', 'senior', 'lead')),
ADD COLUMN IF NOT EXISTS availability TEXT CHECK (availability IN ('open_to_work', 'freelance', 'not_open')),
ADD COLUMN IF NOT EXISTS hourly_rate NUMERIC(10, 2),
ADD COLUMN IF NOT EXISTS salary_range TEXT,
ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;

-- Add social links as JSONB array
-- Format: [{"type": "github", "url": "https://..."}, ...]
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '[]'::jsonb;

-- Add settings as JSONB object
-- Format: {"slug": "...", "isPublic": true, "seoTitle": "...", ...}
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"isPublic": false, "showContactForm": true}'::jsonb;

-- Add theme as JSONB object
-- Format: {"id": "emerald", "primaryColor": "emerald", ...}
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS theme JSONB DEFAULT '{"id": "emerald", "primaryColor": "emerald", "accentStyle": "soft", "radius": "md", "layout": "sidebar-left", "showProfilePhoto": true}'::jsonb;

-- Add primary stack as JSONB array of skill names
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS primary_stack JSONB DEFAULT '[]'::jsonb;

-- Add slug column for custom URLs (unique per user)
ALTER TABLE portfolios 
ADD COLUMN IF NOT EXISTS slug TEXT;

-- Create unique index on slug (only for non-null slugs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_portfolios_slug_unique 
ON portfolios(slug) 
WHERE slug IS NOT NULL;

-- Create index for slug lookups
CREATE INDEX IF NOT EXISTS idx_portfolios_slug ON portfolios(slug);

-- Migrate published to settings.isPublic
-- Update existing rows to sync published with settings.isPublic
UPDATE portfolios 
SET settings = jsonb_set(
  COALESCE(settings, '{}'::jsonb),
  '{isPublic}',
  to_jsonb(published)
)
WHERE settings->>'isPublic' IS NULL;

-- ============================================
-- 2. SKILLS TABLE - Migrate to Structured Format
-- ============================================

-- Add new structured fields
ALTER TABLE skills 
ADD COLUMN IF NOT EXISTS name TEXT,
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('language', 'framework', 'tool', 'soft_skill')),
ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('beginner', 'intermediate', 'advanced')),
ADD COLUMN IF NOT EXISTS years_experience NUMERIC(3, 1);

-- Migrate existing skill TEXT to name
-- Set default category and level for existing skills
UPDATE skills 
SET 
  name = skill,
  category = 'tool', -- Default category for migration
  level = 'intermediate' -- Default level for migration
WHERE name IS NULL AND skill IS NOT NULL;

-- Make name required going forward (after migration)
ALTER TABLE skills 
ALTER COLUMN name SET NOT NULL;

-- Update unique constraint to use name instead of skill
-- First, drop old constraint if it exists
ALTER TABLE skills 
DROP CONSTRAINT IF EXISTS skills_user_id_skill_key;

-- Add new unique constraint on user_id and name
ALTER TABLE skills 
ADD CONSTRAINT skills_user_id_name_unique UNIQUE(user_id, name);

-- Keep skill column for backward compatibility (will be deprecated)
-- Add index on category and level for filtering
CREATE INDEX IF NOT EXISTS idx_skills_category ON skills(category);
CREATE INDEX IF NOT EXISTS idx_skills_level ON skills(level);
CREATE INDEX IF NOT EXISTS idx_skills_user_category ON skills(user_id, category);

-- ============================================
-- 3. PROJECTS TABLE - Add New Fields
-- ============================================

-- Add new project fields
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS role TEXT,
ADD COLUMN IF NOT EXISTS highlights JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS tags JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS "order" INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS media JSONB DEFAULT '[]'::jsonb;

-- Add indexes for featured and order
CREATE INDEX IF NOT EXISTS idx_projects_featured ON projects(user_id, featured);
CREATE INDEX IF NOT EXISTS idx_projects_order ON projects(user_id, "order");

-- ============================================
-- 4. EXPERIENCE TABLE - Add New Fields
-- ============================================

-- Add new experience fields
ALTER TABLE experience 
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS employment_type TEXT CHECK (employment_type IN ('full_time', 'contract', 'internship')),
ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb;

-- Make description optional (remove NOT NULL constraint)
-- First, set empty descriptions to NULL
UPDATE experience 
SET description = NULL 
WHERE description = '' OR char_length(description) < 10;

-- Drop the check constraint on description
ALTER TABLE experience 
DROP CONSTRAINT IF EXISTS experience_description_check;

-- Make description nullable
ALTER TABLE experience 
ALTER COLUMN description DROP NOT NULL;

-- Add index on employment type
CREATE INDEX IF NOT EXISTS idx_experience_employment_type ON experience(user_id, employment_type);

-- ============================================
-- 5. EDUCATION TABLE - Add New Fields
-- ============================================

-- Add new education fields
ALTER TABLE education 
ADD COLUMN IF NOT EXISTS gpa NUMERIC(3, 2) CHECK (gpa >= 0 AND gpa <= 4.0),
ADD COLUMN IF NOT EXISTS coursework JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS honors TEXT;

-- ============================================
-- 6. CERTIFICATIONS TABLE - New Table
-- ============================================

CREATE TABLE IF NOT EXISTS certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) >= 2),
  issuer TEXT NOT NULL CHECK (char_length(issuer) >= 2),
  issue_date TEXT NOT NULL,
  expiry_date TEXT,
  credential_id TEXT,
  credential_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for certifications
CREATE INDEX IF NOT EXISTS idx_certifications_user_id ON certifications(user_id);
CREATE INDEX IF NOT EXISTS idx_certifications_issue_date ON certifications(issue_date);

-- Trigger for updated_at
CREATE TRIGGER update_certifications_updated_at
  BEFORE UPDATE ON certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS for certifications
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;

-- Users can only access their own certifications
CREATE POLICY "Users can view their own certifications"
  ON certifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own certifications"
  ON certifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own certifications"
  ON certifications FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own certifications"
  ON certifications FOR DELETE
  USING (auth.uid() = user_id);

-- Public can view certifications for published portfolios
CREATE POLICY "Public can view certifications for published portfolios"
  ON certifications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.user_id = certifications.user_id
      AND (portfolios.published = true OR (portfolios.settings->>'isPublic')::boolean = true)
    )
  );

-- ============================================
-- 7. ANALYTICS TABLE - Enhanced Tracking
-- ============================================

-- Extend event_type to include more event types
ALTER TABLE portfolio_analytics 
DROP CONSTRAINT IF EXISTS portfolio_analytics_event_type_check;

ALTER TABLE portfolio_analytics 
ADD CONSTRAINT portfolio_analytics_event_type_check 
CHECK (event_type IN ('view', 'download', 'contact_click', 'social_click', 'project_view'));

-- Add slug column for tracking which portfolio was viewed
ALTER TABLE portfolio_analytics 
ADD COLUMN IF NOT EXISTS slug TEXT,
ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS event_data JSONB;

-- Add indexes for enhanced analytics
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_slug ON portfolio_analytics(slug);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_project_id ON portfolio_analytics(project_id);

-- Update tracking functions to support slug
CREATE OR REPLACE FUNCTION track_portfolio_view(target_user_id UUID, portfolio_slug TEXT DEFAULT NULL)
RETURNS void AS $$
BEGIN
  INSERT INTO portfolio_analytics (user_id, event_type, slug)
  VALUES (target_user_id, 'view', portfolio_slug);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION track_portfolio_event(
  target_user_id UUID,
  event_type_param TEXT,
  portfolio_slug TEXT DEFAULT NULL,
  project_id_param UUID DEFAULT NULL,
  event_data_param JSONB DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO portfolio_analytics (user_id, event_type, slug, project_id, event_data)
  VALUES (target_user_id, event_type_param, portfolio_slug, project_id_param, event_data_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. UPDATE RLS POLICIES FOR NEW FIELDS
-- ============================================

-- Update public portfolio view policy to check settings.isPublic
-- Drop old policy
DROP POLICY IF EXISTS "Public can view published portfolios" ON portfolios;

-- Create new policy that checks both published and settings.isPublic
CREATE POLICY "Public can view published portfolios"
  ON portfolios FOR SELECT
  USING (
    published = true 
    OR (settings->>'isPublic')::boolean = true
  );

-- Update public policies to check settings.isPublic
-- Skills
DROP POLICY IF EXISTS "Public can view skills for published portfolios" ON skills;
CREATE POLICY "Public can view skills for published portfolios"
  ON skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.user_id = skills.user_id
      AND (
        portfolios.published = true 
        OR (portfolios.settings->>'isPublic')::boolean = true
      )
    )
  );

-- Projects
DROP POLICY IF EXISTS "Public can view projects for published portfolios" ON projects;
CREATE POLICY "Public can view projects for published portfolios"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.user_id = projects.user_id
      AND (
        portfolios.published = true 
        OR (portfolios.settings->>'isPublic')::boolean = true
      )
    )
  );

-- Project Tech Stack
DROP POLICY IF EXISTS "Public can view tech stack for published projects" ON project_tech_stack;
CREATE POLICY "Public can view tech stack for published projects"
  ON project_tech_stack FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN portfolios ON portfolios.user_id = projects.user_id
      WHERE projects.id = project_tech_stack.project_id
      AND (
        portfolios.published = true 
        OR (portfolios.settings->>'isPublic')::boolean = true
      )
    )
  );

-- Experience
DROP POLICY IF EXISTS "Public can view experience for published portfolios" ON experience;
CREATE POLICY "Public can view experience for published portfolios"
  ON experience FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.user_id = experience.user_id
      AND (
        portfolios.published = true 
        OR (portfolios.settings->>'isPublic')::boolean = true
      )
    )
  );

-- Education
DROP POLICY IF EXISTS "Public can view education for published portfolios" ON education;
CREATE POLICY "Public can view education for published portfolios"
  ON education FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.user_id = education.user_id
      AND (
        portfolios.published = true 
        OR (portfolios.settings->>'isPublic')::boolean = true
      )
    )
  );

-- ============================================
-- 9. COMMENTS FOR DOCUMENTATION
-- ============================================

COMMENT ON COLUMN portfolios.location IS 'User location (city, country)';
COMMENT ON COLUMN portfolios.role_level IS 'Role level: junior, mid, senior, lead';
COMMENT ON COLUMN portfolios.availability IS 'Availability status: open_to_work, freelance, not_open';
COMMENT ON COLUMN portfolios.social_links IS 'Array of social links: [{"type": "github", "url": "..."}]';
COMMENT ON COLUMN portfolios.settings IS 'Portfolio settings: slug, seoTitle, seoDescription, showContactForm, contactEmail';
COMMENT ON COLUMN portfolios.theme IS 'Theme configuration: id, primaryColor, accentStyle, radius, layout, showProfilePhoto';
COMMENT ON COLUMN portfolios.primary_stack IS 'Array of primary skill names for highlighting';
COMMENT ON COLUMN portfolios.slug IS 'Custom URL slug for public portfolio access';
COMMENT ON COLUMN skills.name IS 'Skill name (replaces skill column)';
COMMENT ON COLUMN skills.category IS 'Skill category: language, framework, tool, soft_skill';
COMMENT ON COLUMN skills.level IS 'Skill level: beginner, intermediate, advanced';
COMMENT ON COLUMN projects.highlights IS 'Array of project highlights/achievements';
COMMENT ON COLUMN projects.tags IS 'Array of project tags';
COMMENT ON COLUMN projects.media IS 'Array of media items: [{"type": "image", "url": "..."}]';
COMMENT ON COLUMN experience.achievements IS 'Array of achievement bullet points';
COMMENT ON COLUMN education.coursework IS 'Array of coursework items';

-- ============================================
-- 10. MIGRATION COMPLETE
-- ============================================
-- All schema changes have been applied
-- Next steps:
-- 1. Update application code to use new schema
-- 2. Create migration helper functions in TypeScript
-- 3. Test data migration for existing portfolios
-- ============================================

