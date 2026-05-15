-- Projects: showcases apps and games on the public /projects page.
create table if not exists projects (
  id          uuid        primary key default gen_random_uuid(),
  title       text        not null,
  description text        not null,
  link        text        not null,
  image_url   text,
  "order"     int         not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

alter table projects enable row level security;

create policy "public_select_projects"
  on projects for select
  using (true);

create policy "admin_insert_projects"
  on projects for insert
  with check (auth.role() = 'authenticated');

create policy "admin_update_projects"
  on projects for update
  using (auth.role() = 'authenticated');

create policy "admin_delete_projects"
  on projects for delete
  using (auth.role() = 'authenticated');
