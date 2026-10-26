<template>
  <header class="flex items-center justify-between mb-4">
    <div>
      <div class="text-[13px] text-[#41587f] font-medium flex items-center gap-1.5">
        <span>Halo, {{ authStore.userName }}</span>
        <span 
          class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border border-transparent"
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
      <h1 class="text-[22px] font-semibold tracking-tight text-[#0f2547] mt-0.5">MonMan Finance</h1>
    </div>

    <!-- Right Controls: Privacy Toggle, Theme Toggle, Sync button & Avatar (referensi-ui.html) -->
    <div class="flex items-center gap-1.5">
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
import { useThemeStore } from '@/stores/themeStore'
import DynamicIcon from '@/components/DynamicIcon.vue'

defineEmits(['open-profile'])

const store = useFinanceStore()
const authStore = useAuthStore()
const themeStore = useThemeStore()
</script>
