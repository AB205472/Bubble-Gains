create table if not exists public.bubble_attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  chat_day_id uuid not null references public.bubble_chat_days(id) on delete cascade,
  message_id uuid references public.bubble_chat_messages(id) on delete set null,
  entry_date date not null,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0 and size_bytes <= 15728640),
  attachment_type text not null default 'image' check (attachment_type in ('image','meal','receipt','scale','workout','progress','general')),
  status text not null default 'uploaded' check (status in ('uploading','uploaded','analyzed','failed')),
  analysis jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists bubble_attachments_user_date_idx on public.bubble_attachments(user_id, entry_date desc);
create index if not exists bubble_attachments_message_idx on public.bubble_attachments(message_id);
create index if not exists bubble_attachments_chat_day_idx on public.bubble_attachments(chat_day_id, created_at);

alter table public.bubble_attachments enable row level security;
grant select, insert, update, delete on public.bubble_attachments to authenticated;

create policy "Users can view own bubble attachments" on public.bubble_attachments for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own bubble attachments" on public.bubble_attachments for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own bubble attachments" on public.bubble_attachments for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users can delete own bubble attachments" on public.bubble_attachments for delete to authenticated using ((select auth.uid()) = user_id);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('bubble-uploads','bubble-uploads',false,15728640,array['image/jpeg','image/png','image/webp','image/heic','image/heif'])
on conflict (id) do update set public=excluded.public,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

create policy "Users can view own bubble uploads" on storage.objects for select to authenticated using (bucket_id='bubble-uploads' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Users can upload own bubble uploads" on storage.objects for insert to authenticated with check (bucket_id='bubble-uploads' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Users can update own bubble uploads" on storage.objects for update to authenticated using (bucket_id='bubble-uploads' and (storage.foldername(name))[1]=(select auth.uid())::text) with check (bucket_id='bubble-uploads' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy "Users can delete own bubble uploads" on storage.objects for delete to authenticated using (bucket_id='bubble-uploads' and (storage.foldername(name))[1]=(select auth.uid())::text);