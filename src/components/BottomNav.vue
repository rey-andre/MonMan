<template>
  <nav 
    class="liquid-nav absolute left-4 right-4 flex justify-around items-center p-2 rounded-[32px] z-40 select-none"
    style="bottom: calc(14px + env(safe-area-inset-bottom, 0px));"
    aria-label="Navigasi Utama"
  >
    <!-- Curved Specular Gloss Overlay -->
    <div class="nav-gloss" aria-hidden="true"></div>

    <router-link
      v-for="item in navItems"
      :key="item.path"
      :to="item.path"
      class="nav-tab group cursor-pointer"
      :class="isActive(item.path) ? 'active' : 'inactive'"
      :aria-label="item.label"
    >
      <!-- Active Specular Lens Sheen -->
      <div v-if="isActive(item.path)" class="tab-gloss" aria-hidden="true"></div>

      <!-- Icon with dynamic scale & liquid tint -->
      <DynamicIcon 
        :name="item.icon" 
        :size="21" 
        class="transition-transform duration-300 relative z-10"
        :class="isActive(item.path) 
          ? 'text-white drop-shadow-[0_1px_2px_rgba(15,37,71,0.25)]' 
          : 'text-[#0f2547] group-hover:scale-110 group-hover:text-[#4f8cff] dark:text-[#94a9c9] dark:group-hover:text-[#5d9dfc]'" 
      />

      <!-- Active Micro Glow Dot Indicator -->
      <span 
        v-if="isActive(item.path)" 
        class="active-dot"
        aria-hidden="true"
      ></span>
    </router-link>
  </nav>
</template>

<script setup>
import { useRoute } from 'vue-router'
import DynamicIcon from '@/components/DynamicIcon.vue'

const route = useRoute()

const navItems = [
  { path: '/', label: 'Beranda', icon: 'Home' },
  { path: '/wallets', label: 'Dompet', icon: 'Landmark' },
  { path: '/crypto', label: 'Kripto', icon: 'Bitcoin' },
  { path: '/insights', label: 'Analisis', icon: 'PieChart' },
  { path: '/transactions', label: 'Mutasi', icon: 'History' }
]

function isActive(path) {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}
</script>

<style scoped>
/* Liquid Glass Navigation Bar */
.liquid-nav {
  position: absolute;
  /* Crystal-clear translucent glass gradient */
  background: linear-gradient(
    135deg, 
    rgba(255, 255, 255, 0.36) 0%, 
    rgba(255, 255, 255, 0.14) 50%, 
    rgba(255, 255, 255, 0.28) 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.65);
  -webkit-backdrop-filter: blur(20px) saturate(210%);
  backdrop-filter: blur(20px) saturate(210%);
  /* Delicate refraction bevel + luminous drop shadow */
  box-shadow: 
    0 16px 36px -6px rgba(79, 140, 255, 0.16),
    0 4px 14px rgba(15, 37, 71, 0.05),
    inset 0 1.5px 1px 0 rgba(255, 255, 255, 0.85),
    inset 0 -1px 1px 0 rgba(255, 255, 255, 0.2),
    inset 0 0 12px rgba(255, 255, 255, 0.15);
  overflow: hidden;
}

/* Curved Specular Highlight across top rim */
.nav-gloss {
  position: absolute;
  top: 1px;
  left: 12px;
  right: 12px;
  height: 48%;
  border-radius: 26px 26px 80px 80px / 20px 20px 30px 30px;
  background: linear-gradient(
    180deg, 
    rgba(255, 255, 255, 0.35) 0%, 
    rgba(255, 255, 255, 0.02) 80%, 
    transparent 100%
  );
  pointer-events: none;
  z-index: 2;
}

/* Base Nav Tab Item */
.nav-tab {
  position: relative;
  width: 52px;
  height: 46px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  -webkit-tap-highlight-color: transparent;
  z-index: 5;
}

/* Inactive Tab State */
.nav-tab.inactive {
  background: transparent;
}
.nav-tab.inactive:hover {
  background: rgba(255, 255, 255, 0.25);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.5);
}
.nav-tab.inactive:active {
  transform: scale(0.92);
}

/* Active Liquid Droplet Bubble State */
.nav-tab.active {
  background: linear-gradient(
    140deg, 
    #4f8cff 0%, 
    #6fa6ff 48%, 
    #3f7df8 100%
  );
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: 
    0 8px 22px -2px rgba(79, 140, 255, 0.52),
    0 3px 8px rgba(79, 140, 255, 0.3),
    inset 0 1.5px 2px rgba(255, 255, 255, 0.8),
    inset 0 -1.5px 2px rgba(15, 37, 71, 0.2);
  transform: translateY(-1px);
}

/* Inner Gloss Sheen inside active droplet */
.tab-gloss {
  position: absolute;
  top: 1.5px;
  left: 6px;
  right: 6px;
  height: 42%;
  border-radius: 18px 18px 60px 60px / 14px 14px 20px 20px;
  background: linear-gradient(
    180deg, 
    rgba(255, 255, 255, 0.55) 0%, 
    rgba(255, 255, 255, 0) 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* Active Micro Dot Indicator */
.active-dot {
  position: absolute;
  bottom: 4px;
  width: 4px;
  height: 4px;
  border-radius: 9999px;
  background: #ffffff;
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.9);
  pointer-events: none;
}
</style>
