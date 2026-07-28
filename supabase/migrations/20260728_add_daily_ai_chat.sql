create table if not exists public.bubble_chat_days (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  status text not null default 'open' check (status in ('open','archived')),
  title text not null default 'Today with Bubble',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, entry_date)
);

create table if not exists public.bubble_chat_messages (
  id uuid primary key default gen_random_uuid(),
  chat_day_id uuid not null references public.bubble_chat_days(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  role text not null check (role in ('user','assistant')),
  content text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists bubble_chat_messages_day_created_idx
  on public.bubble_chat_messages(chat_day_id, created_at);
create index if not exists bubble_chat_messages_user_date_idx
  on public.bubble_chat_messages(user_id, entry_date, created_at);

alter table public.bubble_chat_days enable row level security;
alter table public.bubble_chat_messages enable row level security;

create policy "Users can read own chat days" on public.bubble_chat_days for select using (auth.uid() = user_id);
create policy "Users can insert own chat days" on public.bubble_chat_days for insert with check (auth.uid() = user_id);
create policy "Users can update own chat days" on public.bubble_chat_days for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own chat days" on public.bubble_chat_days for delete using (auth.uid() = user_id);

create policy "Users can read own chat messages" on public.bubble_chat_messages for select using (auth.uid() = user_id);
create policy "Users can insert own chat messages" on public.bubble_chat_messages for insert with check (auth.uid() = user_id);
create policy "Users can update own chat messages" on public.bubble_chat_messages for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own chat messages" on public.bubble_chat_messages for delete using (auth.uid() = user_id);
