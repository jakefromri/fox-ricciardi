-- BLOG-6: Comments and Votes
-- Run this against both dev and prod Supabase projects.
-- Verify linked project first: cat supabase/.temp/project-ref

-- ── comments ─────────────────────────────────────────────────────────────────

create table if not exists comments (
  id          uuid        primary key default gen_random_uuid(),
  post_id     uuid        not null references posts(id) on delete cascade,
  author_name text        not null check (char_length(author_name) <= 100),
  body        text        not null check (char_length(body) <= 500),
  created_at  timestamptz not null default now()
);

create index if not exists comments_post_id_idx on comments(post_id);

alter table comments enable row level security;

-- Anyone can read comments
create policy "public_select_comments"
  on comments for select
  using (true);

-- Anyone can post a comment
create policy "public_insert_comments"
  on comments for insert
  with check (true);

-- Only authenticated admin can delete
create policy "admin_delete_comments"
  on comments for delete
  using (auth.role() = 'authenticated');


-- ── votes ─────────────────────────────────────────────────────────────────────

create table if not exists votes (
  id          uuid        primary key default gen_random_uuid(),
  post_id     uuid        not null references posts(id) on delete cascade,
  vote_type   text        not null check (vote_type in ('up', 'down')),
  fingerprint text        not null,
  created_at  timestamptz not null default now(),
  -- one vote per browser fingerprint per post
  unique (post_id, fingerprint)
);

create index if not exists votes_post_id_idx on votes(post_id);

alter table votes enable row level security;

-- Anyone can read vote counts
create policy "public_select_votes"
  on votes for select
  using (true);

-- Anyone can cast a vote (unique constraint handles dedup)
create policy "public_insert_votes"
  on votes for insert
  with check (true);
