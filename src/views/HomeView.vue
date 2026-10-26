<template>
  <div class="space-y-3.5">
    <!-- Section: Total Net Worth Card (referensi-ui.html: .balance) -->
    <NetWorthCard />

    <!-- Section: Quick Actions Grid (referensi-ui.html: .actions) -->
    <QuickActions
      @open-transaction="$emit('open-transaction')"
      @open-wallet="$emit('open-wallet')"
      @open-crypto="$emit('open-crypto')"
    />

    <!-- Row 2: Donut Chart & Goal Card (referensi-ui.html: .row2) -->
    <AnalyticsCards />

    <!-- Section: Ringkasan Dompet & Kripto -->
    <section class="glass p-4 rounded-[26px]" aria-label="Ringkasan Aset">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-[15px] font-semibold text-[#0f2547]">Ringkasan Aset</h2>
        <router-link 
          to="/wallets" 
          class="text-[13px] text-[#2b63d6] font-medium hover:underline flex items-center gap-0.5"
        >
          Lihat Semua
          <DynamicIcon name="ChevronRight" :size="14" />
        </router-link>
      </div>

      <div class="grid grid-cols-2 gap-2.5">
        <!-- Fiat Summary Card -->
        <router-link
          to="/wallets"
          class="p-3.5 rounded-[20px] bg-white/40 hover:bg-white/60 border border-white/60 transition-all block group"
        >
          <div class="text-[12px] font-medium text-[#41587f]">Rekening Fiat</div>
          <div class="text-base font-semibold text-[#0f2547] mt-0.5 font-mono truncate">
            {{ store.formatMoney(store.totalFiatBalance) }}
          </div>
          <div class="text-[11px] text-[#4f8cff] font-medium mt-1">
            {{ store.wallets.length }} rekening aktif
          </div>
        </router-link>

        <!-- Crypto Summary Card -->
        <router-link
          to="/crypto"
          class="p-3.5 rounded-[20px] bg-white/40 hover:bg-white/60 border border-white/60 transition-all block group"
        >
          <div class="text-[12px] font-medium text-[#41587f]">Kripto (10 Desimal)</div>
          <div class="text-base font-semibold text-[#4f8cff] mt-0.5 font-mono truncate">
            {{ store.formatMoney(store.totalCryptoValueIdr) }}
          </div>
          <div class="text-[11px] text-[#ff9a4d] font-medium mt-1">
            {{ store.cryptoAssets.length }} koin tercatat
          </div>
        </router-link>
      </div>
    </section>

    <!-- Recent Activity (referensi-ui.html: .tx) -->
    <section class="glass p-4 rounded-[26px]" aria-label="Recent activity">
      <div class="flex items-center justify-between mb-2">
        <h2 class="text-[16px] font-semibold text-[#0f2547]">Aktivitas Terkini</h2>
        <router-link 
          to="/transactions" 
          class="text-[13px] text-[#2b63d6] font-medium hover:underline flex items-center gap-0.5"
        >
          Lihat Semua
          <DynamicIcon name="ChevronRight" :size="14" />
        </router-link>
      </div>

      <div v-if="previewTransactions.length > 0" class="divide-y divide-white/70">
        <div
          v-for="tx in previewTransactions"
          :key="tx.id"
          class="py-2.5 flex items-center gap-3"
        >
          <!-- Badge (referensi-ui.html: .badge) -->
          <div 
            class="w-10 h-10 rounded-[14px] flex items-center justify-center shrink-0"
            :class="tx.type === 'EXPENSE' ? 'bg-[#ffe6d1]' : 'bg-[#eaf3ff]'"
          >
            <DynamicIcon 
              :name="tx.type === 'TRANSFER' ? 'ArrowLeftRight' : (tx.category?.icon || 'Coins')" 
              :size="18" 
              :class="tx.type === 'EXPENSE' ? 'text-[#9a4a0c]' : 'text-[#4f8cff]'"
            />
          </div>

          <div class="flex-1 min-w-0">
            <div class="text-[15px] font-medium text-[#0f2547] truncate">
              {{ tx.notes || tx.category?.name || 'Transaksi' }}
            </div>
            <div class="text-[12.5px] text-[#41587f] truncate mt-0.5">
              {{ formatRelativeDate(tx.date) }} · {{ tx.sourceWallet?.name }}
            </div>
          </div>

          <!-- Value (referensi-ui.html: .v, .v.in) -->
          <div 
            class="text-[15px] font-medium font-mono text-right shrink-0"
            :class="tx.type === 'INCOME' ? 'text-[#1f5fd1]' : tx.type === 'TRANSFER' ? 'text-indigo-600' : 'text-[#0f2547]'"
          >
            {{ tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '−' : '⇄' }}
            {{ store.formatMoney(tx.amount) }}
          </div>
        </div>
      </div>

      <div v-else class="text-center py-4 text-xs text-[#41587f]">
        Belum ada catatan transaksi.
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFinanceStore } from '@/stores/financeStore'
import { formatIdr, formatRelativeDate } from '@/utils/formatters'
import NetWorthCard from '@/components/NetWorthCard.vue'
import QuickActions from '@/components/QuickActions.vue'
import AnalyticsCards from '@/components/AnalyticsCards.vue'
import DynamicIcon from '@/components/DynamicIcon.vue'

defineEmits(['open-transaction', 'open-wallet', 'open-crypto', 'open-profile'])
const store = useFinanceStore()

const previewTransactions = computed(() => {
  return store.recentTransactions.slice(0, 3)
})
</script>
