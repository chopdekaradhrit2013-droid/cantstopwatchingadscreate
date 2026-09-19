-- Run once in Supabase SQL Editor. One project for BOTH websites.

create table if not exists brands (
  id text primary key,
  name text not null,
  handle text unique not null,
  description text default '',
  website text default '',
  industry text default 'Other',
  logo text default '',
  contact_email text default '',
  instagram text default '',
  twitter text default '',
  youtube text default '',
  followers int default 0,
  plan text default 'free',
  updated_at timestamptz default now()
);

create table if not exists advertisements (
  id text primary key,
  brand_id text references brands(id) on delete cascade,
  brand_name text not null,
  title text not null,
  description text default '',
  media text default '',
  category text default 'Other',
  style text default 'Minimal',
  product text default '',
  cta text default 'Learn more',
  destination_url text default '',
  status text default 'draft',
  created_at timestamptz default now(),
  views int default 0,
  likes int default 0,
  saves int default 0,
  clicks int default 0
);

alter table brands enable row level security;
alter table advertisements enable row level security;

create policy brands_read on brands for select using (true);
create policy brands_write on brands for insert with check (true);
create policy brands_update on brands for update using (true);
create policy ads_read on advertisements for select using (true);
create policy ads_write on advertisements for insert with check (true);
create policy ads_update on advertisements for update using (true);
create policy ads_delete on advertisements for delete using (true);
