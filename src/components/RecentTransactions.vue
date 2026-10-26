<template>
  <section class="glass p-4 rounded-3xl my-3" aria-label="Riwayat Mutasi">
    <!-- Header -->
    <div class="flex items-center justify-between mb-2">
      <h2 class="text-sm font-bold text-ink">Riwayat Mutasi Terkini</h2>
      <button 
        @click="$emit('open-transaction')"
        class="text-xs font-semibold text-brand-blue hover:underline flex items-center gap-1"
      >
        <DynamicIcon name="Plus" :size="13" />
        Catat Baru
      </button>
    </div>

    <!-- Filter Pills -->
    <div class="flex gap-1 overflow-x-auto no-scrollbar py-1 mb-2">
      <button
        v-for="f in filterOptions"
        :key="f.key"
        @click="activeFilter = f.key"
        type="button"
        class="px-2.5 py-1 text-[11px] font-medium rounded-full transition-all shrink-0"
        :class="activeFilter === f.key 
          ? 'bg-ink text-white font-semibold' 
          : 'bg-white/40 text-ink-muted hover:bg-white/70'"
      >
        {{ f.label }}
      </button>
    </div>

    <!-- Transaction List -->
    <div v-if="filteredTransactions.length > 0" class="divide-y divide-white/60">
      <div
        v-for="tx in filteredTransactions"
        :key="tx.id"
        class="py-2.5 flex items-center gap-3 group"
      >
        <!-- Icon Badge -->
        <div 
          class="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
          :class="getBadgeClass(tx.type)"
        >
          <DynamicIcon 
            :name="tx.type === 'TRANSFER' ? 'ArrowLeftRight' : (tx.category?.icon || 'Coins')" 
            :size="17" 
            :class="getIconColorClass(tx.type)"
          />
        </div>

        <!-- Description & Metadata -->
        <div class="flex-1 min-w-0">
          <div class="text-xs font-bold text-ink truncate">
            {{ tx.notes || tx.category?.name || 'Transaksi' }}
          </div>
          <div class="text-[11px] text-ink-muted truncate mt-0.5 flex items-center gap-1">
            <span v-if="tx.category">{{ tx.category.name }} · </span>
            <span>{{ formatRelativeDate(tx.date) }}</span>
            <span>·</span>
            <span class="truncate">
              {{ tx.type === 'TRANSFER' 
                ? `${tx.sourceWallet?.name} → ${tx.targetWallet?.name}` 
                : tx.sourceWallet?.name }}
            </span>
          </div>
        </div>

        <!-- Amount & Delete Action -->
        <div class="text-right shrink-0 flex items-center gap-2">
          <div>
            <div 
              class="text-xs font-bold font-mono"
              :class="tx.type === 'INCOME' ? 'text-blue-600' : tx.type === 'TRANSFER' ? 'text-indigo-600' : 'text-ink'"
            >
              {{ tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '−' : '⇄' }}
              {{ formatIdr(tx.amount) }}
            </div>
            <div class="text-[9px] text-ink-muted">
              {{ tx.type === 'EXPENSE' ? 'Keluar' : tx.type === 'INCOME' ? 'Masuk' : 'Transfer' }}
            </div>
          </div>

          <!-- Delete button (visible on hover / active) -->
          <button
            @click="deleteTx(tx.id)"
            class="w-6 h-6 rounded-lg glass opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-red-500 hover:bg-red-50"
            title="Hapus transaksi"
          >
            <DynamicIcon name="Trash2" :size="12" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-6 text-xs text-ink-muted">
      Belum ada transaksi pada filter ini.
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useFinanceStore } from '@/stores/financeStore'
import { formatIdr, formatRelativeDate } from '@/utils/formatters'
import DynamicIcon from '@/components/DynamicIcon.vue'

defineEmits(['open-transaction'])
const store = useFinanceStore()

const activeFilter = ref('ALL')

const filterOptions = [
  { key: 'ALL', label: 'Semua' },
  { key: 'EXPENSE', label: 'Pengeluaran' },
  { key: 'INCOME', label: 'Pemasukan' },
  { key: 'TRANSFER', label: 'Transfer' }
]

const filteredTransactions = computed(() => {
  const list = store.recentTransactions
  if (activeFilter.value === 'ALL') return list
  return list.filter(t => t.type === activeFilter.value)
})

function getBadgeClass(type) {
  if (type === 'EXPENSE') return 'bg-[#ffe6d1]' // Peach / Orange like reference
  if (type === 'INCOME') return 'bg-brand-mist' // Mist / Sky blue like reference
  return 'bg-purple-100/70'
}

function getIconColorClass(type) {
  if (type === 'EXPENSE') return 'text-[#9a4a0c]'
  if (type === 'INCOME') return 'text-brand-blue'
  return 'text-purple-600'
}

function deleteTx(id) {
  if (confirm('Hapus transaksi ini dan kembalikan saldo rekening?')) {
    store.deleteTransaction(id)
  }
}
</script>
