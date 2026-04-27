import { useState } from 'react'
import { Monitor, Clock, ChevronDown, Check, X, Info } from 'lucide-react'
import { MOCK_COMPUTERS, useAuthStore, useBookingsStore } from '@/lib/store'
import { format, addHours, setHours, setMinutes } from 'date-fns'
import { ru } from 'date-fns/locale'
import type { Computer, Booking } from '@/types'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { hapticSuccess, hapticMedium } from '@/lib/native'

const ZONES = ['all', 'standard', 'vip', 'cyber'] as const
type Zone = typeof ZONES[number]

const ZONE_COLORS: Record<string, string> = {
  standard: 'text-white/70 border-white/20',
  vip:      'text-yellow-400 border-yellow-500/30',
  cyber:    'text-neon-cyan border-neon-cyan/30',
}
const ZONE_BG: Record<string, string> = {
  standard: 'bg-white/5',
  vip:      'bg-yellow-500/10',
  cyber:    'bg-neon-cyan/10',
}

export default function Booking() {
  const user        = useAuthStore(s => s.user)
  const updateBal   = useAuthStore(s => s.updateBalance)
  const addBooking  = useBookingsStore(s => s.addBooking)
  const addTx       = useBookingsStore(s => s.addTransaction)

  const [zone, setZone]         = useState<Zone>('all')
  const [selected, setSelected] = useState<Computer | null>(null)
  const [hours, setHours2]      = useState(2)
  const [startHour, setStart]   = useState((new Date().getHours() + 1) % 24)
  const [showModal, setModal]   = useState(false)
  const [loading, setLoading]   = useState(false)

  const computers = MOCK_COMPUTERS.filter(c =>
    zone === 'all' ? true : c.zone === zone
  )

  const cost = selected ? selected.hourly_rate * hours : 0
  const canBook = selected && selected.status === 'free' && cost <= (user?.balance || 0)

  function openModal(c: Computer) {
    if (c.status !== 'free') { hapticMedium(); toast.error('Это место занято или на обслуживании'); return }
    setSelected(c)
    setModal(true)
  }

  async function confirmBooking() {
    if (!selected || !user) return
    setLoading(true)
    await new Promise(r => setTimeout(r, 900))

    const now   = new Date()
    let start = setMinutes(setHours(new Date(), startHour), 0)
    // If chosen hour already passed today — schedule for tomorrow
    if (start <= now) { start = new Date(start.getTime() + 24 * 60 * 60 * 1000) }
    const end   = addHours(start, hours)

    const booking: Booking = {
      id:          'bk-' + Date.now(),
      user_id:     user.id,
      computer_id: selected.id,
      club_id:     selected.club_id,
      seat_number: selected.seat_number,
      zone:        selected.zone,
      start_time:  start.toISOString(),
      end_time:    end.toISOString(),
      total_cost:  cost,
      status:      'upcoming',
      created_at:  now.toISOString(),
    }

    addBooking(booking)
    addTx({
      id:          'tx-' + Date.now(),
      user_id:     user.id,
      type:        'payment',
      amount:      -cost,
      description: `Бронь места #${selected.seat_number} (${selected.zone})`,
      created_at:  now.toISOString(),
    })
    updateBal(-cost)

    hapticSuccess()
    toast.success(`Место #${selected.seat_number} забронировано! 🎮`)
    setModal(false)
    setSelected(null)
    setLoading(false)
  }

  return (
    <div className="page-wrapper pb-safe">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="font-display font-700 text-2xl">Бронирование</h1>
        <p className="text-white/40 text-sm mt-0.5">Выбери свободное место</p>
      </div>

      {/* Zone filter */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {ZONES.map(z => (
            <button
              key={z}
              onClick={() => setZone(z)}
              className={clsx(
                'shrink-0 px-4 py-2 rounded-xl text-sm font-display font-500 border transition-all duration-200',
                zone === z
                  ? 'bg-neon-cyan text-dark-950 border-transparent'
                  : 'bg-dark-800 text-white/50 border-white/10 hover:border-white/30'
              )}
            >
              {z === 'all' ? 'Все зоны' : z.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="px-4 mb-4 flex items-center gap-4">
        {[
          { color: 'status-free',     label: 'Свободно' },
          { color: 'status-busy',     label: 'Занято'   },
          { color: 'status-reserved', label: 'Бронь'    },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={`status-dot ${color}`} />
            <span className="text-xs text-white/40">{label}</span>
          </div>
        ))}
      </div>

      {/* Grid by zone */}
      <div className="px-4 space-y-5 overflow-y-auto scrollbar-hide">
        {(['standard', 'vip', 'cyber'] as const).map(z => {
          const zoneComputers = computers.filter(c => c.zone === z)
          if (!zoneComputers.length) return null

          return (
            <div key={z}>
              <div className="flex items-center gap-2 mb-3">
                <span className={clsx('badge border', ZONE_COLORS[z], ZONE_BG[z])}>
                  {z.toUpperCase()}
                </span>
                <span className="text-white/30 text-xs">
                  {zoneComputers.filter(c => c.status === 'free').length} свободно
                </span>
                <span className="text-white/30 text-xs ml-auto">
                  от {zoneComputers[0].hourly_rate} ₽/ч
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {zoneComputers.map(pc => (
                  <button
                    key={pc.id}
                    onClick={() => openModal(pc)}
                    className={clsx(
                      'aspect-square rounded-xl border flex flex-col items-center justify-center gap-1',
                      'transition-all duration-200 active:scale-95 select-none',
                      pc.status === 'free'
                        ? 'bg-dark-800 border-neon-cyan/20 hover:border-neon-cyan/50 hover:bg-neon-cyan/5'
                        : pc.status === 'busy'
                          ? 'bg-dark-700/50 border-red-500/20 opacity-60 cursor-not-allowed'
                          : pc.status === 'reserved'
                            ? 'bg-dark-700/50 border-yellow-500/20 opacity-60 cursor-not-allowed'
                            : 'bg-dark-700/30 border-white/5 opacity-40 cursor-not-allowed'
                    )}
                  >
                    <Monitor size={14} className={clsx(
                      pc.status === 'free' ? 'text-neon-cyan' :
                      pc.status === 'busy' ? 'text-red-400' : 'text-yellow-400'
                    )} />
                    <span className="text-[10px] font-mono text-white/60">#{pc.seat_number}</span>
                    <span className={clsx(
                      'status-dot',
                      pc.status === 'free' ? 'status-free' :
                      pc.status === 'busy' ? 'status-busy' : 'status-reserved'
                    )} />
                  </button>
                ))}
              </div>
            </div>
          )
        })}

        <div className="h-2" />
      </div>

      {/* Booking Modal */}
      {showModal && selected && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end"
          style={{ paddingBottom: '5rem' }}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setModal(false)} />

          {/* Sheet */}
          <div className="relative w-full bg-dark-900 rounded-t-3xl border-t border-white/10 animate-slide-up flex flex-col"
            style={{ maxHeight: '80dvh' }}>

            {/* Drag handle */}
            <div className="shrink-0 pt-3 pb-1 flex justify-center">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-4">
              <div className="flex items-center justify-between mb-5 pt-2">
                <div>
                  <h2 className="font-display font-700 text-lg">
                    Место #{selected.seat_number}
                    <span className={clsx('ml-2 text-sm', ZONE_COLORS[selected.zone])}>
                      {selected.zone.toUpperCase()}
                    </span>
                  </h2>
                  <p className="text-white/40 text-xs mt-0.5">Подтверди параметры сеанса</p>
                </div>
                <button onClick={() => setModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10">
                  <X size={16} />
                </button>
              </div>

              {/* PC Specs */}
              <div className="card mb-4 space-y-2">
                <p className="text-xs font-display text-white/40 uppercase tracking-wider mb-2">Конфигурация</p>
                {[
                  ['CPU', selected.specs.cpu],
                  ['GPU', selected.specs.gpu],
                  ['RAM', selected.specs.ram],
                  ['Монитор', `${selected.specs.monitor} ${selected.specs.hz}Hz`],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between text-sm">
                    <span className="text-white/40">{k}</span>
                    <span className="font-mono text-xs text-white/80">{v}</span>
                  </div>
                ))}
              </div>

              {/* Time selector */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="space-y-1">
                  <label className="text-xs font-display text-white/50 uppercase tracking-wider flex items-center gap-1">
                    <Clock size={10} /> Начало
                  </label>
                  <select
                    className="input-field text-sm"
                    value={startHour}
                    onChange={e => setStart(Number(e.target.value))}
                  >
                    {Array.from({ length: 24 }, (_, i) => (
                      <option key={i} value={i}>{String(i).padStart(2, '0')}:00</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-display text-white/50 uppercase tracking-wider flex items-center gap-1">
                    <ChevronDown size={10} /> Длительность
                  </label>
                  <select
                    className="input-field text-sm"
                    value={hours}
                    onChange={e => setHours2(Number(e.target.value))}
                  >
                    {[1,2,3,4,5,6,8].map(h => (
                      <option key={h} value={h}>{h} {h === 1 ? 'час' : h < 5 ? 'часа' : 'часов'}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Cost breakdown */}
              <div className="card">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-white/40">{selected.hourly_rate} ₽/ч × {hours} ч</span>
                  <span>{cost} ₽</span>
                </div>
                <div className="flex justify-between text-sm border-t border-white/10 pt-2 mt-2">
                  <span className="font-display font-700">Итого</span>
                  <span className="font-display font-700 text-neon-cyan">{cost} ₽</span>
                </div>
                {cost > (user?.balance || 0) && (
                  <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                    <Info size={12} /> Недостаточно средств. Пополни баланс
                  </p>
                )}
              </div>
            </div>

            {/* Confirm button — always visible, never overlapped */}
            <div className="shrink-0 px-5 pt-3 pb-4 border-t border-white/5">
              <button
                className="btn-primary w-full text-center flex items-center justify-center gap-2"
                disabled={!canBook || loading}
                onClick={confirmBooking}
              >
                {loading ? (
                  <><span className="w-4 h-4 border-2 border-dark-950/40 border-t-dark-950 rounded-full animate-spin" /> Бронируем...</>
                ) : (
                  <><Check size={18} /> Забронировать за {cost} ₽</>
                )}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
