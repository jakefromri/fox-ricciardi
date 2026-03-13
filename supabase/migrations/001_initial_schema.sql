-- Enable moddatetime extension
create extension if not exists moddatetime schema extensions;

-- Posts
create table posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content jsonb not null default '{}',
  excerpt text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger handle_updated_at before update on posts
  for each row execute procedure extensions.moddatetime(updated_at);

alter table posts enable row level security;

create policy "public_read_published" on posts
  for select to anon
  using (status = 'published');

create policy "owner_all" on posts
  for all to authenticated
  using (true)
  with check (true);

-- Profile (singleton)
create table profile (
  id int primary key default 1,
  bio text not null default '',
  linkedin_url text,
  instagram_url text,
  email text,
  updated_at timestamptz not null default now(),
  constraint singleton check (id = 1)
);

create trigger handle_profile_updated_at before update on profile
  for each row execute procedure extensions.moddatetime(updated_at);

alter table profile enable row level security;

create policy "public_read" on profile
  for select to anon
  using (true);

create policy "owner_write" on profile
  for update to authenticated
  using (true)
  with check (true);

-- Seed profile
insert into profile (id, bio, email)
values (1, 'Hi, I''m Jake.', 'jakericciardi@gmail.com')
on conflict (id) do nothing;
