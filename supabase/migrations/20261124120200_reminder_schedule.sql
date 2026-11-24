create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron;

create function private.dispatch_reminders()
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_app_url text;
  v_cron_secret text;
  v_request_id bigint;
begin
  select ds.decrypted_secret into v_app_url
  from vault.decrypted_secrets ds where ds.name = 'app_url';

  select ds.decrypted_secret into v_cron_secret
  from vault.decrypted_secrets ds where ds.name = 'cron_secret';

  if v_app_url is null or v_cron_secret is null then
    raise notice 'Reminder dispatch skipped: vault secrets app_url and cron_secret are required';
    return null;
  end if;

  select net.http_post(
    url := rtrim(v_app_url, '/') || '/api/cron/reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || v_cron_secret,
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb,
    timeout_milliseconds := 15000
  ) into v_request_id;

  return v_request_id;
end;
$$;

revoke all on function private.dispatch_reminders() from public;

select cron.schedule(
  'send-appointment-reminders',
  '0 21 * * *',
  $$select private.dispatch_reminders()$$
);
