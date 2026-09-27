-- Blog SEO / social fields used by the Rank-Math-style editor in
-- /admin/blogs. Safe to re-run: every column is added IF NOT EXISTS.
--
-- Until this is applied, the API detects the missing columns, drops them
-- from its writes and keeps saving the rest of the post (see
-- writeBlogRow in backend/src/admin/store.js) — so applying it is what
-- turns these fields from "edited but not stored" into "persisted".

alter table public.blogs add column if not exists image_alt            text;
alter table public.blogs add column if not exists og_title             text;
alter table public.blogs add column if not exists og_description       text;
alter table public.blogs add column if not exists twitter_title        text;
alter table public.blogs add column if not exists twitter_description  text;
alter table public.blogs add column if not exists twitter_image        text;
alter table public.blogs add column if not exists secondary_keywords   text;
alter table public.blogs add column if not exists schema_type          text default 'BlogPosting';
alter table public.blogs add column if not exists robots_noindex       boolean default false;
alter table public.blogs add column if not exists robots_nofollow      boolean default false;
alter table public.blogs add column if not exists pillar_content       boolean default false;
