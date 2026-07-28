create table if not exists public.bubble_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  status text not null default 'draft' check (status in ('draft','final')),
  title text not null default 'Daily Story',
  summary text not null default '',
  sections jsonb not null default '{}'::jsonb,
  tags text[] not null default '{}'::text[],
  wins text[] not null default '{}'::text[],
  lessons text[] not null default '{}'::text[],
  people text[] not null default '{}'::text[],
  health jsonb not null default '{}'::jsonb,
  relationship_with_health jsonb not null default '{}'::jsonb,
  stat_gains jsonb not null default '{}'::jsonb,
  is_pivotal boolean not null default false,
  source text not null default 'chat',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, entry_date)
);
alter table public.bubble_days enable row level security;
create policy "Users can read own bubble days" on public.bubble_days for select using (auth.uid() = user_id);
create policy "Users can insert own bubble days" on public.bubble_days for insert with check (auth.uid() = user_id);
create policy "Users can update own bubble days" on public.bubble_days for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own bubble days" on public.bubble_days for delete using (auth.uid() = user_id);
create unique index if not exists daily_summaries_user_date_unique on public.daily_summaries(user_id, summary_date);
create unique index if not exists wellness_logs_user_date_unique on public.wellness_logs(user_id, log_date);
