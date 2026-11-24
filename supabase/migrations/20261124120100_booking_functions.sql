create function public.get_busy_periods(
  p_dentist_ids uuid[],
  p_from timestamptz,
  p_to timestamptz
)
returns table (dentist_id uuid, starts_at timestamptz, ends_at timestamptz)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if p_to <= p_from or p_to - p_from > interval '62 days' then
    raise exception 'invalid_range' using errcode = '22023';
  end if;

  return query
  select a.dentist_id, lower(a.period), upper(a.period)
  from public.appointments a
  where a.dentist_id = any (p_dentist_ids)
    and a.status <> 'cancelled'
    and a.period && tstzrange(p_from, p_to, '[)')
  union all
  select b.dentist_id, lower(b.period), upper(b.period)
  from public.schedule_blocks b
  where b.dentist_id = any (p_dentist_ids)
    and b.period && tstzrange(p_from, p_to, '[)');
end;
$$;

create function public.book_appointment(
  p_dentist_id uuid,
  p_treatment_id uuid,
  p_starts_at timestamptz,
  p_patient_name text,
  p_patient_email text,
  p_patient_phone text,
  p_payment_method public.payment_method,
  p_manage_token_hash bytea,
  p_insurance_provider text default null,
  p_patient_notes text default null
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
    dentist_id, treatment_id, patient_id, period, payment_method,
    insurance_provider, patient_notes, manage_token_hash, source
  )
  values (
    p_dentist_id,
    p_treatment_id,
    v_patient_id,
    tstzrange(p_starts_at, p_starts_at + make_interval(mins => v_duration), '[)'),
    p_payment_method,
    p_insurance_provider,
    p_patient_notes,
    p_manage_token_hash,
    'website'
  )
  returning id into v_appointment_id;

  return v_appointment_id;
end;
$$;

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
  select cl.id, a.id, lower(a.period), upper(a.period),
         p.full_name, p.email, p.phone, d.display_name, t.name
  from claimed cl
  join public.appointments a on a.id = cl.appointment_id
  join public.patients p on p.id = a.patient_id
  join public.dentists d on d.id = a.dentist_id
  join public.treatments t on t.id = a.treatment_id
  order by lower(a.period);
end;
$$;

revoke all on function public.get_busy_periods(uuid[], timestamptz, timestamptz) from public;
revoke all on function public.book_appointment(uuid, uuid, timestamptz, text, text, text, public.payment_method, bytea, text, text) from public;
revoke all on function public.claim_reminders(timestamptz, timestamptz, text) from public;

revoke all on function public.get_busy_periods(uuid[], timestamptz, timestamptz) from anon, authenticated;
revoke all on function public.book_appointment(uuid, uuid, timestamptz, text, text, text, public.payment_method, bytea, text, text) from anon, authenticated;
revoke all on function public.claim_reminders(timestamptz, timestamptz, text) from anon, authenticated;

grant execute on function public.get_busy_periods(uuid[], timestamptz, timestamptz) to anon, authenticated, service_role;
grant execute on function public.book_appointment(uuid, uuid, timestamptz, text, text, text, public.payment_method, bytea, text, text) to service_role;
grant execute on function public.claim_reminders(timestamptz, timestamptz, text) to service_role;
