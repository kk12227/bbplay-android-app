import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Booking, Transaction, Computer } from '@/types'

// ─── Mock computers data ───────────────────────────────────────────────────
export const MOCK_COMPUTERS: Computer[] = [
  // Standard zone
  ...Array.from({ length: 8 }, (_, i) => ({
    id: `std-${i + 1}`,
    club_id: 'club-1',
    seat_number: i + 1,
    zone: 'standard' as const,
    specs: { cpu: 'Intel Core i5-12400', gpu: 'RTX 3060', ram: '16GB DDR5', monitor: '27" Full HD', hz: 144 },
    hourly_rate: 80,
    status: ([
      'free','free','busy','free','reserved','free','busy','free'
    ] as const)[i]
  })),
  // VIP zone
  ...Array.from({ length: 6 }, (_, i) => ({
    id: `vip-${i + 1}`,
    club_id: 'club-1',
    seat_number: i + 1,
    zone: 'vip' as const,
    specs: { cpu: 'Intel Core i9-12900K', gpu: 'RTX 4070 Ti', ram: '32GB DDR5', monitor: '27" QHD', hz: 240 },
    hourly_rate: 140,
    status: ([
      'free','busy','free','free','reserved','free'
    ] as const)[i]
  })),
  // Cyber zone
  ...Array.from({ length: 4 }, (_, i) => ({
    id: `cyber-${i + 1}`,
    club_id: 'club-1',
    seat_number: i + 1,
    zone: 'cyber' as const,
    specs: { cpu: 'Intel Core i9-13900K', gpu: 'RTX 4090', ram: '64GB DDR5', monitor: '32" 4K', hz: 360 },
    hourly_rate: 200,
    status: ([
      'free','free','busy','free'
    ] as const)[i]
  }))
]

// ─── Auth store ────────────────────────────────────────────────────────────
interface AuthStore {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (email: string, username: string, password: string) => Promise<boolean>
  logout: () => void
  updateBalance: (amount: number) => void
  updateUsername: (name: string) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: async (email, password) => {
        // Demo login — any credentials work, or use demo@bbplay.ru / demo1234
        await new Promise(r => setTimeout(r, 800))
        if (password.length < 4) return false

        const user: User = {
          id: 'user-' + Date.now(),
          email,
          username: email.split('@')[0],
          balance: 350,
          created_at: new Date().toISOString()
        }
        set({ user, isAuthenticated: true })
        return true
      },

      register: async (email, username, password) => {
        await new Promise(r => setTimeout(r, 1000))
        if (password.length < 6) return false

        const user: User = {
          id: 'user-' + Date.now(),
          email,
          username,
          balance: 0,
          created_at: new Date().toISOString()
        }
        set({ user, isAuthenticated: true })
        return true
      },

      logout: () => set({ user: null, isAuthenticated: false }),

      updateBalance: (amount) => {
        const { user } = get()
        if (!user) return
        const newBalance = user.balance + amount
        set({ user: { ...user, balance: Math.max(0, newBalance) } })
      },

      updateUsername: (name: string) => {
        const { user } = get()
        if (!user) return
        set({ user: { ...user, username: name } })
      }
    }),
    { name: 'bbplay-auth', partialize: (s) => ({ user: s.user, isAuthenticated: s.isAuthenticated }) }
  )
)

// ─── Bookings store ────────────────────────────────────────────────────────
interface BookingsStore {
  bookings: Booking[]
  transactions: Transaction[]
  addBooking: (booking: Booking) => void
  cancelBooking: (id: string) => void
  addTransaction: (tx: Transaction) => void
}

export const useBookingsStore = create<BookingsStore>()(
  persist(
    (set) => ({
      bookings: [],
      transactions: [],

      addBooking: (booking) => set(s => ({ bookings: [booking, ...s.bookings] })),

      cancelBooking: (id) => set(s => ({
        bookings: s.bookings.map(b =>
          b.id === id ? { ...b, status: 'cancelled' as const } : b
        )
      })),

      addTransaction: (tx) => set(s => ({ transactions: [tx, ...s.transactions] }))
    }),
    { name: 'bbplay-bookings' }
  )
)
