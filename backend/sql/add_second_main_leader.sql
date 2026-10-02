-- ============================================================
-- SUPABASE SQL: ADD SECOND MAIN LEADER (ShyamBhai)
-- ============================================================
-- Creates the user in Supabase auth.users & public.profiles
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
    new_user_id uuid := gen_random_uuid();
BEGIN
    -- 1. Insert into auth.users with encrypted password 'Shyam@0369'
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        role,
        aud,
        is_super_admin
    )
    VALUES (
        new_user_id,
        '00000000-0000-0000-0000-000000000000'::uuid,
        'shyamviththalani@gmail.com',
        crypt('Shyam@0369', gen_salt('bf')),
        now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        '{"full_name":"ShyamBhai"}'::jsonb,
        now(),
        now(),
        'authenticated',
        'authenticated',
        false
    )
    ON CONFLICT (email) DO UPDATE SET
        encrypted_password = crypt('Shyam@0369', gen_salt('bf')),
        updated_at = now();

    -- Retrieve the exact user ID (in case user already existed)
    SELECT id INTO new_user_id 
    FROM auth.users 
    WHERE email = 'shyamviththalani@gmail.com';

    -- 2. Insert or update into public.profiles with main_leader role
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        role,
        floor_number,
        room_start,
        room_end,
        is_active,
        created_at,
        updated_at
    )
    VALUES (
        new_user_id,
        'ShyamBhai',
        'shyamviththalani@gmail.com',
        'main_leader',
        NULL,
        NULL,
        NULL,
        true,
        now(),
        now()
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = 'ShyamBhai',
        email = 'shyamviththalani@gmail.com',
        role = 'main_leader',
        floor_number = NULL,
        room_start = NULL,
        room_end = NULL,
        is_active = true,
        updated_at = now();

END $$;
