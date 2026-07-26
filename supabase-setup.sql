-- Run this in the Supabase SQL Editor for the HART Studio project.
-- Creates an isolated table for constellation-graph submissions with strict RLS:
-- public can only ever insert rows forced to 'pending', and can only read 'approved' rows.
-- Nothing here touches any existing table, schema, or policy.

create table public.constellation_submissions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  constellation_slug text not null default 'pangram-reaction',
  question_id text not null,
  name text not null,
  handle text,
  color text not null,
  answer_text text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected'))
);

alter table public.constellation_submissions enable row level security;

create policy "public can insert pending submissions"
  on public.constellation_submissions for insert
  to anon
  with check (status = 'pending');

create policy "public can read approved submissions"
  on public.constellation_submissions for select
  to anon
  using (status = 'approved');
