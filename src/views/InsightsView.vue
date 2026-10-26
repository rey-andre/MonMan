<template>
  <div class="space-y-3.5">
    <!-- Monthly Cash Flow Overview Card -->
    <section class="glass p-4 rounded-[26px]" aria-label="Arus Kas">
      <h2 class="text-[14px] font-medium text-[#41587f] mb-3">Arus Kas Bulan Ini</h2>
      <div class="grid grid-cols-2 gap-2.5 mb-3">
        <!-- Pemasukan -->
        <div class="p-3 rounded-[20px] bg-white/40 border border-white/70">
          <div class="flex items-center gap-1.5 text-[12px] font-medium text-[#1f5fd1] mb-0.5">
            <DynamicIcon name="ArrowDownLeft" :size="14" />
            <span>Pemasukan</span>
          </div>
          <div class="text-[17px] font-semibold text-[#0f2547] font-mono">
            {{ store.formatMoney(totalIncomeThisMonth) }}
          </div>
        </div>

        <!-- Pengeluaran -->
        <div class="p-3 rounded-[20px] bg-white/40 border border-white/70">
          <div class="flex items-center gap-1.5 text-[12px] font-medium text-[#9a4a0c] mb-0.5">
            <DynamicIcon name="ArrowUpRight" :size="14" />
            <span>Pengeluaran</span>
          </div>
          <div class="text-[17px] font-semibold text-[#0f2547] font-mono">
            {{ store.formatMoney(store.totalMonthlyExpense) }}
          </div>
        </div>
      </div>

      <!-- Net Cash Flow / Tabungan Bersih -->
      <div class="p-3 rounded-[20px] bg-white/50 border border-white/80 flex items-center justify-between">
        <div>
          <span class="text-[12px] text-[#41587f] block">Surplus Bersih (Net Flow)</span>
          <span 
            class="text-[16px] font-semibold font-mono"
            :class="netCashFlow >= 0 ? 'text-[#1f5fd1]' : 'text-red-500'"
          >
            {{ store.isPrivacyMode ? '••••••••' : (netCashFlow >= 0 ? '+' : '−') + formatIdr(Math.abs(netCashFlow)) }}
          </span>
        </div>
        <div class="text-right">
          <span class="text-[11px] text-[#41587f] block">Rasio Tabungan</span>
          <span class="text-[14px] font-semibold text-[#0f2547] font-mono">{{ savingsRate }}%</span>
        </div>
      </div>
    </section>

    <!-- Spending Breakdown with Donut Chart -->
    <section class="glass p-4 rounded-[26px]" aria-label="Kategori Pengeluaran">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-[15px] font-semibold text-[#0f2547]">Distribusi Pengeluaran</h2>
        <span class="text-[13px] font-semibold text-[#4f8cff] font-mono">
          Total: {{ store.formatMoney(store.totalMonthlyExpense) }}
        </span>
      </div>

      <!-- SVG Donut Chart (referensi-ui.html: .donut) -->
      <svg class="w-full max-w-[130px] mx-auto my-3 block" viewBox="0 0 120 120" role="img">
        <circle
          cx="60"
          cy="60"
          r="44"
          fill="none"
          stroke="rgba(79, 140, 255, 0.15)"
          stroke-width="16"
        />

        <circle
          v-for="(seg, idx) in donutSegments"
          :key="idx"
          cx="60"
          cy="60"
          r="44"
          fill="none"
          :stroke="seg.color"
          stroke-width="16"
          :stroke-dasharray="`${seg.dashLength} 276`"
          :stroke-dashoffset="seg.dashOffset"
          transform="rotate(-90 60 60)"
          stroke-linecap="round"
          class="transition-all duration-500 ease-out"
        />

        <text x="60" y="58" text-anchor="middle" font-size="15" font-weight="600" fill="var(--ink)" font-family="Outfit,sans-serif">
          {{ store.formatShortMoney(store.totalMonthlyExpense) }}
        </text>
        <text x="60" y="74" text-anchor="middle" font-size="10" fill="var(--ink2)" font-family="Outfit,sans-serif">
          Bulan Ini
        </text>
      </svg>

      <!-- Categories Progress List -->
      <div class="mt-3 space-y-2">
        <div 
          v-for="cat in store.spendingByCategory"
          :key="cat.name"
          class="p-2.5 rounded-[18px] bg-white/40 border border-white/60 space-y-1.5"
        >
          <div class="flex items-center justify-between text-xs">
            <div class="flex items-center gap-2">
              <b class="w-2.5 h-2.5 rounded-full" :style="{ backgroundColor: cat.color }"></b>
              <span class="font-medium text-[#0f2547] text-[13px]">{{ cat.name }}</span>
            </div>
            <div class="font-mono text-[#0f2547]">
              <span class="font-semibold">{{ store.formatMoney(cat.total) }}</span>
              <span class="text-[#41587f] text-[11px] ml-1.5 font-sans">({{ cat.percentage }}%)</span>
            </div>
          </div>
          <!-- Progress bar -->
          <div class="h-2 rounded-full bg-[rgba(79,140,255,0.15)] overflow-hidden">
            <div 
              class="h-full rounded-full transition-all duration-500"
              :style="{ width: `${cat.percentage}%`, backgroundColor: cat.color }"
            ></div>
          </div>
        </div>

        <div v-if="store.spendingByCategory.length === 0" class="text-center py-4 text-xs text-[#41587f]">
          Belum ada pengeluaran tercatat bulan ini.
        </div>
      </div>
    </section>

    <!-- Manajemen Hutang & Piutang (Menggantikan Dana Darurat) -->
    <section class="glass p-4 rounded-[26px]" aria-label="Manajemen Hutang dan Piutang">
      <div class="flex items-center justify-between mb-3">
        <div class="flex items-center gap-1.5">
          <DynamicIcon name="Scale" :size="17" class="text-[#4f8cff]" />
          <h2 class="text-[15px] font-semibold text-[#0f2547]">Hutang & Piutang</h2>
        </div>
        <button
          @click="$emit('open-debt')"
          type="button"
          class="px-2.5 py-1 text-xs font-semibold rounded-xl text-[#0f2547] glass hover:bg-white/80 active:scale-95 transition-all flex items-center gap-1"
        >
          <DynamicIcon name="Plus" :size="13" />
          <span>Catat</span>
        </button>
      </div>

      <!-- Ringkasan Nilai -->
      <div class="grid grid-cols-2 gap-2.5 mb-3">
        <!-- Piutang Card -->
        <div class="p-3 rounded-[20px] bg-white/40 border border-white/60">
          <div class="flex items-center gap-1 text-[11.5px] font-medium text-[#1f5fd1] mb-0.5">
            <DynamicIcon name="ArrowDownLeft" :size="13" />
            <span>Total Piutang</span>
          </div>
          <div class="text-[16px] font-semibold text-[#0f2547] font-mono truncate">
            {{ store.formatMoney(store.totalPiutang) }}
          </div>
          <span class="text-[11px] text-[#41587f]">Hak tagih belum dibayar</span>
        </div>

        <!-- Hutang Card -->
        <div class="p-3 rounded-[20px] bg-white/40 border border-white/60">
          <div class="flex items-center gap-1 text-[11.5px] font-medium text-[#9a4a0c] mb-0.5">
            <DynamicIcon name="ArrowUpRight" :size="13" />
            <span>Total Hutang</span>
          </div>
          <div class="text-[16px] font-semibold text-[#0f2547] font-mono truncate">
            {{ store.formatMoney(store.totalHutang) }}
          </div>
          <span class="text-[11px] text-[#41587f]">Kewajiban harus dibayar</span>
        </div>
      </div>

      <!-- Filter Tabs -->
      <div class="grid grid-cols-4 gap-1 p-1 bg-white/40 rounded-2xl border border-white/60 mb-3 text-[11px]">
        <button
          v-for="tab in debtTabs"
          :key="tab.key"
          @click="debtFilter = tab.key"
          type="button"
          class="py-1.5 font-medium rounded-xl transition-all truncate text-center"
          :class="debtFilter === tab.key ? 'glass-strong text-[#0f2547] font-semibold shadow-xs' : 'text-[#41587f] hover:text-[#0f2547]'"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Debt Items List -->
      <div v-if="filteredDebts.length > 0" class="space-y-2">
        <div
          v-for="item in filteredDebts"
          :key="item.id"
          class="p-3 rounded-[20px] bg-white/40 hover:bg-white/60 border border-white/70 transition-all flex items-center justify-between gap-2.5"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <!-- Type Icon Badge -->
            <div
              class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              :class="item.isPaid 
                ? 'bg-emerald-100/80 text-emerald-700' 
                : item.type === 'PIUTANG' 
                  ? 'bg-[#eaf3ff] text-[#1f5fd1]' 
                  : 'bg-[#ffe6d1] text-[#9a4a0c]'"
            >
              <DynamicIcon 
                :name="item.isPaid ? 'Check' : (item.type === 'PIUTANG' ? 'ArrowDownLeft' : 'ArrowUpRight')" 
                :size="16" 
              />
            </div>

            <!-- Details -->
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="text-[13.5px] font-semibold text-[#0f2547] truncate">{{ item.person }}</span>
                <span
                  class="text-[10px] px-1.5 py-0.2 rounded-md font-medium"
                  :class="item.isPaid 
                    ? 'bg-emerald-100 text-emerald-800' 
                    : item.type === 'PIUTANG' 
                      ? 'bg-blue-100 text-[#1f5fd1]' 
                      : 'bg-orange-100 text-[#9a4a0c]'"
                >
                  {{ item.isPaid ? 'Lunas' : item.type === 'PIUTANG' ? 'Piutang' : 'Hutang' }}
                </span>
              </div>
              <div class="text-[11px] text-[#41587f] truncate mt-0.5">
                {{ formatDueDate(item.dueDate) }}
                <span v-if="item.notes"> · {{ item.notes }}</span>
              </div>
            </div>
          </div>

          <!-- Amount and Action buttons -->
          <div class="flex items-center gap-2 shrink-0">
            <div class="text-right">
              <div 
                class="text-[13.5px] font-semibold font-mono"
                :class="item.isPaid ? 'text-[#41587f] line-through' : item.type === 'PIUTANG' ? 'text-[#1f5fd1]' : 'text-[#9a4a0c]'"
              >
                {{ store.formatMoney(item.amount) }}
              </div>
            </div>

            <div class="flex items-center gap-1">
              <!-- Toggle status button -->
              <button
                @click="store.toggleDebtStatus(item.id)"
                type="button"
                :title="item.isPaid ? 'Tandai belum lunas' : 'Tandai lunas'"
                class="w-7 h-7 rounded-lg glass flex items-center justify-center transition-all active:scale-95"
                :class="item.isPaid ? 'text-emerald-600 bg-emerald-50' : 'text-[#41587f] hover:text-[#0f2547]'"
              >
                <DynamicIcon :name="item.isPaid ? 'CheckCircle2' : 'Circle'" :size="15" />
              </button>

              <!-- Edit button -->
              <button
                @click="$emit('edit-debt', item)"
                type="button"
                title="Edit catatan"
                class="w-7 h-7 rounded-lg glass flex items-center justify-center text-[#41587f] hover:text-[#0f2547] active:scale-95 transition-all"
              >
                <DynamicIcon name="Edit3" :size="13" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty state -->
      <div v-else class="text-center py-6 px-4 rounded-[20px] bg-white/20 border border-white/50 text-[#41587f]">
        <DynamicIcon name="CheckCircle" :size="24" class="mx-auto mb-1.5 opacity-60 text-[#4f8cff]" />
        <p class="text-xs font-medium text-[#0f2547]">Tidak ada catatan di kategori ini</p>
        <p class="text-[11px] mt-0.5">Semua kewajiban atau piutang telah terselesaikan</p>
      </div>
    </section>

    <!-- Asset Allocation Bar (Fiat vs Crypto) -->
    <section class="glass p-4 rounded-[26px]" aria-label="Alokasi Portofolio">
      <h2 class="text-[15px] font-semibold text-[#0f2547] mb-2">Alokasi Portofolio Keseluruhan</h2>
      
      <!-- Proportion Bar (referensi-ui.html: .bar) -->
      <div class="h-3 rounded-full bg-white/60 overflow-hidden flex border border-white/70 mb-2">
        <div 
          class="h-full transition-all duration-500"
          :style="{ 
            width: `${100 - store.cryptoPercentage}%`,
            background: 'var(--blue)' 
          }"
          title="Fiat"
        ></div>
        <div 
          class="h-full transition-all duration-500"
          :style="{ 
            width: `${store.cryptoPercentage}%`,
            background: 'var(--orange)' 
          }"
          title="Crypto"
        ></div>
      </div>

      <div class="grid grid-cols-2 gap-2 text-xs">
        <div class="flex items-center gap-1.5">
          <b class="w-2.5 h-2.5 rounded-full" style="background: var(--blue);"></b>
          <span class="text-[#41587f]">Fiat / Dompet:</span>
          <strong class="text-[#0f2547] font-mono">{{ 100 - store.cryptoPercentage }}%</strong>
        </div>
        <div class="flex items-center gap-1.5 justify-end">
          <b class="w-2.5 h-2.5 rounded-full" style="background: var(--orange);"></b>
          <span class="text-[#41587f]">Kripto:</span>
          <strong class="text-[#0f2547] font-mono">{{ store.cryptoPercentage }}%</strong>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from '@/stores/financeStore'
import { formatIdr } from '@/utils/formatters'
import DynamicIcon from '@/components/DynamicIcon.vue'

defineEmits(['open-debt', 'edit-debt'])

const store = useFinanceStore()
const circumference = 276.46

const currentMonthName = computed(() => {
  return new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date())
})

// Debt & Receivables State
const debtFilter = ref('ALL')
const debtTabs = [
  { key: 'ALL', label: 'Semua' },
  { key: 'PIUTANG', label: 'Piutang' },
  { key: 'HUTANG', label: 'Hutang' },
  { key: 'PAID', label: 'Lunas' }
]

const filteredDebts = computed(() => {
  if (debtFilter.value === 'ALL') {
    return store.sortedDebts
  }
  if (debtFilter.value === 'PIUTANG') {
    return store.debts.filter(d => d.type === 'PIUTANG' && !d.isPaid)
  }
  if (debtFilter.value === 'HUTANG') {
    return store.debts.filter(d => d.type === 'HUTANG' && !d.isPaid)
  }
  if (debtFilter.value === 'PAID') {
    return store.debts.filter(d => d.isPaid)
  }
  return store.sortedDebts
})

function formatDueDate(dateStr) {
  if (!dateStr) return 'Tanpa batas tempo'
  try {
    const d = new Date(dateStr)
    return 'Jatuh tempo: ' + new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).format(d)
  } catch (e) {
    return dateStr
  }
}

const totalIncomeThisMonth = computed(() => {
  const now = new Date()
  const curYear = now.getFullYear()
  const curMonth = now.getMonth()

  return store.transactions
    .filter(tx => {
      if (tx.type !== 'INCOME') return false
      const d = new Date(tx.date)
      return d.getFullYear() === curYear && d.getMonth() === curMonth
    })
    .reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0)
})

const netCashFlow = computed(() => {
  return totalIncomeThisMonth.value - store.totalMonthlyExpense
})

const savingsRate = computed(() => {
  if (totalIncomeThisMonth.value <= 0) return 0
  const rate = Math.round((netCashFlow.value / totalIncomeThisMonth.value) * 100)
  return Math.max(0, rate)
})

function formatShortIdr(val) {
  if (!val || val === 0) return 'Rp 0'
  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Jt`
  if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)} Rb`
  return `Rp ${val}`
}

const donutSegments = computed(() => {
  const cats = store.spendingByCategory
  let currentOffset = 0

  return cats.map(cat => {
    const dashLength = (cat.percentage / 100) * circumference
    const seg = {
      color: cat.color,
      dashLength: Math.max(0, dashLength - 3),
      dashOffset: -currentOffset
    }
    currentOffset += dashLength
    return seg
  })
})
</script>
