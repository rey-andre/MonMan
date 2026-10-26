<template>
  <header class="flex items-center justify-between gap-2 mb-3.5">
    <!-- Left Title & Dynamic Subtitle based on Route -->
    <div class="min-w-0 flex-1">
      <div class="text-[12.5px] text-[#41587f] font-medium flex items-center gap-1.5 truncate">
        <span class="truncate">{{ pageMeta.subtitle }}</span>
        <span 
          v-if="pageMeta.isHome"
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-transparent shrink-0"
          :class="authStore.isAuthenticated 
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800/40' 
            : 'bg-[#eaf3ff] text-[#4f8cff] dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/40'"
          :title="authStore.isAuthenticated ? 'Tersambung ke Supabase Cloud' : 'Mode Tamu Offline'"
        >
          <span 
            class="w-1.5 h-1.5 rounded-full" 
            :class="authStore.isAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-[#4f8cff]'"
          ></span>
          {{ authStore.isAuthenticated ? 'Cloud' : 'Tamu' }}
        </span>
      </div>
      <h1 class="text-[20px] font-semibold tracking-tight text-[#0f2547] mt-0.5 truncate leading-tight">
        {{ pageMeta.title }}
      </h1>
    </div>

    <!-- Right Universal Controls: Privacy Toggle, Theme Toggle, Sync button & Avatar (referensi-ui.html) -->
    <div class="flex items-center gap-1.5 shrink-0">
      <!-- Privacy Eye Toggle Button -->
      <button
        @click="store.togglePrivacy"
        :title="store.isPrivacyMode ? 'Tampilkan Nilai Keuangan' : 'Sembunyikan Nilai Keuangan'"
        class="w-9 h-9 rounded-2xl glass flex items-center justify-center text-[#41587f] hover:text-[#0f2547] active:scale-95 transition-all cursor-pointer"
        aria-label="Toggle Sembunyikan Nilai"
      >
        <DynamicIcon 
          :name="store.isPrivacyMode ? 'EyeOff' : 'Eye'" 
          :size="15" 
          :class="store.isPrivacyMode ? 'text-amber-500 dark:text-amber-400' : 'text-[#41587f]'"
        />
      </button>

      <!-- Quick Theme Toggle Button -->
      <button
        @click="themeStore.toggleTheme"
        :title="`Mode ${themeStore.isDark ? 'Gelap' : 'Terang'} aktif (Klik untuk beralih)`"
        class="w-9 h-9 rounded-2xl glass flex items-center justify-center text-[#41587f] hover:text-[#0f2547] active:scale-95 transition-all cursor-pointer"
        aria-label="Ubah Tema"
      >
        <DynamicIcon 
          :name="themeStore.isDark ? 'Sun' : 'Moon'" 
          :size="15" 
          class="transition-transform duration-300 hover:rotate-12"
          :class="themeStore.isDark ? 'text-amber-400' : 'text-[#41587f]'"
        />
      </button>

      <!-- Refresh Rates Button -->
      <button
        @click="store.refreshMarketRates"
        :disabled="store.isSyncingRates"
        :title="`Terakhir diperbarui: ${store.lastRateSync ? store.lastRateSync.toLocaleTimeString('id-ID') : 'Baru saja'}`"
        class="w-9 h-9 rounded-2xl glass flex items-center justify-center text-[#41587f] hover:text-[#0f2547] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
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
        class="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold text-white shadow-sm border-2 border-white select-none shrink-0 active:scale-95 transition-transform cursor-pointer"
        style="background: linear-gradient(135deg, var(--orange), var(--blue));"
        :title="`Profil: ${authStore.userName}`"
      >
        {{ authStore.userInitial }}
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useFinanceStore } from '@/stores/financeStore'
import { useAuthStore } from '@/stores/authStore'
import { useThemeStore } from '@/stores/themeStore'
import DynamicIcon from '@/components/DynamicIcon.vue'

defineEmits(['open-profile'])

const route = useRoute()
const store = useFinanceStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const currentMonthName = computed(() => {
  return new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
})

const pageMeta = computed(() => {
  switch (route.path) {
    case '/wallets':
      return {
        title: 'Dompet & Portofolio',
        subtitle: 'Rekening fiat & aset kripto',
        isHome: false
      }
    case '/crypto':
      return {
        title: 'Portofolio Kripto',
        subtitle: 'Pertumbuhan & mutasi 10 desimal',
        isHome: false
      }
    case '/transactions':
      return {
        title: 'Riwayat Mutasi',
        subtitle: 'Pemasukan, pengeluaran & transfer',
        isHome: false
      }
    case '/insights':
      return {
        title: 'Analisis Finansial',
        subtitle: `Arus kas ${currentMonthName.value}`,
        isHome: false
      }
    default:
      return {
        title: 'MonMan Finance',
        subtitle: `Halo, ${authStore.userName}`,
        isHome: true
      }
  }
})
</script>
