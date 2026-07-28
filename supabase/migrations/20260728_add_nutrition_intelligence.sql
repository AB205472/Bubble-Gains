alter table public.bubble_days
  add column if not exists nutrition jsonb not null default '{}'::jsonb,
  add column if not exists calorie_status text null
    check (calorie_status in ('deficit','maintenance','surplus','unknown'));

comment on column public.bubble_days.nutrition is
  'Daily nutrition totals, goals, estimate confidence, and coach summary.';
comment on column public.bubble_days.calorie_status is
  'User-confirmed or estimated daily energy status.';
