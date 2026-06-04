-- =============================================================
-- Peculiex — Supabase Postgres schema
-- Run this in the Supabase SQL editor (or `psql -f`) once per project.
-- All tables are written so that running this file twice is safe.
-- =============================================================

-- ==== USER SUBMISSIONS =======================================

create table if not exists public.leads (
  id          bigserial primary key,
  name        text        not null,
  email       text        not null,
  phone       text        not null,
  interest    text        not null,
  budget      text        not null,
  message     text,
  status      text        not null default 'new',
  created_at  timestamptz not null default now()
);
create index if not exists leads_created_at_idx on public.leads(created_at desc);
create index if not exists leads_email_idx      on public.leads(email);

create table if not exists public.newsletter_subscribers (
  email       text        primary key,
  created_at  timestamptz not null default now(),
  unsubscribed boolean    not null default false
);

create table if not exists public.contact_messages (
  id          bigserial primary key,
  name        text        not null,
  email       text        not null,
  subject     text        not null,
  message     text        not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.sip_shares (
  id          text        primary key,
  amount      numeric     not null,
  rate        numeric     not null,
  years       integer     not null,
  invested    numeric     not null,
  gains       numeric     not null,
  total       numeric     not null,
  created_at  timestamptz not null default now()
);

-- ==== CATALOG / SEED TABLES (read-only from frontend) =========

create table if not exists public.ticker_items (
  name        text        primary key,
  price       numeric     not null,
  chg         numeric     not null
);

create table if not exists public.indices (
  id          text        primary key,
  name        text        not null,
  price       numeric     not null,
  chg         numeric     not null
);

create table if not exists public.stocks (
  sym         text        primary key,
  name        text        not null,
  price       numeric     not null,
  chg         numeric     not null,
  vol         text        not null,
  cap         text        not null,
  cat         text        not null check (cat in ('up','stable','watch'))
);
-- Stable UUID per stock so admin CRUD can rename `sym` without losing identity.
alter table public.stocks
  add column if not exists id uuid not null default gen_random_uuid();
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'stocks_id_unique'
  ) then
    alter table public.stocks add constraint stocks_id_unique unique (id);
  end if;
end $$;
alter table public.stocks add column if not exists created_at timestamptz not null default now();
alter table public.stocks add column if not exists updated_at timestamptz not null default now();

create table if not exists public.unlisted_shares (
  name        text        primary key,
  domain      text        not null,
  sector      text        not null,
  brand       text        not null,
  initial     text        not null,
  price       numeric     not null,
  iv          text        not null,
  tag         text        not null check (tag in ('trend','avail','lim'))
);
-- Stable UUID per unlisted share so admin CRUD can rename without losing identity.
alter table public.unlisted_shares
  add column if not exists id uuid not null default gen_random_uuid();
do $$ begin
  if not exists (
    select 1 from pg_constraint where conname = 'unlisted_shares_id_unique'
  ) then
    alter table public.unlisted_shares add constraint unlisted_shares_id_unique unique (id);
  end if;
end $$;
alter table public.unlisted_shares add column if not exists logo_url text;
alter table public.unlisted_shares add column if not exists created_at timestamptz not null default now();
alter table public.unlisted_shares add column if not exists updated_at timestamptz not null default now();

create table if not exists public.products (
  title       text        primary key,
  icon        text        not null,
  body        text        not null,
  cta         text        not null,
  soon        boolean     not null default false,
  position    integer     not null default 0
);

create table if not exists public.testimonials (
  id          bigserial primary key,
  quote       text        not null,
  author      text        not null,
  role        text        not null,
  color       text        not null,
  initials    text        not null,
  position    integer     not null default 0
);

create table if not exists public.faqs (
  id          bigserial primary key,
  q           text        not null,
  a           text        not null,
  position    integer     not null default 0
);

-- ==== ACCOUNTS + WATCHLIST ===================================
--
-- We keep our own users table (`app_users`) instead of relying on
-- Supabase's built-in `auth.users` so the Express layer stays the single
-- source of truth — it issues its own HMAC tokens, validates passwords,
-- and uses the service-role key for everything. RLS stays "deny by default".

create table if not exists public.app_users (
  id            uuid        primary key,
  email         text        not null unique,
  password_hash text        not null,
  name          text        not null,
  mobile        text,
  created_at    timestamptz not null default now()
);
-- Role for the admin panel. 'user' = default, 'admin' = reserved,
-- 'superadmin' = full admin powers. Bootstrapped via SUPERADMIN_EMAIL.
alter table public.app_users
  add column if not exists role text not null default 'user'
    check (role in ('user','admin','superadmin'));
create index if not exists app_users_email_idx on public.app_users(lower(email));
create index if not exists app_users_role_idx  on public.app_users(role);

-- Email verification (OTP). The user can sign up but cannot log in until
-- they prove control of their inbox by entering the 6-digit code we send
-- to them. We never store the OTP in plaintext — only a SHA-256 hash.
alter table public.app_users
  add column if not exists email_verified       boolean     not null default false,
  add column if not exists otp_hash             text,
  add column if not exists otp_expires_at       timestamptz,
  add column if not exists otp_attempts         integer     not null default 0,
  add column if not exists otp_last_sent_at     timestamptz,
  add column if not exists otp_send_count_hour  integer     not null default 0,
  add column if not exists otp_send_window_at   timestamptz;

create table if not exists public.watchlist_items (
  id           uuid        primary key,
  user_id      uuid        not null references public.app_users(id) on delete cascade,
  symbol       text        not null,
  name         text        not null,
  added_price  numeric,
  note         text,
  created_at   timestamptz not null default now(),
  unique (user_id, symbol)
);
create index if not exists watchlist_user_idx on public.watchlist_items(user_id, created_at desc);

-- ==== ROW-LEVEL SECURITY =====================================
--
-- The Express backend uses the service-role key, which bypasses RLS.
-- We still enable RLS so that NO direct access from anon/authenticated
-- keys is possible. Anything that needs to be public goes through the API.

alter table public.leads                  enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.contact_messages       enable row level security;
alter table public.sip_shares             enable row level security;
alter table public.ticker_items           enable row level security;
alter table public.indices                enable row level security;
alter table public.stocks                 enable row level security;
alter table public.unlisted_shares        enable row level security;
alter table public.products               enable row level security;
alter table public.testimonials           enable row level security;
alter table public.faqs                   enable row level security;
alter table public.app_users              enable row level security;
alter table public.watchlist_items        enable row level security;

-- (No policies created intentionally — only the service-role key may read/write.)

-- ==== PAPER TRADING ==========================================

create table if not exists public.paper_trades (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.app_users(id) on delete cascade,
  symbol       text        not null,
  type         text        not null check (type in ('buy', 'sell')),
  quantity     integer     not null check (quantity > 0),
  price        numeric     not null,
  created_at   timestamptz not null default now()
);
create index if not exists paper_trades_user_idx on public.paper_trades(user_id, created_at desc);
create index if not exists paper_trades_symbol_idx on public.paper_trades(symbol);

alter table public.paper_trades enable row level security;
