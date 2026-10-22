-- Scheduled publishing for blog posts. Safe to re-run.
--
-- A scheduled post is stored as published = true with publish_at in the
-- future; the public API hides it until that moment, so it goes live on its
-- own with no background job. Until this column exists the API refuses to
-- schedule (rather than publishing the post immediately).

alter table public.blogs add column if not exists publish_at timestamptz;

create index if not exists blogs_publish_at_idx on public.blogs (publish_at);
