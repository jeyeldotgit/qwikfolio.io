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

-- Drop the problematic trigger
DROP TRIGGER IF EXISTS tr_log_experience_added ON experience;

-- Drop the function (we'll recreate it if needed, or just remove it)
DROP FUNCTION IF EXISTS log_new_experience();

-- If you want to keep the logging functionality, recreate it with a valid event_type
-- or remove the analytics insert entirely. For now, we'll just remove it.
-- If you need logging, you can create a separate log table or use a valid event_type.

-- Verify the trigger is gone
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'experience'
  AND trigger_name = 'tr_log_experience_added';

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
CHECK (event_type IN ('view', 'download', 'contact_click', 'social_click', 'project_view'));

-- Verify the constraint was created correctly
SELECT 
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'portfolio_analytics'::regclass
  AND conname LIKE '%event_type%';

