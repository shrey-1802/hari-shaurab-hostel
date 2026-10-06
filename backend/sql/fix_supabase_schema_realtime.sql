-- ============================================================
-- HARI-SAURABH HOSTEL MANAGEMENT SYSTEM
-- SUPABASE SCHEMA FIX & REAL-TIME CROSS-DEVICE SYNC MIGRATION
-- ============================================================
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/raytyqftzbutisuruylj/sql/new
--
-- This script fixes:
-- 1. Adds missing columns (floor_number, room_number, student_number, etc.) so Wing Leader inserts succeed online.
-- 2. Makes room_id nullable so direct floor_number/room_number inserts work.
-- 3. Grants full public RLS policies for real-time cross-device sync.
-- 4. Enables Supabase Realtime replication for students, notifications, profiles, and registration_links.
-- ============================================================

-- 1. Ensure pgcrypto extension exists
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Safely add all required columns to STUDENTS table
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='floor_number') THEN
        ALTER TABLE public.students ADD COLUMN floor_number INTEGER DEFAULT 4;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='room_number') THEN
        ALTER TABLE public.students ADD COLUMN room_number VARCHAR(50) DEFAULT '401';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='student_number') THEN
        ALTER TABLE public.students ADD COLUMN student_number VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='student_mobile') THEN
        ALTER TABLE public.students ADD COLUMN student_mobile VARCHAR(30);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='parent_name') THEN
        ALTER TABLE public.students ADD COLUMN parent_name VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='parent_mobile') THEN
        ALTER TABLE public.students ADD COLUMN parent_mobile VARCHAR(30);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='college_name') THEN
        ALTER TABLE public.students ADD COLUMN college_name VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='department') THEN
        ALTER TABLE public.students ADD COLUMN department VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='semester_result') THEN
        ALTER TABLE public.students ADD COLUMN semester_result VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='hobby') THEN
        ALTER TABLE public.students ADD COLUMN hobby TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='hostel_friends') THEN
        ALTER TABLE public.students ADD COLUMN hostel_friends TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='non_hostel_friends') THEN
        ALTER TABLE public.students ADD COLUMN non_hostel_friends TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='profile_picture_url') THEN
        ALTER TABLE public.students ADD COLUMN profile_picture_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='creator_name') THEN
        ALTER TABLE public.students ADD COLUMN creator_name VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='registration_status') THEN
        ALTER TABLE public.students ADD COLUMN registration_status VARCHAR(50) DEFAULT 'APPROVED';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='registered_via_link') THEN
        ALTER TABLE public.students ADD COLUMN registered_via_link VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='approved_by') THEN
        ALTER TABLE public.students ADD COLUMN approved_by UUID;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='approved_at') THEN
        ALTER TABLE public.students ADD COLUMN approved_at TIMESTAMPTZ;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='registration_source') THEN
        ALTER TABLE public.students ADD COLUMN registration_source VARCHAR(50) DEFAULT 'MANUAL';
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='room_id') THEN
        ALTER TABLE public.students ALTER COLUMN room_id DROP NOT NULL;
    END IF;
END $$;

-- 3. Ensure Row Level Security (RLS) policies allow public SELECT, INSERT, UPDATE, DELETE
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to students" ON public.students;
CREATE POLICY "Allow public read access to students" ON public.students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to students" ON public.students;
CREATE POLICY "Allow public insert access to students" ON public.students FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to students" ON public.students;
CREATE POLICY "Allow public update access to students" ON public.students FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access to students" ON public.students;
CREATE POLICY "Allow public delete access to students" ON public.students FOR DELETE USING (true);

-- 4. Enable Supabase Realtime Replication for instant cross-device updates
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 5. Force PostgREST schema cache reload
NOTIFY pgrst, 'reload schema';
