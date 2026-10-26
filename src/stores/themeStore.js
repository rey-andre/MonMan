import { defineStore } from 'pinia'

export const THEME_STORAGE_KEY = 'monman_theme'

export const useThemeStore = defineStore('theme', {
  state: () => ({
    currentTheme: localStorage.getItem(THEME_STORAGE_KEY) || 'light',
    systemIsDark: typeof window !== 'undefined' && window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)').matches : false,
    mediaQueryListener: null
  }),

  getters: {
    isDark: (state) => {
      if (state.currentTheme === 'dark') return true
      if (state.currentTheme === 'light') return false
      return state.systemIsDark
    },
    themeLabel: (state) => {
      if (state.currentTheme === 'dark') return 'Gelap'
      if (state.currentTheme === 'light') return 'Terang'
      return 'Sistem'
    }
  },

  actions: {
    initTheme() {
      if (typeof window === 'undefined') return

      // Read current system preference
      if (window.matchMedia) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)')
        this.systemIsDark = mq.matches

        // Remove previous listener if exists
        if (this.mediaQueryListener) {
          mq.removeEventListener('change', this.mediaQueryListener)
        }

        this.mediaQueryListener = (e) => {
          this.systemIsDark = e.matches
          if (this.currentTheme === 'system') {
            this.applyTheme()
          }
        }

        mq.addEventListener('change', this.mediaQueryListener)
      }

      this.applyTheme()
    },

    setTheme(theme) {
      if (!['system', 'light', 'dark'].includes(theme)) return
      this.currentTheme = theme
      localStorage.setItem(THEME_STORAGE_KEY, theme)
      this.applyTheme()
    },

    toggleTheme() {
      if (this.isDark) {
        this.setTheme('light')
      } else {
        this.setTheme('dark')
      }
    },

    applyTheme() {
      if (typeof document === 'undefined') return

      const html = document.documentElement
      const shouldBeDark = this.isDark

      if (shouldBeDark) {
        html.classList.add('dark')
        html.setAttribute('data-theme', 'dark')
      } else {
        html.classList.remove('dark')
        html.setAttribute('data-theme', 'light')
      }

      // Update mobile browser chrome bar theme-color
      let metaTheme = document.querySelector('meta[name="theme-color"]')
      if (!metaTheme) {
        metaTheme = document.createElement('meta')
        metaTheme.name = 'theme-color'
        document.head.appendChild(metaTheme)
      }
      metaTheme.content = shouldBeDark ? '#09101d' : '#cfe3ff'
    }
  }
})
