import { defineStore } from 'pinia'
import { supabase } from '@/services/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    profile: null,
    isLoading: false,
    isInitialLoading: true,
    authError: null
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.user),
    userName: (state) => {
      if (state.profile?.full_name) return state.profile.full_name
      if (state.user?.user_metadata?.full_name) return state.user.user_metadata.full_name
      if (state.user?.email) return state.user.email.split('@')[0]
      return 'Tamu'
    },
    userEmail: (state) => state.user?.email || '',
    userInitial: (state) => {
      const name = state.userName || 'M'
      return name.charAt(0).toUpperCase()
    }
  },

  actions: {
    async initAuth() {
      if (!supabase) {
        this.isInitialLoading = false
        return
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        if (error) throw error

        this.session = session
        this.user = session?.user || null

        if (this.user) {
          await this.fetchProfile()
        }
      } catch (err) {
        console.error('Failed to get initial session:', err)
      } finally {
        this.isInitialLoading = false
      }

      // Listen for auth state changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        this.session = session
        this.user = session?.user || null

        if (this.user) {
          await this.fetchProfile()
        } else {
          this.profile = null
        }
      })
    },

    async fetchProfile() {
      if (!supabase || !this.user) return
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', this.user.id)
          .maybeSingle()

        if (error) {
          console.warn('Profile fetch warning:', error)
          return
        }

        if (data) {
          this.profile = data
        } else {
          // If no profile row yet, create one
          const defaultName = this.user.user_metadata?.full_name || this.user.email?.split('@')[0] || 'User'
          const { data: newProfile } = await supabase
            .from('profiles')
            .upsert({ id: this.user.id, full_name: defaultName })
            .select()
            .single()
          this.profile = newProfile
        }
      } catch (err) {
        console.error('Error fetching profile:', err)
      }
    },

    async login(email, password) {
      if (!supabase) throw new Error('Supabase client tidak terkonfigurasi')
      this.isLoading = true
      this.authError = null

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        })

        if (error) {
          let userMsg = error.message
          if (error.message.includes('Invalid login credentials')) {
            userMsg = 'Email atau kata sandi tidak sesuai.'
          } else if (error.message.includes('Email not confirmed')) {
            userMsg = 'Email belum dikonfirmasi. Periksa kotak masuk email Anda.'
          }
          throw new Error(userMsg)
        }

        this.session = data.session
        this.user = data.user
        await this.fetchProfile()
        return data
      } catch (err) {
        this.authError = err.message
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async register(email, password, fullName) {
      if (!supabase) throw new Error('Supabase client tidak terkonfigurasi')
      this.isLoading = true
      this.authError = null

      try {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim()
            }
          }
        })

        if (error) {
          let userMsg = error.message
          if (error.message.includes('User already registered')) {
            userMsg = 'Email sudah terdaftar. Silakan langsung masuk.'
          } else if (error.message.includes('Password should be at least')) {
            userMsg = 'Kata sandi minimal harus 6 karakter.'
          }
          throw new Error(userMsg)
        }

        this.session = data.session
        this.user = data.user
        if (this.user) {
          await this.fetchProfile()
        }
        return data
      } catch (err) {
        this.authError = err.message
        throw err
      } finally {
        this.isLoading = false
      }
    },

    async logout() {
      if (!supabase) return
      this.isLoading = true
      try {
        await supabase.auth.signOut()
        this.user = null
        this.session = null
        this.profile = null
      } catch (err) {
        console.error('Logout error:', err)
      } finally {
        this.isLoading = false
      }
    }
  }
})
