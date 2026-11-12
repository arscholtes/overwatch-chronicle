-- Members of the archive: who has an account, what they say about themselves, and what they write to each other.
-- SCHEMA.md describes every table. Accounts are invite-only; a person with an account but no member row can do nothing.

create table public.member (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  roster_id  text not null unique,
  owner      boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.profile (
  roster_id  text primary key,
  bio        text not null default '' check (char_length(bio) <= 1200),
  hidden     boolean not null default false,
  updated_at timestamptz not null default now()
);

create table public.thread (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);

create table public.thread_member (
  thread_id uuid not null references public.thread (id) on delete cascade,
  user_id   uuid not null references public.member (user_id) on delete cascade,
  primary key (thread_id, user_id)
);

create table public.message (
  id        bigint generated always as identity primary key,
  thread_id uuid not null references public.thread (id) on delete cascade,
  sender    uuid not null references public.member (user_id) on delete cascade,
  body      text not null check (char_length(body) between 1 and 4000),
  sent_at   timestamptz not null default now()
);
create index message_thread_sent on public.message (thread_id, sent_at);

create table public.block (
  blocker uuid not null references public.member (user_id) on delete cascade,
  blocked uuid not null references public.member (user_id) on delete cascade,
  primary key (blocker, blocked),
  check (blocker <> blocked)
);

create table public.report (
  id         bigint generated always as identity primary key,
  message_id bigint not null references public.message (id) on delete cascade,
  reporter   uuid not null references public.member (user_id) on delete cascade,
  reason     text not null check (char_length(reason) between 1 and 1000),
  created_at timestamptz not null default now(),
  unique (message_id, reporter)
);

-- These run as their owner so a policy can ask about membership without reading through its own policy.
create function public.is_member() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.member where user_id = (select auth.uid()));
$$;

create function public.is_owner() returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.member where user_id = (select auth.uid()) and owner);
$$;

create function public.in_thread(thread uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.thread_member where thread_id = thread and user_id = (select auth.uid()));
$$;

create function public.blocked_in(thread uuid) returns boolean language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.thread_member other
    join public.block b on (b.blocker = other.user_id and b.blocked = (select auth.uid()))
                        or (b.blocker = (select auth.uid()) and b.blocked = other.user_id)
    where other.thread_id = thread and other.user_id <> (select auth.uid()));
$$;

-- The one way a conversation starts: between the caller and one other member, reusing the one they already have.
create function public.start_thread(recipient uuid) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  me uuid := auth.uid();
  found uuid;
begin
  if not public.is_member() then raise exception 'only members can write to members'; end if;
  if recipient = me then raise exception 'a conversation needs someone else in it'; end if;
  if not exists (select 1 from public.member where user_id = recipient) then raise exception 'that person is not a member'; end if;
  if exists (select 1 from public.block where (blocker = recipient and blocked = me) or (blocker = me and blocked = recipient)) then
    raise exception 'this conversation is not available';
  end if;
  select a.thread_id into found from public.thread_member a
    join public.thread_member b on b.thread_id = a.thread_id and b.user_id = recipient
    where a.user_id = me limit 1;
  if found is not null then return found; end if;
  insert into public.thread default values returning id into found;
  insert into public.thread_member (thread_id, user_id) values (found, me), (found, recipient);
  return found;
end;
$$;

-- Ties an invited account to its roster entry. Run by the owner from the SQL editor, never by the page.
create function public.add_member(member_email text, roster text, is_owner boolean default false) returns uuid language plpgsql security definer set search_path = '' as $$
declare
  account uuid;
begin
  select id into account from auth.users where lower(email) = lower(member_email);
  if account is null then raise exception 'no invited account has the address %', member_email; end if;
  insert into public.member (user_id, roster_id, owner) values (account, roster, is_owner);
  return account;
end;
$$;
revoke execute on function public.add_member(text, text, boolean) from public, anon, authenticated;
revoke execute on function public.start_thread(uuid) from public, anon;
grant execute on function public.start_thread(uuid) to authenticated;

alter table public.member        enable row level security;
alter table public.profile       enable row level security;
alter table public.thread        enable row level security;
alter table public.thread_member enable row level security;
alter table public.message       enable row level security;
alter table public.block         enable row level security;
alter table public.report        enable row level security;

revoke all on public.member, public.profile, public.thread, public.thread_member, public.message, public.block, public.report from anon, authenticated;
grant select on public.profile to anon, authenticated;
grant insert, update on public.profile to authenticated;
grant select on public.member, public.thread, public.thread_member to authenticated;
grant select, insert on public.message, public.report to authenticated;
grant select, insert, delete on public.block to authenticated;

create policy "members see who the members are" on public.member for select to authenticated using (public.is_member());

create policy "anyone reads what a member published" on public.profile for select to anon, authenticated using (true);
create policy "a member writes their own profile" on public.profile for insert to authenticated
  with check (roster_id = (select roster_id from public.member where user_id = (select auth.uid())));
create policy "a member edits their own profile" on public.profile for update to authenticated
  using (roster_id = (select roster_id from public.member where user_id = (select auth.uid())))
  with check (roster_id = (select roster_id from public.member where user_id = (select auth.uid())));

create policy "a member sees their conversations" on public.thread for select to authenticated using (public.in_thread(id));
create policy "a member sees who is in their conversations" on public.thread_member for select to authenticated using (public.in_thread(thread_id));

create policy "a member reads their conversations" on public.message for select to authenticated using (public.in_thread(thread_id));
create policy "a member writes into their conversations" on public.message for insert to authenticated
  with check (sender = (select auth.uid()) and public.in_thread(thread_id) and not public.blocked_in(thread_id));

create policy "a member sees their own blocks" on public.block for select to authenticated using (blocker = (select auth.uid()));
create policy "a member blocks another" on public.block for insert to authenticated with check (blocker = (select auth.uid()) and public.is_member());
create policy "a member lifts their own block" on public.block for delete to authenticated using (blocker = (select auth.uid()));

create policy "a member reports a message they can read" on public.report for insert to authenticated
  with check (reporter = (select auth.uid()) and exists (select 1 from public.message m where m.id = message_id and public.in_thread(m.thread_id)));
create policy "owners read reports" on public.report for select to authenticated using (public.is_owner());
