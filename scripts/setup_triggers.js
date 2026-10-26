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

const triggerSql = `
-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  raw_name text;
begin
  raw_name := coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1));

  -- 1. Create Profile
  insert into public.profiles (id, full_name, avatar_url, updated_at)
  values (new.id, raw_name, null, now())
  on conflict (id) do nothing;

  -- 2. Create Starter Wallets
  insert into public.wallets (user_id, name, type, balance, color, icon)
  values
    (new.id, 'BCA Prioritas', 'Bank', 14850000, '#0066b2', 'Building2'),
    (new.id, 'Bank Mandiri', 'Bank', 6420000, '#003366', 'Landmark'),
    (new.id, 'GoPay / e-Wallet', 'E-Wallet', 750000, '#00aed6', 'Smartphone'),
    (new.id, 'Dompet Tunai', 'Cash', 380000, '#10b981', 'Banknote')
  on conflict do nothing;

  -- 3. Create Starter Crypto Assets (10 decimals)
  insert into public.crypto_assets (user_id, symbol, name, amount)
  values
    (new.id, 'BTC', 'Bitcoin', 0.0042500000),
    (new.id, 'ETH', 'Ethereum', 0.0850000000),
    (new.id, 'SOL', 'Solana', 1.4500000000)
  on conflict do nothing;

  -- 4. Create Starter Debts
  insert into public.debts (user_id, type, person, amount, due_date, is_paid, notes)
  values
    (new.id, 'PIUTANG', 'Budi Santoso', 1500000, '2026-11-05', false, 'Pinjaman modal usaha kecil'),
    (new.id, 'HUTANG', 'Siti Rahma', 250000, '2026-10-30', false, 'Talangan belanja groceries bulanan')
  on conflict do nothing;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Also run for existing users who do not have wallets yet
do $$
declare
  u record;
begin
  for u in select * from auth.users loop
    if not exists (select 1 from public.wallets where user_id = u.id) then
      insert into public.profiles (id, full_name, avatar_url, updated_at)
      values (u.id, coalesce(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)), null, now())
      on conflict (id) do nothing;

      insert into public.wallets (user_id, name, type, balance, color, icon)
      values
        (u.id, 'BCA Prioritas', 'Bank', 14850000, '#0066b2', 'Building2'),
        (u.id, 'Bank Mandiri', 'Bank', 6420000, '#003366', 'Landmark'),
        (u.id, 'GoPay / e-Wallet', 'E-Wallet', 750000, '#00aed6', 'Smartphone'),
        (u.id, 'Dompet Tunai', 'Cash', 380000, '#10b981', 'Banknote')
      on conflict do nothing;

      insert into public.crypto_assets (user_id, symbol, name, amount)
      values
        (u.id, 'BTC', 'Bitcoin', 0.0042500000),
        (u.id, 'ETH', 'Ethereum', 0.0850000000),
        (u.id, 'SOL', 'Solana', 1.4500000000)
      on conflict do nothing;

      insert into public.debts (user_id, type, person, amount, due_date, is_paid, notes)
      values
        (u.id, 'PIUTANG', 'Budi Santoso', 1500000, '2026-11-05', false, 'Pinjaman modal usaha kecil'),
        (u.id, 'HUTANG', 'Siti Rahma', 250000, '2026-10-30', false, 'Talangan belanja groceries bulanan')
      on conflict do nothing;
    end if;
  end loop;
end;
$$;
`

async function run() {
  await client.connect()
  console.log('Applying starter trigger & seeding existing user...')
  await client.query(triggerSql)
  console.log('Starter trigger successfully applied!')
  await client.end()
}

run().catch(err => {
  console.error('Trigger setup failed:', err)
  process.exit(1)
})
