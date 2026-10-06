-- ============================================================
-- HARI-SAURABH HOSTEL MANAGEMENT SYSTEM
-- COMPLETE SUPABASE ONLINE DATABASE SETUP & REALTIME SYNC MIGRATION
-- ============================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/raytyqftzbutisuruylj/sql/new
--
-- This script ensures:
-- 1. All student records inserted/edited by Wing Leaders reflect to Main Leaders and vice-versa.
-- 2. All notifications and alerts sync across online accounts in real-time.
-- 3. All leader profiles & access permissions are configured.
-- ============================================================

-- Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. STUDENTS TABLE
-- ============================================================
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
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely ensure all columns exist
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

-- Enable Row Level Security (RLS) & Grant Public / Anon Access for students
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to students" ON public.students;
CREATE POLICY "Allow public read access to students" ON public.students FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to students" ON public.students;
CREATE POLICY "Allow public insert access to students" ON public.students FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to students" ON public.students;
CREATE POLICY "Allow public update access to students" ON public.students FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access to students" ON public.students;
CREATE POLICY "Allow public delete access to students" ON public.students FOR DELETE USING (true);


-- ============================================================
-- 2. NOTIFICATIONS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    notification_type VARCHAR(100) DEFAULT 'SYSTEM_ALERT',
    timing_type VARCHAR(50),
    dedupe_key VARCHAR(255),
    student_id VARCHAR(255),
    student_name VARCHAR(255),
    student_avatar TEXT,
    student_phone VARCHAR(50),
    room_number VARCHAR(50),
    floor_number INTEGER,
    dob VARCHAR(50),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS & Grant Public / Anon Access for notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to notifications" ON public.notifications;
CREATE POLICY "Allow public read access to notifications" ON public.notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to notifications" ON public.notifications;
CREATE POLICY "Allow public insert access to notifications" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to notifications" ON public.notifications;
CREATE POLICY "Allow public update access to notifications" ON public.notifications FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access to notifications" ON public.notifications;
CREATE POLICY "Allow public delete access to notifications" ON public.notifications FOR DELETE USING (true);


-- ============================================================
-- 2.5. PUSH SUBSCRIPTIONS TABLE (FOR CHROME / BROWSER PUSH)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh_key TEXT,
    auth_key TEXT,
    user_agent TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Allow public read access to push_subscriptions" ON public.push_subscriptions FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Allow public insert access to push_subscriptions" ON public.push_subscriptions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Allow public update access to push_subscriptions" ON public.push_subscriptions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete access to push_subscriptions" ON public.push_subscriptions;
CREATE POLICY "Allow public delete access to push_subscriptions" ON public.push_subscriptions FOR DELETE USING (true);


-- Ensure app_role enum type (if present) accepts both uppercase and lowercase values
DO $$ 
BEGIN
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'MAIN_LEADER';
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'WING_LEADER';
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'main_leader';
    ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'wing_leader';
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- ============================================================
-- 3. PROFILES / LEADER ACCOUNTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'WING_LEADER',
    assigned_floor INTEGER,
    room_start VARCHAR(30),
    room_end VARCHAR(30),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safely add missing columns to profiles table if it already existed
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='assigned_floor') THEN
        ALTER TABLE public.profiles ADD COLUMN assigned_floor INTEGER;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='room_start') THEN
        ALTER TABLE public.profiles ADD COLUMN room_start VARCHAR(30);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='room_end') THEN
        ALTER TABLE public.profiles ADD COLUMN room_end VARCHAR(30);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role VARCHAR(50) DEFAULT 'WING_LEADER';
    ELSE
        -- If role exists as strict enum app_role, convert column to VARCHAR(50) to accept all role representations
        BEGIN
            ALTER TABLE public.profiles ALTER COLUMN role TYPE VARCHAR(50) USING role::text;
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='full_name') THEN
        ALTER TABLE public.profiles ADD COLUMN full_name VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='email') THEN
        ALTER TABLE public.profiles ADD COLUMN email VARCHAR(255);
    END IF;
END $$;

-- Enable RLS & Grant Public / Anon Access for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert access to profiles" ON public.profiles;
CREATE POLICY "Allow public insert access to profiles" ON public.profiles FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update access to profiles" ON public.profiles;
CREATE POLICY "Allow public update access to profiles" ON public.profiles FOR UPDATE USING (true);


-- ============================================================
-- 4. SEED LEADER ACCOUNTS IN PROFILES TABLE
-- ============================================================
-- Ensure unique index exists on email for ON CONFLICT resolution
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx ON public.profiles (email);

INSERT INTO public.profiles (id, email, full_name, role, assigned_floor, room_start, room_end)
VALUES
    (gen_random_uuid(), 'priyankshah3690@gmail.com', 'PriyankBhai', 'MAIN_LEADER', NULL, NULL, NULL),
    (gen_random_uuid(), 'shyamviththalani@gmail.com', 'ShyamBhai', 'MAIN_LEADER', NULL, NULL, NULL),
    (gen_random_uuid(), 'aryansinhc673@gmail.com', 'AryanBhai (Floor 4: 401-409)', 'WING_LEADER', 4, '401', '409'),
    (gen_random_uuid(), 'shreemadgandhi369@gmail.com', 'ShreemadBhai (Floor 4: 410-418)', 'WING_LEADER', 4, '410', '418'),
    (gen_random_uuid(), 'jeetsinhsolanki749@gmail.com', 'JeetBhai (Floor 6: 601-609)', 'WING_LEADER', 6, '601', '609'),
    (gen_random_uuid(), 'patelparam2111@gmail.com', 'ParamBhai (Floor 6: 610-618)', 'WING_LEADER', 6, '610', '618')
ON CONFLICT (email) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    assigned_floor = EXCLUDED.assigned_floor,
    room_start = EXCLUDED.room_start,
    room_end = EXCLUDED.room_end;



-- ============================================================
-- 5. ENABLE SUPABASE REALTIME REPLICATION
-- ============================================================
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
