<template>
  <div class="min-h-full flex flex-col justify-between py-2">
    <!-- Top Bar with Back Button -->
    <div class="flex items-center justify-between pb-3">
      <button
        type="button"
        @click="handleBack"
        class="w-9 h-9 rounded-2xl glass flex items-center justify-center text-[#41587f] hover:text-[#0f2547] active:scale-95 transition-all"
        title="Kembali ke Beranda"
      >
        <DynamicIcon name="ArrowLeft" :size="16" />
      </button>
      <span class="text-xs font-semibold text-[#41587f]">Autentikasi Cloud</span>
      <div class="w-9"></div>
    </div>

    <!-- Main Liquid Glass Auth Card -->
    <div class="glass-strong p-6 rounded-[32px] border border-white/80 shadow-2xl relative z-10 my-auto">
      <!-- App Branding -->
      <div class="text-center mb-6">
        <div 
          class="w-14 h-14 mx-auto mb-3 rounded-2xl flex items-center justify-center shadow-md border-2 border-white select-none"
          style="background: linear-gradient(135deg, var(--orange), var(--blue));"
        >
          <DynamicIcon name="ShieldCheck" :size="28" class="text-white" />
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-[#0f2547]">MonMan Cloud</h1>
        <p class="text-xs text-[#41587f] mt-1">
          Sinkronisasi dompet, mutasi, dan portofolio kripto Anda ke cloud database Supabase
        </p>
      </div>

      <!-- Segmented Tab Switcher (Masuk vs Daftar) -->
      <div class="grid grid-cols-2 gap-1 p-1 bg-white/40 rounded-2xl border border-white/60 mb-5">
        <button
          type="button"
          @click="setMode('LOGIN')"
          class="py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[40px]"
          :class="mode === 'LOGIN' 
            ? 'glass-strong text-[#0f2547] shadow-xs' 
            : 'text-[#41587f] hover:text-[#0f2547]'"
        >
          <DynamicIcon name="LogIn" :size="14" />
          <span>Masuk</span>
        </button>
        <button
          type="button"
          @click="setMode('REGISTER')"
          class="py-2.5 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 min-h-[40px]"
          :class="mode === 'REGISTER' 
            ? 'glass-strong text-[#0f2547] shadow-xs' 
            : 'text-[#41587f] hover:text-[#0f2547]'"
        >
          <DynamicIcon name="UserPlus" :size="14" />
          <span>Daftar Akun</span>
        </button>
      </div>

      <!-- Error / Success Alert Banners -->
      <div 
        v-if="errorMessage" 
        class="mb-4 p-3 rounded-2xl bg-red-100/70 border border-red-200 text-red-800 text-xs flex items-start gap-2"
      >
        <DynamicIcon name="AlertCircle" :size="15" class="shrink-0 mt-0.5 text-red-600" />
        <span>{{ errorMessage }}</span>
      </div>

      <div 
        v-if="successMessage" 
        class="mb-4 p-3 rounded-2xl bg-emerald-100/70 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2"
      >
        <DynamicIcon name="CheckCircle2" :size="15" class="shrink-0 mt-0.5 text-emerald-600" />
        <span>{{ successMessage }}</span>
      </div>

      <!-- Form Inputs -->
      <form @submit.prevent="handleSubmit" class="space-y-3.5">
        <!-- Nama Lengkap (Khusus Mode Daftar) -->
        <div v-if="mode === 'REGISTER'">
          <label class="block text-xs font-semibold text-[#41587f] mb-1">Nama Lengkap</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#41587f]">
              <DynamicIcon name="User" :size="15" />
            </span>
            <input
              v-model="form.fullName"
              type="text"
              required
              placeholder="Contoh: Reynold Andre"
              class="w-full pl-10 pr-3.5 py-2.5 rounded-2xl glass-input text-xs font-semibold text-[#0f2547]"
            />
          </div>
        </div>

        <!-- Email -->
        <div>
          <label class="block text-xs font-semibold text-[#41587f] mb-1">Alamat Email</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#41587f]">
              <DynamicIcon name="Mail" :size="15" />
            </span>
            <input
              v-model="form.email"
              type="email"
              required
              autocomplete="email"
              placeholder="nama@email.com"
              class="w-full pl-10 pr-3.5 py-2.5 rounded-2xl glass-input text-xs font-semibold text-[#0f2547]"
            />
          </div>
        </div>

        <!-- Kata Sandi -->
        <div>
          <label class="block text-xs font-semibold text-[#41587f] mb-1">Kata Sandi</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#41587f]">
              <DynamicIcon name="Lock" :size="15" />
            </span>
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              minlength="6"
              autocomplete="current-password"
              placeholder="Minimal 6 karakter"
              class="w-full pl-10 pr-10 py-2.5 rounded-2xl glass-input text-xs font-semibold text-[#0f2547]"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#41587f] hover:text-[#0f2547]"
              tabindex="-1"
            >
              <DynamicIcon :name="showPassword ? 'EyeOff' : 'Eye'" :size="15" />
            </button>
          </div>
        </div>

        <!-- Submit Button -->
        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="w-full mt-2 py-3.5 rounded-2xl text-white font-semibold text-sm shadow-md transition-all active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
          style="background: linear-gradient(135deg, var(--blue), #7fb0ff);"
        >
          <DynamicIcon 
            v-if="authStore.isLoading" 
            name="RefreshCw" 
            :size="16" 
            class="animate-spin" 
          />
          <DynamicIcon 
            v-else 
            :name="mode === 'LOGIN' ? 'LogIn' : 'UserCheck'" 
            :size="16" 
          />
          <span>{{ authStore.isLoading ? 'Memproses...' : (mode === 'LOGIN' ? 'Masuk ke Akun' : 'Daftar Akun Baru') }}</span>
        </button>
      </form>

      <!-- Guest Fallback -->
      <div class="mt-4 pt-4 border-t border-white/60 text-center">
        <button
          type="button"
          @click="continueAsGuest"
          class="text-xs text-[#2b63d6] font-medium hover:underline inline-flex items-center gap-1 cursor-pointer"
        >
          <span>Gunakan mode tamu lokal tanpa login</span>
          <DynamicIcon name="ChevronRight" :size="13" />
        </button>
      </div>
    </div>

    <!-- Security footnote -->
    <div class="text-center pt-3 text-[11px] text-[#41587f]/80">
      Dilindungi dengan Row Level Security (RLS) PostgreSQL & Enkripsi Supabase Auth
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useFinanceStore } from '@/stores/financeStore'
import DynamicIcon from '@/components/DynamicIcon.vue'

const router = useRouter()
const authStore = useAuthStore()
const financeStore = useFinanceStore()

const mode = ref('LOGIN') // 'LOGIN' or 'REGISTER'
const showPassword = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  fullName: '',
  email: '',
  password: ''
})

function setMode(newMode) {
  mode.value = newMode
  errorMessage.value = ''
  successMessage.value = ''
}

function handleBack() {
  if (authStore.hasAuthChoice) {
    router.push('/')
  } else {
    continueAsGuest()
  }
}

function continueAsGuest() {
  authStore.setGuestMode()
  router.push('/')
}

async function handleSubmit() {
  errorMessage.value = ''
  successMessage.value = ''

  try {
    if (mode.value === 'LOGIN') {
      await authStore.login(form.email, form.password)
      successMessage.value = 'Berhasil masuk! Menyinkronkan data cloud...'
      await financeStore.fetchUserData()
      setTimeout(() => {
        router.push('/')
      }, 600)
    } else {
      await authStore.register(form.email, form.password, form.fullName)
      successMessage.value = 'Pendaftaran berhasil! Akun dan dompet starter siap digunakan.'
      await financeStore.fetchUserData()
      setTimeout(() => {
        router.push('/')
      }, 700)
    }
  } catch (err) {
    errorMessage.value = err.message || 'Terjadi kesalahan autentikasi'
  }
}
</script>
