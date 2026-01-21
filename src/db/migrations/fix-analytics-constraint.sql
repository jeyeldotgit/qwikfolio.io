-- Fix portfolio_analytics event_type constraint and log_new_experience trigger
-- This script fixes the trigger function that's causing constraint violations
-- Run this in your Supabase SQL Editor

-- First, check the current function definition
SELECT 
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'log_new_experience';

-- NOTE:
-- Your trigger function inserts event_type = 'added_experience'.
-- If you want to KEEP that behavior, the analytics constraint must allow it.
-- This script updates the constraint accordingly (no need to drop the trigger/function).

-- Also ensure the constraint is correct (in case it wasn't updated)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT conname 
    FROM pg_constraint 
    WHERE conrelid = 'portfolio_analytics'::regclass 
      AND conname LIKE '%event_type%'
  LOOP
    EXECUTE 'ALTER TABLE portfolio_analytics DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
  END LOOP;
END $$;

-- Recreate the constraint with all allowed event types
ALTER TABLE portfolio_analytics 
ADD CONSTRAINT portfolio_analytics_event_type_check 
CHECK (
  event_type IN (
    'view',
    'download',
    'contact_click',
    'social_click',
    'project_view',
    'added_experience'
  )
);

-- Verify the constraint was created correctly
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'portfolio_analytics'::regclass
  AND conname LIKE '%event_type%';

