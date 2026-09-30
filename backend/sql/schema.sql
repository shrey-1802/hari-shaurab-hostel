-- ============================================================
-- HARI-SAURABH HOSTEL MANAGEMENT SYSTEM
-- Supabase PostgreSQL Database Schema
-- ============================================================
-- Floors: 4th Floor & 6th Floor
-- Wing Leaders:
--   Floor 4: Leader A (401-409), Leader B (410-418)
--   Floor 6: Leader A (601-609), Leader B (610-618)
-- ============================================================

create extension if not exists pgcrypto;

-- ============================================================
-- 1. ENUMS
-- ============================================================

do $$ begin
    create type public.app_role as enum ('main_leader', 'wing_leader');
exception when duplicate_object then null;
end $$;

do $$ begin
    create type public.notification_type as enum (
        'birthday_reminder',
        'student_update',
        'system_alert'
    );
exception when duplicate_object then null;
end $$;

do $$ begin
    create type public.audit_action as enum (
        'create',
        'update',
        'delete',
        'login',
        'logout',
        'view'
    );
exception when duplicate_object then null;
end $$;

-- ============================================================
-- 2. HOSTEL STRUCTURE
-- ============================================================

create table if not exists public.hostel_wings (
    id uuid primary key default gen_random_uuid(),
    name varchar(100) not null unique,
    description text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.floors (
    id uuid primary key default gen_random_uuid(),
    wing_id uuid not null references public.hostel_wings(id) on delete restrict,
    floor_number integer not null,
    name varchar(100),
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint floors_floor_number_check check (floor_number >= 0),
    constraint floors_unique_wing_floor unique (wing_id, floor_number)
);

create table if not exists public.rooms (
    id uuid primary key default gen_random_uuid(),
    floor_id uuid not null references public.floors(id) on delete restrict,
    room_number varchar(30) not null,
    capacity integer not null default 3,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint rooms_capacity_check check (capacity > 0),
    constraint rooms_unique_floor_room unique (floor_id, room_number)
);

-- ============================================================
-- 3. APPLICATION PROFILES (Leaders)
-- ============================================================

create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    full_name varchar(150) not null,
    email varchar(255),
    mobile varchar(20),
    avatar_url text,
    role public.app_role not null default 'wing_leader',
    floor_number integer,        -- Assigned floor: 4 or 6 (null for main_leader)
    room_start varchar(30),       -- e.g. '401', '410', '601', '610'
    room_end varchar(30),         -- e.g. '409', '418', '609', '618'
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- Leader to Floor assignment linking table (optional multi-floor mapping)
create table if not exists public.leader_floor_assignments (
    id uuid primary key default gen_random_uuid(),
    leader_id uuid not null references public.profiles(id) on delete cascade,
    floor_id uuid not null references public.floors(id) on delete cascade,
    assigned_at timestamptz not null default now(),
    assigned_by uuid references public.profiles(id) on delete set null,

    constraint leader_floor_unique unique (leader_id, floor_id)
);

-- ============================================================
-- 4. STUDENTS
-- ============================================================

create table if not exists public.students (
    id uuid primary key default gen_random_uuid(),

    full_name varchar(150) not null,
    date_of_birth date not null,
    mobile varchar(20),
    email varchar(255),

    profile_photo_url text,

    room_id uuid not null references public.rooms(id) on delete restrict,

    admission_number varchar(50),
    enrollment_number varchar(50),

    address text,
    city varchar(100),
    state varchar(100),
    pincode varchar(20),

    is_active boolean not null default true,

    created_by uuid references public.profiles(id) on delete set null,
    updated_by uuid references public.profiles(id) on delete set null,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint students_admission_unique unique (admission_number),
    constraint students_enrollment_unique unique (enrollment_number)
);

-- ============================================================
-- 5. PARENT / GUARDIAN INFORMATION
-- ============================================================

create table if not exists public.student_parents (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.students(id) on delete cascade,

    parent_name varchar(150) not null,
    relationship varchar(50),
    mobile varchar(20),
    email varchar(255),
    address text,

    is_primary boolean not null default false,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- ============================================================
-- 6. ACADEMIC INFORMATION
-- ============================================================

create table if not exists public.student_academics (
    id uuid primary key default gen_random_uuid(),
    student_id uuid not null references public.students(id) on delete cascade,

    institution_name varchar(200),
    course varchar(150),
    branch varchar(150),
    year_of_study integer,
    semester integer,
    roll_number varchar(50),

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint academic_year_check check (
        year_of_study is null or year_of_study > 0
    ),
    constraint academic_semester_check check (
        semester is null or semester > 0
    )
);

-- ============================================================
-- 7. FRIENDS
-- ============================================================

create table if not exists public.student_friendships (
    id uuid primary key default gen_random_uuid(),

    student_id uuid not null references public.students(id) on delete cascade,
    friend_student_id uuid not null references public.students(id) on delete cascade,

    status varchar(20) not null default 'active',

    created_at timestamptz not null default now(),

    constraint friendship_not_self check (student_id <> friend_student_id),
    constraint friendship_status_check check (
        status in ('active', 'blocked')
    )
);

create unique index if not exists student_friendships_pair_unique
on public.student_friendships (
    least(student_id, friend_student_id),
    greatest(student_id, friend_student_id)
);

-- ============================================================
-- 8. BIRTHDAY NOTIFICATIONS / ALERT HISTORY
-- ============================================================

create table if not exists public.birthday_alerts (
    id uuid primary key default gen_random_uuid(),

    student_id uuid not null references public.students(id) on delete cascade,
    birthday_date date not null,

    generated_at timestamptz not null default now(),

    constraint birthday_alert_unique unique (student_id, birthday_date)
);

-- ============================================================
-- 9. NOTIFICATION CENTER
-- ============================================================

create table if not exists public.notifications (
    id uuid primary key default gen_random_uuid(),

    recipient_id uuid not null references public.profiles(id) on delete cascade,
    student_id uuid references public.students(id) on delete cascade,

    type public.notification_type not null,
    title varchar(200) not null,
    message text not null,

    is_read boolean not null default false,
    read_at timestamptz,

    metadata jsonb not null default '{}'::jsonb,

    created_at timestamptz not null default now()
);

-- ============================================================
-- 10. BROWSER PUSH SUBSCRIPTIONS
-- ============================================================

create table if not exists public.push_subscriptions (
    id uuid primary key default gen_random_uuid(),

    profile_id uuid not null references public.profiles(id) on delete cascade,

    endpoint text not null,
    p256dh_key text,
    auth_key text,

    user_agent text,
    is_active boolean not null default true,

    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),

    constraint push_endpoint_unique unique (endpoint)
);

-- ============================================================
-- 11. AUDIT LOGS
-- ============================================================

create table if not exists public.audit_logs (
    id uuid primary key default gen_random_uuid(),

    actor_id uuid references public.profiles(id) on delete set null,

    action public.audit_action not null,
    entity_type varchar(100) not null,
    entity_id uuid,

    old_data jsonb,
    new_data jsonb,

    ip_address inet,
    user_agent text,

    created_at timestamptz not null default now()
);

-- ============================================================
-- 12. INDEXES
-- ============================================================

create index if not exists idx_profiles_role
on public.profiles(role);

create index if not exists idx_profiles_floor_rooms
on public.profiles(floor_number, room_start, room_end);

create index if not exists idx_students_room
on public.students(room_id);

create index if not exists idx_students_dob
on public.students(date_of_birth);

create index if not exists idx_students_name
on public.students using gin (to_tsvector('simple', full_name));

create index if not exists idx_student_parents_student
on public.student_parents(student_id);

create index if not exists idx_student_academics_student
on public.student_academics(student_id);

create index if not exists idx_notifications_recipient
on public.notifications(recipient_id);

create index if not exists idx_notifications_unread
on public.notifications(recipient_id, is_read)
where is_read = false;

create index if not exists idx_notifications_created
on public.notifications(created_at desc);

create index if not exists idx_birthday_alerts_date
on public.birthday_alerts(birthday_date);

create index if not exists idx_audit_actor
on public.audit_logs(actor_id);

-- ============================================================
-- 13. UPDATED_AT TRIGGER
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists trg_hostel_wings_updated_at on public.hostel_wings;
create trigger trg_hostel_wings_updated_at
before update on public.hostel_wings
for each row execute function public.set_updated_at();

drop trigger if exists trg_floors_updated_at on public.floors;
create trigger trg_floors_updated_at
before update on public.floors
for each row execute function public.set_updated_at();

drop trigger if exists trg_rooms_updated_at on public.rooms;
create trigger trg_rooms_updated_at
before update on public.rooms
for each row execute function public.set_updated_at();

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists trg_students_updated_at on public.students;
create trigger trg_students_updated_at
before update on public.students
for each row execute function public.set_updated_at();

-- ============================================================
-- 14. AUTH TRIGGER
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (
        id,
        full_name,
        email
    )
    values (
        new.id,
        coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
        new.email
    )
    on conflict (id) do nothing;

    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();

-- ============================================================
-- 15. VIEWS
-- ============================================================

create or replace view public.student_directory
with (security_invoker = true)
as
select
    s.id,
    s.full_name,
    s.date_of_birth,
    s.mobile,
    s.email,
    s.profile_photo_url,
    s.admission_number,
    s.enrollment_number,
    r.id as room_id,
    r.room_number,
    f.id as floor_id,
    f.floor_number,
    f.name as floor_name,
    w.id as wing_id,
    w.name as wing_name,
    s.is_active,
    s.created_at,
    s.updated_at
from public.students s
join public.rooms r on r.id = s.room_id
join public.floors f on f.id = r.floor_id
join public.hostel_wings w on w.id = f.wing_id;

create or replace view public.upcoming_birthdays
with (security_invoker = true)
as
select
    s.id,
    s.full_name,
    s.date_of_birth,
    s.profile_photo_url,
    r.room_number,
    f.floor_number,
    w.name as wing_name,
    make_date(
        extract(year from current_date)::integer,
        extract(month from s.date_of_birth)::integer,
        extract(day from s.date_of_birth)::integer
    ) as birthday_this_year
from public.students s
join public.rooms r on r.id = s.room_id
join public.floors f on f.id = r.floor_id
join public.hostel_wings w on w.id = f.wing_id
where s.is_active = true;
