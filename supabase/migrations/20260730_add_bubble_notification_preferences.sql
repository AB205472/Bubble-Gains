create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  enabled boolean not null default false,
  breakfast_time time not null default '08:00',
  lunch_time time not null default '11:30',
  snack_time time not null default '14:45',
  recap_time time not null default '19:30',
  timezone text not null default 'America/Chicago',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.notification_preferences enable row level security;
grant select, insert, update, delete on public.notification_preferences to authenticated;
create policy "Users can view own notification preferences" on public.notification_preferences for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own notification preferences" on public.notification_preferences for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own notification preferences" on public.notification_preferences for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own notification preferences" on public.notification_preferences for delete to authenticated using ((select auth.uid()) = user_id);

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  user_agent text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, endpoint)
);

create index if not exists push_subscriptions_user_active_idx on public.push_subscriptions(user_id, active);
alter table public.push_subscriptions enable row level security;
grant select, insert, update, delete on public.push_subscriptions to authenticated;
create policy "Users can view own push subscriptions" on public.push_subscriptions for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own push subscriptions" on public.push_subscriptions for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own push subscriptions" on public.push_subscriptions for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own push subscriptions" on public.push_subscriptions for delete to authenticated using ((select auth.uid()) = user_id);
