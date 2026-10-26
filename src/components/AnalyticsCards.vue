<template>
  <div class="grid grid-cols-[1.15fr_1fr] gap-3 my-2">
    <!-- Card 1: Pengeluaran Bulan Ini (referensi-ui.html: .card) -->
    <section class="glass p-4 rounded-[26px]" aria-label="Pengeluaran Bulan Ini">
      <h2 class="text-[14px] font-medium text-[#41587f] mb-2.5">Pengeluaran Bulan Ini</h2>
      
      <!-- SVG Donut Chart (referensi-ui.html: .donut) -->
      <svg class="w-full max-w-[110px] mx-auto block" viewBox="0 0 120 120" role="img">
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

        <text x="60" y="65" text-anchor="middle" font-size="14.5" font-weight="600" fill="var(--ink)" font-family="Outfit,sans-serif">
          {{ store.formatShortMoney(store.totalMonthlyExpense) }}
        </text>
      </svg>

      <!-- Legend (referensi-ui.html: .legend) -->
      <ul v-if="displayCategories.length > 0" class="mt-2.5 space-y-1.5 text-[12.5px] text-[#0f2547]">
        <li 
          v-for="cat in displayCategories" 
          :key="cat.name"
          class="flex items-center justify-between"
        >
          <div class="flex items-center gap-2 truncate">
            <b class="w-2.5 h-2.5 rounded-full shrink-0" :style="{ backgroundColor: cat.color }"></b>
            <span class="truncate text-[12px]">{{ cat.name }}</span>
          </div>
          <span class="text-[#41587f] text-[11px] font-mono shrink-0 ml-1">{{ cat.percentage }}%</span>
        </li>
      </ul>
      <div v-else class="mt-3 py-2 text-center text-[11px] text-[#41587f]">
        Belum ada pengeluaran bulan ini
      </div>
    </section>

    <!-- Card 2: Ringkasan Hutang & Piutang (referensi-ui.html: .goal) -->
    <section class="glass p-4 rounded-[26px] flex flex-col justify-between" aria-label="Ringkasan Hutang Piutang">
      <div>
        <div class="flex items-center justify-between mb-1.5">
          <h2 class="text-[14px] font-medium text-[#41587f]">Hutang & Piutang</h2>
          <router-link to="/insights" class="text-[11.5px] text-[#2b63d6] font-medium hover:underline">
            Detail
          </router-link>
        </div>

        <!-- Net Debt Balance -->
        <div 
          class="text-[20px] font-semibold tracking-[-0.02em] font-mono leading-tight"
          :class="store.netDebtBalance >= 0 ? 'text-[#0f2547]' : 'text-amber-700'"
        >
          {{ store.isPrivacyMode ? '••••••' : (store.netDebtBalance >= 0 ? '+' : '−') + formatShortIdr(Math.abs(store.netDebtBalance)) }}
        </div>
        <p class="text-[11.5px] text-[#41587f] mt-0.5 mb-2.5">
          {{ store.netDebtBalance >= 0 ? 'Surplus Hak Tagih' : 'Defisit Kewajiban' }}
        </p>

        <!-- Piutang & Hutang Breakdown Row -->
        <div class="space-y-1.5 text-xs">
          <div class="flex items-center justify-between p-1.5 rounded-xl bg-white/40">
            <span class="text-[#41587f] text-[11px] flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-[#4f8cff]"></span>
              Piutang:
            </span>
            <span class="font-mono font-semibold text-[#0f2547] text-[12px]">
              {{ store.formatShortMoney(store.totalPiutang) }}
            </span>
          </div>

          <div class="flex items-center justify-between p-1.5 rounded-xl bg-white/40">
            <span class="text-[#41587f] text-[11px] flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-[#ff9a4d]"></span>
              Hutang:
            </span>
            <span class="font-mono font-semibold text-[#0f2547] text-[12px]">
              {{ store.formatShortMoney(store.totalHutang) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Ratio Progress Bar -->
      <div class="mt-2.5">
        <div class="h-2 rounded-full bg-white/50 overflow-hidden flex border border-white/60">
          <div 
            class="h-full transition-all duration-500"
            :style="{ 
              width: `${piutangRatio}%`,
              background: 'var(--blue)' 
            }"
            title="Piutang"
          ></div>
          <div 
            class="h-full transition-all duration-500"
            :style="{ 
              width: `${100 - piutangRatio}%`,
              background: 'var(--orange)' 
            }"
            title="Hutang"
          ></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFinanceStore } from '@/stores/financeStore'
import { formatShortIdr } from '@/utils/formatters'

const store = useFinanceStore()
const circumference = 276.46

const piutangRatio = computed(() => {
  const total = store.totalPiutang + store.totalHutang
  if (total <= 0) return 50
  return Math.round((store.totalPiutang / total) * 100)
})

const displayCategories = computed(() => {
  const cats = store.spendingByCategory
  if (!cats || cats.length === 0) return []

  if (cats.length <= 3) {
    return cats
  }

  const top2 = cats.slice(0, 2)
  const rest = cats.slice(2)
  const restTotal = rest.reduce((sum, c) => sum + (Number(c.total) || 0), 0)
  const restPercentage = Math.max(0, 100 - top2.reduce((sum, c) => sum + c.percentage, 0))

  return [
    ...top2,
    {
      name: 'Lainnya',
      color: '#a9cdff',
      total: restTotal,
      percentage: restPercentage
    }
  ]
})

const donutSegments = computed(() => {
  const cats = store.spendingByCategory
  if (!cats || cats.length === 0) return []

  let currentOffset = 0

  return cats.map(cat => {
    const dashLength = (cat.percentage / 100) * circumference
    const seg = {
      color: cat.color,
      dashLength: Math.max(0, dashLength - 2),
      dashOffset: -currentOffset
    }
    currentOffset += dashLength
    return seg
  })
})
</script>
