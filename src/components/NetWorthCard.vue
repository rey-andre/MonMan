<template>
  <section class="glass p-5 rounded-[28px] relative overflow-hidden" aria-label="Total balance">
    <div class="flex items-center justify-between">
      <div class="text-[13px] text-[#41587f] font-normal">Total Kekayaan Bersih</div>
      <div class="text-[11px] font-medium text-[#41587f]/80 font-mono">
        1 USD = {{ formatIdr(store.usdToIdrRate) }}
      </div>
    </div>

    <!-- Big Net Worth Amount (referensi-ui.html: .amt) -->
    <div class="text-3xl sm:text-[38px] font-semibold tracking-[-0.03em] text-[#0f2547] mt-1 mb-2 font-sans flex items-baseline">
      <span>{{ formatIdr(store.totalNetWorth) }}</span>
    </div>

    <!-- Composition & Cashflow Chip (referensi-ui.html: .chip) -->
    <div class="flex items-center gap-1.5 flex-wrap mb-1">
      <span 
        class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border"
        :class="monthlyNetFlow >= 0 
          ? 'bg-orange-500/15 text-[#9a4a0c] border-orange-500/30 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40' 
          : 'bg-rose-500/15 text-rose-700 border-rose-500/30 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/40'"
      >
        <span>{{ monthlyNetFlow >= 0 ? '▲ +' : '▼ −' }}{{ formatIdr(Math.abs(monthlyNetFlow)) }}</span>
        <span class="text-[10px] opacity-75">bulan ini</span>
      </span>

      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium bg-blue-500/12 text-[#1a56db] border border-blue-500/25 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/40">
        <span class="flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-[#4f8cff] dark:bg-[#5d9dfc]"></span>
          <span>Fiat: {{ 100 - store.cryptoPercentage }}%</span>
        </span>
        <span class="opacity-50">·</span>
        <span class="flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-[#ff9a4d] dark:bg-[#fb923c]"></span>
          <span>Crypto: {{ store.cryptoPercentage }}%</span>
        </span>
      </span>
    </div>

    <!-- Sparkline SVG with Gradient Stroke & Area Fill (referensi-ui.html: .spark) -->
    <svg class="w-full h-20 my-1 block" viewBox="0 0 320 84" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id="spark-ln" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stop-color="#4f8cff"/>
          <stop offset="1" stop-color="#ff9a4d"/>
        </linearGradient>
        <linearGradient id="spark-fl" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#4f8cff" stop-opacity="0.28"/>
          <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
        </linearGradient>
      </defs>
      
      <!-- Area Fill -->
      <path :d="currentSparkline.fillPath" fill="url(#spark-fl)" class="transition-all duration-300"/>
      
      <!-- Line Stroke -->
      <path 
        :d="currentSparkline.linePath" 
        fill="none" 
        stroke="url(#spark-ln)" 
        stroke-width="3.5" 
        stroke-linecap="round"
        stroke-linejoin="round"
        class="transition-all duration-300"
      />
      
      <!-- Current Value Highlight Circle -->
      <circle 
        :cx="currentSparkline.endX" 
        :cy="currentSparkline.endY" 
        r="6" 
        fill="var(--white)" 
        stroke="#ff9a4d" 
        stroke-width="3"
      />
    </svg>

    <!-- Time Range Tabs (referensi-ui.html: .range) -->
    <div class="flex gap-1.5 mt-1.5" role="tablist">
      <button
        v-for="range in ranges"
        :key="range"
        @click="activeRange = range"
        class="flex-1 py-1.5 text-[13px] font-normal rounded-full transition-all duration-200 cursor-pointer text-[#41587f]"
        :class="activeRange === range 
          ? 'glass-strong font-medium text-[#0f2547] shadow-[0_2px_8px_rgba(79,140,255,0.18)]' 
          : 'hover:text-[#0f2547]'"
      >
        {{ range }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from '@/stores/financeStore'
import { formatIdr } from '@/utils/formatters'

const store = useFinanceStore()
const ranges = ['1W', '1M', '3M', '1Y']
const activeRange = ref('1M')

// Calculate real monthly net cashflow from real transactions
const monthlyNetFlow = computed(() => {
  const now = new Date()
  const curYear = now.getFullYear()
  const curMonth = now.getMonth()

  let income = 0
  let expense = 0

  store.transactions.forEach(tx => {
    const d = new Date(tx.date)
    if (d.getFullYear() === curYear && d.getMonth() === curMonth) {
      if (tx.type === 'INCOME') income += Number(tx.amount) || 0
      if (tx.type === 'EXPENSE') expense += Number(tx.amount) || 0
    }
  })

  return income - expense
})

const sparklines = {
  '1W': {
    fillPath: 'M0 62 C30 58 45 40 75 44 S120 64 150 48 S200 20 235 28 S290 14 320 10 L320 84 L0 84Z',
    linePath: 'M0 62 C30 58 45 40 75 44 S120 64 150 48 S200 20 235 28 S290 14 320 10',
    endX: 320,
    endY: 10
  },
  '1M': {
    fillPath: 'M0 62 C30 58 45 40 75 44 S120 64 150 48 S200 20 235 28 S290 14 320 10 L320 84 L0 84Z',
    linePath: 'M0 62 C30 58 45 40 75 44 S120 64 150 48 S200 20 235 28 S290 14 320 10',
    endX: 320,
    endY: 10
  },
  '3M': {
    fillPath: 'M0 70 C40 65 60 55 100 50 S160 35 200 38 S260 22 320 14 L320 84 L0 84Z',
    linePath: 'M0 70 C40 65 60 55 100 50 S160 35 200 38 S260 22 320 14',
    endX: 320,
    endY: 14
  },
  '1Y': {
    fillPath: 'M0 78 C40 72 90 60 140 50 S210 38 270 24 S300 16 320 8 L320 84 L0 84Z',
    linePath: 'M0 78 C40 72 90 60 140 50 S210 38 270 24 S300 16 320 8',
    endX: 320,
    endY: 8
  }
}

const currentSparkline = computed(() => {
  return sparklines[activeRange.value] || sparklines['1M']
})
</script>
