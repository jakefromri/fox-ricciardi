-- Remove the 9th kiosk (it blocks navigation in the center-bottom walkway)
delete from game_displays where id = 8;

-- Store settings: single-row table for editable /store page content.
-- intro_text drives the start screen description shown before the game begins.
create table if not exists store_settings (
  id          int         primary key default 1,
  intro_text  text        not null,
  updated_at  timestamptz not null default now(),
  -- enforce single row
  constraint store_settings_single_row check (id = 1)
);

alter table store_settings enable row level security;

create policy "public_select_store_settings"
  on store_settings for select
  using (true);

create policy "admin_update_store_settings"
  on store_settings for update
  using (auth.role() = 'authenticated');

-- Seed with default intro text
insert into store_settings (id, intro_text) values (
  1,
  'Welcome to a grocery store — except instead of groceries, you''ll find everything you need to know about working with Jake Ricciardi, PM. Navigate the aisles. Find the displays. Learn something. (Hopefully fun, not weird.)'
);
