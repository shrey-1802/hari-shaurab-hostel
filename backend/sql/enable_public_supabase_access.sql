-- ============================================================
-- SUPABASE SQL MIGRATION: ENABLE REAL-TIME STUDENT SYNC & RLS PERMISSIONS
-- ============================================================
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard)
-- to ensure student records inserted/updated by Wing Leaders or Main Leaders
-- are permanently stored in Supabase PostgreSQL & synced across all accounts.
-- ============================================================

-- 1. Ensure public.students table exists with all required columns
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL,
    student_number VARCHAR(100),
    student_mobile VARCHAR(30),
    parent_name VARCHAR(255),
    parent_mobile VARCHAR(30),
    college_name VARCHAR(255),
    department VARCHAR(255),
    semester_result VARCHAR(100),
    hobby TEXT,
    hostel_friends TEXT,
    non_hostel_friends TEXT,
    floor_number INTEGER NOT NULL,
    room_number VARCHAR(50) NOT NULL,
    profile_picture_url TEXT,
    creator_name VARCHAR(255),
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Add missing columns safely if table already existed
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='student_number') THEN
        ALTER TABLE public.students ADD COLUMN student_number VARCHAR(100);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='student_mobile') THEN
        ALTER TABLE public.students ADD COLUMN student_mobile VARCHAR(30);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='creator_name') THEN
        ALTER TABLE public.students ADD COLUMN creator_name VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='students' AND column_name='profile_picture_url') THEN
        ALTER TABLE public.students ADD COLUMN profile_picture_url TEXT;
    END IF;
END $$;

-- 3. Enable RLS (Row Level Security) and allow all authenticated & anon requests to sync student data
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to students" ON public.students;
CREATE POLICY "Allow public read access to students" 
ON public.students FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Allow public insert access to students" ON public.students;
CREATE POLICY "Allow public insert access to students" 
ON public.students FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to students" ON public.students;
CREATE POLICY "Allow public update access to students" 
ON public.students FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Allow public delete access to students" ON public.students;
CREATE POLICY "Allow public delete access to students" 
ON public.students FOR DELETE 
USING (true);

-- 4. Enable Realtime Replication on public.students
ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
