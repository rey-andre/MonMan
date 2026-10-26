<template>
  <div class="space-y-3.5">
    <!-- Hero Investment Growth Liquid Glass Card -->
    <section class="glass p-4 rounded-[26px] relative overflow-hidden" aria-label="Ringkasan Pertumbuhan Investasi">
      <div class="flex items-center justify-between mb-1">
        <span class="text-xs font-semibold text-[#41587f]">Nilai Portofolio Terkini</span>
        <span class="text-[11px] font-medium text-[#41587f]/80 font-mono">
          1 USD = {{ formatIdr(store.usdToIdrRate) }}
        </span>
      </div>

      <!-- Current Portfolio Value in IDR & USD -->
      <div class="flex items-baseline gap-2">
        <div class="text-[26px] font-bold text-[#0f2547] font-mono tracking-tight">
          {{ store.formatMoney(store.totalCryptoValueIdr) }}
        </div>
      </div>
      <div class="text-[12.5px] text-[#41587f] font-mono mt-0.5">
        {{ store.isPrivacyMode ? '$••••••' : '≈ $' + totalCryptoValueUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' USD' }}
      </div>

      <!-- Metric Grid: Modal Terinvestasi, PnL, ROI -->
      <div class="grid grid-cols-3 gap-2 mt-3.5 pt-3 border-t border-white/60">
        <!-- Modal Terinvestasi -->
        <div class="p-2 rounded-xl bg-white/40">
          <span class="text-[10.5px] text-[#41587f] block">Modal Beli</span>
          <span class="text-[12.5px] font-semibold text-[#0f2547] font-mono block truncate">
            {{ store.formatShortMoney(store.totalCryptoInvestedIdr) }}
          </span>
        </div>

        <!-- Profit / Loss Bersih -->
        <div class="p-2 rounded-xl bg-white/40">
          <span class="text-[10.5px] text-[#41587f] block">Untung / Rugi</span>
          <span 
            class="text-[12.5px] font-semibold font-mono block truncate"
            :class="store.totalCryptoPnlIdr >= 0 ? 'text-emerald-600' : 'text-rose-600'"
          >
            {{ store.isPrivacyMode ? '••••••' : (store.totalCryptoPnlIdr >= 0 ? '+' : '−') + formatShortIdr(Math.abs(store.totalCryptoPnlIdr)) }}
          </span>
        </div>

        <!-- ROI % -->
        <div class="p-2 rounded-xl bg-white/40">
          <span class="text-[10.5px] text-[#41587f] block">Pertumbuhan</span>
          <span 
            class="text-[12.5px] font-bold font-mono block truncate"
            :class="store.totalCryptoRoiPercentage >= 0 ? 'text-emerald-600' : 'text-rose-600'"
          >
            {{ store.totalCryptoRoiPercentage >= 0 ? '+' : '' }}{{ store.totalCryptoRoiPercentage }}%
          </span>
        </div>
      </div>

      <!-- Quick Action: Catat Beli / Jual -->
      <button
        @click="openBuyModal()"
        class="w-full mt-3.5 py-3 rounded-2xl text-white font-semibold text-xs shadow-md transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-2"
        style="background: linear-gradient(135deg, var(--blue), #7fb0ff);"
      >
        <DynamicIcon name="PlusCircle" :size="15" />
        <span>+ Catat Beli / Jual Kripto</span>
      </button>
    </section>

    <!-- Tab Selector (Koleksi Koin vs Riwayat Mutasi) -->
    <div class="p-1 bg-white/40 rounded-[20px] border border-white/60 grid grid-cols-2 gap-1">
      <button
        @click="activeTab = 'HOLDINGS'"
        type="button"
        class="py-2 text-[12px] font-medium rounded-[16px] transition-all flex items-center justify-center gap-1.5"
        :class="activeTab === 'HOLDINGS' ? 'glass-strong text-[#0f2547] font-semibold shadow-xs' : 'text-[#41587f] hover:text-[#0f2547]'"
      >
        <DynamicIcon name="Bitcoin" :size="14" />
        <span>Koleksi Aset ({{ store.cryptoListWithValues.length }})</span>
      </button>
      <button
        @click="activeTab = 'MUTATIONS'"
        type="button"
        class="py-2 text-[12px] font-medium rounded-[16px] transition-all flex items-center justify-center gap-1.5"
        :class="activeTab === 'MUTATIONS' ? 'glass-strong text-[#0f2547] font-semibold shadow-xs' : 'text-[#41587f] hover:text-[#0f2547]'"
      >
        <DynamicIcon name="History" :size="14" />
        <span>Mutasi Beli/Jual ({{ store.cryptoTransactions.length }})</span>
      </button>
    </div>

    <!-- TAB 1: KOLEKSI ASET KRIPTO (HOLDINGS) -->
    <div v-if="activeTab === 'HOLDINGS'" class="space-y-2.5">
      <div
        v-for="coin in store.cryptoListWithValues"
        :key="coin.id"
        class="glass p-4 rounded-[24px] space-y-3 hover:bg-white/60 transition-all"
      >
        <!-- Top Row: Icon, Symbol, Name & Current Value -->
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div 
              class="w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0 select-none"
              :style="{ background: getCoinGradient(coin.symbol) }"
            >
              {{ coin.symbol }}
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="font-semibold text-[15px] text-[#0f2547]">{{ coin.name }}</span>
                <span class="text-[11px] font-medium px-1.5 py-0.2 rounded bg-white/70 text-[#41587f]">
                  {{ coin.symbol }}
                </span>
              </div>
              <div class="text-[12px] font-mono text-[#41587f] mt-0.5" title="Presisi 10 desimal">
                {{ store.formatCryptoMoney(coin.amount) }} {{ coin.symbol }}
              </div>
            </div>
          </div>

          <!-- Current Value in IDR -->
          <div class="text-right">
            <div class="text-[15px] font-semibold text-[#0f2547] font-mono">
              {{ store.formatMoney(coin.valueIdr) }}
            </div>
            <div class="text-[11px] font-mono text-[#41587f]">
              {{ store.formatUsdMoney(coin.valueUsd) }}
            </div>
          </div>
        </div>

        <!-- Investment Details Row: Avg Buy vs Live Price, PnL & ROI -->
        <div class="grid grid-cols-2 gap-2 pt-2.5 border-t border-white/60 text-xs">
          <!-- Avg Buy Price & Market Price -->
          <div class="p-2 rounded-xl bg-white/35">
            <div class="text-[10px] text-[#41587f] flex items-center justify-between">
              <span>Beli Rata2:</span>
              <strong class="font-mono text-[#0f2547]">
                ${{ Number(coin.avgBuyPriceUsd).toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
              </strong>
            </div>
            <div class="text-[10px] text-[#41587f] flex items-center justify-between mt-1">
              <span>Harga Pasar:</span>
              <strong class="font-mono text-[#4f8cff]">
                ${{ Number(coin.priceUsd).toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
              </strong>
            </div>
          </div>

          <!-- PnL & ROI Pill -->
          <div class="p-2 rounded-xl bg-white/35 flex flex-col justify-between">
            <div class="text-[10px] text-[#41587f]">Pertumbuhan:</div>
            <div class="flex items-center justify-between mt-1">
              <span 
                class="font-mono font-semibold text-[11.5px]"
                :class="coin.unrealizedPnlIdr >= 0 ? 'text-emerald-600' : 'text-rose-600'"
              >
                {{ store.isPrivacyMode ? '••••••' : (coin.unrealizedPnlIdr >= 0 ? '+' : '−') + formatShortIdr(Math.abs(coin.unrealizedPnlIdr)) }}
              </span>
              <span 
                class="text-[10.5px] font-bold px-1.5 py-0.2 rounded-md font-mono"
                :class="coin.roiPercentage >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
              >
                {{ coin.roiPercentage >= 0 ? '+' : '' }}{{ coin.roiPercentage }}%
              </span>
            </div>
          </div>
        </div>

        <!-- Bottom Actions -->
        <div class="flex items-center justify-between pt-1">
          <div class="text-[10.5px] text-[#41587f]">
            Modal: <strong class="font-mono font-semibold text-[#0f2547]">{{ store.formatShortMoney(coin.totalInvestedIdr) }}</strong>
          </div>
          <div class="flex items-center gap-1.5">
            <button
              @click="openBuyModal(coin.symbol)"
              type="button"
              class="px-2.5 py-1 text-[11px] font-semibold rounded-xl glass hover:bg-white/80 active:scale-95 text-[#0f2547] transition-all flex items-center gap-1"
            >
              <DynamicIcon name="Plus" :size="12" />
              <span>Beli Lagi</span>
            </button>
            <button
              @click="$emit('edit-crypto', coin)"
              type="button"
              class="w-7 h-7 rounded-xl glass flex items-center justify-center text-[#41587f] hover:text-[#0f2547] active:scale-95 transition-all"
              title="Edit Jumlah Koin"
            >
              <DynamicIcon name="Edit3" :size="13" />
            </button>
          </div>
        </div>
      </div>

      <div v-if="store.cryptoListWithValues.length === 0" class="text-center py-8 glass rounded-[24px]">
        <DynamicIcon name="Bitcoin" :size="32" class="mx-auto mb-2 text-[#4f8cff] opacity-60" />
        <p class="text-sm font-semibold text-[#0f2547]">Belum Ada Aset Kripto</p>
        <p class="text-xs text-[#41587f] mt-0.5">Catat pembelian koin pertama Anda sekarang</p>
      </div>
    </div>

    <!-- TAB 2: RIWAYAT MUTASI BELI & JUAL KRIPTO -->
    <div v-if="activeTab === 'MUTATIONS'" class="space-y-2.5">
      <div
        v-for="ctx in store.recentCryptoTransactions"
        :key="ctx.id"
        class="glass p-3.5 rounded-[22px] flex items-center justify-between gap-3 hover:bg-white/60 transition-all"
      >
        <!-- Left: Badge & Info -->
        <div class="flex items-center gap-3 min-w-0">
          <div 
            class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 font-bold text-xs"
            :class="ctx.type === 'BUY' 
              ? 'bg-emerald-100 text-emerald-700' 
              : ctx.type === 'TRANSFER_IN'
                ? 'bg-blue-100 text-blue-700'
                : ctx.type === 'SELL' 
                  ? 'bg-rose-100 text-rose-700' 
                  : 'bg-orange-100 text-orange-700'"
          >
            <DynamicIcon 
              :name="(ctx.type === 'BUY' || ctx.type === 'TRANSFER_IN') ? 'ArrowDownLeft' : 'ArrowUpRight'" 
              :size="18" 
            />
          </div>

          <div class="min-w-0">
            <div class="flex items-center gap-1.5">
              <span class="text-[13.5px] font-semibold text-[#0f2547]">
                {{ ctx.type === 'BUY' ? 'Beli' : ctx.type === 'SELL' ? 'Jual' : ctx.type === 'TRANSFER_IN' ? 'Terima' : 'Kirim' }} {{ ctx.symbol }}
              </span>
              <span class="text-[10px] px-1.5 py-0.2 rounded font-mono font-medium bg-white/70 text-[#41587f]">
                @ {{ ctx.fiatCurrency === 'USD' ? '$' : 'Rp' }}{{ Number(ctx.pricePerCoin).toLocaleString('en-US', { maximumFractionDigits: 2 }) }}
              </span>
            </div>
            <div class="text-[11.5px] text-[#41587f] font-mono mt-0.5 truncate">
              {{ store.isPrivacyMode ? '••••••' : ((ctx.type === 'BUY' || ctx.type === 'TRANSFER_IN') ? '+' : '−') + formatCryptoAmount(ctx.amount) }} {{ ctx.symbol }}
            </div>
            <div class="text-[10.5px] text-[#41587f]/80 mt-0.5">
              {{ ctx.transactionDate }}
              <span v-if="ctx.sourceWallet"> · dari {{ ctx.sourceWallet.name }}</span>
            </div>
          </div>
        </div>

        <!-- Right: Fiat Value & Delete Action -->
        <div class="flex items-center gap-2 shrink-0">
          <div class="text-right">
            <div 
              class="text-[13.5px] font-semibold font-mono"
              :class="(ctx.type === 'BUY' || ctx.type === 'TRANSFER_IN') ? 'text-emerald-600' : 'text-rose-600'"
            >
              {{ store.isPrivacyMode ? '••••••••' : (ctx.fiatCurrency === 'USD' ? '$' + Number(ctx.fiatAmount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : formatIdr(ctx.fiatAmount)) }}
            </div>
            <div v-if="ctx.fiatCurrency === 'USD'" class="text-[10px] font-mono text-[#41587f]">
              ≈ {{ store.formatMoney(ctx.fiatAmount * store.usdToIdrRate) }}
            </div>
          </div>

          <button
            @click="handleDeleteCtx(ctx.id)"
            type="button"
            class="w-7 h-7 rounded-lg glass flex items-center justify-center text-red-500 hover:text-red-700 active:scale-95 transition-all"
            title="Hapus Mutasi Kripto"
          >
            <DynamicIcon name="Trash2" :size="13" />
          </button>
        </div>
      </div>

      <div v-if="store.cryptoTransactions.length === 0" class="text-center py-8 glass rounded-[24px]">
        <DynamicIcon name="History" :size="32" class="mx-auto mb-2 text-[#4f8cff] opacity-60" />
        <p class="text-sm font-semibold text-[#0f2547]">Belum Ada Riwayat Mutasi Kripto</p>
        <p class="text-xs text-[#41587f] mt-0.5">Klik tombol di atas untuk mencatat pembelian pertama</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from '@/stores/financeStore'
import { formatIdr, formatCryptoAmount } from '@/utils/formatters'
import DynamicIcon from '@/components/DynamicIcon.vue'

const emit = defineEmits(['open-crypto-tx', 'edit-crypto'])
const store = useFinanceStore()
const activeTab = ref('HOLDINGS') // 'HOLDINGS' or 'MUTATIONS'

const totalCryptoValueUsd = computed(() => {
  if (store.usdToIdrRate <= 0) return 0
  return store.totalCryptoValueIdr / store.usdToIdrRate
})

function formatShortIdr(val) {
  if (!val || val === 0) return 'Rp 0'
  if (val >= 1000000000) return `Rp ${(val / 1000000000).toFixed(2)} M`
  if (val >= 1000000) return `Rp ${(val / 1000000).toFixed(1)} Jt`
  if (val >= 1000) return `Rp ${(val / 1000).toFixed(0)} Rb`
  return `Rp ${val}`
}

function getCoinGradient(symbol) {
  const sym = (symbol || '').toUpperCase()
  switch (sym) {
    case 'BTC': return 'linear-gradient(135deg, #f7931a, #ffb347)'
    case 'ETH': return 'linear-gradient(135deg, #627eea, #8ca0f8)'
    case 'SOL': return 'linear-gradient(135deg, #14f195, #9945ff)'
    case 'BNB': return 'linear-gradient(135deg, #f3ba2f, #ffd269)'
    case 'DOGE': return 'linear-gradient(135deg, #c2a633, #e8cf65)'
    case 'XRP': return 'linear-gradient(135deg, #23292f, #535c68)'
    default: return 'linear-gradient(135deg, var(--blue), var(--orange))'
  }
}

function openBuyModal(symbol = 'BTC') {
  emit('open-crypto-tx', symbol)
}

async function handleDeleteCtx(id) {
  if (confirm('Hapus mutasi kripto ini? Jumlah koin dan saldo rekening akan otomatis dikembalikan.')) {
    await store.deleteCryptoTransaction(id)
  }
}
</script>
