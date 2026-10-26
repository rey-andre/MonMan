<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0f2547]/30 backdrop-blur-sm transition-all duration-300">
    <div 
      class="glass-strong w-full max-w-[430px] rounded-t-[36px] sm:rounded-[36px] max-h-[90vh] overflow-y-auto no-scrollbar p-6 shadow-2xl border border-white/80 animate-in slide-in-from-bottom duration-300"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-3.5 border-b border-white/60">
        <div>
          <h3 class="text-[17px] font-semibold text-[#0f2547]">Profil Pengguna</h3>
          <p class="text-xs text-[#41587f]">Status sinkronisasi akun & cloud database</p>
        </div>
        <button 
          @click="emit('close')" 
          class="w-8 h-8 rounded-full glass flex items-center justify-center text-[#41587f] hover:text-[#0f2547] transition-colors"
          aria-label="Tutup modal"
        >
          <DynamicIcon name="X" :size="15" />
        </button>
      </div>

      <!-- User Info Card -->
      <div class="p-4 rounded-[24px] bg-white/40 border border-white/70 my-4 flex items-center gap-3.5">
        <!-- Avatar -->
        <div 
          class="w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold text-white shadow-sm border-2 border-white select-none shrink-0"
          style="background: linear-gradient(135deg, var(--orange), var(--blue));"
        >
          {{ authStore.userInitial }}
        </div>

        <div class="min-w-0 flex-1">
          <div class="text-[15px] font-semibold text-[#0f2547] truncate">
            {{ authStore.userName }}
          </div>
          <div class="text-xs text-[#41587f] truncate">
            {{ authStore.isAuthenticated ? authStore.userEmail : 'Pengguna Tamu (Offline)' }}
          </div>
          <!-- Status pill -->
          <div class="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium"
            :class="authStore.isAuthenticated ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'"
          >
            <span 
              class="w-1.5 h-1.5 rounded-full" 
              :class="authStore.isAuthenticated ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'"
            ></span>
            <span>{{ authStore.isAuthenticated ? 'Tersinkronisasi ke Supabase' : 'Penyimpanan Lokal (Tamu)' }}</span>
          </div>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="grid grid-cols-3 gap-2 text-center mb-4">
        <div class="p-2.5 rounded-2xl bg-white/35 border border-white/60">
          <div class="text-[15px] font-semibold text-[#0f2547] font-mono">{{ financeStore.wallets.length }}</div>
          <div class="text-[10.5px] text-[#41587f] mt-0.5">Rekening</div>
        </div>
        <div class="p-2.5 rounded-2xl bg-white/35 border border-white/60">
          <div class="text-[15px] font-semibold text-[#4f8cff] font-mono">{{ financeStore.cryptoAssets.length }}</div>
          <div class="text-[10.5px] text-[#41587f] mt-0.5">Kripto</div>
        </div>
        <div class="p-2.5 rounded-2xl bg-white/35 border border-white/60">
          <div class="text-[15px] font-semibold text-[#ff9a4d] font-mono">{{ financeStore.debts.length }}</div>
          <div class="text-[10.5px] text-[#41587f] mt-0.5">Hutang/Piutang</div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="space-y-2 mt-5">
        <div v-if="authStore.isAuthenticated" class="space-y-2">
          <!-- Force Cloud Sync Button -->
          <button
            @click="handleManualSync"
            :disabled="financeStore.isSyncingCloud"
            class="w-full py-3 rounded-2xl glass font-semibold text-xs text-[#0f2547] hover:bg-white/70 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <DynamicIcon 
              name="RefreshCw" 
              :size="15" 
              :class="{ 'animate-spin text-[#4f8cff]': financeStore.isSyncingCloud }" 
            />
            <span>{{ financeStore.isSyncingCloud ? 'Menyinkronkan...' : 'Sinkronkan Data Cloud' }}</span>
          </button>

          <!-- Logout Button -->
          <button
            @click="handleLogout"
            class="w-full py-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 text-red-600 font-semibold text-xs border border-red-200/50 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <DynamicIcon name="LogOut" :size="15" />
            <span>Keluar dari Akun</span>
          </button>
        </div>

        <div v-else class="space-y-2">
          <p class="text-xs text-[#41587f] leading-snug text-center mb-2">
            Masuk atau buat akun untuk menyimpan data Anda ke PostgreSQL Supabase dan mengaksesnya dari perangkat mana pun.
          </p>
          <button
            @click="goToAuth"
            class="w-full py-3.5 rounded-2xl text-white font-semibold text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
            style="background: linear-gradient(135deg, var(--blue), #7fb0ff);"
          >
            <DynamicIcon name="LogIn" :size="15" />
            <span>Masuk / Buat Akun Supabase</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useFinanceStore } from '@/stores/financeStore'
import DynamicIcon from '@/components/DynamicIcon.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close'])
const router = useRouter()
const authStore = useAuthStore()
const financeStore = useFinanceStore()

async function handleManualSync() {
  await financeStore.fetchUserData()
}

async function handleLogout() {
  await authStore.logout()
  emit('close')
}

function goToAuth() {
  emit('close')
  router.push('/auth')
}
</script>
