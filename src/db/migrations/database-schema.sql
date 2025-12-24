-- Portfolio Database Schema
-- This file contains SQL migrations for Supabase
-- Run these migrations in your Supabase SQL editor

-- ============================================
-- 1. PORTFOLIOS TABLE
-- ============================================
-- Stores personal information (one record per user)
CREATE TABLE IF NOT EXISTS portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  headline TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  bio TEXT,
  website TEXT,
  github TEXT,
  linkedin TEXT,
  published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- 2. SKILLS TABLE
-- ============================================
-- Stores individual skills (many per user)
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  skill TEXT NOT NULL CHECK (char_length(skill) >= 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill)
);

-- ============================================
-- 3. PROJECTS TABLE
-- ============================================
-- Stores project entries (many per user)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(name) >= 2),
  description TEXT NOT NULL CHECK (char_length(description) >= 10),
  repo_url TEXT,
  live_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. PROJECT_TECH_STACK TABLE
-- ============================================
-- Junction table for project technologies (many-to-many)
CREATE TABLE IF NOT EXISTS project_tech_stack (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tech TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, tech)
);

-- ============================================
-- 5. EXPERIENCE TABLE
-- ============================================
-- Stores work experience entries (many per user)
CREATE TABLE IF NOT EXISTS experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL CHECK (char_length(company) >= 2),
  role TEXT NOT NULL CHECK (char_length(role) >= 2),
  start_date TEXT NOT NULL,
  end_date TEXT,
  current BOOLEAN DEFAULT FALSE,
  description TEXT NOT NULL CHECK (char_length(description) >= 10),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 6. EDUCATION TABLE
-- ============================================
-- Stores education entries (many per user)
CREATE TABLE IF NOT EXISTS education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  school TEXT NOT NULL CHECK (char_length(school) >= 2),
  degree TEXT NOT NULL CHECK (char_length(degree) >= 2),
  field TEXT NOT NULL CHECK (char_length(field) >= 2),
  start_date TEXT NOT NULL,
  end_date TEXT,
  current BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_project_tech_stack_project_id ON project_tech_stack(project_id);
CREATE INDEX IF NOT EXISTS idx_experience_user_id ON experience(user_id);
CREATE INDEX IF NOT EXISTS idx_education_user_id ON education(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on all tables
ALTER TABLE portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tech_stack ENABLE ROW LEVEL SECURITY;
ALTER TABLE experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE education ENABLE ROW LEVEL SECURITY;

-- Portfolios: Users can only access their own portfolio
CREATE POLICY "Users can view their own portfolio"
  ON portfolios FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own portfolio"
  ON portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolio"
  ON portfolios FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolio"
  ON portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- Skills: Users can only access their own skills
CREATE POLICY "Users can view their own skills"
  ON skills FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own skills"
  ON skills FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own skills"
  ON skills FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own skills"
  ON skills FOR DELETE
  USING (auth.uid() = user_id);

-- Projects: Users can only access their own projects
CREATE POLICY "Users can view their own projects"
  ON projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON projects FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON projects FOR DELETE
  USING (auth.uid() = user_id);

-- Project Tech Stack: Users can only access tech stack for their own projects
CREATE POLICY "Users can view tech stack for their own projects"
  ON project_tech_stack FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tech_stack.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert tech stack for their own projects"
  ON project_tech_stack FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tech_stack.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update tech stack for their own projects"
  ON project_tech_stack FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tech_stack.project_id
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tech_stack.project_id
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete tech stack for their own projects"
  ON project_tech_stack FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_tech_stack.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Experience: Users can only access their own experience
CREATE POLICY "Users can view their own experience"
  ON experience FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own experience"
  ON experience FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own experience"
  ON experience FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own experience"
  ON experience FOR DELETE
  USING (auth.uid() = user_id);

-- Education: Users can only access their own education
CREATE POLICY "Users can view their own education"
  ON education FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own education"
  ON education FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own education"
  ON education FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own education"
  ON education FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- PUBLIC READ POLICIES FOR PUBLISHED PORTFOLIOS
-- ============================================
-- These policies allow anonymous users to read published portfolios

-- Allow public to view published portfolios
CREATE POLICY "Public can view published portfolios"
  ON portfolios FOR SELECT
  USING (published = true);

-- Allow public to view skills for published portfolios
CREATE POLICY "Public can view skills for published portfolios"
  ON skills FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.user_id = skills.user_id
      AND portfolios.published = true
    )
  );

-- Allow public to view projects for published portfolios
CREATE POLICY "Public can view projects for published portfolios"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.user_id = projects.user_id
      AND portfolios.published = true
    )
  );

-- Allow public to view tech stack for published projects
CREATE POLICY "Public can view tech stack for published projects"
  ON project_tech_stack FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      JOIN portfolios ON portfolios.user_id = projects.user_id
      WHERE projects.id = project_tech_stack.project_id
      AND portfolios.published = true
    )
  );

-- Allow public to view experience for published portfolios
CREATE POLICY "Public can view experience for published portfolios"
  ON experience FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.user_id = experience.user_id
      AND portfolios.published = true
    )
  );

-- Allow public to view education for published portfolios
CREATE POLICY "Public can view education for published portfolios"
  ON education FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM portfolios
      WHERE portfolios.user_id = education.user_id
      AND portfolios.published = true
    )
  );

-- Enable RLS on profiles table (if not already enabled)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Allow public to view profiles by username (for portfolio lookup)
-- This is needed for getPublicPortfolioByUsername to work
CREATE POLICY "Public can view profiles by username"
  ON profiles FOR SELECT
  USING (true); -- Username is public information

-- Users can still view and update their own profile
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON portfolios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_experience_updated_at
  BEFORE UPDATE ON experience
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_education_updated_at
  BEFORE UPDATE ON education
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. PORTFOLIO_ANALYTICS TABLE
-- ============================================
-- Stores analytics events (views, downloads, etc.)
CREATE TABLE IF NOT EXISTS portfolio_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('view', 'download')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES FOR ANALYTICS
-- ============================================
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_user_id ON portfolio_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_event_type ON portfolio_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_created_at ON portfolio_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_portfolio_analytics_user_event ON portfolio_analytics(user_id, event_type);

-- ============================================
-- RLS POLICIES FOR ANALYTICS
-- ============================================
ALTER TABLE portfolio_analytics ENABLE ROW LEVEL SECURITY;

-- Users can insert their own analytics events (for tracking)
CREATE POLICY "Users can insert their own analytics"
  ON portfolio_analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own analytics
CREATE POLICY "Users can view their own analytics"
  ON portfolio_analytics FOR SELECT
  USING (auth.uid() = user_id);

-- Allow anonymous inserts for public portfolio views
-- This requires a service role key or a function that bypasses RLS
-- For MVP, we'll use a function that allows inserts without auth
CREATE OR REPLACE FUNCTION track_portfolio_view(target_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO portfolio_analytics (user_id, event_type)
  VALUES (target_user_id, 'view');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION track_portfolio_download(target_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO portfolio_analytics (user_id, event_type)
  VALUES (target_user_id, 'download');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

