<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0f2547]/30 backdrop-blur-sm transition-all duration-300">
    <div class="glass-strong w-full max-w-[430px] rounded-t-[36px] sm:rounded-[36px] max-h-[90vh] overflow-y-auto no-scrollbar p-6 shadow-2xl border border-white/80 animate-in slide-in-from-bottom duration-300">
      <!-- Header -->
      <div class="flex items-center justify-between pb-3.5 border-b border-white/60">
        <div>
          <h3 class="text-[17px] font-semibold text-[#0f2547]">{{ isEdit ? 'Edit Aset Kripto' : 'Tambah Aset Kripto' }}</h3>
          <p class="text-xs text-[#41587f]">Mendukung presisi tinggi hingga 10 desimal</p>
        </div>
        <button @click="close" class="w-8 h-8 rounded-full glass flex items-center justify-center text-[#41587f] hover:text-[#0f2547]">
          <DynamicIcon name="X" :size="15" />
        </button>
      </div>

      <!-- Quick Ticker Suggestions -->
      <div class="my-3.5">
        <div class="text-[11px] font-medium text-[#41587f] mb-1.5">Pilih Koin Populer:</div>
        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="coin in popularCoins"
            :key="coin.symbol"
            type="button"
            @click="selectPreset(coin)"
            class="px-2.5 py-1 rounded-xl text-xs font-semibold glass hover:bg-white/80 transition-all flex items-center gap-1"
            :class="form.symbol === coin.symbol 
              ? 'border-[#4f8cff] bg-white/90 text-[#4f8cff]' 
              : 'text-[#41587f]'"
          >
            <span>{{ coin.symbol }}</span>
            <span class="text-[10px] opacity-70">({{ coin.name }})</span>
          </button>
        </div>
      </div>

      <!-- Form Inputs -->
      <div class="space-y-3.5">
        <!-- Symbol & Name -->
        <div class="grid grid-cols-2 gap-2.5">
          <div>
            <label class="block text-xs font-semibold text-[#41587f] mb-1">Kode Simbol / Ticker</label>
            <input
              v-model="form.symbol"
              @input="onSymbolChange"
              type="text"
              placeholder="BTC"
              class="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-bold uppercase text-[#0f2547] placeholder-[#41587f]/40 font-mono"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-[#41587f] mb-1">Nama Koin</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Bitcoin"
              class="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-medium text-[#0f2547] placeholder-[#41587f]/40"
            />
          </div>
        </div>

        <p v-if="duplicateCoin" class="text-[11px] text-amber-600 font-medium -mt-1">
          Koin {{ duplicateCoin.symbol }} sudah ada di portofolio. Menyimpan akan memperbarui jumlah koin ini.
        </p>

        <!-- Amount (Supports 10 Decimals as required by PRD 4.4) -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs font-semibold text-[#41587f]">Jumlah Unit Koin</label>
            <span class="text-[10px] font-medium text-[#4f8cff] bg-[#eaf3ff] px-2 py-0.5 rounded-full border border-[#a9cdff]/40">
              Hingga 10 desimal
            </span>
          </div>
          <div class="relative">
            <input
              v-model="form.amount"
              type="number"
              step="0.0000000001"
              min="0"
              placeholder="0.0000000000"
              class="w-full px-3.5 py-2.5 rounded-2xl glass-input text-sm font-mono font-bold text-[#0f2547] placeholder-[#41587f]/40"
            />
          </div>
          <!-- Quick Decimal Fraction Helpers -->
          <div class="flex gap-1.5 mt-1.5 overflow-x-auto no-scrollbar">
            <button
              v-for="frac in ['0.0001', '0.005', '0.01', '0.1', '1.0']"
              :key="frac"
              type="button"
              @click="form.amount = frac"
              class="px-2 py-0.5 text-[10px] rounded-lg glass text-[#41587f] hover:text-[#0f2547] font-mono transition-colors"
            >
              {{ frac }}
            </button>
          </div>
        </div>

        <!-- Real-time Live Calculation Box (PRD 4.4) -->
        <div class="p-3.5 rounded-2xl glass border border-[#a9cdff]/50 bg-white/40 space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="text-[#41587f] font-medium">Harga Pasar (USD)</span>
            <span class="font-bold text-[#0f2547] font-mono">{{ formatUsd(currentPriceUsd) }}</span>
          </div>

          <div class="flex items-center justify-between text-xs">
            <span class="text-[#41587f] font-medium">Kurs Nilai Tukar (1 USD)</span>
            <span class="font-semibold text-[#0f2547] font-mono">{{ formatIdr(store.usdToIdrRate) }}</span>
          </div>

          <div class="pt-2 border-t border-white/60 flex items-center justify-between">
            <span class="text-xs font-bold text-[#0f2547]">Estimasi Nilai IDR:</span>
            <span class="text-sm font-extrabold text-[#4f8cff] font-mono">
              {{ store.formatMoney(calculatedIdrValue) }}
            </span>
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
          {{ isEdit ? 'Simpan Perubahan' : 'Tambah Koin' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useFinanceStore } from '@/stores/financeStore'
import { formatIdr, formatUsd } from '@/utils/formatters'
import DynamicIcon from '@/components/DynamicIcon.vue'

const props = defineProps({
  isOpen: Boolean,
  cryptoData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])
const store = useFinanceStore()

const popularCoins = [
  { symbol: 'BTC', name: 'Bitcoin' },
  { symbol: 'ETH', name: 'Ethereum' },
  { symbol: 'SOL', name: 'Solana' },
  { symbol: 'BNB', name: 'BNB' },
  { symbol: 'DOGE', name: 'Dogecoin' },
  { symbol: 'XRP', name: 'Ripple' },
  { symbol: 'ADA', name: 'Cardano' }
]

const form = ref({
  id: null,
  symbol: 'BTC',
  name: 'Bitcoin',
  amount: ''
})

const isEdit = computed(() => !!props.cryptoData?.id)

const duplicateCoin = computed(() => {
  if (isEdit.value) return null
  const sym = (form.value.symbol || '').trim().toUpperCase()
  if (!sym) return null
  return store.cryptoAssets.find(c => (c.symbol || '').toUpperCase() === sym) || null
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.cryptoData) {
      form.value = {
        id: props.cryptoData.id,
        symbol: props.cryptoData.symbol,
        name: props.cryptoData.name,
        amount: props.cryptoData.amount?.toString() || ''
      }
    } else {
      form.value = {
        id: null,
        symbol: 'BTC',
        name: 'Bitcoin',
        amount: ''
      }
    }
  }
})

function selectPreset(coin) {
  form.value.symbol = coin.symbol
  form.value.name = coin.name
}

function onSymbolChange() {
  const sym = form.value.symbol.trim().toUpperCase()
  const matched = popularCoins.find(c => c.symbol === sym)
  if (matched && !form.value.name) {
    form.value.name = matched.name
  }
}

const currentPriceUsd = computed(() => {
  const sym = (form.value.symbol || '').trim().toUpperCase()
  return store.cryptoPricesUsd[sym] || 0
})

const calculatedIdrValue = computed(() => {
  const amt = parseFloat(form.value.amount) || 0
  const price = currentPriceUsd.value
  const rate = store.usdToIdrRate || 16250
  return amt * price * rate
})

const isValid = computed(() => {
  const amt = parseFloat(form.value.amount)
  return !!form.value.symbol.trim() && !isNaN(amt) && amt >= 0
})

function close() {
  emit('close')
}

function handleSubmit() {
  if (!isValid.value) return
  store.saveCryptoAsset({
    id: form.value.id,
    symbol: form.value.symbol.trim().toUpperCase(),
    name: form.value.name.trim() || form.value.symbol.trim().toUpperCase(),
    amount: form.value.amount
  })
  close()
}

function handleDelete() {
  if (confirm(`Hapus koin ${form.value.symbol} dari portofolio?`)) {
    store.deleteCryptoAsset(form.value.id)
    close()
  }
}
</script>
