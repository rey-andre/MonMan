-- ==============================================================================
-- MonMan - Supabase PostgreSQL Database Schema
-- Referensi: PRD Section 5 & Manajemen Hutang Piutang
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (User Display Name & Profile)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabel Wallets (Rekening Bank / E-Wallet / Tunai)
create table if not exists public.wallets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid() not null,
  name text not null,
  type text not null check (type in ('Bank', 'E-Wallet', 'Cash')),
  balance numeric(15, 2) not null default 0,
  color text default '#4f8cff',
  icon text default 'Building2',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabel Categories (Kategori Pemasukan & Pengeluaran)
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  type text not null check (type in ('EXPENSE', 'INCOME')),
  icon text,
  color text default '#4f8cff',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabel Transactions (Riwayat Mutasi Uang)
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid() not null,
  type text not null check (type in ('EXPENSE', 'INCOME', 'TRANSFER')),
  amount numeric(15, 2) not null check (amount > 0),
  source_wallet_id uuid references public.wallets(id) on delete cascade,
  target_wallet_id uuid references public.wallets(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null,
  notes text,
  transaction_date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Tabel Crypto Assets (Kepemilikan Koin Crypto dengan Presisi 10 Desimal)
create table if not exists public.crypto_assets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid() not null,
  symbol text not null,
  name text not null,
  amount numeric(20, 10) not null check (amount >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Tabel Debts (Hutang & Piutang)
create table if not exists public.debts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid() not null,
  type text not null check (type in ('PIUTANG', 'HUTANG')),
  person text not null,
  amount numeric(15, 2) not null check (amount > 0),
  due_date date,
  is_paid boolean not null default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Tabel Crypto Transactions (Mutasi Beli / Jual Kripto)
create table if not exists public.crypto_transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid() not null,
  crypto_asset_id uuid references public.crypto_assets(id) on delete cascade,
  symbol text not null,
  type text not null check (type in ('BUY', 'SELL', 'TRANSFER_IN', 'TRANSFER_OUT')),
  amount numeric(20, 10) not null check (amount > 0),
  fiat_currency text not null default 'IDR' check (fiat_currency in ('IDR', 'USD')),
  fiat_amount numeric(15, 2) not null default 0,
  price_per_coin numeric(20, 2) not null default 0,
  source_wallet_id uuid references public.wallets(id) on delete set null,
  notes text,
  transaction_date date default current_date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.crypto_assets enable row level security;
alter table public.debts enable row level security;
alter table public.crypto_transactions enable row level security;

-- Policies
create policy "Users can manage own profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can manage own wallets" on public.wallets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can read categories" on public.categories for select using (user_id is null or user_id = auth.uid());
create policy "Users can manage own categories" on public.categories for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own transactions" on public.transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own crypto_assets" on public.crypto_assets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own debts" on public.debts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage own crypto_transactions" on public.crypto_transactions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
