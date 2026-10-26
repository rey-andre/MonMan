import pg from 'pg'
import fs from 'fs'
import path from 'path'

// Helper to load .env if available
try {
  const envPath = path.resolve('.env')
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, 'utf8').split('\n')
    lines.forEach(line => {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/)
      if (match) {
        const key = match[1]
        let value = match[2] || ''
        if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1)
        if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1)
        if (!process.env[key]) process.env[key] = value.trim()
      }
    })
  }
} catch (e) {}

const client = new pg.Client({
  host: process.env.SUPABASE_DB_HOST || 'db.bhckedwnxqqfcykrasfo.supabase.co',
  port: Number(process.env.SUPABASE_DB_PORT) || 5432,
  database: process.env.SUPABASE_DB_NAME || 'postgres',
  user: process.env.SUPABASE_DB_USER || 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD,
  ssl: { rejectUnauthorized: false }
})

const schemaSql = `
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles Table (Optional helper for user display name & avatar)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Wallets Table (Fiat Accounts: Bank, E-Wallet, Cash)
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

-- 3. Categories Table (Income & Expense Categories)
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  type text not null check (type in ('EXPENSE', 'INCOME')),
  icon text,
  color text default '#4f8cff',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Transactions Table (Income, Expense, Transfer)
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

-- 5. Crypto Assets Table (10 Decimal Precision: numeric(20, 10))
create table if not exists public.crypto_assets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade default auth.uid() not null,
  symbol text not null,
  name text not null,
  amount numeric(20, 10) not null check (amount >= 0),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Debts Table (Hutang & Piutang)
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

-- 7. Crypto Transactions Table (Mutasi Beli / Jual Kripto)
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

-- =========================================================
-- Enable Row Level Security (RLS) on all tables
-- =========================================================
alter table public.profiles enable row level security;
alter table public.wallets enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;
alter table public.crypto_assets enable row level security;
alter table public.debts enable row level security;
alter table public.crypto_transactions enable row level security;

-- Drop existing policies if any to ensure clean re-runnability
drop policy if exists "Users can manage own profile" on public.profiles;
drop policy if exists "Users can manage own wallets" on public.wallets;
drop policy if exists "Users can read categories" on public.categories;
drop policy if exists "Users can manage own categories" on public.categories;
drop policy if exists "Users can manage own transactions" on public.transactions;
drop policy if exists "Users can manage own crypto_assets" on public.crypto_assets;
drop policy if exists "Users can manage own debts" on public.debts;
drop policy if exists "Users can manage own crypto_transactions" on public.crypto_transactions;

-- Create RLS Policies
create policy "Users can manage own profile" 
  on public.profiles for all 
  using (auth.uid() = id) 
  with check (auth.uid() = id);

create policy "Users can manage own wallets" 
  on public.wallets for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

create policy "Users can read categories" 
  on public.categories for select 
  using (user_id is null or user_id = auth.uid());

create policy "Users can manage own categories" 
  on public.categories for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

create policy "Users can manage own transactions" 
  on public.transactions for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

create policy "Users can manage own crypto_assets" 
  on public.crypto_assets for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

create policy "Users can manage own debts" 
  on public.debts for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

create policy "Users can manage own crypto_transactions" 
  on public.crypto_transactions for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);

-- =========================================================
-- Insert Default Global Categories if empty
-- =========================================================
insert into public.categories (name, type, icon, color, user_id)
select * from (
  values
    ('Makanan & Kuliner', 'EXPENSE', 'Utensils', '#ff9a4d', null::uuid),
    ('Transportasi', 'EXPENSE', 'Car', '#4f8cff', null::uuid),
    ('Belanja & Kebutuhan', 'EXPENSE', 'ShoppingBag', '#ec4899', null::uuid),
    ('Tagihan & Langganan', 'EXPENSE', 'Receipt', '#8b5cf6', null::uuid),
    ('Hiburan & Hobi', 'EXPENSE', 'Gamepad2', '#f59e0b', null::uuid),
    ('Kesehatan', 'EXPENSE', 'HeartPulse', '#ef4444', null::uuid),
    ('Lainnya', 'EXPENSE', 'MoreHorizontal', '#64748b', null::uuid),
    ('Gaji Bulanan', 'INCOME', 'Briefcase', '#10b981', null::uuid),
    ('Freelance & Projek', 'INCOME', 'Laptop', '#3b82f6', null::uuid),
    ('Investasi & Dividen', 'INCOME', 'TrendingUp', '#8b5cf6', null::uuid),
    ('Cashback & Hadiah', 'INCOME', 'Gift', '#f59e0b', null::uuid),
    ('Lainnya', 'INCOME', 'Coins', '#64748b', null::uuid)
) as v(name, type, icon, color, user_id)
where not exists (
  select 1 from public.categories where user_id is null
);
`

async function run() {
  console.log('Connecting to Supabase PostgreSQL...')
  await client.connect()
  console.log('Connected. Running migration schema...')
  await client.query(schemaSql)
  console.log('Migration executed successfully!')

  // Check categories count
  const catRes = await client.query('select count(*) from public.categories;')
  console.log('Total categories in DB:', catRes.rows[0].count)

  await client.end()
}

run().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
