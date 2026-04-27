import { useNavigate } from 'react-router-dom'
import { Monitor, Wallet, Newspaper, Clock, TrendingUp, MapPin, Star, ChevronRight, Zap } from 'lucide-react'
import { useAuthStore, useBookingsStore } from '@/lib/store'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import clsx from 'clsx'

const CLUBS = [
  { id: 'club-1', name: 'BBplay Central', address: 'Советская, 155', hours: '24/7', rating: 4.9, free: 12, busy: 8 },
  { id: 'club-2', name: 'BBplay Arena',   address: 'Мичуринская, 112', hours: '10:00–02:00', rating: 4.7, free: 5, busy: 7 },
  { id: 'club-3', name: 'BBplay North',   address: 'Студенецкая, 45',  hours: '08:00–00:00', rating: 4.8, free: 9, busy: 3 },
]

export default function Dashboard() {
  const navigate  = useNavigate()
  const user      = useAuthStore(s => s.user)
  const bookings  = useBookingsStore(s => s.bookings)
  const upcoming  = bookings.filter(b => b.status === 'upcoming' || b.status === 'active').slice(0, 1)[0]
  const totalHours = bookings
    .filter(b => b.status === 'completed')
    .reduce((sum, b) => {
      const diff = (new Date(b.end_time).getTime() - new Date(b.start_time).getTime()) / 3600000
      return sum + Math.round(diff)
    }, 0)

  const hour = new Date().getHours()
  const greeting = hour < 6 ? '🌙 Ночная смена' : hour < 12 ? '☀️ Доброе утро' : hour < 18 ? '⚡ Добрый день' : '🎮 Добрый вечер'

  return (
    <div className="page-wrapper pb-safe">
      {/* Header */}
      <div className="px-4 pt-12 pb-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/40 text-sm font-body">{greeting}</p>
            <h1 className="font-display font-700 text-2xl mt-0.5">
              {user?.username} <span className="text-neon-cyan text-glow-cyan">_</span>
            </h1>
          </div>
          <button
            onClick={() => navigate('/balance')}
            className="flex flex-col items-end gap-0.5 bg-neon-cyan/10 border border-neon-cyan/30 rounded-2xl px-4 py-2.5 active:scale-95 transition-transform"
          >
            <span className="text-[10px] text-neon-cyan/60 font-display uppercase tracking-wider">Баланс</span>
            <span className="font-display font-700 text-neon-cyan text-lg leading-none">
              {(user?.balance || 0).toLocaleString('ru-RU')} ₽
            </span>
          </button>
        </div>
      </div>

      <div className="px-4 space-y-5 animate-slide-up overflow-y-auto scrollbar-hide">
        {/* Quick actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => navigate('/booking')}
            className="card flex flex-col items-center gap-2 text-center neon-border-hover active:scale-95 transition-all p-3"
          >
            <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
              <Monitor size={18} className="text-neon-cyan" />
            </div>
            <div>
              <div className="font-display font-700 text-xs">Бронь</div>
              <div className="text-white/40 text-[10px]">Выбрать место</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/balance')}
            className="card flex flex-col items-center gap-2 text-center neon-border-hover active:scale-95 transition-all p-3"
          >
            <div className="w-9 h-9 rounded-xl bg-neon-blue/10 flex items-center justify-center">
              <Wallet size={18} className="text-neon-blue" />
            </div>
            <div>
              <div className="font-display font-700 text-xs">Баланс</div>
              <div className="text-white/40 text-[10px]">Пополнить</div>
            </div>
          </button>

          <button
            onClick={() => navigate('/news')}
            className="card flex flex-col items-center gap-2 text-center neon-border-hover active:scale-95 transition-all p-3"
          >
            <div className="w-9 h-9 rounded-xl bg-neon-purple/10 flex items-center justify-center">
              <Newspaper size={18} className="text-neon-purple" />
            </div>
            <div>
              <div className="font-display font-700 text-xs">Новости</div>
              <div className="text-white/40 text-[10px]">Из ВКонтакте</div>
            </div>
          </button>
        </div>

        {/* Active/upcoming booking */}
        {upcoming && (
          <div>
            <h2 className="font-display font-700 text-sm text-white/50 uppercase tracking-wider mb-2">Активная бронь</h2>
            <div className="card bg-gradient-to-r from-neon-cyan/5 to-neon-blue/5 border-neon-cyan/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-neon-cyan/20 flex items-center justify-center">
                    <Monitor size={18} className="text-neon-cyan" />
                  </div>
                  <div>
                    <div className="font-display font-700 text-sm">
                      Место #{upcoming.seat_number} · {upcoming.zone.toUpperCase()}
                    </div>
                    <div className="text-white/40 text-xs flex items-center gap-1 mt-0.5">
                      <Clock size={10} />
                      {format(new Date(upcoming.start_time), 'HH:mm', { locale: ru })} —{' '}
                      {format(new Date(upcoming.end_time), 'HH:mm', { locale: ru })}
                    </div>
                  </div>
                </div>
                <span className={clsx(
                  'badge text-xs',
                  upcoming.status === 'active'
                    ? 'bg-neon-cyan/20 text-neon-cyan'
                    : 'bg-yellow-500/20 text-yellow-400'
                )}>
                  {upcoming.status === 'active' ? '▶ Активна' : '⏳ Ожидает'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div>
          <h2 className="font-display font-700 text-sm text-white/50 uppercase tracking-wider mb-2">Статистика</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: Clock,      label: 'Часов',    value: totalHours, suffix: 'ч' },
              { icon: TrendingUp, label: 'Визитов',  value: bookings.filter(b => b.status !== 'cancelled').length, suffix: '' },
              { icon: Zap,        label: 'До награды', value: `${totalHours % 5}/5`, suffix: '' },
            ].map(({ icon: Icon, label, value, suffix }) => (
              <div key={label} className="card text-center p-3">
                <Icon size={16} className="text-neon-cyan mx-auto mb-1" />
                <div className="font-display font-700 text-lg leading-none">
                  {value}{suffix}
                </div>
                <div className="text-white/40 text-xs mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Clubs */}
        <div>
          <h2 className="font-display font-700 text-sm text-white/50 uppercase tracking-wider mb-2">Наши клубы</h2>
          <div className="space-y-2">
            {CLUBS.map(club => (
              <button
                key={club.id}
                onClick={() => navigate('/booking')}
                className="card w-full text-left neon-border-hover active:scale-[0.98] transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-dark-700 flex items-center justify-center shrink-0 font-display font-700 text-neon-cyan text-lg">
                      {club.name.split(' ')[1][0]}
                    </div>
                    <div>
                      <div className="font-display font-700 text-sm">{club.name}</div>
                      <div className="flex items-center gap-1 text-white/40 text-xs mt-0.5">
                        <MapPin size={10} />
                        {club.address}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="flex items-center gap-1 text-yellow-400 text-xs">
                      <Star size={10} fill="currentColor" />
                      {club.rating}
                    </div>
                    <div className="text-[10px] text-neon-cyan">{club.free} свободно</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Loyalty banner */}
        <div className="card bg-gradient-to-r from-neon-purple/10 to-neon-blue/10 border-neon-purple/20">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🏆</div>
            <div>
              <div className="font-display font-700 text-sm">Программа лояльности</div>
              <div className="text-white/50 text-xs mt-0.5">Каждые 5 часов — бесплатный час! Бонус до +15% при пополнении</div>
            </div>
            <ChevronRight size={16} className="text-white/30 shrink-0 ml-auto" />
          </div>
        </div>

        <div className="h-2" />
      </div>
    </div>
  )
}
