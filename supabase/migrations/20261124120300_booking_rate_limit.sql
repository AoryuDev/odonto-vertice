create table private.booking_attempts (
  id bigint generated always as identity primary key,
  fingerprint bytea not null check (octet_length(fingerprint) = 32),
  attempted_at timestamptz not null default now()
);

create index booking_attempts_fingerprint_idx on private.booking_attempts (fingerprint, attempted_at desc);

create function public.register_booking_attempt(
  p_fingerprint bytea,
  p_limit integer,
  p_window_minutes integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_recent integer;
begin
  perform pg_advisory_xact_lock(hashtextextended(encode(p_fingerprint, 'hex'), 0));

  delete from private.booking_attempts
  where attempted_at < now() - interval '1 day';

  select count(*) into v_recent
  from private.booking_attempts
  where fingerprint = p_fingerprint
    and attempted_at > now() - make_interval(mins => p_window_minutes);

  if v_recent >= p_limit then
    return false;
  end if;

  insert into private.booking_attempts (fingerprint) values (p_fingerprint);
  return true;
end;
$$;

revoke all on function public.register_booking_attempt(bytea, integer, integer) from public, anon, authenticated;
grant execute on function public.register_booking_attempt(bytea, integer, integer) to service_role;
