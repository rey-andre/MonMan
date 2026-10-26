<template>
  <main class="phone-shell relative shadow-phone mx-auto flex flex-col justify-between overflow-hidden">
    <!-- Ambient Liquid Glass Orbs (referensi-ui.html) -->
    <div class="orb o1" aria-hidden="true"></div>
    <div class="orb o2" aria-hidden="true"></div>
    <div class="orb o3" aria-hidden="true"></div>

    <!-- Main Scrollable Page Area with Native Touch Inertia -->
    <div 
      ref="scrollContainer" 
      class="flex-1 h-full overflow-y-auto no-scrollbar px-4 pt-4 pb-28 relative z-10"
      :class="{ '!pb-4': route.path === '/auth' }"
      style="-webkit-overflow-scrolling: touch;"
    >
      <router-view 
        v-slot="{ Component }"
        @open-transaction="openTransactionModal"
        @open-wallet="openWalletModal()"
        @open-crypto="openCryptoModal()"
        @edit-wallet="openWalletModal"
        @edit-crypto="openCryptoModal"
        @open-debt="openDebtModal()"
        @edit-debt="openDebtModal"
        @open-profile="openProfileModal"
      >
        <transition name="page-fade" mode="out-in">
          <component 
            :is="Component" 
            @open-transaction="openTransactionModal"
            @open-wallet="openWalletModal()"
            @open-crypto="openCryptoModal()"
            @edit-wallet="openWalletModal"
            @edit-crypto="openCryptoModal"
            @open-debt="openDebtModal()"
            @edit-debt="openDebtModal"
            @open-profile="openProfileModal"
          />
        </transition>
      </router-view>
    </div>

    <!-- Fixed Floating Liquid Glass Bottom Navigation Bar (Hidden on Auth page) -->
    <BottomNav v-if="route.path !== '/auth'" />

    <!-- Interactive Glass Modals -->
    <TransactionModal
      :is-open="isTransactionModalOpen"
      @close="isTransactionModalOpen = false"
    />

    <WalletModal
      :is-open="isWalletModalOpen"
      :wallet-data="selectedWallet"
      @close="isWalletModalOpen = false"
    />

    <CryptoModal
      :is-open="isCryptoModalOpen"
      :crypto-data="selectedCrypto"
      @close="isCryptoModalOpen = false"
    />

    <DebtModal
      :is-open="isDebtModalOpen"
      :debt-data="selectedDebt"
      @close="isDebtModalOpen = false"
    />

    <ProfileModal
      :is-open="isProfileModalOpen"
      @close="isProfileModalOpen = false"
    />
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useFinanceStore } from '@/stores/financeStore'
import { useAuthStore } from '@/stores/authStore'
import BottomNav from '@/components/BottomNav.vue'
import TransactionModal from '@/components/modals/TransactionModal.vue'
import WalletModal from '@/components/modals/WalletModal.vue'
import CryptoModal from '@/components/modals/CryptoModal.vue'
import DebtModal from '@/components/modals/DebtModal.vue'
import ProfileModal from '@/components/modals/ProfileModal.vue'

const route = useRoute()
const store = useFinanceStore()
const authStore = useAuthStore()
const scrollContainer = ref(null)

// Modal States
const isTransactionModalOpen = ref(false)
const isWalletModalOpen = ref(false)
const isCryptoModalOpen = ref(false)
const isDebtModalOpen = ref(false)
const isProfileModalOpen = ref(false)

const selectedWallet = ref(null)
const selectedCrypto = ref(null)
const selectedDebt = ref(null)

function openTransactionModal() {
  isTransactionModalOpen.value = true
}

function openWalletModal(wallet = null) {
  selectedWallet.value = wallet
  isWalletModalOpen.value = true
}

function openCryptoModal(crypto = null) {
  selectedCrypto.value = crypto
  isCryptoModalOpen.value = true
}

function openDebtModal(debt = null) {
  selectedDebt.value = debt
  isDebtModalOpen.value = true
}

function openProfileModal() {
  isProfileModalOpen.value = true
}

// Lifecycle
onMounted(async () => {
  await authStore.initAuth()
  await store.refreshMarketRates()
  if (authStore.isAuthenticated) {
    await store.fetchUserData()
  }
})
</script>

<style scoped>
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(4px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
