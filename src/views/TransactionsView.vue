<template>
  <div class="space-y-3.5">
    <!-- Action: Catat Transaksi Baru -->
    <button
      @click="$emit('open-transaction')"
      class="w-full py-2.5 px-4 rounded-2xl text-white font-semibold text-xs shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
      style="background: linear-gradient(135deg, var(--blue), #7fb0ff);"
    >
      <DynamicIcon name="PlusCircle" :size="15" />
      <span>+ Catat Transaksi Baru</span>
    </button>

    <!-- Quick In/Out Stats -->
    <div class="grid grid-cols-2 gap-2.5">
      <div class="glass p-3 rounded-[20px]">
        <div class="flex items-center gap-1 text-[12px] font-medium text-[#1f5fd1] mb-0.5">
          <DynamicIcon name="ArrowDownLeft" :size="14" />
          <span>Total Masuk</span>
        </div>
        <div class="text-[15px] font-semibold text-[#0f2547] font-mono truncate">
          {{ store.formatMoney(stats.income) }}
        </div>
      </div>
      <div class="glass p-3 rounded-[20px]">
        <div class="flex items-center gap-1 text-[12px] font-medium text-[#9a4a0c] mb-0.5">
          <DynamicIcon name="ArrowUpRight" :size="14" />
          <span>Total Keluar</span>
        </div>
        <div class="text-[15px] font-semibold text-[#0f2547] font-mono truncate">
          {{ store.formatMoney(stats.expense) }}
        </div>
      </div>
    </div>

    <!-- Search & Filters Container -->
    <div class="glass p-3.5 rounded-[24px] space-y-2.5">
      <!-- Search Input (referensi-ui.html: .glass-input) -->
      <div class="relative">
        <DynamicIcon name="Search" :size="15" class="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#41587f]" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari transaksi atau kategori..."
          class="w-full pl-9 pr-8 py-2 rounded-[16px] glass-input text-xs font-medium text-[#0f2547] placeholder-[#41587f]/60"
        />
        <button
          v-if="searchQuery"
          @click="searchQuery = ''"
          class="absolute right-3 top-1/2 -translate-y-1/2 text-[#41587f] hover:text-[#0f2547] text-sm"
        >
          ×
        </button>
      </div>

      <!-- Type Filter Pills -->
      <div class="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          v-for="t in typeFilters"
          :key="t.key"
          @click="activeType = t.key"
          type="button"
          class="px-3 py-1.5 text-xs font-medium rounded-full transition-all shrink-0 min-h-[34px] flex items-center"
          :class="activeType === t.key 
            ? 'glass-strong text-[#0f2547] font-semibold shadow-xs' 
            : 'text-[#41587f] hover:text-[#0f2547]'"
        >
          {{ t.label }}
        </button>
      </div>

      <!-- Wallet Filter -->
      <div class="flex items-center gap-2 text-xs">
        <span class="text-[#41587f] font-medium shrink-0">Rekening:</span>
        <select
          v-model="selectedWalletId"
          class="flex-1 px-3 py-1.5 rounded-xl glass-input text-xs font-medium text-[#0f2547] cursor-pointer"
        >
          <option value="ALL">Semua Rekening</option>
          <option v-for="w in store.wallets" :key="w.id" :value="w.id">
            {{ w.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Transaction List (referensi-ui.html: .item, .badge, .v) -->
    <div class="glass p-3.5 rounded-[26px] divide-y divide-white/70">
      <div
        v-for="tx in filteredTransactions"
        :key="tx.id"
        class="py-2.5 flex items-center gap-3 group"
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

        <!-- Description & Metadata -->
        <div class="flex-1 min-w-0">
          <div class="text-[14.5px] font-medium text-[#0f2547] truncate">
            {{ tx.notes || tx.category?.name || 'Mutasi' }}
          </div>
          <div class="text-[12px] text-[#41587f] truncate mt-0.5">
            <span v-if="tx.category" class="font-medium text-[#0f2547]">{{ tx.category.name }} · </span>
            <span>{{ formatRelativeDate(tx.date) }}</span>
            <span>·</span>
            <span class="truncate">
              {{ tx.type === 'TRANSFER' 
                ? `${tx.sourceWallet?.name} → ${tx.targetWallet?.name}` 
                : tx.sourceWallet?.name }}
            </span>
          </div>
        </div>

        <!-- Amount & Delete Action (referensi-ui.html: .v, .v.in) -->
        <div class="text-right shrink-0 flex items-center gap-2 ml-2">
          <div>
            <div 
              class="text-[14.5px] font-medium font-mono"
              :class="tx.type === 'INCOME' ? 'text-[#1f5fd1]' : tx.type === 'TRANSFER' ? 'text-indigo-600' : 'text-[#0f2547]'"
            >
              {{ tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '−' : '⇄' }}
              {{ store.formatMoney(tx.amount) }}
            </div>
            <div class="text-[10px] text-[#41587f]">
              {{ tx.type === 'EXPENSE' ? 'Pengeluaran' : tx.type === 'INCOME' ? 'Pemasukan' : 'Pindah Saldo' }}
            </div>
          </div>

          <!-- Delete Button -->
          <button
            @click="handleDelete(tx.id)"
            class="w-7 h-7 rounded-lg text-[#41587f]/60 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors"
            title="Hapus Transaksi (Rollback Saldo)"
          >
            <DynamicIcon name="Trash2" :size="13" />
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div 
        v-if="filteredTransactions.length === 0" 
        class="py-8 text-center space-y-1.5"
      >
        <div class="w-10 h-10 mx-auto rounded-full bg-white/50 flex items-center justify-center text-[#41587f]">
          <DynamicIcon name="Search" :size="18" />
        </div>
        <div class="text-xs font-semibold text-[#0f2547]">Tidak ada transaksi ditemukan</div>
        <p class="text-[11px] text-[#41587f]">Coba sesuaikan filter atau kata kunci pencarian Anda.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from '@/stores/financeStore'
import { formatIdr, formatRelativeDate } from '@/utils/formatters'
import DynamicIcon from '@/components/DynamicIcon.vue'

defineEmits(['open-transaction'])
const store = useFinanceStore()

const searchQuery = ref('')
const activeType = ref('ALL')
const selectedWalletId = ref('ALL')

const typeFilters = [
  { key: 'ALL', label: 'Semua' },
  { key: 'EXPENSE', label: 'Pengeluaran' },
  { key: 'INCOME', label: 'Pemasukan' },
  { key: 'TRANSFER', label: 'Transfer' }
]

const filteredTransactions = computed(() => {
  return store.recentTransactions.filter(tx => {
    if (activeType.value !== 'ALL' && tx.type !== activeType.value) {
      return false
    }

    if (selectedWalletId.value !== 'ALL') {
      const matchSource = tx.sourceWalletId === selectedWalletId.value
      const matchTarget = tx.targetWalletId === selectedWalletId.value
      if (!matchSource && !matchTarget) return false
    }

    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      const notes = (tx.notes || '').toLowerCase()
      const catName = (tx.category?.name || '').toLowerCase()
      const srcName = (tx.sourceWallet?.name || '').toLowerCase()
      const tgtName = (tx.targetWallet?.name || '').toLowerCase()
      if (!notes.includes(q) && !catName.includes(q) && !srcName.includes(q) && !tgtName.includes(q)) {
        return false
      }
    }

    return true
  })
})

const stats = computed(() => {
  let income = 0
  let expense = 0
  filteredTransactions.value.forEach(tx => {
    if (tx.type === 'INCOME') income += Number(tx.amount) || 0
    if (tx.type === 'EXPENSE') expense += Number(tx.amount) || 0
  })
  return { income, expense }
})

function handleDelete(id) {
  if (confirm('Hapus transaksi ini? Saldo rekening akan dikembalikan otomatis.')) {
    store.deleteTransaction(id)
  }
}
</script>
