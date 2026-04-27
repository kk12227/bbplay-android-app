export interface User {
  id: string
  email: string
  username: string
  balance: number
  avatar_url?: string
  created_at: string
}

export interface Club {
  id: string
  name: string
  address: string
  city: string
  open_hours: string
  rating: number
  image_url?: string
  total_seats: number
}

export interface Computer {
  id: string
  club_id: string
  seat_number: number
  zone: 'standard' | 'vip' | 'cyber'
  specs: {
    cpu: string
    gpu: string
    ram: string
    monitor: string
    hz: number
  }
  hourly_rate: number
  status: 'free' | 'busy' | 'reserved' | 'maintenance'
}

export interface Booking {
  id: string
  user_id: string
  computer_id: string
  club_id: string
  seat_number: number
  zone: string
  start_time: string
  end_time: string
  total_cost: number
  status: 'upcoming' | 'active' | 'completed' | 'cancelled'
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'topup' | 'payment' | 'refund'
  amount: number
  description: string
  created_at: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface TimeSlot {
  start: string
  end: string
  available: boolean
}
