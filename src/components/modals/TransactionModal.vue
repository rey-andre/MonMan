<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0f2547]/30 backdrop-blur-sm transition-all duration-300">
    <div 
      class="glass-strong w-full max-w-[430px] rounded-t-[36px] sm:rounded-[36px] max-h-[90vh] overflow-y-auto no-scrollbar p-6 shadow-2xl border border-white/80 animate-in slide-in-from-bottom duration-300"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-3.5 border-b border-white/60">
        <div>
          <h3 class="text-[17px] font-semibold text-[#0f2547]">Catat Transaksi</h3>
          <p class="text-xs text-[#41587f]">Pemasukan, pengeluaran, atau pindah saldo</p>
        </div>
        <button 
          @click="close" 
          class="w-8 h-8 rounded-full glass flex items-center justify-center text-[#41587f] hover:text-[#0f2547] transition-colors"
          aria-label="Tutup modal"
        >
          <DynamicIcon name="X" :size="15" />
        </button>
      </div>

      <!-- Type Tabs -->
      <div class="grid grid-cols-3 gap-1.5 p-1.5 my-3.5 bg-white/40 rounded-2xl border border-white/60">
        <button
          v-for="t in types"
          :key="t.key"
          @click="form.type = t.key"
          class="py-2 text-xs font-semibold rounded-xl transition-all min-h-[38px]"
          :class="form.type === t.key 
            ? (t.key === 'EXPENSE' ? 'bg-[#ff9a4d] text-white shadow-sm' : t.key === 'INCOME' ? 'bg-[#4f8cff] text-white shadow-sm' : 'bg-[#a9cdff] text-[#0f2547] shadow-sm') 
            : 'text-[#41587f] hover:text-[#0f2547]'"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Form Inputs -->
      <div class="space-y-3.5">
        <!-- Nominal / Amount -->
        <div>
          <label class="block text-xs font-semibold text-[#41587f] mb-1">Nominal (IDR)</label>
          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#41587f]">Rp</span>
            <input
              v-model.number="form.amount"
              type="number"
              min="0"
              placeholder="0"
              class="w-full pl-11 pr-4 py-2.5 rounded-2xl glass-input text-lg font-semibold text-[#0f2547] font-mono"
              :class="{ '!border-rose-500 !ring-1 !ring-rose-500': isInsufficientTransfer }"
            />
          </div>
          <div v-if="isInsufficientTransfer" class="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1">
            <DynamicIcon name="AlertCircle" :size="13" />
            <span>Nominal transfer melebihi saldo rekening sumber (Maks: {{ store.formatMoney(selectedSourceWallet?.balance || 0) }})</span>
          </div>
          <!-- Quick Amount Chips -->
          <div class="flex flex-wrap gap-1.5 mt-2">
            <button
              v-for="amt in quickAmounts"
              :key="amt.value"
              @click="form.amount = (form.amount || 0) + amt.value"
              type="button"
              class="px-2.5 py-1 text-[11px] font-medium rounded-lg glass hover:bg-white/70 text-[#41587f] transition-all"
            >
              +{{ amt.label }}
            </button>
            <button
              v-if="form.amount > 0"
              @click="form.amount = 0"
              type="button"
              class="px-2 py-1 text-[11px] font-medium rounded-lg bg-red-100/70 text-red-700 hover:bg-red-200/70 transition-all"
            >
              Reset
            </button>
          </div>
        </div>

        <!-- Rekening Sumber (Source Wallet) -->
        <div>
          <label class="block text-xs font-semibold text-[#41587f] mb-1">
            {{ form.type === 'INCOME' ? 'Masuk ke Rekening' : 'Dari Rekening' }}
          </label>
          <select
            v-model="form.sourceWalletId"
            class="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm font-medium text-[#0f2547] bg-white/60 cursor-pointer"
          >
            <option v-for="w in store.wallets" :key="w.id" :value="w.id">
              {{ w.name }} (Saldo: {{ store.formatMoney(w.balance) }})
            </option>
          </select>
        </div>

        <!-- Rekening Tujuan (Hanya untuk TRANSFER) -->
        <div v-if="form.type === 'TRANSFER'">
          <label class="block text-xs font-semibold text-[#41587f] mb-1">Tujuan Rekening</label>
          <select
            v-model="form.targetWalletId"
            class="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm font-medium text-[#0f2547] bg-white/60 cursor-pointer"
          >
            <option 
              v-for="w in store.wallets.filter(w => w.id !== form.sourceWalletId)" 
              :key="w.id" 
              :value="w.id"
            >
              {{ w.name }} (Saldo: {{ store.formatMoney(w.balance) }})
            </option>
          </select>
        </div>

        <!-- Kategori (Untuk Expense & Income) -->
        <div v-if="form.type !== 'TRANSFER'">
          <label class="block text-xs font-semibold text-[#41587f] mb-1">Kategori</label>
          <div class="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto no-scrollbar p-0.5">
            <button
              v-for="cat in availableCategories"
              :key="cat.id"
              type="button"
              @click="form.categoryId = cat.id"
              class="flex items-center gap-2 p-2 rounded-xl text-left border transition-all text-xs"
              :class="form.categoryId === cat.id 
                ? 'bg-white/90 border-[#4f8cff] text-[#0f2547] font-semibold shadow-xs' 
                : 'bg-white/30 border-white/50 text-[#41587f] hover:bg-white/50'"
            >
              <div 
                class="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                :style="{ backgroundColor: cat.color + '25', color: cat.color }"
              >
                <DynamicIcon :name="cat.icon" :size="13" />
              </div>
              <span class="truncate">{{ cat.name }}</span>
            </button>
          </div>
        </div>

        <!-- Catatan & Tanggal -->
        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-xs font-semibold text-[#41587f] mb-1">Tanggal</label>
            <input
              v-model="form.date"
              type="date"
              class="w-full px-3 py-2 rounded-2xl glass-input text-xs font-medium text-[#0f2547]"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-[#41587f] mb-1">Catatan</label>
            <input
              v-model="form.notes"
              type="text"
              placeholder="Contoh: Makan siang"
              class="w-full px-3 py-2 rounded-2xl glass-input text-xs text-[#0f2547] placeholder-[#41587f]/50"
            />
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-5 flex gap-2.5">
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
          class="flex-1 min-h-[44px] rounded-2xl font-semibold text-xs text-white shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          :style="{ background: form.type === 'EXPENSE' ? 'linear-gradient(135deg, var(--orange), #f97316)' : 'linear-gradient(135deg, var(--blue), #7fb0ff)' }"
        >
          Simpan Transaksi
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFinanceStore } from '@/stores/financeStore'
import { formatIdr } from '@/utils/formatters'
import DynamicIcon from '@/components/DynamicIcon.vue'

const props = defineProps({
  isOpen: Boolean
})

const emit = defineEmits(['close'])
const store = useFinanceStore()

const types = [
  { key: 'EXPENSE', label: 'Pengeluaran' },
  { key: 'INCOME', label: 'Pemasukan' },
  { key: 'TRANSFER', label: 'Pindah Saldo' }
]

const quickAmounts = [
  { label: '50rb', value: 50000 },
  { label: '100rb', value: 100000 },
  { label: '250rb', value: 250000 },
  { label: '500rb', value: 500000 },
  { label: '1jt', value: 1000000 }
]

const form = ref({
  type: 'EXPENSE',
  amount: null,
  sourceWalletId: '',
  targetWalletId: '',
  categoryId: '',
  notes: '',
  date: new Date().toISOString().split('T')[0]
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    form.value.amount = null
    form.value.notes = ''
    form.value.date = new Date().toISOString().split('T')[0]
    if (store.wallets.length > 0) {
      form.value.sourceWalletId = store.wallets[0].id
      if (store.wallets.length > 1) {
        form.value.targetWalletId = store.wallets[1].id
      }
    }
    const cats = store.categories.filter(c => c.type === form.value.type)
    if (cats.length > 0) form.value.categoryId = cats[0].id
  }
})

watch(() => form.value.type, (newType) => {
  const cats = store.categories.filter(c => c.type === newType)
  if (cats.length > 0) {
    form.value.categoryId = cats[0].id
  }
})

const availableCategories = computed(() => {
  return store.categories.filter(c => c.type === form.value.type)
})

const selectedSourceWallet = computed(() => {
  return store.wallets.find(w => w.id === form.value.sourceWalletId) || null
})

const isInsufficientTransfer = computed(() => {
  if (form.value.type === 'TRANSFER' && selectedSourceWallet.value) {
    const amt = Number(form.value.amount) || 0
    return amt > (Number(selectedSourceWallet.value.balance) || 0)
  }
  return false
})

const isValid = computed(() => {
  if (!form.value.amount || form.value.amount <= 0) return false
  if (!form.value.sourceWalletId) return false
  if (form.value.type === 'TRANSFER') {
    if (!form.value.targetWalletId || form.value.targetWalletId === form.value.sourceWalletId) return false
    if (selectedSourceWallet.value && (Number(form.value.amount) || 0) > (Number(selectedSourceWallet.value.balance) || 0)) {
      return false
    }
    return true
  }
  return !!form.value.categoryId
})

function close() {
  emit('close')
}

function handleSubmit() {
  if (!isValid.value) return
  store.addTransaction({
    type: form.value.type,
    amount: form.value.amount,
    sourceWalletId: form.value.sourceWalletId,
    targetWalletId: form.value.targetWalletId,
    categoryId: form.value.categoryId,
    notes: form.value.notes,
    date: form.value.date
  })
  close()
}
</script>
