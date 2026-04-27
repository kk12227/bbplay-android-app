import { useState } from 'react'
import { Wallet, CreditCard, Smartphone, ArrowUpRight, ArrowDownLeft, Check, ChevronRight } from 'lucide-react'
import { useAuthStore, useBookingsStore } from '@/lib/store'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { hapticSuccess } from '@/lib/native'

const QUICK_AMOUNTS = [100, 300, 500, 1000, 2000, 5000]

const BONUS_TIERS = [
  { min: 500,  bonus: 5,  label: 'от 500 ₽' },
  { min: 1000, bonus: 10, label: 'от 1000 ₽' },
  { min: 2000, bonus: 15, label: 'от 2000 ₽' },
]

const PAYMENT_METHODS = [
  { id: 'card', icon: CreditCard,   label: 'Банковская карта', sub: 'Visa / MasterCard / МИР' },
  { id: 'sbp',  icon: Smartphone,   label: 'СБП',              sub: 'Система быстрых платежей' },
]

export default function Balance() {
  const user      = useAuthStore(s => s.user)
  const updateBal = useAuthStore(s => s.updateBalance)
  const addTx     = useBookingsStore(s => s.addTransaction)
  const txList    = useBookingsStore(s => s.transactions)

  const [amount, setAmount]   = useState('')
  const [method, setMethod]   = useState('card')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const numAmount = parseInt(amount) || 0
  const bonus     = BONUS_TIERS.slice().reverse().find(t => numAmount >= t.min)
  const bonusAmt  = bonus ? Math.floor(numAmount * bonus.bonus / 100) : 0
  const totalGet  = numAmount + bonusAmt

  async function handleTopup() {
    if (numAmount < 100) { toast.error('Минимальное пополнение — 100 ₽'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))

    updateBal(totalGet)
    addTx({
      id:          'tx-' + Date.now(),
      user_id:     user!.id,
      type:        'topup',
      amount:      totalGet,
      description: `Пополнение через ${method === 'card' ? 'карту' : 'СБП'}${bonusAmt ? ` (+${bonusAmt} ₽ бонус)` : ''}`,
      created_at:  new Date().toISOString(),
    })

    setLoading(false)
    setSuccess(true)
    setAmount('')
    setTimeout(() => setSuccess(false), 3000)
    hapticSuccess()
    toast.success(`Баланс пополнен на ${totalGet} ₽! 🎉`)
  }

  const userTx = txList.filter(t => t.user_id === user?.id)

  return (
    <div className="page-wrapper pb-safe">
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <h1 className="font-display font-700 text-2xl">Баланс</h1>
        <p className="text-white/40 text-sm mt-0.5">Пополнение и история</p>
      </div>

      <div className="px-4 space-y-4 overflow-y-auto scrollbar-hide">
        {/* Balance card */}
        <div className="relative overflow-hidden rounded-2xl p-5"
          style={{ background: 'linear-gradient(135deg, #0e0e18 0%, #14141f 50%, #1c2e1c 100%)', border: '1px solid rgba(0,245,196,0.2)' }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-neon-cyan/5 blur-2xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-1">
              <Wallet size={16} className="text-neon-cyan" />
              <span className="text-white/50 text-xs font-display uppercase tracking-wider">Текущий баланс</span>
            </div>
            <div className="font-display font-700 text-4xl text-glow-cyan text-neon-cyan">
              {(user?.balance || 0).toLocaleString('ru-RU')} ₽
            </div>
            <div className="text-white/30 text-xs mt-1 font-body">
              {user?.email}
            </div>
          </div>
        </div>

        {/* Bonus tiers */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {BONUS_TIERS.map(t => (
            <div key={t.min}
              className={clsx(
                'shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-display transition-all',
                numAmount >= t.min
                  ? 'bg-neon-cyan/15 border-neon-cyan/40 text-neon-cyan'
                  : 'bg-dark-800 border-white/10 text-white/40'
              )}>
              <span>+{t.bonus}%</span>
              <span className="text-white/30">{t.label}</span>
            </div>
          ))}
        </div>

        {/* Amount input */}
        <div className="card space-y-4">
          <p className="text-xs font-display text-white/50 uppercase tracking-wider">Сумма пополнения</p>

          <div className="relative">
            <input
              type="number"
              className="input-field text-xl font-display font-700 pr-10"
              placeholder="0"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min={100}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 font-display">₽</span>
          </div>

          {/* Quick amounts */}
          <div className="grid grid-cols-3 gap-2">
            {QUICK_AMOUNTS.map(a => (
              <button
                key={a}
                onClick={() => setAmount(String(a))}
                className={clsx(
                  'py-2 rounded-xl text-sm font-display border transition-all active:scale-95',
                  amount === String(a)
                    ? 'bg-neon-cyan/20 border-neon-cyan/50 text-neon-cyan'
                    : 'bg-dark-700 border-white/10 text-white/60 hover:border-white/30'
                )}
              >
                {a.toLocaleString('ru-RU')} ₽
              </button>
            ))}
          </div>

          {/* Bonus display */}
          {bonusAmt > 0 && (
            <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/20">
              <span className="text-neon-cyan text-sm font-display font-700">🎁 Бонус +{bonusAmt} ₽</span>
              <span className="text-white/60 text-sm">Итого: <span className="text-white font-700">{totalGet} ₽</span></span>
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="card space-y-3">
          <p className="text-xs font-display text-white/50 uppercase tracking-wider">Способ оплаты</p>
          {PAYMENT_METHODS.map(m => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={clsx(
                'w-full flex items-center gap-3 p-3 rounded-xl border transition-all',
                method === m.id
                  ? 'bg-neon-cyan/10 border-neon-cyan/40'
                  : 'bg-dark-700 border-white/10 hover:border-white/30'
              )}
            >
              <div className={clsx(
                'w-9 h-9 rounded-lg flex items-center justify-center shrink-0',
                method === m.id ? 'bg-neon-cyan/20' : 'bg-white/5'
              )}>
                <m.icon size={18} className={method === m.id ? 'text-neon-cyan' : 'text-white/40'} />
              </div>
              <div className="text-left">
                <div className="text-sm font-display font-500">{m.label}</div>
                <div className="text-xs text-white/40">{m.sub}</div>
              </div>
              {method === m.id && <Check size={16} className="text-neon-cyan ml-auto" />}
            </button>
          ))}
        </div>

        {/* Topup button */}
        <button
          className="btn-primary w-full flex items-center justify-center gap-2"
          disabled={numAmount < 100 || loading}
          onClick={handleTopup}
        >
          {loading ? (
            <><span className="w-4 h-4 border-2 border-dark-950/40 border-t-dark-950 rounded-full animate-spin" /> Обрабатываем...</>
          ) : success ? (
            <><Check size={18} /> Баланс пополнен!</>
          ) : (
            <>Пополнить {numAmount >= 100 ? `на ${totalGet.toLocaleString('ru-RU')} ₽` : ''}</>
          )}
        </button>

        {/* Transaction history */}
        {userTx.length > 0 && (
          <div>
            <h2 className="font-display font-700 text-sm text-white/50 uppercase tracking-wider mb-3">История</h2>
            <div className="space-y-2">
              {userTx.slice(0, 10).map(tx => (
                <div key={tx.id} className="card flex items-center gap-3">
                  <div className={clsx(
                    'w-9 h-9 rounded-xl flex items-center justify-center shrink-0',
                    tx.type === 'topup' ? 'bg-neon-cyan/10' : 'bg-red-500/10'
                  )}>
                    {tx.type === 'topup'
                      ? <ArrowDownLeft size={16} className="text-neon-cyan" />
                      : <ArrowUpRight size={16} className="text-red-400" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-display font-500 truncate">{tx.description}</div>
                    <div className="text-xs text-white/30">
                      {format(new Date(tx.created_at), 'd MMM, HH:mm', { locale: ru })}
                    </div>
                  </div>
                  <div className={clsx(
                    'font-display font-700 text-sm shrink-0',
                    tx.amount > 0 ? 'text-neon-cyan' : 'text-red-400'
                  )}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount} ₽
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="h-2" />
      </div>
    </div>
  )
}
