-- ============================================================
-- MIGRATION: UPDATE ROOM CAPACITY & RESTRICTIONS TO 2 STUDENTS PER ROOM
-- ============================================================
-- Execute this script in your Supabase SQL Editor / PostgreSQL DB.

-- 1. Update rooms table default capacity to 2 and update existing rooms
update public.rooms
set capacity = 2
where capacity > 2 or capacity is null;

-- 2. Alter column default for future room insertions
alter table public.rooms
alter column capacity set default 2;

-- 3. Drop existing capacity check constraint if present and re-create with max 2 limit
alter table public.rooms
drop constraint if exists rooms_capacity_check;

alter table public.rooms
add constraint rooms_capacity_check check (capacity > 0 and capacity <= 2);

-- 4. Create a trigger to strictly enforce max 2 students per room on insert/update in students table
create or replace function public.check_room_capacity_limit()
returns trigger
language plpgsql
as $$
declare
    current_occupants integer;
begin
    -- Check if student is assigned to a room
    if NEW.room_number is not null and NEW.floor_number is not null then
        select count(*)
        into current_occupants
        from public.students
        where floor_number = NEW.floor_number
          and room_number = NEW.room_number
          and id <> coalesce(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);

        if current_occupants >= 2 then
            raise exception 'Room % on Floor % is already full! Maximum 2 students are allowed per room.',
                NEW.room_number, NEW.floor_number;
        end if;
    end if;

    return NEW;
end;
$$;

drop trigger if exists trg_enforce_room_capacity on public.students;
create trigger trg_enforce_room_capacity
before insert or update on public.students
for each row
execute function public.check_room_capacity_limit();
