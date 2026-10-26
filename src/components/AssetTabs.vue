<template>
  <section class="glass p-4 rounded-3xl my-3" aria-label="Manajemen Aset">
    <!-- Header with Tabs -->
    <div class="flex items-center justify-between mb-3.5">
      <div class="flex items-center gap-1 bg-white/40 p-1 rounded-2xl border border-white/60">
        <button
          @click="activeTab = 'FIAT'"
          type="button"
          class="px-3 py-1.5 text-xs font-semibold rounded-xl transition-all"
          :class="activeTab === 'FIAT' ? 'bg-brand-blue text-white shadow-sm' : 'text-ink-muted hover:text-ink'"
        >
          Rekening Fiat ({{ store.wallets.length }})
        </button>
        <button
          @click="activeTab = 'CRYPTO'"
          type="button"
          class="px-3 py-1.5 text-xs font-semibold rounded-xl transition-all"
          :class="activeTab === 'CRYPTO' ? 'bg-brand-orange text-white shadow-sm' : 'text-ink-muted hover:text-ink'"
        >
          Kripto ({{ store.cryptoAssets.length }})
        </button>
      </div>

      <!-- Add Button according to current tab -->
      <button
        @click="activeTab === 'FIAT' ? $emit('open-wallet') : $emit('open-crypto')"
        class="w-8 h-8 rounded-full glass hover:bg-white/80 flex items-center justify-center text-ink transition-transform active:scale-95"
        :title="activeTab === 'FIAT' ? 'Tambah Dompet' : 'Tambah Koin Kripto'"
      >
        <DynamicIcon name="Plus" :size="16" />
      </button>
    </div>

    <!-- TAB 1: FIAT WALLETS -->
    <div v-if="activeTab === 'FIAT'" class="space-y-2">
      <div
        v-for="wallet in store.wallets"
        :key="wallet.id"
        class="flex items-center justify-between p-3 rounded-2xl bg-white/40 hover:bg-white/60 border border-white/60 transition-all group"
      >
        <div class="flex items-center gap-3">
          <div 
            class="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
            :style="{ backgroundColor: wallet.color || '#4f8cff' }"
          >
            <DynamicIcon :name="wallet.icon || 'Landmark'" :size="18" />
          </div>
          <div>
            <div class="flex items-center gap-1.5">
              <span class="text-sm font-bold text-ink">{{ wallet.name }}</span>
              <span class="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/70 text-ink-muted border border-white/80">
                {{ wallet.type }}
              </span>
            </div>
            <div class="text-xs text-ink-muted mt-0.5">
              Saldo: <strong class="text-ink font-semibold">{{ formatIdr(wallet.balance) }}</strong>
            </div>
          </div>
        </div>

        <!-- Action / Edit -->
        <button
          @click="$emit('edit-wallet', wallet)"
          class="w-8 h-8 rounded-xl glass hover:bg-white/80 flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
          title="Edit Dompet"
        >
          <DynamicIcon name="Edit3" :size="14" />
        </button>
      </div>

      <!-- Quick Add Wallet Pill -->
      <button
        @click="$emit('open-wallet')"
        class="w-full py-2.5 rounded-2xl border border-dashed border-brand-blue/40 text-xs font-semibold text-brand-blue hover:bg-white/30 flex items-center justify-center gap-1.5 transition-all"
      >
        <DynamicIcon name="Plus" :size="14" />
        Tambah Rekening Bank atau e-Wallet
      </button>
    </div>

    <!-- TAB 2: CRYPTO PORTFOLIO (10 DECIMALS PRECISION) -->
    <div v-else class="space-y-2.5">
      <!-- Info Banner for 10 Decimals & Exchange Rate -->
      <div class="p-2.5 rounded-2xl bg-brand-mist/60 border border-brand-sky/40 flex items-center justify-between text-[11px] text-ink-muted">
        <span class="flex items-center gap-1">
          <DynamicIcon name="Sparkles" :size="13" class="text-brand-orange" />
          Mendukung presisi 10 desimal
        </span>
        <span class="font-mono font-medium">1 USD = {{ formatIdr(store.usdToIdrRate) }}</span>
      </div>

      <div
        v-for="asset in store.cryptoListWithValues"
        :key="asset.id"
        class="p-3.5 rounded-2xl bg-white/40 hover:bg-white/60 border border-white/60 transition-all"
      >
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-orange to-amber-300 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              {{ asset.symbol.slice(0, 3) }}
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-sm font-bold text-ink">{{ asset.symbol }}</span>
                <span class="text-xs text-ink-muted">({{ asset.name }})</span>
              </div>
              <div class="text-[11px] text-ink-muted flex items-center gap-1 mt-0.5">
                <span>Harga:</span>
                <strong class="text-ink font-mono font-semibold">{{ formatUsd(asset.priceUsd) }}</strong>
              </div>
            </div>
          </div>

          <!-- Total IDR Value -->
          <div class="text-right">
            <div class="text-sm font-extrabold text-brand-blue font-mono">
              {{ formatIdr(asset.valueIdr) }}
            </div>
            <div class="text-[10px] text-ink-muted font-mono">
              ≈ {{ formatUsd(asset.valueUsd) }}
            </div>
          </div>
        </div>

        <!-- 10-Decimal Amount Display (PRD 4.4) -->
        <div class="mt-2.5 pt-2 border-t border-white/50 flex items-center justify-between text-xs">
          <div class="text-ink-muted">
            Kepemilikan:
            <span class="font-mono font-bold text-ink ml-1 select-all">
              {{ formatCrypto(asset.amount) }} {{ asset.symbol }}
            </span>
          </div>
          <button
            @click="$emit('edit-crypto', asset)"
            class="text-[11px] font-semibold text-brand-blue hover:underline flex items-center gap-0.5"
          >
            <DynamicIcon name="Edit3" :size="12" />
            Edit
          </button>
        </div>
      </div>

      <!-- Quick Add Crypto Pill -->
      <button
        @click="$emit('open-crypto')"
        class="w-full py-2.5 rounded-2xl border border-dashed border-brand-orange/40 text-xs font-semibold text-brand-orange hover:bg-white/30 flex items-center justify-center gap-1.5 transition-all"
      >
        <DynamicIcon name="Plus" :size="14" />
        Tambah Aset Kripto Baru (10 Desimal)
      </button>
    </div>
  </section>
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
