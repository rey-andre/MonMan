<template>
  <header class="flex items-center justify-between mb-4">
    <div>
      <div class="text-[13px] text-[#41587f] font-medium flex items-center gap-1.5">
        <span>Halo, {{ authStore.userName }}</span>
        <span 
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
          :class="authStore.isAuthenticated ? 'bg-emerald-100 text-emerald-800' : 'bg-[#eaf3ff] text-[#4f8cff]'"
          :title="authStore.isAuthenticated ? 'Tersambung ke Supabase Cloud' : 'Mode Tamu Offline'"
        >
          <span 
            class="w-1.5 h-1.5 rounded-full" 
            :class="authStore.isAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-[#4f8cff]'"
          ></span>
          {{ authStore.isAuthenticated ? 'Cloud' : 'Tamu' }}
        </span>
      </div>
      <h1 class="text-[22px] font-semibold tracking-tight text-[#0f2547] mt-0.5">MonMan Finance</h1>
    </div>

    <!-- Right Controls: Sync button & Avatar (referensi-ui.html) -->
    <div class="flex items-center gap-2">
      <button
        @click="store.refreshMarketRates"
        :disabled="store.isSyncingRates"
        :title="`Terakhir diperbarui: ${store.lastRateSync ? store.lastRateSync.toLocaleTimeString('id-ID') : 'Baru saja'}`"
        class="w-9 h-9 rounded-2xl glass flex items-center justify-center text-[#41587f] hover:text-[#0f2547] active:scale-95 transition-all disabled:opacity-50"
      >
        <DynamicIcon 
          name="RefreshCw" 
          :size="15" 
          :class="{ 'animate-spin text-[#4f8cff]': store.isSyncingRates }" 
        />
      </button>

      <!-- Liquid Gradient Avatar (referensi-ui.html) -->
      <button 
        @click="$emit('open-profile')"
        type="button"
        class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold text-white shadow-sm border-2 border-white select-none shrink-0 active:scale-95 transition-transform cursor-pointer"
        style="background: linear-gradient(135deg, var(--orange), var(--blue));"
        :title="`Profil: ${authStore.userName}`"
      >
        {{ authStore.userInitial }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { useFinanceStore } from '@/stores/financeStore'
import { useAuthStore } from '@/stores/authStore'
import DynamicIcon from '@/components/DynamicIcon.vue'

defineEmits(['open-profile'])

const store = useFinanceStore()
const authStore = useAuthStore()
</script>
