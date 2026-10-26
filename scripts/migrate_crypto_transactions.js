import pg from 'pg'
import fs from 'fs'
import path from 'path'

// Load .env
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

const sql = `
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

-- RLS
alter table public.crypto_transactions enable row level security;

drop policy if exists "Users can manage own crypto_transactions" on public.crypto_transactions;
create policy "Users can manage own crypto_transactions" 
  on public.crypto_transactions for all 
  using (auth.uid() = user_id) 
  with check (auth.uid() = user_id);
`

async function run() {
  await client.connect()
  console.log('Running crypto_transactions migration on Supabase PostgreSQL...')
  await client.query(sql)
  console.log('crypto_transactions table & RLS policies successfully applied!')
  await client.end()
}

run().catch(err => {
  console.error('Migration failed:', err)
  process.exit(1)
})
