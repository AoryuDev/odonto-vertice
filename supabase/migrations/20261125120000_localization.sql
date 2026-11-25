create type public.app_locale as enum ('pt', 'en');

create table public.treatment_translations (
  treatment_id uuid not null references public.treatments (id) on delete cascade,
  locale public.app_locale not null,
  name text not null check (char_length(name) between 3 and 80),
  summary text not null check (char_length(summary) between 20 and 280),
  content jsonb not null default '{}'::jsonb check (jsonb_typeof(content) = 'object'),
  primary key (treatment_id, locale)
);

create table public.dentist_translations (
  dentist_id uuid not null references public.dentists (id) on delete cascade,
  locale public.app_locale not null,
  display_name text not null check (char_length(display_name) between 3 and 80),
  headline text not null,
  bio text[] not null check (cardinality(bio) > 0),
  education text[] not null default '{}',
  primary key (dentist_id, locale)
);

insert into public.treatment_translations (treatment_id, locale, name, summary, content)
select id, 'pt', name, summary, content from public.treatments;

insert into public.dentist_translations (dentist_id, locale, display_name, headline, bio, education)
select id, 'pt', display_name, headline, bio, education from public.dentists;

alter table public.treatments
  drop column name,
  drop column summary,
  drop column content;

alter table public.dentists
  drop column display_name,
  drop column headline,
  drop column bio,
  drop column education;

alter table public.treatment_translations enable row level security;
alter table public.dentist_translations enable row level security;

create policy "Treatment translations are public" on public.treatment_translations
  for select to anon, authenticated using (true);

create policy "Translations of active dentists are public" on public.dentist_translations
  for select to anon, authenticated using (
    exists (
      select 1 from public.dentists d
      where d.id = dentist_translations.dentist_id and d.is_active
    )
  );

revoke all on public.treatment_translations, public.dentist_translations from anon, authenticated;
grant select on public.treatment_translations, public.dentist_translations to anon, authenticated;

alter table public.appointments
  add column locale public.app_locale not null default 'pt';

alter table public.staff_profiles
  add column locale public.app_locale not null default 'pt';

create policy "Staff update own profile" on public.staff_profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

grant update (locale) on public.staff_profiles to authenticated;

update public.appointments
set cancellation_reason = case cancellation_reason
  when 'Cancelada pelo paciente' then 'patient'
  when 'Conflito de horário' then 'patient:schedule_conflict'
  when 'Resolvi em outro lugar' then 'patient:resolved_elsewhere'
  when 'Problema de saúde' then 'patient:health_issue'
  when 'Questão financeira' then 'patient:financial'
end
where status = 'cancelled'
  and cancellation_reason in (
    'Cancelada pelo paciente',
    'Conflito de horário',
    'Resolvi em outro lugar',
    'Problema de saúde',
    'Questão financeira'
  );

drop function public.book_appointment(
  uuid, uuid, uuid, timestamptz, text, text, text, public.payment_method, bytea, text, text
);

create function public.book_appointment(
  p_appointment_id uuid,
  p_dentist_id uuid,
  p_treatment_id uuid,
  p_starts_at timestamptz,
  p_patient_name text,
  p_patient_email text,
  p_patient_phone text,
  p_payment_method public.payment_method,
  p_manage_token_hash bytea,
  p_insurance_provider text default null,
  p_patient_notes text default null,
  p_locale public.app_locale default 'pt'
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_duration smallint;
  v_patient_id uuid;
  v_appointment_id uuid;
begin
  select t.duration_minutes into v_duration
  from public.treatments t
  where t.id = p_treatment_id and t.is_bookable;

  if not found then
    raise exception 'treatment_not_offered' using errcode = 'P0001';
  end if;

  insert into public.patients (full_name, email, phone)
  values (p_patient_name, p_patient_email, p_patient_phone)
  on conflict (email) do update
    set full_name = excluded.full_name,
        phone = excluded.phone
  returning id into v_patient_id;

  insert into public.appointments (
    id, dentist_id, treatment_id, patient_id, period, payment_method,
    insurance_provider, patient_notes, manage_token_hash, source, locale
  )
  values (
    p_appointment_id,
    p_dentist_id,
    p_treatment_id,
    v_patient_id,
    tstzrange(p_starts_at, p_starts_at + make_interval(mins => v_duration), '[)'),
    p_payment_method,
    p_insurance_provider,
    p_patient_notes,
    p_manage_token_hash,
    'website',
    coalesce(p_locale, 'pt')
  )
  returning id into v_appointment_id;

  return v_appointment_id;
end;
$$;

revoke all on function public.book_appointment(
  uuid, uuid, uuid, timestamptz, text, text, text, public.payment_method, bytea, text, text, public.app_locale
) from public, anon, authenticated;

grant execute on function public.book_appointment(
  uuid, uuid, uuid, timestamptz, text, text, text, public.payment_method, bytea, text, text, public.app_locale
) to service_role;

drop function public.claim_reminders(timestamptz, timestamptz, text);

create function public.claim_reminders(
  p_from timestamptz,
  p_to timestamptz,
  p_channel text
)
returns table (
  delivery_id uuid,
  appointment_id uuid,
  starts_at timestamptz,
  ends_at timestamptz,
  locale public.app_locale,
  patient_name text,
  patient_email text,
  patient_phone text,
  dentist_name text,
  treatment_name text
)
language plpgsql
security invoker
set search_path = ''
as $$
#variable_conflict use_column
begin
  return query
  with candidates as (
    select a.id, lower(a.period) as starts_at
    from public.appointments a
    where a.status = 'scheduled'
      and lower(a.period) >= p_from
      and lower(a.period) < p_to
  ),
  claimed as (
    insert into public.notification_deliveries as nd (appointment_id, kind, channel, appointment_starts_at)
    select c.id, 'reminder', p_channel, c.starts_at from candidates c
    on conflict (appointment_id, kind, appointment_starts_at) do update
      set status = 'pending',
          attempts = nd.attempts + 1,
          channel = excluded.channel
      where nd.status = 'failed' and nd.attempts < 3
    returning nd.id, nd.appointment_id
  )
  select cl.id, a.id, lower(a.period), upper(a.period), a.locale,
         p.full_name, p.email, p.phone,
         coalesce(dt.display_name, dt_default.display_name),
         coalesce(tt.name, tt_default.name)
  from claimed cl
  join public.appointments a on a.id = cl.appointment_id
  join public.patients p on p.id = a.patient_id
  left join public.dentist_translations dt
    on dt.dentist_id = a.dentist_id and dt.locale = a.locale
  left join public.dentist_translations dt_default
    on dt_default.dentist_id = a.dentist_id and dt_default.locale = 'pt'
  left join public.treatment_translations tt
    on tt.treatment_id = a.treatment_id and tt.locale = a.locale
  left join public.treatment_translations tt_default
    on tt_default.treatment_id = a.treatment_id and tt_default.locale = 'pt'
  order by lower(a.period);
end;
$$;

revoke all on function public.claim_reminders(timestamptz, timestamptz, text)
  from public, anon, authenticated;

grant execute on function public.claim_reminders(timestamptz, timestamptz, text) to service_role;
