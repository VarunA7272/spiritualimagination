-- Run this once in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- Matches the RPC calls already in src/app/core/services/supabase.service.ts:
--   .rpc('request_otp', { mobile_num })                       -> returns the OTP as text (dev/mock mode)
--   .rpc('verify_otp',  { mobile_num, input_code })            -> returns boolean

create table if not exists otp_verifications (
  id uuid primary key default gen_random_uuid(),
  mobile_num text not null,
  otp_code text not null,
  expires_at timestamptz not null,
  verified boolean default false,
  created_at timestamptz default now()
);

create index if not exists idx_otp_mobile on otp_verifications(mobile_num);

-- request_otp: generates + stores a 6-digit code, returns it directly as text.
-- ⚠️ DEV/MOCK MODE ONLY. AuthOtpService reads this returned string into
-- `mockOtp` and shows it as a UI hint / console log so you can test the
-- flow with zero SMS cost. Before going to production, either:
--   (a) stop returning otp_code from this function and instead call the
--       supabase/functions/request-otp Edge Function (which sends a real
--       SMS and never leaks the code back to the client), or
--   (b) keep this function only for local/staging Supabase projects.
create or replace function public.request_otp(mobile_num text)
returns text
language plpgsql
security definer
as $$
declare
  new_otp text;
begin
  if (select count(*) from otp_verifications
      where mobile_num = request_otp.mobile_num
        and created_at > now() - interval '10 minutes') >= 3 then
    raise exception 'Too many attempts. Try again later.';
  end if;

  new_otp := lpad(floor(random() * 1000000)::text, 6, '0');

  insert into otp_verifications (mobile_num, otp_code, expires_at)
  values (mobile_num, new_otp, now() + interval '5 minutes');

  return new_otp;
end;
$$;

-- verify_otp: checks the code the user entered, param name matches
-- supabase.service.ts's rpc call: { mobile_num, input_code }
create or replace function public.verify_otp(mobile_num text, input_code text)
returns boolean
language plpgsql
security definer
as $$
declare
  match_row otp_verifications;
begin
  select * into match_row from otp_verifications
  where mobile_num = verify_otp.mobile_num
    and otp_code = verify_otp.input_code
    and expires_at > now()
    and verified = false
  order by created_at desc limit 1;

  if match_row.id is null then
    return false;
  end if;

  update otp_verifications set verified = true where id = match_row.id;
  return true;
end;
$$;

alter table otp_verifications enable row level security;
-- No public policies added on purpose — only security-definer functions
-- above (and the service-role key inside the Edge Function, once you add
-- real SMS sending) can touch this table.
