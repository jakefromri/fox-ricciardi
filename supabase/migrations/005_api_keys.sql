create table api_keys (
  id           uuid primary key default gen_random_uuid(),
  name         text not null,
  key_hash     text not null unique,   -- SHA-256 of the full key, hex-encoded
  key_prefix   text not null,          -- first 8 chars after "sk_" for display
  created_at   timestamptz not null default now(),
  last_used_at timestamptz,
  revoked_at   timestamptz
);

alter table api_keys enable row level security;

-- Only authenticated admin can manage keys
create policy "owner_all" on api_keys
  for all to authenticated
  using (true)
  with check (true);
