import { defineStore } from 'pinia'
import { fetchUsdToIdrRate, fetchCryptoPrices } from '@/services/api'
import { supabase } from '@/services/supabase'
import { formatIdr, formatCrypto, formatUsd, formatShortIdr } from '@/utils/formatters'

const STORAGE_KEY = 'monman_finance_data_v1'

const DEFAULT_WALLETS = [
  {
    id: 'w-1',
    name: 'BCA Prioritas',
    type: 'Bank',
    balance: 14850000,
    color: '#0066b2',
    icon: 'Building2'
  },
  {
    id: 'w-2',
    name: 'Bank Mandiri',
    type: 'Bank',
    balance: 6420000,
    color: '#003366',
    icon: 'Landmark'
  },
  {
    id: 'w-3',
    name: 'GoPay / e-Wallet',
    type: 'E-Wallet',
    balance: 750000,
    color: '#00aed6',
    icon: 'Smartphone'
  },
  {
    id: 'w-4',
    name: 'Dompet Tunai',
    type: 'Cash',
    balance: 380000,
    color: '#10b981',
    icon: 'Banknote'
  }
]

const DEFAULT_CATEGORIES = [
  // EXPENSES
  { id: 'cat-exp-1', name: 'Makanan & Kuliner', type: 'EXPENSE', icon: 'Utensils', color: '#ff9a4d' },
  { id: 'cat-exp-2', name: 'Transportasi', type: 'EXPENSE', icon: 'Car', color: '#4f8cff' },
  { id: 'cat-exp-3', name: 'Belanja & Kebutuhan', type: 'EXPENSE', icon: 'ShoppingBag', color: '#ec4899' },
  { id: 'cat-exp-4', name: 'Tagihan & Langganan', type: 'EXPENSE', icon: 'Receipt', color: '#8b5cf6' },
  { id: 'cat-exp-5', name: 'Hiburan & Hobi', type: 'EXPENSE', icon: 'Gamepad2', color: '#f59e0b' },
  { id: 'cat-exp-6', name: 'Kesehatan', type: 'EXPENSE', icon: 'HeartPulse', color: '#ef4444' },
  { id: 'cat-exp-7', name: 'Lainnya', type: 'EXPENSE', icon: 'MoreHorizontal', color: '#64748b' },

  // INCOMES
  { id: 'cat-inc-1', name: 'Gaji Bulanan', type: 'INCOME', icon: 'Briefcase', color: '#10b981' },
  { id: 'cat-inc-2', name: 'Freelance & Side Project', type: 'INCOME', icon: 'Laptop', color: '#3b82f6' },
  { id: 'cat-inc-3', name: 'Investasi & Dividen', type: 'INCOME', icon: 'TrendingUp', color: '#8b5cf6' },
  { id: 'cat-inc-4', name: 'Cashback & Hadiah', type: 'INCOME', icon: 'Gift', color: '#f59e0b' },
  { id: 'cat-inc-5', name: 'Lainnya', type: 'INCOME', icon: 'Coins', color: '#64748b' }
]

const DEFAULT_CRYPTO = [
  {
    id: 'c-1',
    symbol: 'BTC',
    name: 'Bitcoin',
    // 10 decimals support as per PRD
    amount: 0.0042500000
  },
  {
    id: 'c-2',
    symbol: 'ETH',
    name: 'Ethereum',
    amount: 0.0850000000
  },
  {
    id: 'c-3',
    symbol: 'SOL',
    name: 'Solana',
    amount: 1.4500000000
  }
]

const DEFAULT_CRYPTO_TRANSACTIONS = [
  {
    id: 'ctx-1',
    symbol: 'BTC',
    type: 'BUY',
    amount: 0.0042500000,
    fiatCurrency: 'USD',
    fiatAmount: 276.25,
    pricePerCoin: 65000,
    sourceWalletId: 'w-1',
    notes: 'Cicil Bitcoin bulanan DCA',
    transactionDate: '2026-09-15'
  },
  {
    id: 'ctx-2',
    symbol: 'ETH',
    type: 'BUY',
    amount: 0.0850000000,
    fiatCurrency: 'USD',
    fiatAmount: 178.50,
    pricePerCoin: 2100,
    sourceWalletId: 'w-1',
    notes: 'Akumulasi Ethereum DCA',
    transactionDate: '2026-09-20'
  },
  {
    id: 'ctx-3',
    symbol: 'SOL',
    type: 'BUY',
    amount: 1.4500000000,
    fiatCurrency: 'USD',
    fiatAmount: 123.25,
    pricePerCoin: 85,
    sourceWalletId: 'w-3',
    notes: 'Beli Solana di GoPay',
    transactionDate: '2026-10-05'
  }
]

const DEFAULT_TRANSACTIONS = [
  {
    id: 'tx-1',
    type: 'EXPENSE',
    amount: 64200,
    sourceWalletId: 'w-3',
    targetWalletId: null,
    categoryId: 'cat-exp-1',
    notes: 'Fresh Market Groceries',
    date: new Date().toISOString().split('T')[0]
  },
  {
    id: 'tx-2',
    type: 'INCOME',
    amount: 8500000,
    sourceWalletId: 'w-1',
    targetWalletId: null,
    categoryId: 'cat-inc-1',
    notes: 'Salary Deposit - Studio Project',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0]
  },
  {
    id: 'tx-3',
    type: 'EXPENSE',
    amount: 320000,
    sourceWalletId: 'w-1',
    targetWalletId: null,
    categoryId: 'cat-exp-2',
    notes: 'Tiket Perjalanan Skyline Airways',
    date: new Date(Date.now() - 172800000).toISOString().split('T')[0]
  },
  {
    id: 'tx-4',
    type: 'TRANSFER',
    amount: 500000,
    sourceWalletId: 'w-1',
    targetWalletId: 'w-3',
    categoryId: null,
    notes: 'Top up GoPay dari BCA',
    date: new Date(Date.now() - 259200000).toISOString().split('T')[0]
  }
]

const DEFAULT_DEBTS = [
  {
    id: 'd-1',
    type: 'PIUTANG',
    person: 'Budi Santoso',
    amount: 1500000,
    dueDate: '2026-11-05',
    isPaid: false,
    notes: 'Pinjaman modal usaha kecil',
    createdAt: '2026-10-15'
  },
  {
    id: 'd-2',
    type: 'HUTANG',
    person: 'Siti Rahma',
    amount: 250000,
    dueDate: '2026-10-30',
    isPaid: false,
    notes: 'Talangan belanja groceries bulanan',
    createdAt: '2026-10-20'
  },
  {
    id: 'd-3',
    type: 'PIUTANG',
    person: 'Andi Pratama',
    amount: 600000,
    dueDate: '2026-10-10',
    isPaid: true,
    notes: 'Patungan sewa lapangan futsal',
    createdAt: '2026-10-01'
  }
]

export const useFinanceStore = defineStore('finance', {
  state: () => {
    // Attempt local storage hydration
    const saved = localStorage.getItem(STORAGE_KEY)
    let parsed = null
    if (saved) {
      try {
        parsed = JSON.parse(saved)
      } catch (e) {
        console.error('Failed to parse local storage finance data', e)
      }
    }

    return {
      wallets: parsed?.wallets || DEFAULT_WALLETS,
      cryptoAssets: parsed?.cryptoAssets || DEFAULT_CRYPTO,
      cryptoTransactions: parsed?.cryptoTransactions || DEFAULT_CRYPTO_TRANSACTIONS,
      categories: parsed?.categories || DEFAULT_CATEGORIES,
      transactions: parsed?.transactions || DEFAULT_TRANSACTIONS,
      debts: parsed?.debts || DEFAULT_DEBTS,
      
      // Live Rates
      usdToIdrRate: 16250,
      cryptoPricesUsd: {
        BTC: 80170,
        ETH: 2325,
        SOL: 101.5
      },
      cryptoMeta: {},
      ratesSource: 'Initial',
      lastRateSync: null,
      isSyncingRates: false,
      syncError: null,
      isSyncingCloud: false,
      cloudSyncError: null,
      isPrivacyMode: localStorage.getItem('monman_privacy_mode') === 'true'
    }
  },

  getters: {
    // Total Fiat Wallets Balance in IDR
    totalFiatBalance(state) {
      return state.wallets.reduce((acc, w) => acc + (Number(w.balance) || 0), 0)
    },

    // Crypto assets list augmented with live USD and IDR values & Investment PnL
    cryptoListWithValues(state) {
      return state.cryptoAssets.map(asset => {
        const sym = (asset.symbol || '').toUpperCase()
        const priceUsd = state.cryptoPricesUsd[sym] || 0
        const meta = state.cryptoMeta[sym] || {}
        const amount = Number(asset.amount) || 0
        const valueUsd = amount * priceUsd
        const valueIdr = valueUsd * state.usdToIdrRate

        // Calculate Cost Basis & PnL from crypto transactions
        const coinTxs = state.cryptoTransactions.filter(t => (t.symbol || '').toUpperCase() === sym)
        let totalInvestedIdr = 0

        coinTxs.forEach(t => {
          let fiatIdr = Number(t.fiatAmount) || 0
          if (t.fiatCurrency === 'USD') {
            fiatIdr *= state.usdToIdrRate
          }

          if (t.type === 'BUY' || t.type === 'TRANSFER_IN') {
            totalInvestedIdr += fiatIdr
          } else if (t.type === 'SELL') {
            totalInvestedIdr = Math.max(0, totalInvestedIdr - fiatIdr)
          }
        })

        const totalInvestedUsd = state.usdToIdrRate > 0 ? (totalInvestedIdr / state.usdToIdrRate) : 0
        const avgBuyPriceUsd = amount > 0 && totalInvestedUsd > 0 ? (totalInvestedUsd / amount) : 0
        const avgBuyPriceIdr = avgBuyPriceUsd * state.usdToIdrRate
        const unrealizedPnlIdr = valueIdr - totalInvestedIdr
        const unrealizedPnlUsd = valueUsd - totalInvestedUsd
        const roiPercentage = totalInvestedIdr > 0 
          ? Math.round(((valueIdr - totalInvestedIdr) / totalInvestedIdr) * 1000) / 10 
          : 0

        return {
          ...asset,
          priceUsd,
          priceIdr: priceUsd * state.usdToIdrRate,
          valueUsd,
          valueIdr,
          totalInvestedIdr,
          totalInvestedUsd,
          avgBuyPriceUsd,
          avgBuyPriceIdr,
          unrealizedPnlIdr,
          unrealizedPnlUsd,
          roiPercentage,
          usdToIdrRate: state.usdToIdrRate,
          change24h: meta.change24h !== undefined ? meta.change24h : 0,
          highest: meta.highest,
          lowest: meta.lowest,
          exchange: meta.exchange || 'binance'
        }
      })
    },

    // Total Crypto Portfolio Value in IDR
    totalCryptoValueIdr(state) {
      return this.cryptoListWithValues.reduce((acc, c) => acc + (c.valueIdr || 0), 0)
    },

    // Total Fiat Capital Invested into Crypto in IDR
    totalCryptoInvestedIdr() {
      return this.cryptoListWithValues.reduce((acc, c) => acc + (c.totalInvestedIdr || 0), 0)
    },

    // Total Overall Crypto Unrealized Profit/Loss in IDR
    totalCryptoPnlIdr() {
      return this.totalCryptoValueIdr - this.totalCryptoInvestedIdr
    },

    // Total Overall Crypto ROI %
    totalCryptoRoiPercentage() {
      if (this.totalCryptoInvestedIdr <= 0) return 0
      return Math.round(((this.totalCryptoValueIdr - this.totalCryptoInvestedIdr) / this.totalCryptoInvestedIdr) * 1000) / 10
    },

    // Sorted recent crypto mutations
    recentCryptoTransactions(state) {
      return [...state.cryptoTransactions].sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate)).map(ctx => {
        const wallet = state.wallets.find(w => w.id === ctx.sourceWalletId)
        return {
          ...ctx,
          sourceWallet: wallet
        }
      })
    },

    // Grand Total Net Worth (Fiat + Crypto) in IDR
    totalNetWorth(state) {
      return this.totalFiatBalance + this.totalCryptoValueIdr
    },

    // Crypto percentage of total net worth
    cryptoPercentage() {
      if (this.totalNetWorth <= 0) return 0
      return Math.round((this.totalCryptoValueIdr / this.totalNetWorth) * 100)
    },

    // Sorted recent transactions with full category and wallet metadata
    recentTransactions(state) {
      return [...state.transactions].sort((a, b) => new Date(b.date) - new Date(a.date)).map(tx => {
        const category = state.categories.find(c => c.id === tx.categoryId)
        const sourceWallet = state.wallets.find(w => w.id === tx.sourceWalletId)
        const targetWallet = state.wallets.find(w => w.id === tx.targetWalletId)

        return {
          ...tx,
          category,
          sourceWallet,
          targetWallet
        }
      })
    },

    // Current Month Spending Breakdown
    monthlyExpenses(state) {
      const now = new Date()
      const curYear = now.getFullYear()
      const curMonth = now.getMonth() + 1
      const yearMonthPrefix = `${curYear}-${String(curMonth).padStart(2, '0')}`

      return state.transactions.filter(tx => {
        if (tx.type !== 'EXPENSE' || !tx.date) return false
        if (tx.date.startsWith(yearMonthPrefix)) return true
        const d = new Date(tx.date)
        return d.getFullYear() === curYear && (d.getMonth() + 1) === curMonth
      })
    },

    totalMonthlyExpense() {
      return this.monthlyExpenses.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
    },

    // Spending breakdown by category for Donut chart
    spendingByCategory(state) {
      const map = {}
      this.monthlyExpenses.forEach(tx => {
        const cat = state.categories.find(c => c.id === tx.categoryId) || {
          name: 'Lainnya',
          color: '#a9cdff'
        }
        if (!map[cat.name]) {
          map[cat.name] = {
            name: cat.name,
            color: cat.color || '#4f8cff',
            total: 0
          }
        }
        map[cat.name].total += Number(tx.amount) || 0
      })

      const total = this.totalMonthlyExpense || 1
      return Object.values(map).map(item => ({
        ...item,
        percentage: Math.round((item.total / total) * 100)
      })).sort((a, b) => b.total - a.total)
    },

    // Total Hutang yang belum lunas (Kewajiban)
    totalHutang(state) {
      return state.debts
        .filter(d => d.type === 'HUTANG' && !d.isPaid)
        .reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
    },

    // Total Piutang yang belum lunas (Hak Tagih)
    totalPiutang(state) {
      return state.debts
        .filter(d => d.type === 'PIUTANG' && !d.isPaid)
        .reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
    },

    // Saldo Bersih Hutang Piutang (Piutang - Hutang)
    netDebtBalance() {
      return this.totalPiutang - this.totalHutang
    },

    // Daftar hutang & piutang terurut
    sortedDebts(state) {
      return [...state.debts].sort((a, b) => {
        if (a.isPaid !== b.isPaid) return a.isPaid ? 1 : -1
        return new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31')
      })
    }
  },

  actions: {
    togglePrivacy() {
      this.isPrivacyMode = !this.isPrivacyMode
      localStorage.setItem('monman_privacy_mode', String(this.isPrivacyMode))
    },

    formatMoney(amount, withPrefix = true) {
      if (this.isPrivacyMode) {
        return withPrefix ? 'Rp ••••••••' : '••••••••'
      }
      return formatIdr(amount, withPrefix)
    },

    formatShortMoney(amount) {
      if (this.isPrivacyMode) {
        return '••••••'
      }
      return formatShortIdr(amount)
    },

    formatCryptoMoney(amount, maxDigits = 10) {
      if (this.isPrivacyMode) {
        return '••••••'
      }
      return formatCrypto(amount, maxDigits)
    },

    formatUsdMoney(amount) {
      if (this.isPrivacyMode) {
        return '$••••••'
      }
      return formatUsd(amount)
    },

    saveToStorage() {
      const data = {
        wallets: this.wallets,
        cryptoAssets: this.cryptoAssets,
        cryptoTransactions: this.cryptoTransactions,
        categories: this.categories,
        transactions: this.transactions,
        debts: this.debts
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    },

    // Fetch user data from Supabase Cloud Database
    async fetchUserData() {
      if (!supabase) return
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) return

      this.isSyncingCloud = true
      this.cloudSyncError = null

      try {
        // 1. Wallets
        const { data: walletsData, error: wErr } = await supabase
          .from('wallets')
          .select('*')
          .order('created_at', { ascending: true })

        if (!wErr && walletsData && walletsData.length > 0) {
          this.wallets = walletsData.map(w => ({
            id: w.id,
            name: w.name,
            type: w.type,
            balance: Number(w.balance) || 0,
            color: w.color || '#4f8cff',
            icon: w.icon || 'Building2'
          }))
        }

        // 2. Categories
        const { data: catData, error: cErr } = await supabase
          .from('categories')
          .select('*')
          .order('created_at', { ascending: true })

        if (!cErr && catData && catData.length > 0) {
          this.categories = catData.map(c => ({
            id: c.id,
            name: c.name,
            type: c.type,
            icon: c.icon,
            color: c.color || '#4f8cff'
          }))
        }

        // 3. Transactions
        const { data: txData, error: tErr } = await supabase
          .from('transactions')
          .select('*')
          .order('transaction_date', { ascending: false })
          .order('created_at', { ascending: false })

        if (!tErr && txData) {
          this.transactions = txData.map(t => ({
            id: t.id,
            type: t.type,
            amount: Number(t.amount) || 0,
            sourceWalletId: t.source_wallet_id,
            targetWalletId: t.target_wallet_id,
            categoryId: t.category_id,
            notes: t.notes || '',
            date: t.transaction_date
          }))
        }

        // 4. Crypto Assets
        const { data: cryptoData, error: crErr } = await supabase
          .from('crypto_assets')
          .select('*')
          .order('created_at', { ascending: true })

        if (!crErr && cryptoData && cryptoData.length > 0) {
          this.cryptoAssets = cryptoData.map(c => ({
            id: c.id,
            symbol: c.symbol,
            name: c.name,
            amount: Number(c.amount) || 0
          }))
        }

        // 5. Debts (Hutang & Piutang)
        const { data: debtData, error: dErr } = await supabase
          .from('debts')
          .select('*')
          .order('created_at', { ascending: false })

        if (!dErr && debtData) {
          this.debts = debtData.map(d => ({
            id: d.id,
            type: d.type,
            person: d.person,
            amount: Number(d.amount) || 0,
            dueDate: d.due_date || '',
            isPaid: Boolean(d.is_paid),
            notes: d.notes || '',
            createdAt: d.created_at
          }))
        }

        // 6. Crypto Transactions (Mutasi Beli / Jual Kripto)
        const { data: ctxData, error: ctxErr } = await supabase
          .from('crypto_transactions')
          .select('*')
          .order('transaction_date', { ascending: false })
          .order('created_at', { ascending: false })

        if (!ctxErr && ctxData && ctxData.length > 0) {
          this.cryptoTransactions = ctxData.map(c => ({
            id: c.id,
            symbol: c.symbol,
            type: c.type,
            amount: Number(c.amount) || 0,
            fiatCurrency: c.fiat_currency || 'IDR',
            fiatAmount: Number(c.fiat_amount) || 0,
            pricePerCoin: Number(c.price_per_coin) || 0,
            sourceWalletId: c.source_wallet_id,
            notes: c.notes || '',
            transactionDate: c.transaction_date
          }))
        }

        this.saveToStorage()
      } catch (err) {
        console.error('Error fetching Supabase user data:', err)
        this.cloudSyncError = err.message
      } finally {
        this.isSyncingCloud = false
      }
    },

    // Fetch live market data (USD to IDR + Crypto Prices)
    async refreshMarketRates() {
      this.isSyncingRates = true
      this.syncError = null
      try {
        const { rate, source: fxSource, rawUsdMap } = await fetchUsdToIdrRate()
        this.usdToIdrRate = rate

        const symbols = Array.from(new Set([
          ...this.cryptoAssets.map(c => c.symbol.toUpperCase()),
          'BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP', 'ADA'
        ]))

        const { prices, meta, source: cryptoSource, lastUpdated } = await fetchCryptoPrices(symbols, rawUsdMap)
        this.cryptoPricesUsd = {
          ...this.cryptoPricesUsd,
          ...prices
        }
        this.cryptoMeta = {
          ...this.cryptoMeta,
          ...meta
        }
        this.ratesSource = `${fxSource} & ${cryptoSource}`
        this.lastRateSync = lastUpdated
      } catch (err) {
        console.error('Error syncing rates:', err)
        this.syncError = err.message || 'Gagal menyinkronkan kurs'
      } finally {
        this.isSyncingRates = false
      }
    },

    // Add new Transaction and adjust Wallet balance accordingly
    async addTransaction({ type, amount, sourceWalletId, targetWalletId, categoryId, notes, date }) {
      const parsedAmount = Number(amount)
      if (!parsedAmount || parsedAmount <= 0) return false

      const tempId = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
      const newTx = {
        id: tempId,
        type,
        amount: parsedAmount,
        sourceWalletId,
        targetWalletId: type === 'TRANSFER' ? targetWalletId : null,
        categoryId: type !== 'TRANSFER' ? categoryId : null,
        notes: notes || '',
        date: date || new Date().toISOString().split('T')[0]
      }

      // Update local wallet balance
      let src = null
      let tgt = null
      if (type === 'EXPENSE') {
        src = this.wallets.find(w => w.id === sourceWalletId)
        if (src) src.balance = Math.max(0, (Number(src.balance) || 0) - parsedAmount)
      } else if (type === 'INCOME') {
        src = this.wallets.find(w => w.id === sourceWalletId)
        if (src) src.balance = (Number(src.balance) || 0) + parsedAmount
      } else if (type === 'TRANSFER') {
        src = this.wallets.find(w => w.id === sourceWalletId)
        tgt = this.wallets.find(w => w.id === targetWalletId)
        if (src) src.balance = Math.max(0, (Number(src.balance) || 0) - parsedAmount)
        if (tgt) tgt.balance = (Number(tgt.balance) || 0) + parsedAmount
      }

      this.transactions.unshift(newTx)
      this.saveToStorage()

      // Sync to Supabase if authenticated
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            const { data, error } = await supabase.from('transactions').insert({
              user_id: session.user.id,
              type,
              amount: parsedAmount,
              source_wallet_id: sourceWalletId && !sourceWalletId.startsWith('w-') ? sourceWalletId : null,
              target_wallet_id: type === 'TRANSFER' && targetWalletId && !targetWalletId.startsWith('w-') ? targetWalletId : null,
              category_id: categoryId && !categoryId.startsWith('cat-') ? categoryId : null,
              notes: notes || '',
              transaction_date: newTx.date
            }).select().single()

            if (data?.id) {
              newTx.id = data.id
              this.saveToStorage()
            }

            if (src && !src.id.startsWith('w-')) {
              await supabase.from('wallets').update({ balance: src.balance }).eq('id', src.id)
            }
            if (tgt && !tgt.id.startsWith('w-')) {
              await supabase.from('wallets').update({ balance: tgt.balance }).eq('id', tgt.id)
            }
          }
        } catch (e) {
          console.error('Supabase transaction insert error:', e)
        }
      }

      return newTx
    },

    // Delete transaction and rollback wallet balances
    async deleteTransaction(txId) {
      const idx = this.transactions.findIndex(t => t.id === txId)
      if (idx === -1) return

      const tx = this.transactions[idx]
      const amount = Number(tx.amount) || 0

      // Rollback local balances
      let src = null
      let tgt = null
      if (tx.type === 'EXPENSE') {
        src = this.wallets.find(w => w.id === tx.sourceWalletId)
        if (src) src.balance = (Number(src.balance) || 0) + amount
      } else if (tx.type === 'INCOME') {
        src = this.wallets.find(w => w.id === tx.sourceWalletId)
        if (src) src.balance = Math.max(0, (Number(src.balance) || 0) - amount)
      } else if (tx.type === 'TRANSFER') {
        src = this.wallets.find(w => w.id === tx.sourceWalletId)
        tgt = this.wallets.find(w => w.id === tx.targetWalletId)
        if (src) src.balance = (Number(src.balance) || 0) + amount
        if (tgt) tgt.balance = Math.max(0, (Number(tgt.balance) || 0) - amount)
      }

      this.transactions.splice(idx, 1)
      this.saveToStorage()

      // Sync to Supabase
      if (supabase && !txId.startsWith('tx-')) {
        try {
          await supabase.from('transactions').delete().eq('id', txId)
          if (src && !src.id.startsWith('w-')) {
            await supabase.from('wallets').update({ balance: src.balance }).eq('id', src.id)
          }
          if (tgt && !tgt.id.startsWith('w-')) {
            await supabase.from('wallets').update({ balance: tgt.balance }).eq('id', tgt.id)
          }
        } catch (e) {
          console.error('Supabase transaction delete error:', e)
        }
      }
    },

    // Add or Edit Wallet
    async saveWallet({ id, name, type, balance, color, icon }) {
      const parsedBalance = Number(balance) || 0

      if (id) {
        const idx = this.wallets.findIndex(w => w.id === id)
        if (idx !== -1) {
          this.wallets[idx] = {
            ...this.wallets[idx],
            name,
            type,
            balance: parsedBalance,
            color: color || this.wallets[idx].color,
            icon: icon || this.wallets[idx].icon
          }
        }

        if (supabase && !id.startsWith('w-')) {
          await supabase.from('wallets').update({
            name,
            type,
            balance: parsedBalance,
            color,
            icon
          }).eq('id', id)
        }
      } else {
        const tempId = `w-${Date.now()}`
        const newWallet = {
          id: tempId,
          name,
          type: type || 'Bank',
          balance: parsedBalance,
          color: color || '#4f8cff',
          icon: icon || (type === 'Bank' ? 'Landmark' : type === 'E-Wallet' ? 'Smartphone' : 'Banknote')
        }
        this.wallets.push(newWallet)

        if (supabase) {
          try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
              const { data } = await supabase.from('wallets').insert({
                user_id: session.user.id,
                name: newWallet.name,
                type: newWallet.type,
                balance: newWallet.balance,
                color: newWallet.color,
                icon: newWallet.icon
              }).select().single()

              if (data?.id) {
                newWallet.id = data.id
              }
            }
          } catch (e) {
            console.error('Supabase wallet insert error:', e)
          }
        }
      }
      this.saveToStorage()
    },

    async deleteWallet(walletId) {
      this.wallets = this.wallets.filter(w => w.id !== walletId)
      this.saveToStorage()

      if (supabase && !walletId.startsWith('w-')) {
        await supabase.from('wallets').delete().eq('id', walletId)
      }
    },

    // Add or Edit Crypto Asset (Support up to 10 decimals)
    async saveCryptoAsset({ id, symbol, name, amount }) {
      const cleanSymbol = (symbol || '').trim().toUpperCase()
      const parsedAmount = typeof amount === 'string' ? parseFloat(amount) : Number(amount)

      if (id) {
        const idx = this.cryptoAssets.findIndex(c => c.id === id)
        if (idx !== -1) {
          this.cryptoAssets[idx] = {
            ...this.cryptoAssets[idx],
            symbol: cleanSymbol,
            name: name || cleanSymbol,
            amount: parsedAmount || 0
          }
        }

        if (supabase && !id.startsWith('c-')) {
          await supabase.from('crypto_assets').update({
            symbol: cleanSymbol,
            name: name || cleanSymbol,
            amount: parsedAmount || 0,
            updated_at: new Date().toISOString()
          }).eq('id', id)
        }
      } else {
        const tempId = `c-${Date.now()}`
        const newCrypto = {
          id: tempId,
          symbol: cleanSymbol,
          name: name || cleanSymbol,
          amount: parsedAmount || 0
        }
        this.cryptoAssets.push(newCrypto)

        if (supabase) {
          try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
              const { data } = await supabase.from('crypto_assets').insert({
                user_id: session.user.id,
                symbol: cleanSymbol,
                name: name || cleanSymbol,
                amount: parsedAmount || 0
              }).select().single()

              if (data?.id) {
                newCrypto.id = data.id
              }
            }
          } catch (e) {
            console.error('Supabase crypto insert error:', e)
          }
        }
      }

      this.saveToStorage()
      this.refreshMarketRates()
    },

    async deleteCryptoAsset(assetId) {
      this.cryptoAssets = this.cryptoAssets.filter(c => c.id !== assetId)
      this.saveToStorage()

      if (supabase && !assetId.startsWith('c-')) {
        await supabase.from('crypto_assets').delete().eq('id', assetId)
      }
    },

    // Add or Edit Debt / Receivable
    async saveDebt({ id, type, person, amount, dueDate, isPaid, notes }) {
      const parsedAmount = Number(amount) || 0
      const cleanPerson = (person || '').trim()
      if (!cleanPerson || parsedAmount <= 0) return false

      if (id) {
        const idx = this.debts.findIndex(d => d.id === id)
        if (idx !== -1) {
          this.debts[idx] = {
            ...this.debts[idx],
            type: type || 'PIUTANG',
            person: cleanPerson,
            amount: parsedAmount,
            dueDate: dueDate || '',
            isPaid: Boolean(isPaid),
            notes: notes || ''
          }
        }

        if (supabase && !id.startsWith('d-')) {
          await supabase.from('debts').update({
            type: type || 'PIUTANG',
            person: cleanPerson,
            amount: parsedAmount,
            due_date: dueDate || null,
            is_paid: Boolean(isPaid),
            notes: notes || ''
          }).eq('id', id)
        }
      } else {
        const tempId = `d-${Date.now()}`
        const newDebt = {
          id: tempId,
          type: type || 'PIUTANG',
          person: cleanPerson,
          amount: parsedAmount,
          dueDate: dueDate || '',
          isPaid: false,
          notes: notes || '',
          createdAt: new Date().toISOString().split('T')[0]
        }
        this.debts.unshift(newDebt)

        if (supabase) {
          try {
            const { data: { session } } = await supabase.auth.getSession()
            if (session?.user) {
              const { data } = await supabase.from('debts').insert({
                user_id: session.user.id,
                type: newDebt.type,
                person: newDebt.person,
                amount: newDebt.amount,
                due_date: newDebt.dueDate || null,
                is_paid: false,
                notes: newDebt.notes
              }).select().single()

              if (data?.id) {
                newDebt.id = data.id
              }
            }
          } catch (e) {
            console.error('Supabase debt insert error:', e)
          }
        }
      }

      this.saveToStorage()
      return true
    },

    async deleteDebt(debtId) {
      this.debts = this.debts.filter(d => d.id !== debtId)
      this.saveToStorage()

      if (supabase && !debtId.startsWith('d-')) {
        await supabase.from('debts').delete().eq('id', debtId)
      }
    },

    async toggleDebtStatus(debtId) {
      const debt = this.debts.find(d => d.id === debtId)
      if (debt) {
        debt.isPaid = !debt.isPaid
        this.saveToStorage()

        if (supabase && !debtId.startsWith('d-')) {
          await supabase.from('debts').update({ is_paid: debt.isPaid }).eq('id', debtId)
        }
      }
    },

    // Record Crypto Mutation (BUY, SELL, TRANSFER) with Fiat Investment Tracking
    async addCryptoTransaction({ symbol, type, amount, fiatCurrency, fiatAmount, pricePerCoin, sourceWalletId, notes, transactionDate }) {
      const cleanSymbol = (symbol || '').trim().toUpperCase()
      const parsedAmount = Number(amount) || 0
      const parsedFiat = Number(fiatAmount) || 0
      if (!cleanSymbol || parsedAmount <= 0) return false

      const effectivePrice = Number(pricePerCoin) > 0 
        ? Number(pricePerCoin) 
        : (parsedAmount > 0 ? (parsedFiat / parsedAmount) : 0)

      const tempId = `ctx-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
      const newCtx = {
        id: tempId,
        symbol: cleanSymbol,
        type: type || 'BUY',
        amount: parsedAmount,
        fiatCurrency: fiatCurrency || 'IDR',
        fiatAmount: parsedFiat,
        pricePerCoin: effectivePrice,
        sourceWalletId: sourceWalletId || null,
        notes: notes || '',
        transactionDate: transactionDate || new Date().toISOString().split('T')[0]
      }

      // 1. Adjust Crypto Asset Balance
      let asset = this.cryptoAssets.find(c => c.symbol.toUpperCase() === cleanSymbol)
      if (asset) {
        if (newCtx.type === 'BUY' || newCtx.type === 'TRANSFER_IN') {
          asset.amount = (Number(asset.amount) || 0) + parsedAmount
        } else if (newCtx.type === 'SELL' || newCtx.type === 'TRANSFER_OUT') {
          asset.amount = Math.max(0, (Number(asset.amount) || 0) - parsedAmount)
        }
      } else if (newCtx.type === 'BUY' || newCtx.type === 'TRANSFER_IN') {
        const coinNames = { BTC: 'Bitcoin', ETH: 'Ethereum', SOL: 'Solana', BNB: 'BNB', DOGE: 'Dogecoin', XRP: 'Ripple', ADA: 'Cardano' }
        asset = {
          id: `c-${Date.now()}`,
          symbol: cleanSymbol,
          name: coinNames[cleanSymbol] || cleanSymbol,
          amount: parsedAmount
        }
        this.cryptoAssets.push(asset)
      }

      // 2. Adjust Source Wallet Balance if wallet selected
      let srcWallet = null
      if (sourceWalletId) {
        srcWallet = this.wallets.find(w => w.id === sourceWalletId)
        if (srcWallet) {
          let fiatInIdr = parsedFiat
          if (newCtx.fiatCurrency === 'USD') {
            fiatInIdr = parsedFiat * this.usdToIdrRate
          }

          if (newCtx.type === 'BUY') {
            srcWallet.balance = Math.max(0, (Number(srcWallet.balance) || 0) - fiatInIdr)
          } else if (newCtx.type === 'SELL') {
            srcWallet.balance = (Number(srcWallet.balance) || 0) + fiatInIdr
          }
        }
      }

      this.cryptoTransactions.unshift(newCtx)
      this.saveToStorage()

      // 3. Sync to Supabase if authenticated
      if (supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            // Insert crypto_transaction
            const { data: insertedCtx } = await supabase.from('crypto_transactions').insert({
              user_id: session.user.id,
              symbol: cleanSymbol,
              type: newCtx.type,
              amount: parsedAmount,
              fiat_currency: newCtx.fiatCurrency,
              fiat_amount: parsedFiat,
              price_per_coin: effectivePrice,
              source_wallet_id: sourceWalletId && !sourceWalletId.startsWith('w-') ? sourceWalletId : null,
              notes: newCtx.notes,
              transaction_date: newCtx.transactionDate
            }).select().single()

            if (insertedCtx?.id) {
              newCtx.id = insertedCtx.id
              this.saveToStorage()
            }

            // Update or insert crypto_assets in Supabase
            if (asset && !asset.id.startsWith('c-')) {
              await supabase.from('crypto_assets').update({
                amount: asset.amount,
                updated_at: new Date().toISOString()
              }).eq('id', asset.id)
            } else if (asset) {
              const { data: insertedAsset } = await supabase.from('crypto_assets').insert({
                user_id: session.user.id,
                symbol: cleanSymbol,
                name: asset.name,
                amount: asset.amount
              }).select().single()
              if (insertedAsset?.id) {
                asset.id = insertedAsset.id
                this.saveToStorage()
              }
            }

            // Update wallet balance in Supabase
            if (srcWallet && !srcWallet.id.startsWith('w-')) {
              await supabase.from('wallets').update({ balance: srcWallet.balance }).eq('id', srcWallet.id)
            }
          }
        } catch (err) {
          console.error('Error syncing crypto transaction to Supabase:', err)
        }
      }

      this.refreshMarketRates()
      return newCtx
    },

    // Delete Crypto Transaction & Rollback balances
    async deleteCryptoTransaction(ctxId) {
      const idx = this.cryptoTransactions.findIndex(c => c.id === ctxId)
      if (idx === -1) return

      const ctx = this.cryptoTransactions[idx]
      const amount = Number(ctx.amount) || 0
      const fiatAmount = Number(ctx.fiatAmount) || 0

      // Rollback crypto asset amount
      const asset = this.cryptoAssets.find(c => c.symbol.toUpperCase() === ctx.symbol.toUpperCase())
      if (asset) {
        if (ctx.type === 'BUY' || ctx.type === 'TRANSFER_IN') {
          asset.amount = Math.max(0, (Number(asset.amount) || 0) - amount)
        } else if (ctx.type === 'SELL' || ctx.type === 'TRANSFER_OUT') {
          asset.amount = (Number(asset.amount) || 0) + amount
        }
      }

      // Rollback source wallet
      let srcWallet = null
      if (ctx.sourceWalletId) {
        srcWallet = this.wallets.find(w => w.id === ctx.sourceWalletId)
        if (srcWallet) {
          let fiatInIdr = fiatAmount
          if (ctx.fiatCurrency === 'USD') fiatInIdr = fiatAmount * this.usdToIdrRate

          if (ctx.type === 'BUY') {
            srcWallet.balance = (Number(srcWallet.balance) || 0) + fiatInIdr
          } else if (ctx.type === 'SELL') {
            srcWallet.balance = Math.max(0, (Number(srcWallet.balance) || 0) - fiatInIdr)
          }
        }
      }

      this.cryptoTransactions.splice(idx, 1)
      this.saveToStorage()

      // Sync to Supabase
      if (supabase && !ctxId.startsWith('ctx-')) {
        try {
          await supabase.from('crypto_transactions').delete().eq('id', ctxId)
          if (asset && !asset.id.startsWith('c-')) {
            await supabase.from('crypto_assets').update({
              amount: asset.amount,
              updated_at: new Date().toISOString()
            }).eq('id', asset.id)
          }
          if (srcWallet && !srcWallet.id.startsWith('w-')) {
            await supabase.from('wallets').update({ balance: srcWallet.balance }).eq('id', srcWallet.id)
          }
        } catch (e) {
          console.error('Supabase crypto transaction delete error:', e)
        }
      }
    }
  }
})
