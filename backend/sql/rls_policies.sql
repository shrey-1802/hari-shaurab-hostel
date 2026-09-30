-- ============================================================
-- HARI-SAURABH HOSTEL MANAGEMENT SYSTEM
-- Supabase PostgreSQL Row Level Security (RLS) Policies
-- ============================================================
-- Enforces:
-- 1. Main Leader: Unrestricted access to all floors & rooms.
-- 2. Wing Leader: Access only to their assigned floor & room range:
--    - Floor 4: Leader A (401-409), Leader B (410-418)
--    - Floor 6: Leader A (601-609), Leader B (610-618)
-- ============================================================

-- ============================================================
-- 1. HELPER SECURITY FUNCTIONS
-- ============================================================

-- Get the role of the currently logged-in user
create or replace function public.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = public
as $$
    select role
    from public.profiles
    where id = auth.uid()
      and is_active = true
    limit 1;
$$;

-- Check if current authenticated user is a main leader
create or replace function public.is_main_leader()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.profiles
        where id = auth.uid()
          and role = 'main_leader'
          and is_active = true
    );
$$;

-- Check if current user has access to a specific floor
create or replace function public.can_access_floor(target_floor_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select
        public.is_main_leader()
        or exists (
            select 1
            from public.profiles p
            join public.floors f on f.id = target_floor_id
            where p.id = auth.uid()
              and p.role = 'wing_leader'
              and p.is_active = true
              and p.floor_number = f.floor_number
        );
$$;

-- Check if current user has access to a specific room (checks floor + room range)
create or replace function public.can_access_room(target_room_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select
        public.is_main_leader()
        or exists (
            select 1
            from public.profiles p
            join public.rooms r on r.id = target_room_id
            join public.floors f on f.id = r.floor_id
            where p.id = auth.uid()
              and p.role = 'wing_leader'
              and p.is_active = true
              and p.floor_number = f.floor_number
              and (
                  -- If no specific room range is set, allow all rooms on the floor
                  (p.room_start is null or p.room_end is null)
                  -- Otherwise check if room is within leader's range (e.g. 401..409 or 410..418)
                  or (
                      r.room_number >= p.room_start 
                      and r.room_number <= p.room_end
                  )
              )
        );
$$;

-- Check if current user has access to a specific student
create or replace function public.can_access_student(target_student_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
    select exists (
        select 1
        from public.students s
        where s.id = target_student_id
          and public.can_access_room(s.room_id)
    );
$$;

-- ============================================================
-- 2. ENABLE RLS ON ALL TABLES
-- ============================================================

alter table public.hostel_wings enable row level security;
alter table public.floors enable row level security;
alter table public.rooms enable row level security;
alter table public.profiles enable row level security;
alter table public.leader_floor_assignments enable row level security;
alter table public.students enable row level security;
alter table public.student_parents enable row level security;
alter table public.student_academics enable row level security;
alter table public.student_friendships enable row level security;
alter table public.birthday_alerts enable row level security;
alter table public.notifications enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.audit_logs enable row level security;

-- ============================================================
-- 3. PROFILES POLICIES
-- ============================================================

drop policy if exists profiles_select_own_or_main on public.profiles;
create policy profiles_select_own_or_main
on public.profiles for select
to authenticated
using (
    id = auth.uid() or public.is_main_leader()
);

drop policy if exists profiles_update_own_or_main on public.profiles;
create policy profiles_update_own_or_main
on public.profiles for update
to authenticated
using (
    id = auth.uid() or public.is_main_leader()
)
with check (
    id = auth.uid() or public.is_main_leader()
);

-- ============================================================
-- 4. HOSTEL STRUCTURE POLICIES (Wings, Floors, Rooms)
-- ============================================================

-- Wings
drop policy if exists wings_authenticated_select on public.hostel_wings;
create policy wings_authenticated_select
on public.hostel_wings for select
to authenticated
using (true);

drop policy if exists wings_main_manage on public.hostel_wings;
create policy wings_main_manage
on public.hostel_wings for all
to authenticated
using (public.is_main_leader())
with check (public.is_main_leader());

-- Floors
drop policy if exists floors_select_accessible on public.floors;
create policy floors_select_accessible
on public.floors for select
to authenticated
using (
    public.is_main_leader()
    or public.can_access_floor(id)
);

drop policy if exists floors_main_manage on public.floors;
create policy floors_main_manage
on public.floors for all
to authenticated
using (public.is_main_leader())
with check (public.is_main_leader());

-- Rooms
drop policy if exists rooms_select_accessible on public.rooms;
create policy rooms_select_accessible
on public.rooms for select
to authenticated
using (
    public.can_access_room(id)
);

drop policy if exists rooms_main_manage on public.rooms;
create policy rooms_main_manage
on public.rooms for all
to authenticated
using (public.is_main_leader())
with check (public.is_main_leader());

-- ============================================================
-- 5. STUDENTS POLICIES
-- ============================================================

drop policy if exists students_select_accessible on public.students;
create policy students_select_accessible
on public.students for select
to authenticated
using (public.can_access_student(id));

drop policy if exists students_insert_accessible on public.students;
create policy students_insert_accessible
on public.students for insert
to authenticated
with check (
    public.can_access_room(room_id)
);

drop policy if exists students_update_accessible on public.students;
create policy students_update_accessible
on public.students for update
to authenticated
using (public.can_access_student(id))
with check (public.can_access_room(room_id));

drop policy if exists students_delete_main on public.students;
create policy students_delete_main
on public.students for delete
to authenticated
using (public.is_main_leader());

-- ============================================================
-- 6. STUDENT RELATED DATA POLICIES (Parents, Academics, Friends)
-- ============================================================

-- Parents
drop policy if exists parents_access on public.student_parents;
create policy parents_access
on public.student_parents for all
to authenticated
using (public.can_access_student(student_id))
with check (public.can_access_student(student_id));

-- Academics
drop policy if exists academics_access on public.student_academics;
create policy academics_access
on public.student_academics for all
to authenticated
using (public.can_access_student(student_id))
with check (public.can_access_student(student_id));

-- Friendships
drop policy if exists friendships_access on public.student_friendships;
create policy friendships_access
on public.student_friendships for all
to authenticated
using (
    public.can_access_student(student_id)
    and public.can_access_student(friend_student_id)
)
with check (
    public.can_access_student(student_id)
    and public.can_access_student(friend_student_id)
);

-- ============================================================
-- 7. BIRTHDAY ALERTS & NOTIFICATIONS POLICIES
-- ============================================================

-- Birthday alerts
drop policy if exists birthday_alerts_access on public.birthday_alerts;
create policy birthday_alerts_access
on public.birthday_alerts for select
to authenticated
using (public.can_access_student(student_id));

drop policy if exists birthday_alerts_main_insert on public.birthday_alerts;
create policy birthday_alerts_main_insert
on public.birthday_alerts for insert
to authenticated
with check (
    public.is_main_leader()
    or public.can_access_student(student_id)
);

-- Notifications
drop policy if exists notifications_own on public.notifications;
create policy notifications_own
on public.notifications for select
to authenticated
using (recipient_id = auth.uid());

drop policy if exists notifications_mark_read on public.notifications;
create policy notifications_mark_read
on public.notifications for update
to authenticated
using (recipient_id = auth.uid())
with check (recipient_id = auth.uid());

-- Push Subscriptions
drop policy if exists push_own on public.push_subscriptions;
create policy push_own
on public.push_subscriptions for all
to authenticated
using (profile_id = auth.uid())
with check (profile_id = auth.uid());

-- ============================================================
-- 8. AUDIT LOGS POLICIES
-- ============================================================

drop policy if exists audit_main_read on public.audit_logs;
create policy audit_main_read
on public.audit_logs for select
to authenticated
using (public.is_main_leader());

drop policy if exists audit_main_insert on public.audit_logs;
create policy audit_main_insert
on public.audit_logs for insert
to authenticated
with check (
    actor_id = auth.uid()
);
