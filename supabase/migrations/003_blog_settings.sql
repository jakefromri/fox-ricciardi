-- Extend profile singleton with blog-level settings
alter table profile
  add column blog_name text not null default 'Jake Ricciardi',
  add column blog_tagline text,
  add column blog_cover_image_url text;
