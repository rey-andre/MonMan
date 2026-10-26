<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0f2547]/30 backdrop-blur-sm transition-all duration-300">
    <div class="glass-strong w-full max-w-[430px] rounded-t-[36px] sm:rounded-[36px] max-h-[90vh] overflow-y-auto no-scrollbar p-6 shadow-2xl border border-white/80 animate-in slide-in-from-bottom duration-300">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3.5 border-b border-white/60">
        <div>
          <h3 class="text-[17px] font-semibold text-[#0f2547]">{{ isEdit ? 'Edit Rekening' : 'Tambah Rekening & Dompet' }}</h3>
          <p class="text-xs text-[#41587f]">Kelola akun bank, dompet digital, atau kas tunai</p>
        </div>
        <button @click="close" class="w-8 h-8 rounded-full glass flex items-center justify-center text-[#41587f] hover:text-[#0f2547]">
          <DynamicIcon name="X" :size="15" />
        </button>
      </div>

      <!-- Type Selector -->
      <div class="grid grid-cols-3 gap-1.5 p-1.5 my-3.5 bg-white/40 rounded-2xl border border-white/60">
        <button
          v-for="t in walletTypes"
          :key="t"
          @click="form.type = t"
          type="button"
          class="py-2 text-xs font-semibold rounded-xl transition-all min-h-[38px]"
          :class="form.type === t ? 'glass-strong text-[#0f2547] shadow-xs' : 'text-[#41587f] hover:text-[#0f2547]'"
        >
          {{ t }}
        </button>
      </div>

      <!-- Presets for fast input -->
      <div class="mb-3.5">
        <div class="text-[11px] font-medium text-[#41587f] mb-1.5">Pilihan Cepat:</div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="preset in currentPresets"
            :key="preset.name"
            type="button"
            @click="applyPreset(preset)"
            class="px-2.5 py-1 rounded-xl text-xs font-medium glass hover:bg-white/70 text-[#0f2547] transition-all flex items-center gap-1.5"
          >
            <span class="w-2 h-2 rounded-full" :style="{ backgroundColor: preset.color }"></span>
            {{ preset.name }}
          </button>
        </div>
      </div>

      <!-- Form Inputs -->
      <div class="space-y-3.5">
        <div>
          <label class="block text-xs font-semibold text-[#41587f] mb-1">Nama Rekening</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="Contoh: BCA Utama, GoPay, Dompet Saku"
            class="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-semibold text-[#0f2547]"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-[#41587f] mb-1">
            {{ isEdit ? 'Saldo Saat Ini (IDR)' : 'Saldo Awal (IDR)' }}
          </label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#41587f]">Rp</span>
            <input
              v-model.number="form.balance"
              type="number"
              min="0"
              placeholder="0"
              class="w-full pl-11 pr-4 py-2.5 rounded-2xl glass-input text-base font-semibold text-[#0f2547] font-mono"
            />
          </div>
        </div>

        <!-- Color Accent -->
        <div>
          <label class="block text-xs font-semibold text-[#41587f] mb-1">Pilihan Warna Aksen</label>
          <div class="flex items-center gap-2">
            <button
              v-for="c in colorOptions"
              :key="c"
              type="button"
              @click="form.color = c"
              class="w-7 h-7 rounded-full transition-transform border-2"
              :class="form.color === c ? 'scale-110 border-[#0f2547] ring-2 ring-white' : 'border-transparent hover:scale-105'"
              :style="{ backgroundColor: c }"
            ></button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-5 flex gap-2.5">
        <button
          v-if="isEdit"
          type="button"
          @click="handleDelete"
          class="min-h-[44px] px-3.5 rounded-2xl bg-red-100 text-red-700 font-semibold text-xs hover:bg-red-200 transition-colors"
        >
          Hapus
        </button>
        <button
          type="button"
          @click="close"
          class="flex-1 min-h-[44px] rounded-2xl glass font-medium text-xs text-[#41587f] hover:text-[#0f2547] transition-all"
        >
          Batal
        </button>
        <button
          type="button"
          @click="handleSubmit"
          :disabled="!isValid"
          class="flex-1 min-h-[44px] rounded-2xl font-semibold text-xs text-white shadow-sm transition-all disabled:opacity-50"
          style="background: linear-gradient(135deg, var(--blue), #7fb0ff);"
        >
          {{ isEdit ? 'Simpan Perubahan' : 'Tambah Dompet' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFinanceStore } from '@/stores/financeStore'
import DynamicIcon from '@/components/DynamicIcon.vue'

const props = defineProps({
  isOpen: Boolean,
  walletData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])
const store = useFinanceStore()

const walletTypes = ['Bank', 'E-Wallet', 'Cash']
const colorOptions = ['#0066b2', '#003366', '#00aed6', '#10b981', '#ff9a4d', '#8b5cf6', '#ec4899']

const presets = {
  Bank: [
    { name: 'BCA', color: '#0066b2', icon: 'Building2' },
    { name: 'Mandiri', color: '#003366', icon: 'Landmark' },
    { name: 'Bank Jago', color: '#ff9a4d', icon: 'Landmark' },
    { name: 'BRI', color: '#00529c', icon: 'Building2' }
  ],
  'E-Wallet': [
    { name: 'GoPay', color: '#00aed6', icon: 'Smartphone' },
    { name: 'OVO', color: '#4c3494', icon: 'Smartphone' },
    { name: 'DANA', color: '#118eea', icon: 'Smartphone' }
  ],
  Cash: [
    { name: 'Dompet Tunai', color: '#10b981', icon: 'Banknote' },
    { name: 'Kas Darurat', color: '#f59e0b', icon: 'Banknote' }
  ]
}

const form = ref({
  id: null,
  name: '',
  type: 'Bank',
  balance: 0,
  color: '#0066b2',
  icon: 'Landmark'
})

const isEdit = computed(() => !!props.walletData?.id)

const currentPresets = computed(() => {
  return presets[form.value.type] || []
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.walletData) {
      form.value = { ...props.walletData }
    } else {
      form.value = {
        id: null,
        name: '',
        type: 'Bank',
        balance: null,
        color: '#0066b2',
        icon: 'Landmark'
      }
    }
  }
})

function applyPreset(p) {
  form.value.name = p.name
  form.value.color = p.color
  form.value.icon = p.icon
}

const isValid = computed(() => {
  return !!form.value.name.trim() && form.value.balance !== null && form.value.balance >= 0
})

function close() {
  emit('close')
}

function handleSubmit() {
  if (!isValid.value) return
  store.saveWallet({
    id: form.value.id,
    name: form.value.name,
    type: form.value.type,
    balance: form.value.balance,
    color: form.value.color,
    icon: form.value.icon
  })
  close()
}

function handleDelete() {
  if (confirm(`Yakin ingin menghapus rekening "${form.value.name}"?`)) {
    store.deleteWallet(form.value.id)
    close()
  }
}
</script>
