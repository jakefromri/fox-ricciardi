-- Add cover_image_url to posts
alter table posts add column cover_image_url text;

-- Create public storage bucket for post images
insert into storage.buckets (id, name, public)
values ('post-images', 'post-images', true)
on conflict (id) do nothing;

-- RLS: anyone can read images (public bucket)
create policy "post_images_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'post-images');

-- RLS: only authenticated (Jake) can upload
create policy "post_images_authenticated_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'post-images');

-- RLS: only authenticated (Jake) can delete
create policy "post_images_authenticated_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'post-images');
