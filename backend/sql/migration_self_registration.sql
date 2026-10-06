-- ============================================================
-- HARI-SAURABH HOSTEL MANAGEMENT SYSTEM
-- MIGRATION: STUDENT SELF-REGISTRATION SYSTEM
-- ============================================================

-- 1. Create REGISTRATION_LINKS table
CREATE TABLE IF NOT EXISTS public.registration_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wing_leader_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    wing_leader_name VARCHAR(255) NOT NULL,
    registration_token VARCHAR(100) UNIQUE NOT NULL,
    assigned_floor INTEGER NOT NULL,
    room_start VARCHAR(30) NOT NULL,
    room_end VARCHAR(30) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index on registration token for fast lookup
CREATE INDEX IF NOT EXISTS idx_reg_links_token ON public.registration_links(registration_token);

-- 2. Update STUDENTS table with self-registration & approval status fields
DO $$ 
BEGIN 
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
END $$;

-- 3. Seed Registration Links for all 4 Wing Leaders
-- Wing Leader A (Floor 4: Rooms 401-409)
-- Wing Leader B (Floor 4: Rooms 410-418)
-- Wing Leader C (Floor 6: Rooms 601-609)
-- Wing Leader D (Floor 6: Rooms 610-618)

INSERT INTO public.registration_links (id, wing_leader_name, registration_token, assigned_floor, room_start, room_end, is_active)
VALUES
    (gen_random_uuid(), 'Wing Leader A (AryanBhai)', 'wl-a', 4, '401', '409', true),
    (gen_random_uuid(), 'Wing Leader B (ShreemadBhai)', 'wl-b', 4, '410', '418', true),
    (gen_random_uuid(), 'Wing Leader C (JeetBhai)', 'wl-c', 6, '601', '609', true),
    (gen_random_uuid(), 'Wing Leader D (ParamBhai)', 'wl-d', 6, '610', '618', true)
ON CONFLICT (registration_token) DO UPDATE SET
    assigned_floor = EXCLUDED.assigned_floor,
    room_start = EXCLUDED.room_start,
    room_end = EXCLUDED.room_end,
    is_active = true;

-- Map profile IDs to seeded links if profiles exist
UPDATE public.registration_links rl
SET wing_leader_id = p.id
FROM public.profiles p
WHERE (rl.registration_token = 'wl-a' AND p.email = 'aryansinhc673@gmail.com')
   OR (rl.registration_token = 'wl-b' AND p.email = 'shreemadgandhi369@gmail.com')
   OR (rl.registration_token = 'wl-c' AND p.email = 'jeetsinhsolanki749@gmail.com')
   OR (rl.registration_token = 'wl-d' AND p.email = 'patelparam2111@gmail.com');

-- 4. Supabase Row Level Security (RLS) & Policies
ALTER TABLE public.registration_links ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to active registration links" ON public.registration_links;
CREATE POLICY "Allow public read access to active registration links" 
ON public.registration_links FOR SELECT 
USING (is_active = true);

DROP POLICY IF EXISTS "Allow leaders full access to registration links" ON public.registration_links;
CREATE POLICY "Allow leaders full access to registration links" 
ON public.registration_links FOR ALL 
USING (true);

-- Ensure public can submit pending registrations via link
DROP POLICY IF EXISTS "Allow public student self-registration" ON public.students;
CREATE POLICY "Allow public student self-registration" 
ON public.students FOR INSERT 
WITH CHECK (true);

-- Realtime sync publication
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.registration_links;
    END IF;
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
