<template>
  <div class="grid grid-cols-4 gap-2.5 my-3.5">
    <!-- Action 1: Catat Transaksi -->
    <button 
      @click="$emit('open-transaction')"
      class="glass py-3 px-1 text-center rounded-[22px] border border-white/80 active:scale-95 transition-all group cursor-pointer"
    >
      <div 
        class="w-10 h-10 mx-auto mb-1.5 rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
        style="background: linear-gradient(145deg, var(--white), var(--sky));"
      >
        <DynamicIcon name="ArrowLeftRight" :size="18" class="text-[#0f2547]" />
      </div>
      <span class="text-[12.5px] font-medium text-[#0f2547] block truncate">Transaksi</span>
    </button>

    <!-- Action 2: Tambah Dompet -->
    <button 
      @click="$emit('open-wallet')"
      class="glass py-3 px-1 text-center rounded-[22px] border border-white/80 active:scale-95 transition-all group cursor-pointer"
    >
      <div 
        class="w-10 h-10 mx-auto mb-1.5 rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
        style="background: linear-gradient(145deg, var(--white), var(--peach));"
      >
        <DynamicIcon name="Landmark" :size="18" class="text-[#0f2547]" />
      </div>
      <span class="text-[12.5px] font-medium text-[#0f2547] block truncate">+ Dompet</span>
    </button>

    <!-- Action 3: Tambah Kripto -->
    <button 
      @click="$emit('open-crypto')"
      class="glass py-3 px-1 text-center rounded-[22px] border border-white/80 active:scale-95 transition-all group cursor-pointer"
    >
      <div 
        class="w-10 h-10 mx-auto mb-1.5 rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
        style="background: linear-gradient(145deg, var(--white), #cbf3f0);"
      >
        <DynamicIcon name="Bitcoin" :size="18" class="text-[#0f2547]" />
      </div>
      <span class="text-[12.5px] font-medium text-[#0f2547] block truncate">+ Kripto</span>
    </button>

    <!-- Action 4: Refresh Live Market -->
    <button 
      @click="handleSync"
      :disabled="store.isSyncingRates"
      class="glass py-3 px-1 text-center rounded-[22px] border border-white/80 active:scale-95 transition-all group cursor-pointer disabled:opacity-60"
    >
      <div 
        class="w-10 h-10 mx-auto mb-1.5 rounded-full flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform"
        :class="{ 'animate-spin': store.isSyncingRates }"
        style="background: linear-gradient(145deg, var(--white), #ffd6e0);"
      >
        <DynamicIcon name="RefreshCw" :size="18" class="text-[#0f2547]" />
      </div>
      <span class="text-[12.5px] font-medium text-[#0f2547] block truncate">
        {{ store.isSyncingRates ? 'Memuat...' : 'Sync Kurs' }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { useFinanceStore } from '@/stores/financeStore'
import DynamicIcon from '@/components/DynamicIcon.vue'

defineEmits(['open-transaction', 'open-wallet', 'open-crypto'])
const store = useFinanceStore()

function handleSync() {
  store.refreshMarketRates()
}
</script>
