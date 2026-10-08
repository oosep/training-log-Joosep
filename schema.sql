-- Training Log: tabel + turvareeglid
create table public.items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  exercise text not null check (char_length(exercise) between 1 and 60 and trim(exercise) <> ''),
  repetitions integer not null check (repetitions between 1 and 500),
  created_at timestamptz not null default now()
);

alter table public.items enable row level security;

grant select, insert, delete on public.items to authenticated;

create policy "Guests read their own items"
on public.items
for select
to authenticated
using ((select auth.uid()) = owner_id);

create policy "Guests insert their own items"
on public.items
for insert
to authenticated
with check ((select auth.uid()) = owner_id);

create policy "Guests delete their own items"
on public.items
for delete
to authenticated
using ((select auth.uid()) = owner_id);