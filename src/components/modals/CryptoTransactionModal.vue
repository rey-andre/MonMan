<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0f2547]/30 backdrop-blur-sm transition-all duration-300">
    <div 
      class="glass-strong w-full max-w-[430px] rounded-t-[36px] sm:rounded-[36px] max-h-[90vh] overflow-y-auto no-scrollbar p-6 shadow-2xl border border-white/80 animate-in slide-in-from-bottom duration-300"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-3.5 border-b border-white/60">
        <div>
          <h3 class="text-[17px] font-semibold text-[#0f2547]">Catat Mutasi Kripto</h3>
          <p class="text-xs text-[#41587f]">Beli, jual, dan pantau modal investasi fiat secara akurat</p>
        </div>
        <button 
          @click="close" 
          class="w-8 h-8 rounded-full glass flex items-center justify-center text-[#41587f] hover:text-[#0f2547] transition-colors"
          aria-label="Tutup modal"
        >
          <DynamicIcon name="X" :size="15" />
        </button>
      </div>

      <!-- Type Switcher (Beli vs Jual vs Transfer In vs Transfer Out) -->
      <div class="grid grid-cols-4 gap-1 p-1 my-3.5 bg-white/40 rounded-2xl border border-white/60">
        <button
          type="button"
          @click="form.type = 'BUY'"
          class="py-2 text-[11px] font-semibold rounded-xl transition-all min-h-[38px] flex items-center justify-center gap-0.5"
          :class="form.type === 'BUY' 
            ? 'bg-emerald-500 text-white shadow-sm' 
            : 'text-[#41587f] hover:text-[#0f2547]'"
        >
          <DynamicIcon name="ArrowDownLeft" :size="12" />
          <span>Beli</span>
        </button>
        <button
          type="button"
          @click="form.type = 'SELL'"
          class="py-2 text-[11px] font-semibold rounded-xl transition-all min-h-[38px] flex items-center justify-center gap-0.5"
          :class="form.type === 'SELL' 
            ? 'bg-rose-500 text-white shadow-sm' 
            : 'text-[#41587f] hover:text-[#0f2547]'"
        >
          <DynamicIcon name="ArrowUpRight" :size="12" />
          <span>Jual</span>
        </button>
        <button
          type="button"
          @click="form.type = 'TRANSFER_IN'"
          class="py-2 text-[11px] font-semibold rounded-xl transition-all min-h-[38px] flex items-center justify-center gap-0.5"
          :class="form.type === 'TRANSFER_IN' 
            ? 'bg-[#4f8cff] text-white shadow-sm' 
            : 'text-[#41587f] hover:text-[#0f2547]'"
        >
          <DynamicIcon name="ArrowDownLeft" :size="12" />
          <span>Terima</span>
        </button>
        <button
          type="button"
          @click="form.type = 'TRANSFER_OUT'"
          class="py-2 text-[11px] font-semibold rounded-xl transition-all min-h-[38px] flex items-center justify-center gap-0.5"
          :class="form.type === 'TRANSFER_OUT' 
            ? 'bg-amber-500 text-white shadow-sm' 
            : 'text-[#41587f] hover:text-[#0f2547]'"
        >
          <DynamicIcon name="ArrowUpRight" :size="12" />
          <span>Kirim</span>
        </button>
      </div>

      <!-- Form Inputs -->
      <div class="space-y-3.5">
        <!-- Pilihan Simbol Koin -->
        <div>
          <label class="block text-xs font-semibold text-[#41587f] mb-1">Simbol Koin Kripto</label>
          <div class="flex gap-2">
            <input
              v-model="form.symbol"
              type="text"
              placeholder="Contoh: BTC, ETH, SOL, BNB"
              class="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-semibold uppercase text-[#0f2547]"
              @input="onSymbolChange"
            />
          </div>
          <!-- Quick Coin Chips -->
          <div class="flex flex-wrap gap-1.5 mt-2">
            <button
              v-for="sym in popularCoins"
              :key="sym"
              type="button"
              @click="selectCoin(sym)"
              class="px-2.5 py-1 text-[11px] font-semibold rounded-xl glass hover:bg-white/70 transition-all"
              :class="form.symbol.toUpperCase() === sym ? 'bg-[#4f8cff] text-white shadow-xs' : 'text-[#41587f]'"
            >
              {{ sym }}
            </button>
          </div>
        </div>

        <!-- Jumlah Koin (10 Desimal) -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs font-semibold text-[#41587f]">Jumlah Unit Koin (Hingga 10 Desimal)</label>
            <div v-if="form.type === 'SELL' || form.type === 'TRANSFER_OUT'" class="text-[11px] text-[#41587f]">
              Saldo: <strong class="font-mono text-[#0f2547]">{{ currentHolding }} {{ form.symbol }}</strong>
              <button
                type="button"
                @click="setMaxAmount"
                class="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold hover:bg-blue-200 transition-colors cursor-pointer"
              >
                Maks
              </button>
            </div>
          </div>
          <input
            v-model="form.amount"
            type="number"
            step="0.0000000001"
            min="0"
            placeholder="0.0000000000"
            class="w-full px-3.5 py-2.5 rounded-2xl glass-input text-base font-semibold text-[#0f2547] font-mono"
            :class="{ '!border-rose-500 !ring-1 !ring-rose-500': isInsufficientCrypto }"
            @input="recalculatePrice"
          />
          <div v-if="isInsufficientCrypto" class="text-[11px] font-medium text-rose-500 mt-1 flex items-center gap-1">
            <DynamicIcon name="AlertCircle" :size="13" />
            <span>Jumlah koin melebihi saldo yang dimiliki (Maks: {{ currentHolding }} {{ form.symbol }})</span>
          </div>
        </div>

        <!-- Nilai Modal Fiat yang Diinvestasikan -->
        <div>
          <div class="flex items-center justify-between mb-1">
            <label class="block text-xs font-semibold text-[#41587f]">
              {{ form.type === 'BUY' ? 'Modal Fiat yang Diinvestasikan' : form.type === 'SELL' ? 'Hasil Fiat Penjualan' : form.type === 'TRANSFER_IN' ? 'Estimasi Nilai Fiat Masuk' : 'Estimasi Nilai Fiat Keluar' }}
            </label>
            <!-- Currency selector IDR vs USD -->
            <div class="flex p-0.5 rounded-lg bg-white/40 border border-white/60 text-[10px] font-semibold">
              <button
                type="button"
                @click="setCurrency('IDR')"
                class="px-2 py-0.5 rounded-md transition-all"
                :class="form.fiatCurrency === 'IDR' ? 'bg-[#4f8cff] text-white shadow-xs' : 'text-[#41587f]'"
              >
                IDR
              </button>
              <button
                type="button"
                @click="setCurrency('USD')"
                class="px-2 py-0.5 rounded-md transition-all"
                :class="form.fiatCurrency === 'USD' ? 'bg-[#ff9a4d] text-white shadow-xs' : 'text-[#41587f]'"
              >
                USD
              </button>
            </div>
          </div>

          <div class="relative">
            <span class="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#41587f]">
              {{ form.fiatCurrency === 'IDR' ? 'Rp' : '$' }}
            </span>
            <input
              v-model.number="form.fiatAmount"
              type="number"
              min="0"
              placeholder="0"
              class="w-full pl-11 pr-4 py-2.5 rounded-2xl glass-input text-base font-semibold text-[#0f2547] font-mono"
              @input="recalculatePrice"
            />
          </div>
          <div v-if="calculatedPrice > 0" class="text-[11px] text-[#41587f] mt-1 flex items-center justify-between">
            <span>Harga Eksekusi:</span>
            <strong class="text-[#0f2547] font-mono font-semibold">
              {{ form.fiatCurrency === 'IDR' ? 'Rp ' + Number(calculatedPrice).toLocaleString('id-ID') : '$ ' + Number(calculatedPrice).toLocaleString('en-US', { maximumFractionDigits: 2 }) }} / koin
            </strong>
          </div>
        </div>

        <!-- Rekening Sumber Fiat (Opsional) -->
        <div>
          <label class="block text-xs font-semibold text-[#41587f] mb-1">
            {{ form.type === 'BUY' ? 'Potong dari Rekening Fiat (Opsional)' : form.type === 'SELL' ? 'Setor ke Rekening Fiat (Opsional)' : form.type === 'TRANSFER_IN' ? 'Hubungkan ke Rekening Fiat (Opsional)' : 'Potong Biaya dari Rekening Fiat (Opsional)' }}
          </label>
          <select
            v-model="form.sourceWalletId"
            class="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-semibold text-[#0f2547] appearance-none"
          >
            <option :value="null">-- Tidak dipotong dari rekening --</option>
            <option
              v-for="w in store.wallets"
              :key="w.id"
              :value="w.id"
            >
              {{ w.name }} (Saldo: {{ store.formatMoney(w.balance) }})
            </option>
          </select>
          <p v-if="isInsufficientFiat" class="text-[11px] text-red-500 font-medium mt-1">
            Saldo {{ selectedWallet?.name }} tidak mencukupi untuk pembelian ini (Dibutuhkan: {{ store.formatMoney(fiatCostInIdr) }})
          </p>
        </div>

        <!-- Tanggal Transaksi -->
        <div>
          <label class="block text-xs font-semibold text-[#41587f] mb-1">Tanggal Transaksi</label>
          <input
            v-model="form.transactionDate"
            type="date"
            class="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-semibold text-[#0f2547]"
          />
        </div>

        <!-- Catatan -->
        <div>
          <label class="block text-xs font-semibold text-[#41587f] mb-1">Catatan Tambahan</label>
          <input
            v-model="form.notes"
            type="text"
            placeholder="Contoh: Cicil DCA mingguan di exchange"
            class="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs text-[#0f2547]"
          />
        </div>
      </div>

      <!-- Action Button -->
      <div class="mt-6">
        <button
          @click="handleSave"
          :disabled="!isValid"
          class="w-full py-3.5 rounded-2xl text-white font-semibold text-sm shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          :style="{ background: form.type === 'BUY' ? 'linear-gradient(135deg, #10b981, #34d399)' : form.type === 'SELL' ? 'linear-gradient(135deg, #f43f5e, #fb7185)' : form.type === 'TRANSFER_IN' ? 'linear-gradient(135deg, var(--blue), #7fb0ff)' : 'linear-gradient(135deg, #f59e0b, #fbbf24)' }"
        >
          <DynamicIcon name="Check" :size="16" />
          <span>Simpan Mutasi Kripto</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, watch } from 'vue'
import { useFinanceStore } from '@/stores/financeStore'
import DynamicIcon from '@/components/DynamicIcon.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  defaultSymbol: {
    type: String,
    default: 'BTC'
  }
})

const emit = defineEmits(['close'])
const store = useFinanceStore()

const popularCoins = ['BTC', 'ETH', 'SOL', 'BNB', 'DOGE', 'XRP']

const form = reactive({
  type: 'BUY',
  symbol: 'BTC',
  amount: '',
  fiatCurrency: 'USD',
  fiatAmount: '',
  pricePerCoin: 0,
  sourceWalletId: null,
  transactionDate: new Date().toISOString().split('T')[0],
  notes: ''
})

const calculatedPrice = computed(() => {
  const amt = Number(form.amount) || 0
  const fiat = Number(form.fiatAmount) || 0
  if (amt > 0 && fiat > 0) {
    return Math.round((fiat / amt) * 100) / 100
  }
  return 0
})

watch(
  () => props.defaultSymbol,
  (val) => {
    if (val) form.symbol = val.toUpperCase()
  },
  { immediate: true }
)

function setCurrency(curr) {
  form.fiatCurrency = curr
}

function selectCoin(sym) {
  form.symbol = sym
  // Prefill estimated fiat if user inputs amount
  recalculatePrice()
}

function onSymbolChange() {
  form.symbol = (form.symbol || '').toUpperCase()
}

function recalculatePrice() {
  if (calculatedPrice.value > 0) {
    form.pricePerCoin = calculatedPrice.value
  }
}

const currentHolding = computed(() => {
  const sym = (form.symbol || '').trim().toUpperCase()
  const found = store.cryptoAssets.find(c => (c.symbol || '').toUpperCase() === sym)
  return found ? (Number(found.amount) || 0) : 0
})

const selectedWallet = computed(() => {
  return store.wallets.find(w => w.id === form.sourceWalletId)
})

const fiatCostInIdr = computed(() => {
  const fiat = Number(form.fiatAmount) || 0
  if (form.fiatCurrency === 'USD') {
    return Math.round(fiat * store.usdToIdrRate)
  }
  return fiat
})

const isInsufficientFiat = computed(() => {
  if (form.type === 'BUY' && form.sourceWalletId && selectedWallet.value) {
    return fiatCostInIdr.value > (Number(selectedWallet.value.balance) || 0)
  }
  return false
})

const isInsufficientCrypto = computed(() => {
  if (form.type === 'SELL' || form.type === 'TRANSFER_OUT') {
    const amt = Number(form.amount) || 0
    return amt > currentHolding.value
  }
  return false
})

function setMaxAmount() {
  if (currentHolding.value > 0) {
    form.amount = currentHolding.value
    recalculatePrice()
  }
}

const isValid = computed(() => {
  const hasBasic = form.symbol && form.symbol.trim().length > 0 && Number(form.amount) > 0 && Number(form.fiatAmount) > 0
  if (!hasBasic) return false
  if (form.type === 'SELL' || form.type === 'TRANSFER_OUT') {
    return (Number(form.amount) || 0) <= currentHolding.value
  }
  if (isInsufficientFiat.value) return false
  return true
})

function close() {
  form.amount = ''
  form.fiatAmount = ''
  form.notes = ''
  emit('close')
}

async function handleSave() {
  if (!isValid.value) return

  await store.addCryptoTransaction({
    symbol: form.symbol,
    type: form.type,
    amount: form.amount,
    fiatCurrency: form.fiatCurrency,
    fiatAmount: form.fiatAmount,
    pricePerCoin: calculatedPrice.value || form.pricePerCoin,
    sourceWalletId: form.sourceWalletId,
    notes: form.notes,
    transactionDate: form.transactionDate
  })

  close()
}
</script>
