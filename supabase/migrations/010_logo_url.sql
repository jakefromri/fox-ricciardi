-- Add logo_url to profile singleton
-- Displayed in the site header as a clickable home button
alter table profile
  add column logo_url text;
