import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import HomeView from '@/views/HomeView.vue'
import InsightsView from '@/views/InsightsView.vue'
import WalletsView from '@/views/WalletsView.vue'
import TransactionsView from '@/views/TransactionsView.vue'
import AuthView from '@/views/AuthView.vue'
import CryptoView from '@/views/CryptoView.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView
  },
  {
    path: '/wallets',
    name: 'wallets',
    component: WalletsView
  },
  {
    path: '/crypto',
    name: 'crypto',
    component: CryptoView
  },
  {
    path: '/insights',
    name: 'insights',
    component: InsightsView
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: TransactionsView
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.isInitialized) {
    await authStore.initAuth()
  }

  const hasChoice = authStore.hasAuthChoice

  if (to.path === '/auth') {
    next()
  } else if (!hasChoice) {
    // Pengguna baru pertama kali akses tanpa preferensi login/guest -> arahkan ke halaman auth
    next({ path: '/auth', replace: true })
  } else {
    next()
  }
})

export default router
