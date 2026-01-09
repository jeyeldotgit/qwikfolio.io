-- Fix skills table constraints
-- The skill column is deprecated but still has NOT NULL and CHECK constraints
-- This script makes skill nullable and removes the constraint

-- First, check current constraints on the skills table
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'skills'::regclass
  AND (conname LIKE '%skill%' OR contype = 'c');

-- Make skill column nullable (it's deprecated, name is the new field)
ALTER TABLE skills 
ALTER COLUMN skill DROP NOT NULL;

-- Drop the check constraint on skill column
ALTER TABLE skills 
DROP CONSTRAINT IF EXISTS skills_skill_check;

-- Verify the changes
SELECT 
  column_name,
  is_nullable,
  data_type
FROM information_schema.columns
WHERE table_name = 'skills'
  AND column_name = 'skill';

-- Verify constraints are gone
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'skills'::regclass
  AND conname LIKE '%skill%';

