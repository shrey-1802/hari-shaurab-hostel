-- ============================================================
-- HARI-SAURABH HOSTEL MANAGEMENT SYSTEM
-- MASTER SUPABASE SQL FIX (FAIL-SAFE MIGRATION)
-- ============================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/raytyqftzbutisuruylj/sql/new
-- ============================================================

-- 0. Enable pgcrypto extension for UUID generation
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. STUDENTS TABLE (FAIL-SAFE WITH NATIVE IF NOT EXISTS)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE NOT NULL DEFAULT '2000-01-01',
    student_number VARCHAR(100),
    student_mobile VARCHAR(50),
    mobile VARCHAR(50),
    parent_name VARCHAR(255),
    parent_mobile VARCHAR(50),
    college_name VARCHAR(255) DEFAULT 'Hari-Saurabh Institute of Technology',
    department VARCHAR(255) DEFAULT 'General',
    semester_result VARCHAR(100),
    hobby TEXT,
    hostel_friends TEXT,
    non_hostel_friends TEXT,
    floor_number INTEGER DEFAULT 4,
    room_number VARCHAR(50) DEFAULT '401',
    room_id UUID,
    profile_picture_url TEXT,
    profile_photo_url TEXT,
    creator_name VARCHAR(255) DEFAULT 'Wing Leader',
    created_by UUID,
    address TEXT,
    registration_status VARCHAR(50) DEFAULT 'APPROVED',
    registered_via_link VARCHAR(100),
    registration_source VARCHAR(50) DEFAULT 'MANUAL',
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Using PostgreSQL native "ADD COLUMN IF NOT EXISTS" (prevents ERROR 42701)
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS floor_number INTEGER DEFAULT 4;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS room_number VARCHAR(50) DEFAULT '401';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS room_id UUID;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS student_number VARCHAR(100);
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS student_mobile VARCHAR(50);
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS mobile VARCHAR(50);
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_name VARCHAR(255);
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS parent_mobile VARCHAR(50);
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS college_name VARCHAR(255) DEFAULT 'Hari-Saurabh Institute of Technology';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS department VARCHAR(255) DEFAULT 'General';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS semester_result VARCHAR(100);
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS hobby TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS hostel_friends TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS non_hostel_friends TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS profile_picture_url TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS profile_photo_url TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS creator_name VARCHAR(255) DEFAULT 'Wing Leader';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS created_by UUID;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS registration_status VARCHAR(50) DEFAULT 'APPROVED';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS registered_via_link VARCHAR(100);
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS registration_source VARCHAR(50) DEFAULT 'MANUAL';
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE public.students ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Drop NOT NULL constraints that would block direct Wing Leader inserts
DO $$
BEGIN
    BEGIN
        ALTER TABLE public.students ALTER COLUMN room_id DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER TABLE public.students ALTER COLUMN created_by DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER TABLE public.students ALTER COLUMN floor_number DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
    BEGIN
        ALTER TABLE public.students ALTER COLUMN room_number DROP NOT NULL;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
END $$;

-- Drop foreign key constraints on students that would require existing room/user rows
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
          AND table_name = 'students' 
          AND constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE 'ALTER TABLE public.students DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_rec.constraint_name);
    END LOOP;
END $$;


-- ============================================================
-- 2. PROFILES TABLE & SEED ALL 6 LEADER ACCOUNTS
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

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS assigned_floor INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS room_start VARCHAR(30);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS room_end VARCHAR(30);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'WING_LEADER';

-- Drop foreign key on profiles.id if it referenced auth.users(id)
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
          AND table_name = 'profiles' 
          AND constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE 'ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_rec.constraint_name);
    END LOOP;
END $$;

-- Ensure unique constraint on email
CREATE UNIQUE INDEX IF NOT EXISTS profiles_email_unique_idx ON public.profiles (email);

-- Seed / Update Leaders
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
-- 3. REGISTRATION LINKS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS public.registration_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wing_leader_id UUID,
    wing_leader_name VARCHAR(255) NOT NULL,
    registration_token VARCHAR(100) UNIQUE NOT NULL,
    assigned_floor INTEGER NOT NULL,
    room_start VARCHAR(30) NOT NULL,
    room_end VARCHAR(30) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Drop foreign keys on registration_links
DO $$
DECLARE
    constraint_rec RECORD;
BEGIN
    FOR constraint_rec IN 
        SELECT constraint_name 
        FROM information_schema.table_constraints 
        WHERE table_schema = 'public' 
          AND table_name = 'registration_links' 
          AND constraint_type = 'FOREIGN KEY'
    LOOP
        EXECUTE 'ALTER TABLE public.registration_links DROP CONSTRAINT IF EXISTS ' || quote_ident(constraint_rec.constraint_name);
    END LOOP;
END $$;

INSERT INTO public.registration_links (id, wing_leader_name, registration_token, assigned_floor, room_start, room_end, is_active)
VALUES
    (gen_random_uuid(), 'Wing Leader A (AryanBhai)', 'wl-a', 4, '401', '409', true),
    (gen_random_uuid(), 'Wing Leader B (ShreemadBhai)', 'wl-b', 4, '410', '418', true),
    (gen_random_uuid(), 'Wing Leader C (JeetBhai)', 'wl-c', 6, '601', '609', true),
    (gen_random_uuid(), 'Wing Leader D (ParamBhai)', 'wl-d', 6, '610', '618', true)
ON CONFLICT (registration_token) DO UPDATE SET
    wing_leader_name = EXCLUDED.wing_leader_name,
    assigned_floor = EXCLUDED.assigned_floor,
    room_start = EXCLUDED.room_start,
    room_end = EXCLUDED.room_end,
    is_active = true;


-- ============================================================
-- 4. NOTIFICATIONS TABLE
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


-- ============================================================
-- 5. PUSH SUBSCRIPTIONS TABLE
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


-- ============================================================
-- 6. GRANT ALL SQL PRIVILEGES (anon, authenticated, service_role)
-- ============================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;


-- ============================================================
-- 7. SET UP PERMISSIVE RLS POLICIES FOR REST API
-- ============================================================

-- STUDENTS
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to students" ON public.students;
DROP POLICY IF EXISTS "Allow public insert access to students" ON public.students;
DROP POLICY IF EXISTS "Allow public update access to students" ON public.students;
DROP POLICY IF EXISTS "Allow public delete access to students" ON public.students;
DROP POLICY IF EXISTS "Allow all access to students" ON public.students;
DROP POLICY IF EXISTS "students_select_accessible" ON public.students;
DROP POLICY IF EXISTS "students_insert_accessible" ON public.students;
DROP POLICY IF EXISTS "students_update_accessible" ON public.students;
DROP POLICY IF EXISTS "students_delete_main" ON public.students;

CREATE POLICY "Allow public read access to students" ON public.students FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access to students" ON public.students FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update access to students" ON public.students FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete access to students" ON public.students FOR DELETE TO public USING (true);

-- PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public insert access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public update access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow public delete access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "Allow all access to profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

CREATE POLICY "Allow public read access to profiles" ON public.profiles FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access to profiles" ON public.profiles FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update access to profiles" ON public.profiles FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete access to profiles" ON public.profiles FOR DELETE TO public USING (true);

-- NOTIFICATIONS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow public insert access to notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow public update access to notifications" ON public.notifications;
DROP POLICY IF EXISTS "Allow public delete access to notifications" ON public.notifications;

CREATE POLICY "Allow public read access to notifications" ON public.notifications FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access to notifications" ON public.notifications FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update access to notifications" ON public.notifications FOR UPDATE TO public USING (true);
CREATE POLICY "Allow public delete access to notifications" ON public.notifications FOR DELETE TO public USING (true);

-- REGISTRATION LINKS
ALTER TABLE public.registration_links ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to registration_links" ON public.registration_links;
DROP POLICY IF EXISTS "Allow public insert access to registration_links" ON public.registration_links;
DROP POLICY IF EXISTS "Allow public update access to registration_links" ON public.registration_links;

CREATE POLICY "Allow public read access to registration_links" ON public.registration_links FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access to registration_links" ON public.registration_links FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update access to registration_links" ON public.registration_links FOR UPDATE TO public USING (true);

-- PUSH SUBSCRIPTIONS
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to push_subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow public insert access to push_subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow public update access to push_subscriptions" ON public.push_subscriptions;

CREATE POLICY "Allow public read access to push_subscriptions" ON public.push_subscriptions FOR SELECT TO public USING (true);
CREATE POLICY "Allow public insert access to push_subscriptions" ON public.push_subscriptions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Allow public update access to push_subscriptions" ON public.push_subscriptions FOR UPDATE TO public USING (true);


-- ============================================================
-- 8. ENABLE REALTIME REPLICATION SAFELY
-- ============================================================

DO $$
BEGIN
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.students;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.registration_links;
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
END $$;


-- ============================================================
-- 9. RELOAD SCHEMA CACHE
-- ============================================================
NOTIFY pgrst, 'reload schema';

-- Verification output
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'students'
ORDER BY ordinal_position;
