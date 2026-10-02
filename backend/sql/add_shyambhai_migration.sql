-- ============================================================
-- MIGRATION: Add ShyamBhai as Second Main Leader
-- Run this in Supabase SQL Editor
-- ============================================================
-- NOTE: This system uses a custom 'users' table managed by
-- the FastAPI backend (NOT Supabase auth.users + profiles).
-- The backend 'users' table is created by SQLAlchemy.
-- 
-- PREFERRED METHOD: Run the Python seed script from backend dir:
--   python -m app.scripts.seed_users
--
-- The seed_users.py script already includes ShyamBhai and
-- handles the password bcrypt hashing automatically.
-- ============================================================

-- Check if users table exists first
DO $$
BEGIN
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'users'
  ) THEN
    RAISE NOTICE 'public.users table found. See Python seed script for inserting users with proper password hashing.';
  ELSE
    RAISE NOTICE 'public.users table does not exist. Run: python -m app.scripts.seed_users';
  END IF;
END $$;
