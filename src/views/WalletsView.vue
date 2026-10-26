<template>
  <div class="space-y-3.5">
    <!-- Header -->
    <div class="flex items-center justify-between pb-1">
      <div>
        <h1 class="text-[20px] font-semibold tracking-tight text-[#0f2547]">Dompet & Portofolio</h1>
        <p class="text-[13px] text-[#41587f]">Rekening fiat dan aset kripto presisi 10 desimal</p>
      </div>
      <button
        @click="store.refreshMarketRates"
        :disabled="store.isSyncingRates"
        class="w-10 h-10 rounded-2xl glass flex items-center justify-center text-[#41587f] hover:text-[#0f2547] active:scale-95 transition-all disabled:opacity-50"
        title="Perbarui Harga & Kurs"
      >
        <DynamicIcon name="RefreshCw" :size="16" :class="{ 'animate-spin text-[#4f8cff]': store.isSyncingRates }" />
      </button>
    </div>

    <!-- Dual Summary Glass Cards -->
    <div class="grid grid-cols-2 gap-2.5">
      <div class="glass p-3.5 rounded-[22px]">
        <div class="flex items-center gap-1.5 text-[12px] font-medium text-[#41587f] mb-0.5">
          <DynamicIcon name="Landmark" :size="14" class="text-[#4f8cff]" />
          <span>Total Fiat</span>
        </div>
        <div class="text-[16px] font-semibold text-[#0f2547] font-mono truncate">
          {{ formatIdr(store.totalFiatBalance) }}
        </div>
        <div class="text-[11px] text-[#41587f]/80 mt-0.5">
          {{ store.wallets.length }} rekening aktif
        </div>
      </div>

      <div class="glass p-3.5 rounded-[22px]">
        <div class="flex items-center gap-1.5 text-[12px] font-medium text-[#41587f] mb-0.5">
          <DynamicIcon name="Coins" :size="14" class="text-[#ff9a4d]" />
          <span>Total Kripto</span>
        </div>
        <div class="text-[16px] font-semibold text-[#4f8cff] font-mono truncate">
          {{ formatIdr(store.totalCryptoValueIdr) }}
        </div>
        <div class="text-[11px] text-[#41587f]/80 mt-0.5 flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          <span>1 USD = {{ formatIdr(store.usdToIdrRate) }}</span>
        </div>
      </div>
    </div>

    <!-- Tab Selector -->
    <div class="p-1 bg-white/40 rounded-[20px] border border-white/60 grid grid-cols-2 gap-1">
      <button
        @click="activeTab = 'FIAT'"
        type="button"
        class="py-2 text-[12.5px] font-medium rounded-[16px] transition-all flex items-center justify-center gap-1.5"
        :class="activeTab === 'FIAT' ? 'glass-strong text-[#0f2547] font-semibold shadow-xs' : 'text-[#41587f] hover:text-[#0f2547]'"
      >
        <DynamicIcon name="Landmark" :size="14" />
        <span>Rekening Fiat ({{ store.wallets.length }})</span>
      </button>
      <button
        @click="activeTab = 'CRYPTO'"
        type="button"
        class="py-2 text-[12.5px] font-medium rounded-[16px] transition-all flex items-center justify-center gap-1.5"
        :class="activeTab === 'CRYPTO' ? 'glass-strong text-[#0f2547] font-semibold shadow-xs' : 'text-[#41587f] hover:text-[#0f2547]'"
      >
        <DynamicIcon name="Coins" :size="14" />
        <span>Kripto 10 Desimal ({{ store.cryptoAssets.length }})</span>
      </button>
    </div>

    <!-- TAB 1: REKENING FIAT -->
    <div v-if="activeTab === 'FIAT'" class="space-y-2.5">
      <div
        v-for="wallet in store.wallets"
        :key="wallet.id"
        class="glass p-3.5 rounded-[22px] flex items-center justify-between group hover:bg-white/60 transition-all"
      >
        <div class="flex items-center gap-3">
          <div 
            class="w-10 h-10 rounded-[14px] flex items-center justify-center text-white shrink-0 shadow-sm"
            :style="{ backgroundColor: wallet.color || '#4f8cff' }"
          >
            <DynamicIcon :name="wallet.icon || 'Landmark'" :size="18" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-[15px] font-semibold text-[#0f2547]">{{ wallet.name }}</span>
              <span class="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/70 text-[#41587f] border border-white/80">
                {{ wallet.type }}
              </span>
            </div>
            <div class="text-[12.5px] text-[#41587f] mt-0.5">
              Saldo: <strong class="text-[#0f2547] font-mono font-semibold">{{ formatIdr(wallet.balance) }}</strong>
            </div>
          </div>
        </div>

        <button
          @click="$emit('edit-wallet', wallet)"
          class="w-8 h-8 rounded-xl glass hover:bg-white/80 flex items-center justify-center text-[#41587f] hover:text-[#0f2547] transition-colors"
          title="Edit Rekening"
        >
          <DynamicIcon name="Edit3" :size="14" />
        </button>
      </div>

      <!-- Add Wallet Button -->
      <button
        @click="$emit('open-wallet')"
        class="w-full py-3 rounded-[22px] border border-dashed border-[#4f8cff]/50 bg-white/30 hover:bg-white/50 text-[13px] font-semibold text-[#2b63d6] flex items-center justify-center gap-1.5 transition-all"
      >
        <DynamicIcon name="Plus" :size="15" />
        Tambah Rekening Bank atau E-Wallet Baru
      </button>
    </div>

    <!-- TAB 2: PORTOFOLIO KRIPTO (10 DECIMALS PRECISION) -->
    <div v-else class="space-y-2.5">
      <!-- 10 Decimals Precision Banner -->
      <div class="p-3 rounded-[20px] bg-[rgba(255,154,77,0.15)] border border-[#ff9a4d]/30 flex items-center gap-2 text-xs text-[#0f2547]">
        <DynamicIcon name="ShieldCheck" :size="16" class="text-[#9a4a0c] shrink-0" />
        <p class="leading-snug">
          Mendukung kepemilikan koin hingga <strong>10 digit di belakang koma</strong> dengan harga pasar <em>real-time</em> dari FreeCryptoAPI.
        </p>
      </div>

      <!-- Coin Cards -->
      <div
        v-for="asset in store.cryptoListWithValues"
        :key="asset.id"
        class="glass p-3.5 rounded-[22px] space-y-2.5 hover:bg-white/60 transition-all"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2.5">
            <div 
              class="w-10 h-10 rounded-[14px] flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm"
              style="background: linear-gradient(135deg, var(--orange), #f59e0b);"
            >
              {{ asset.symbol.slice(0, 3) }}
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-[15px] font-semibold text-[#0f2547]">{{ asset.symbol }}</span>
                <span class="text-[12px] text-[#41587f]">({{ asset.name }})</span>
              </div>
              <div class="flex items-center gap-1.5 mt-0.5">
                <span class="text-xs font-mono font-semibold text-[#0f2547]">{{ formatUsd(asset.priceUsd) }}</span>
                <!-- 24h Change badge -->
                <span 
                  v-if="asset.change24h !== undefined"
                  class="text-[10px] font-semibold px-1.5 py-0.2 rounded-md"
                  :class="asset.change24h >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-700'"
                >
                  {{ asset.change24h >= 0 ? '▲ +' : '▼ ' }}{{ asset.change24h.toFixed(2) }}%
                </span>
              </div>
            </div>
          </div>

          <!-- Total IDR Value -->
          <div class="text-right">
            <div class="text-[15px] font-semibold text-[#1f5fd1] font-mono">
              {{ formatIdr(asset.valueIdr) }}
            </div>
            <div class="text-[11px] text-[#41587f] font-mono">
              ≈ {{ formatUsd(asset.valueUsd) }}
            </div>
          </div>
        </div>

        <!-- 10-Decimal Amount Row & Edit Action (PRD 4.4) -->
        <div class="pt-2 border-t border-white/60 flex items-center justify-between text-xs">
          <div>
            <span class="text-[#41587f] text-[11px]">Kepemilikan:</span>
            <div class="font-mono font-semibold text-[#0f2547] select-all text-xs tracking-tight">
              {{ formatCrypto(asset.amount) }} {{ asset.symbol }}
            </div>
          </div>

          <button
            @click="$emit('edit-crypto', asset)"
            class="px-2.5 py-1 rounded-xl glass hover:bg-white/80 text-xs font-medium text-[#2b63d6] flex items-center gap-1 transition-colors"
          >
            <DynamicIcon name="Edit3" :size="12" />
            <span>Kelola</span>
          </button>
        </div>
      </div>

      <!-- Add Crypto Button -->
      <button
        @click="$emit('open-crypto')"
        class="w-full py-3 rounded-[22px] border border-dashed border-[#ff9a4d]/50 bg-white/30 hover:bg-white/50 text-[13px] font-semibold text-[#9a4a0c] flex items-center justify-center gap-1.5 transition-all"
      >
        <DynamicIcon name="Plus" :size="15" />
        Tambah Aset Kripto Baru (10 Desimal)
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useFinanceStore } from '@/stores/financeStore'
import { formatIdr, formatCrypto, formatUsd } from '@/utils/formatters'
import DynamicIcon from '@/components/DynamicIcon.vue'

defineEmits(['open-wallet', 'open-crypto', 'edit-wallet', 'edit-crypto'])
const store = useFinanceStore()
const activeTab = ref('FIAT')
</script>
