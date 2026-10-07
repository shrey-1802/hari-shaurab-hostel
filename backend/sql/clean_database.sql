-- ============================================================
-- HARI-SAURABH HOSTEL MANAGEMENT SYSTEM
-- CLEAN DATABASE SCRIPT: WIPE ALL TEST STUDENTS & NOTIFICATIONS
-- ============================================================
-- Run this in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/raytyqftzbutisuruylj/sql/new
--
-- What this does:
-- 1. Removes all test student records from 'public.students'.
-- 2. Removes all test alerts from 'public.notifications'.
-- 3. Preserves all 6 leader accounts (2 Main Leaders + 4 Wing Leaders) in 'public.profiles'.
-- 4. Preserves all 4 registration links in 'public.registration_links'.
-- ============================================================

-- Wipe all test students and notifications
TRUNCATE TABLE public.students CASCADE;
TRUNCATE TABLE public.notifications CASCADE;

-- Tell Supabase API to reload schema cache
NOTIFY pgrst, 'reload schema';

-- Confirmation query: should return 0 students and 6 leaders
SELECT 
    (SELECT count(*) FROM public.students) AS total_students_remaining,
    (SELECT count(*) FROM public.profiles) AS total_leaders_configured,
    (SELECT count(*) FROM public.registration_links) AS total_registration_links;
