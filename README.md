# CampusConnect

A Next.js App Router campus community app starter built with **Clerk**, **Supabase Postgres**, and **Supabase Storage**.

## Included

- Clerk signup/sign-in and persistent sessions
- Student profile creation and editing
- Campus feed ordered newest first
- Create, edit, and delete own posts
- Image/PDF attachment upload
- Comments and likes with a database uniqueness constraint
- Keyword/author/category search
- Responsive layout for desktop and mobile
- SQL schema, constraints, indexes, and row-level security policies

## Requirements

- Node.js 20.9+ recommended
- npm
- A Clerk application: https://dashboard.clerk.com/
- A Supabase project: https://supabase.com/dashboard/

## 1. Install

```bash
npm install
```

Copy `.env.example` to `.env.local` and fill in your project values.

## 2. Configure Clerk

1. Create a Clerk application.
2. Enable email/password sign-in and any OAuth providers you want (for example, Google).
3. Set `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in `.env.local`.
4. In Clerk, enable the Supabase integration and configure the JWT template named `supabase` (or set `CLERK_SUPABASE_JWT_TEMPLATE` to your configured template).
5. Never expose `CLERK_SECRET_KEY` to browser code or commit `.env.local`.

Clerk's official integration guide: https://clerk.com/docs/guides/development/integrations/databases/supabase

## 3. Configure Supabase

1. Create a Supabase project.
2. Open SQL Editor and run the complete `supabase/schema.sql`.
3. In Supabase Authentication settings, add Clerk as a third-party provider using the Clerk domain shown in Clerk's Supabase integration setup.
4. Copy the project URL and publishable key into `.env.local`.
5. Create a Storage bucket named `campus-media`.

For the simplest demo, the app expects a public `campus-media` bucket because post media is rendered using public URLs. **Only use a public bucket for files that are intended to be public.** For private student/assignment files, switch to a private bucket and implement signed URL generation before launch. Add storage write/delete policies in the Supabase dashboard that restrict paths to the authenticated Clerk subject.

The SQL creates RLS policies on app tables. The Clerk subject in the session JWT must match `user_id`/`author_id`; do not disable RLS to make the app work.

## 4. Run locally

```bash
npm run dev
```

Open http://localhost:3000.

## 5. Test the quest requirements

- [ ] Sign up, sign out, sign back in, and refresh the page.
- [ ] Create a profile; edit it; verify a second account cannot edit it.
- [ ] Create two posts and confirm newest appears first.
- [ ] Edit/delete a post as its author; confirm a different user is denied.
- [ ] Upload a JPG/PNG/WebP and a PDF; confirm the post shows the attachments.
- [ ] Comment on a post and confirm it appears under that post.
- [ ] Like/unlike a post; verify repeated clicks do not create duplicate rows.
- [ ] Search by words from a post and by a profile's name; test each category.
- [ ] Test upload size/type errors and an empty search result.
- [ ] Run `npm run build` before deploying.

## Important implementation notes

- The UI and routes are a functional starter, but external Clerk/Supabase configuration is required before database-backed features can run.
- Like uniqueness is enforced by the primary key `(post_id, user_id)`. The like endpoint handles duplicate insert races, but for high concurrency, consider a single PostgreSQL RPC that atomically toggles the row and returns the count.
- Users can create comments and delete their own comments; comments by other users cannot be deleted through the app route.
- Search queries stored posts/categories and filters author names after retrieving the newest 60 results. For production-scale search, use a Postgres full-text search index or RPC that searches profiles and posts together.
- Add rate limiting, moderation/reporting, pagination, and stricter private-media authorization before a public launch.
