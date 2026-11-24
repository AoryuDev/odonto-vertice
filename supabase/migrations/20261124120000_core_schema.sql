create extension if not exists btree_gist with schema extensions;

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create type public.specialty as enum ('general_dentistry', 'orthodontics', 'implantology');
create type public.appointment_status as enum ('scheduled', 'cancelled', 'completed', 'no_show');
create type public.staff_role as enum ('reception', 'dentist');
create type public.payment_method as enum ('private', 'insurance');
create type public.appointment_source as enum ('website', 'reception');
create type public.notification_kind as enum ('confirmation', 'reminder', 'cancellation', 'reschedule');
create type public.delivery_status as enum ('pending', 'sent', 'failed');

create function private.clinic_timezone()
returns text
language sql
immutable
set search_path = ''
as $$ select 'America/Sao_Paulo'::text $$;

create table public.dentists (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  full_name text not null check (char_length(full_name) between 3 and 120),
  display_name text not null check (char_length(display_name) between 3 and 80),
  specialty public.specialty not null,
  cro_registration text not null unique check (cro_registration ~ '^CRO-GO [0-9]{4,6}$'),
  headline text not null,
  bio text[] not null check (cardinality(bio) > 0),
  education text[] not null default '{}',
  photo_key text not null,
  is_technical_lead boolean not null default false,
  is_active boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create unique index dentists_single_technical_lead on public.dentists (is_technical_lead)
  where is_technical_lead;

create table public.treatments (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 3 and 80),
  duration_minutes smallint not null
    check (duration_minutes between 15 and 240 and duration_minutes % 15 = 0),
  summary text not null check (char_length(summary) between 20 and 280),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  photo_key text not null,
  is_urgent boolean not null default false,
  is_bookable boolean not null default true,
  sort_order smallint not null default 0,
  created_at timestamptz not null default now()
);

create table public.dentist_treatments (
  dentist_id uuid not null references public.dentists (id) on delete cascade,
  treatment_id uuid not null references public.treatments (id) on delete cascade,
  primary key (dentist_id, treatment_id)
);

create index dentist_treatments_treatment_idx on public.dentist_treatments (treatment_id);

create table public.weekly_schedules (
  id uuid primary key default gen_random_uuid(),
  dentist_id uuid not null references public.dentists (id) on delete cascade,
  weekday smallint not null check (weekday between 0 and 6),
  starts_at time not null,
  ends_at time not null,
  lunch_starts_at time,
  lunch_ends_at time,
  unique (dentist_id, weekday),
  constraint weekly_schedules_hours_order check (starts_at < ends_at),
  constraint weekly_schedules_lunch_pair check ((lunch_starts_at is null) = (lunch_ends_at is null)),
  constraint weekly_schedules_lunch_inside check (
    lunch_starts_at is null
    or (starts_at < lunch_starts_at and lunch_starts_at < lunch_ends_at and lunch_ends_at < ends_at)
  )
);

create table public.holidays (
  date date primary key,
  name text not null check (char_length(name) between 3 and 80)
);

create table public.schedule_blocks (
  id uuid primary key default gen_random_uuid(),
  dentist_id uuid not null references public.dentists (id) on delete cascade,
  period tstzrange not null,
  reason text not null check (char_length(reason) between 3 and 140),
  created_by uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now(),
  constraint schedule_blocks_period_valid check (
    not isempty(period) and lower_inc(period) and not upper_inc(period)
    and not lower_inf(period) and not upper_inf(period)
  )
);

create index schedule_blocks_dentist_period_idx on public.schedule_blocks
  using gist (dentist_id, period);

create table public.patients (
  id uuid primary key default gen_random_uuid(),
  full_name text not null check (char_length(full_name) between 3 and 120),
  email text not null unique check (email = lower(email) and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text not null check (phone ~ '^\+55[1-9][0-9]{9,10}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  dentist_id uuid not null references public.dentists (id),
  treatment_id uuid not null references public.treatments (id),
  patient_id uuid not null references public.patients (id),
  period tstzrange not null,
  status public.appointment_status not null default 'scheduled',
  payment_method public.payment_method not null,
  insurance_provider text check (char_length(insurance_provider) between 2 and 80),
  patient_notes text check (char_length(patient_notes) <= 500),
  manage_token_hash bytea not null unique check (octet_length(manage_token_hash) = 32),
  source public.appointment_source not null default 'website',
  rescheduled_count smallint not null default 0,
  cancelled_at timestamptz,
  cancellation_reason text check (char_length(cancellation_reason) <= 280),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint appointments_period_valid check (
    not isempty(period) and lower_inc(period) and not upper_inc(period)
    and not lower_inf(period) and not upper_inf(period)
    and upper(period) - lower(period) between interval '15 minutes' and interval '4 hours'
  ),
  constraint appointments_insurance_provider check (
    (payment_method = 'insurance') = (insurance_provider is not null)
  ),
  constraint appointments_cancellation_consistency check (
    (status = 'cancelled') = (cancelled_at is not null)
  ),
  constraint appointments_no_overlap exclude using gist (
    dentist_id with =,
    period with &&
  ) where (status <> 'cancelled')
);

create index appointments_patient_idx on public.appointments (patient_id);
create index appointments_treatment_idx on public.appointments (treatment_id);
create index appointments_upcoming_idx on public.appointments (lower(period))
  where status = 'scheduled';

create table public.staff_profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 3 and 120),
  role public.staff_role not null,
  dentist_id uuid unique references public.dentists (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint staff_profiles_dentist_link check ((role = 'dentist') = (dentist_id is not null))
);

create table public.notification_deliveries (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments (id) on delete cascade,
  kind public.notification_kind not null,
  channel text not null check (channel in ('email', 'whatsapp', 'console')),
  appointment_starts_at timestamptz not null,
  status public.delivery_status not null default 'pending',
  attempts smallint not null default 1,
  provider_message_id text,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (appointment_id, kind, appointment_starts_at)
);

create function private.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger patients_touch_updated_at before update on public.patients
  for each row execute function private.touch_updated_at();

create trigger notification_deliveries_touch_updated_at before update on public.notification_deliveries
  for each row execute function private.touch_updated_at();

create function private.track_appointment_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  if new.period is distinct from old.period then
    new.rescheduled_count := old.rescheduled_count + 1;
  end if;
  if new.status = 'cancelled' and old.status <> 'cancelled' then
    new.cancelled_at := now();
  elsif new.status <> 'cancelled' then
    new.cancelled_at := null;
    new.cancellation_reason := null;
  end if;
  return new;
end;
$$;

create trigger appointments_track_changes before update on public.appointments
  for each row execute function private.track_appointment_changes();

create function private.assert_slot_bookable(
  p_dentist_id uuid,
  p_treatment_id uuid,
  p_period tstzrange
)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_duration smallint;
  v_local_start timestamp := lower(p_period) at time zone private.clinic_timezone();
  v_local_end timestamp := upper(p_period) at time zone private.clinic_timezone();
begin
  select t.duration_minutes into v_duration
  from public.treatments t
  join public.dentist_treatments dt on dt.treatment_id = t.id and dt.dentist_id = p_dentist_id
  join public.dentists d on d.id = dt.dentist_id and d.is_active
  where t.id = p_treatment_id and t.is_bookable;

  if not found then
    raise exception 'treatment_not_offered' using errcode = 'P0001';
  end if;

  if upper(p_period) - lower(p_period) <> make_interval(mins => v_duration) then
    raise exception 'duration_mismatch' using errcode = 'P0001';
  end if;

  if lower(p_period) <= now() then
    raise exception 'slot_in_past' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.holidays h where h.date = v_local_start::date) then
    raise exception 'clinic_closed' using errcode = 'P0001';
  end if;

  if v_local_end::date <> v_local_start::date or not exists (
    select 1
    from public.weekly_schedules ws
    where ws.dentist_id = p_dentist_id
      and ws.weekday = extract(dow from v_local_start)
      and v_local_start::time >= ws.starts_at
      and v_local_end::time <= ws.ends_at
      and (
        ws.lunch_starts_at is null
        or v_local_end::time <= ws.lunch_starts_at
        or v_local_start::time >= ws.lunch_ends_at
      )
  ) then
    raise exception 'outside_working_hours' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.schedule_blocks b
    where b.dentist_id = p_dentist_id and b.period && p_period
  ) then
    raise exception 'slot_blocked' using errcode = 'P0001';
  end if;
end;
$$;

create function private.enforce_appointment_rules()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status <> 'scheduled' then
    return new;
  end if;

  if tg_op = 'UPDATE'
    and new.period = old.period
    and new.dentist_id = old.dentist_id
    and new.treatment_id = old.treatment_id
    and old.status = 'scheduled' then
    return new;
  end if;

  perform private.assert_slot_bookable(new.dentist_id, new.treatment_id, new.period);
  return new;
end;
$$;

create trigger appointments_enforce_rules before insert or update on public.appointments
  for each row execute function private.enforce_appointment_rules();

create function private.staff_role()
returns public.staff_role
language sql
stable
security definer
set search_path = ''
as $$
  select sp.role from public.staff_profiles sp where sp.user_id = (select auth.uid())
$$;

create function private.staff_dentist_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select sp.dentist_id from public.staff_profiles sp where sp.user_id = (select auth.uid())
$$;

create function private.can_access_dentist(p_dentist_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select sp.role = 'reception' or sp.dentist_id = p_dentist_id
     from public.staff_profiles sp
     where sp.user_id = (select auth.uid())),
    false
  )
$$;

revoke all on all functions in schema private from public;
grant execute on function private.staff_role() to authenticated;
grant execute on function private.staff_dentist_id() to authenticated;
grant execute on function private.can_access_dentist(uuid) to authenticated;

alter table public.dentists enable row level security;
alter table public.treatments enable row level security;
alter table public.dentist_treatments enable row level security;
alter table public.weekly_schedules enable row level security;
alter table public.holidays enable row level security;
alter table public.schedule_blocks enable row level security;
alter table public.patients enable row level security;
alter table public.appointments enable row level security;
alter table public.staff_profiles enable row level security;
alter table public.notification_deliveries enable row level security;

create policy "Active dentists are public" on public.dentists
  for select to anon, authenticated using (is_active);

create policy "Treatments are public" on public.treatments
  for select to anon, authenticated using (true);

create policy "Dentist treatments are public" on public.dentist_treatments
  for select to anon, authenticated using (true);

create policy "Weekly schedules are public" on public.weekly_schedules
  for select to anon, authenticated using (true);

create policy "Holidays are public" on public.holidays
  for select to anon, authenticated using (true);

create policy "Reception manages holidays" on public.holidays
  for all to authenticated
  using ((select private.staff_role()) = 'reception')
  with check ((select private.staff_role()) = 'reception');

create policy "Staff read blocks they can access" on public.schedule_blocks
  for select to authenticated using ((select private.can_access_dentist(dentist_id)));

create policy "Staff create blocks they can access" on public.schedule_blocks
  for insert to authenticated with check ((select private.can_access_dentist(dentist_id)));

create policy "Staff remove blocks they can access" on public.schedule_blocks
  for delete to authenticated using ((select private.can_access_dentist(dentist_id)));

create policy "Staff read appointments they can access" on public.appointments
  for select to authenticated using ((select private.can_access_dentist(dentist_id)));

create policy "Staff update appointments they can access" on public.appointments
  for update to authenticated
  using ((select private.can_access_dentist(dentist_id)))
  with check ((select private.can_access_dentist(dentist_id)));

create policy "Staff read patients of accessible appointments" on public.patients
  for select to authenticated using (
    (select private.staff_role()) = 'reception'
    or exists (
      select 1 from public.appointments a
      where a.patient_id = patients.id
        and a.dentist_id = (select private.staff_dentist_id())
    )
  );

create policy "Staff read own profile, reception reads all" on public.staff_profiles
  for select to authenticated using (
    user_id = (select auth.uid()) or (select private.staff_role()) = 'reception'
  );

create policy "Reception reads delivery log" on public.notification_deliveries
  for select to authenticated using ((select private.staff_role()) = 'reception');

revoke all on all tables in schema public from anon, authenticated;
grant select on public.dentists, public.treatments, public.dentist_treatments,
  public.weekly_schedules, public.holidays to anon, authenticated;
grant insert, update, delete on public.holidays to authenticated;
grant select, insert, delete on public.schedule_blocks to authenticated;
grant select on public.appointments, public.patients, public.staff_profiles,
  public.notification_deliveries to authenticated;
grant update (period, status, cancellation_reason) on public.appointments to authenticated;
