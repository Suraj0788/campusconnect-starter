-- CampusConnect schema for Supabase Postgres + Clerk third-party auth.
-- Before using the app, configure Clerk as a Supabase third-party auth provider
-- and use the "supabase" JWT template (or set CLERK_SUPABASE_JWT_TEMPLATE).

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  user_id text primary key,
  full_name text not null default '',
  bio text not null default '',
  major text not null default '',
  graduation_year integer check (graduation_year is null or graduation_year between 2020 and 2045),
  avatar_url text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id text not null references public.profiles(user_id) on delete cascade,
  content text not null check (char_length(content) between 1 and 5000),
  category text not null default 'Other' check (category in ('Events','Study','Projects','Announcements','Questions','Other')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id text not null references public.profiles(user_id) on delete cascade,
  content text not null check (char_length(content) between 1 and 2000),
  created_at timestamptz not null default now()
);

create table if not exists public.likes (
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id text not null references public.profiles(user_id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

create table if not exists public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  file_path text not null,
  file_type text not null,
  original_name text not null,
  public_url text,
  created_at timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts(created_at desc);
create index if not exists posts_author_id_idx on public.posts(author_id);
create index if not exists posts_category_idx on public.posts(category);
create index if not exists comments_post_id_created_at_idx on public.comments(post_id, created_at);
create index if not exists likes_post_id_idx on public.likes(post_id);
create index if not exists post_media_post_id_idx on public.post_media(post_id);

alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.post_media enable row level security;

-- App requests pass Clerk's session token to Supabase. Public/community records
-- can be read by authenticated members; mutations are limited by Clerk subject.
drop policy if exists "Signed-in users can read profiles" on public.profiles;
create policy "Signed-in users can read profiles" on public.profiles for select to authenticated using (auth.jwt()->>'sub' is not null);
drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile" on public.profiles for insert to authenticated with check ((auth.jwt()->>'sub') = user_id);
drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile" on public.profiles for update to authenticated using ((auth.jwt()->>'sub') = user_id) with check ((auth.jwt()->>'sub') = user_id);

drop policy if exists "Signed-in users can read posts" on public.posts;
create policy "Signed-in users can read posts" on public.posts for select to authenticated using (auth.jwt()->>'sub' is not null);
drop policy if exists "Users can create their own posts" on public.posts;
create policy "Users can create their own posts" on public.posts for insert to authenticated with check ((auth.jwt()->>'sub') = author_id);
drop policy if exists "Users can update their own posts" on public.posts;
create policy "Users can update their own posts" on public.posts for update to authenticated using ((auth.jwt()->>'sub') = author_id) with check ((auth.jwt()->>'sub') = author_id);
drop policy if exists "Users can delete their own posts" on public.posts;
create policy "Users can delete their own posts" on public.posts for delete to authenticated using ((auth.jwt()->>'sub') = author_id);

drop policy if exists "Signed-in users can read comments" on public.comments;
create policy "Signed-in users can read comments" on public.comments for select to authenticated using (auth.jwt()->>'sub' is not null);
drop policy if exists "Users can add their own comments" on public.comments;
create policy "Users can add their own comments" on public.comments for insert to authenticated with check ((auth.jwt()->>'sub') = author_id);
drop policy if exists "Users can delete their own comments" on public.comments;
create policy "Users can delete their own comments" on public.comments for delete to authenticated using ((auth.jwt()->>'sub') = author_id);

drop policy if exists "Signed-in users can read likes" on public.likes;
create policy "Signed-in users can read likes" on public.likes for select to authenticated using (auth.jwt()->>'sub' is not null);
drop policy if exists "Users can add their own likes" on public.likes;
create policy "Users can add their own likes" on public.likes for insert to authenticated with check ((auth.jwt()->>'sub') = user_id);
drop policy if exists "Users can remove their own likes" on public.likes;
create policy "Users can remove their own likes" on public.likes for delete to authenticated using ((auth.jwt()->>'sub') = user_id);

drop policy if exists "Signed-in users can read post media" on public.post_media;
create policy "Signed-in users can read post media" on public.post_media for select to authenticated using (auth.jwt()->>'sub' is not null);
drop policy if exists "Users can attach media to own posts" on public.post_media;
create policy "Users can attach media to own posts" on public.post_media for insert to authenticated with check (exists (select 1 from public.posts p where p.id = post_id and p.author_id = (auth.jwt()->>'sub')));
drop policy if exists "Owners can delete media metadata" on public.post_media;
create policy "Owners can delete media metadata" on public.post_media for delete to authenticated using (exists (select 1 from public.posts p where p.id = post_id and p.author_id = (auth.jwt()->>'sub')));

-- Storage setup: create a bucket named campus-media in Dashboard.
-- For this starter, make it public only if all campus attachments are intended to be public.
-- Restrict writes to authenticated users and use first path segment = Clerk subject.
-- For strict private media, use private bucket + signed URLs instead of getPublicUrl().
