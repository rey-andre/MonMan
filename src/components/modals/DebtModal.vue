<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#0f2547]/30 backdrop-blur-sm transition-all duration-300">
    <div 
      class="glass-strong w-full max-w-[430px] rounded-t-[36px] sm:rounded-[36px] max-h-[90vh] overflow-y-auto no-scrollbar p-6 shadow-2xl border border-white/80 animate-in slide-in-from-bottom duration-300"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-3.5 border-b border-white/60">
        <div>
          <h3 class="text-[17px] font-semibold text-[#0f2547]">
            {{ isEdit ? 'Ubah Catatan Hutang / Piutang' : 'Catat Hutang / Piutang' }}
          </h3>
          <p class="text-xs text-[#41587f]">Kelola kewajiban bayar dan hak tagih secara transparan</p>
        </div>
        <button 
          @click="close" 
          class="w-8 h-8 rounded-full glass flex items-center justify-center text-[#41587f] hover:text-[#0f2547] transition-colors"
          aria-label="Tutup modal"
        >
          <DynamicIcon name="X" :size="15" />
        </button>
      </div>

      <!-- Type Switcher (Piutang vs Hutang) -->
      <div class="grid grid-cols-2 gap-1.5 p-1.5 my-3.5 bg-white/40 rounded-2xl border border-white/60">
        <button
          type="button"
          @click="form.type = 'PIUTANG'"
          class="py-2.5 px-3 text-xs font-semibold rounded-xl transition-all min-h-[42px] flex items-center justify-center gap-1.5"
          :class="form.type === 'PIUTANG' 
            ? 'bg-[#4f8cff] text-white shadow-sm' 
            : 'text-[#41587f] hover:text-[#0f2547]'"
        >
          <DynamicIcon name="ArrowDownLeft" :size="14" />
          <span>Piutang (Hak Tagih)</span>
        </button>
        <button
          type="button"
          @click="form.type = 'HUTANG'"
          class="py-2.5 px-3 text-xs font-semibold rounded-xl transition-all min-h-[42px] flex items-center justify-center gap-1.5"
          :class="form.type === 'HUTANG' 
            ? 'bg-[#ff9a4d] text-white shadow-sm' 
            : 'text-[#41587f] hover:text-[#0f2547]'"
        >
          <DynamicIcon name="ArrowUpRight" :size="14" />
          <span>Hutang (Kewajiban)</span>
        </button>
      </div>

      <!-- Form Inputs -->
      <div class="space-y-3.5">
        <!-- Nama Orang / Pihak -->
        <div>
          <label class="block text-xs font-semibold text-[#41587f] mb-1">
            {{ form.type === 'PIUTANG' ? 'Nama Peminjam / Yang Berhutang' : 'Nama Pemberi Pinjaman / Yang Dihutangi' }}
          </label>
          <input
            v-model="form.person"
            type="text"
            :placeholder="form.type === 'PIUTANG' ? 'Contoh: Budi Santoso, Rekan Kantor' : 'Contoh: Siti Rahma, Pinjaman KTA'"
            class="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-semibold text-[#0f2547]"
          />
        </div>

        <!-- Nominal -->
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
            />
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
          </div>
        </div>

        <!-- Tanggal Jatuh Tempo -->
        <div>
          <label class="block text-xs font-semibold text-[#41587f] mb-1">Tanggal Jatuh Tempo (Opsional)</label>
          <input
            v-model="form.dueDate"
            type="date"
            class="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs font-semibold text-[#0f2547]"
          />
        </div>

        <!-- Catatan Tambahan -->
        <div>
          <label class="block text-xs font-semibold text-[#41587f] mb-1">Catatan Tambahan</label>
          <input
            v-model="form.notes"
            type="text"
            placeholder="Contoh: Talangan beli tiket, modal usaha, dsb"
            class="w-full px-3.5 py-2.5 rounded-2xl glass-input text-xs text-[#0f2547]"
          />
        </div>

        <!-- Status Lunas (Toggle if Edit) -->
        <div v-if="isEdit" class="flex items-center justify-between p-3 rounded-2xl bg-white/40 border border-white/60">
          <div>
            <div class="text-xs font-semibold text-[#0f2547]">Status Pelunasan</div>
            <div class="text-[11px] text-[#41587f]">Tandai jika transaksi sudah diselesaikan</div>
          </div>
          <button
            type="button"
            @click="form.isPaid = !form.isPaid"
            class="px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
            :class="form.isPaid ? 'bg-emerald-500 text-white shadow-xs' : 'glass text-[#41587f]'"
          >
            <DynamicIcon :name="form.isPaid ? 'CheckCircle2' : 'Circle'" :size="14" />
            <span>{{ form.isPaid ? 'Lunas' : 'Belum Lunas' }}</span>
          </button>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="mt-6 space-y-2">
        <button
          @click="handleSave"
          :disabled="!isValid"
          class="w-full py-3.5 rounded-2xl text-white font-semibold text-sm shadow-md transition-all active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
          :style="{ background: form.type === 'PIUTANG' ? 'linear-gradient(135deg, var(--blue), #7fb0ff)' : 'linear-gradient(135deg, var(--orange), #ffa66b)' }"
        >
          <DynamicIcon name="Check" :size="16" />
          <span>{{ isEdit ? 'Simpan Perubahan' : 'Catat Sekarang' }}</span>
        </button>

        <button
          v-if="isEdit"
          @click="handleDelete"
          class="w-full py-2.5 rounded-2xl text-red-500 hover:text-red-600 font-semibold text-xs text-center hover:bg-red-50/50 transition-all cursor-pointer"
        >
          Hapus Catatan Ini
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, watch, computed } from 'vue'
import { useFinanceStore } from '@/stores/financeStore'
import DynamicIcon from '@/components/DynamicIcon.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  debtData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['close'])
const store = useFinanceStore()

const isEdit = computed(() => Boolean(props.debtData?.id))

const quickAmounts = [
  { label: '100rb', value: 100000 },
  { label: '500rb', value: 500000 },
  { label: '1jt', value: 1000000 },
  { label: '2.5jt', value: 2500000 }
]

const form = reactive({
  id: null,
  type: 'PIUTANG',
  person: '',
  amount: null,
  dueDate: '',
  notes: '',
  isPaid: false
})

watch(
  () => props.debtData,
  (val) => {
    if (val) {
      form.id = val.id
      form.type = val.type || 'PIUTANG'
      form.person = val.person || ''
      form.amount = val.amount || null
      form.dueDate = val.dueDate || ''
      form.notes = val.notes || ''
      form.isPaid = Boolean(val.isPaid)
    } else {
      resetForm()
    }
  },
  { immediate: true }
)

function resetForm() {
  form.id = null
  form.type = 'PIUTANG'
  form.person = ''
  form.amount = null
  form.dueDate = ''
  form.notes = ''
  form.isPaid = false
}

const isValid = computed(() => {
  return form.person && form.person.trim().length > 0 && Number(form.amount) > 0
})

function close() {
  resetForm()
  emit('close')
}

function handleSave() {
  if (!isValid.value) return
  store.saveDebt({
    id: form.id,
    type: form.type,
    person: form.person,
    amount: form.amount,
    dueDate: form.dueDate,
    isPaid: form.isPaid,
    notes: form.notes
  })
  close()
}

function handleDelete() {
  if (confirm(`Yakin ingin menghapus catatan ${form.type === 'PIUTANG' ? 'piutang' : 'hutang'} ini?`)) {
    store.deleteDebt(form.id)
    close()
  }
}
</script>
