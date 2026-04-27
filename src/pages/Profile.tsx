import { useState } from 'react'
import { LogOut, Monitor, Clock, Award, ChevronRight, Edit2, Check, X, Shield, Bell, HelpCircle, Trash2 } from 'lucide-react'
import { useAuthStore, useBookingsStore } from '@/lib/store'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import clsx from 'clsx'
import toast from 'react-hot-toast'

export default function Profile() {
  const user           = useAuthStore(s => s.user)
  const logout         = useAuthStore(s => s.logout)
  const updateUsername = useAuthStore(s => s.updateUsername)
  const bookings       = useBookingsStore(s => s.bookings)
  const cancelBooking  = useBookingsStore(s => s.cancelBooking)
  const [editing, setEditing] = useState(false)
  const [username, setUsername] = useState(user?.username || '')

  const totalHours   = bookings.filter(b => b.status === 'completed').length * 2
  const totalVisits  = bookings.filter(b => b.status !== 'cancelled').length
  const totalSpent   = bookings.filter(b => b.status !== 'cancelled').reduce((a, b) => a + b.total_cost, 0)
  const loyaltyHours = totalHours % 5
  const freeHoursEarned = Math.floor(totalHours / 5)

  const upcoming = bookings.filter(b => b.status === 'upcoming' || b.status === 'active')
  const past     = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled').slice(0, 5)

  function handleLogout() {
    logout()
    toast('До встречи! 👋', { icon: '🎮' })
  }

  const menuItems = [
    { icon: Bell,         label: 'Уведомления',    sub: 'Push-уведомления включены' },
    { icon: Shield,       label: 'Безопасность',   sub: 'Пароль и сессии'           },
    { icon: HelpCircle,   label: 'Поддержка',      sub: '@bbplay_support'            },
  ]

  return (
    <div className="page-wrapper pb-safe">
      <div className="px-4 pt-12 pb-4">
        <h1 className="font-display font-700 text-2xl">Профиль</h1>
      </div>

      <div className="px-4 space-y-4 overflow-y-auto scrollbar-hide">
        {/* Avatar + info */}
        <div className="card flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-neon-cyan/30 to-neon-blue/30 flex items-center justify-center text-2xl font-display font-700 text-neon-cyan border border-neon-cyan/20">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-neon-cyan flex items-center justify-center">
              <span className="text-dark-950 text-[9px] font-700">✓</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  className="input-field text-sm py-2 flex-1"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  autoFocus
                />
                <button onClick={() => setEditing(false)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <X size={14} />
                </button>
                <button onClick={() => { if (username.trim()) { updateUsername(username.trim()); setEditing(false); toast.success('Никнейм обновлён') } }} className="w-8 h-8 rounded-lg bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center">
                  <Check size={14} className="text-neon-cyan" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-display font-700 text-lg truncate">{username}</span>
                <button onClick={() => setEditing(true)} className="text-white/30 hover:text-white/60 transition-colors">
                  <Edit2 size={13} />
                </button>
              </div>
            )}
            <p className="text-white/40 text-xs truncate">{user?.email}</p>
            <p className="text-white/30 text-xs mt-0.5">
              С нами с {format(new Date(user?.created_at || Date.now()), 'd MMMM yyyy', { locale: ru })}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { icon: Clock,   label: 'Часов',    value: totalHours },
            { icon: Monitor, label: 'Визитов',  value: totalVisits },
            { icon: Award,   label: 'Потрачено', value: `${totalSpent}₽` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="card text-center p-3">
              <Icon size={16} className="text-neon-cyan mx-auto mb-1.5" />
              <div className="font-display font-700 text-base leading-none">{value}</div>
              <div className="text-white/40 text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Loyalty progress */}
        <div className="card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Award size={16} className="text-neon-cyan" />
              <span className="font-display font-700 text-sm">Программа лояльности</span>
            </div>
            {freeHoursEarned > 0 && (
              <span className="badge bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30 text-xs">
                +{freeHoursEarned} {freeHoursEarned === 1 ? 'час' : freeHoursEarned < 5 ? 'часа' : 'часов'} бесплатно
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs text-white/40 mb-1.5">
                <span>{loyaltyHours}/5 часов до награды</span>
                <span>🎁 Бесплатный час</span>
              </div>
              <div className="h-2 bg-dark-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-neon-cyan to-neon-blue rounded-full transition-all duration-500"
                  style={{ width: `${(loyaltyHours / 5) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Active bookings */}
        {upcoming.length > 0 && (
          <div>
            <h2 className="font-display font-700 text-sm text-white/50 uppercase tracking-wider mb-2">Активные брони</h2>
            <div className="space-y-2">
              {upcoming.map(b => (
                <div key={b.id} className="card flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
                    <Monitor size={16} className="text-neon-cyan" />
                  </div>
                  <div className="flex-1">
                    <div className="font-display font-500 text-sm">Место #{b.seat_number} · {b.zone.toUpperCase()}</div>
                    <div className="text-white/40 text-xs">
                      {format(new Date(b.start_time), 'HH:mm')} — {format(new Date(b.end_time), 'HH:mm')}
                    </div>
                  </div>
                  <button
                    onClick={() => { cancelBooking(b.id); toast.success('Бронь отменена') }}
                    className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 shrink-0 active:scale-90 transition-all"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {past.length > 0 && (
          <div>
            <h2 className="font-display font-700 text-sm text-white/50 uppercase tracking-wider mb-2">История</h2>
            <div className="space-y-2">
              {past.map(b => (
                <div key={b.id} className="card flex items-center gap-3 opacity-60">
                  <div className="w-9 h-9 rounded-xl bg-dark-700 flex items-center justify-center">
                    <Monitor size={16} className="text-white/40" />
                  </div>
                  <div className="flex-1">
                    <div className="font-display font-500 text-sm">Место #{b.seat_number} · {b.zone.toUpperCase()}</div>
                    <div className="text-white/30 text-xs">
                      {format(new Date(b.created_at), 'd MMM yyyy', { locale: ru })} · {b.total_cost} ₽
                    </div>
                  </div>
                  <span className={clsx(
                    'badge text-xs',
                    b.status === 'completed' ? 'bg-white/5 text-white/40' : 'bg-red-500/10 text-red-400'
                  )}>
                    {b.status === 'completed' ? 'Завершено' : 'Отменено'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Menu */}
        <div className="card divide-y divide-white/5 p-0 overflow-hidden">
          {menuItems.map(({ icon: Icon, label, sub }) => (
            <button key={label} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/5 transition-colors text-left active:bg-white/10">
              <Icon size={16} className="text-white/40 shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-display font-500">{label}</div>
                <div className="text-xs text-white/30">{sub}</div>
              </div>
              <ChevronRight size={14} className="text-white/20" />
            </button>
          ))}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl border border-red-500/20 text-red-400 text-sm font-display font-500 hover:bg-red-500/10 transition-all active:scale-98"
        >
          <LogOut size={16} />
          Выйти из аккаунта
        </button>

        <div className="text-center text-white/20 text-xs pb-2">
          BBplay v1.0.0 · Black Bears · Тамбов
        </div>
        <div className="h-2" />
      </div>
    </div>
  )
}
