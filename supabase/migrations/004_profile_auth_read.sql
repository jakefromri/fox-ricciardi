-- Allow authenticated users to read the profile row.
-- Previously only `anon` had a SELECT policy, which caused UPDATE...RETURNING
-- to silently return 0 rows (RLS blocks the RETURNING clause for authenticated role).
create policy "auth_read" on profile
  for select to authenticated
  using (true);
