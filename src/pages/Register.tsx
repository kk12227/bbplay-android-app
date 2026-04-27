import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

export default function Register() {
  const [email, setEmail]       = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const register = useAuthStore(s => s.register)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !username || !password) { toast.error('Заполни все поля'); return }
    if (password !== confirm) { toast.error('Пароли не совпадают'); return }
    if (password.length < 6) { toast.error('Минимум 6 символов в пароле'); return }

    setLoading(true)
    const ok = await register(email, username, password)
    setLoading(false)
    if (!ok) toast.error('Ошибка регистрации')
    else toast.success('Добро пожаловать в BBplay! 🎮')
  }

  return (
    <div className="page-wrapper items-center justify-center px-5 min-h-dvh">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 left-10 w-80 h-80 rounded-full bg-neon-purple/5 blur-3xl" />
        <div className="absolute -bottom-40 right-10 w-80 h-80 rounded-full bg-neon-cyan/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 mb-3">
            <Zap size={28} className="text-neon-cyan" />
          </div>
          <h1 className="font-display font-700 text-2xl tracking-tight">Создать аккаунт</h1>
          <p className="text-white/40 text-sm mt-1">BBplay — компьютерные клубы</p>
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-display text-white/50 uppercase tracking-wider">Email</label>
            <input type="email" className="input-field" placeholder="your@email.com"
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-display text-white/50 uppercase tracking-wider">Никнейм</label>
            <input type="text" className="input-field" placeholder="coolplayer"
              value={username} onChange={e => setUsername(e.target.value)} />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-display text-white/50 uppercase tracking-wider">Пароль</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} className="input-field pr-12"
                placeholder="Минимум 6 символов"
                value={password} onChange={e => setPassword(e.target.value)} />
              <button type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                onClick={() => setShowPwd(!showPwd)}>
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-display text-white/50 uppercase tracking-wider">Подтверждение</label>
            <input type="password" className="input-field" placeholder="Повтори пароль"
              value={confirm} onChange={e => setConfirm(e.target.value)} />
          </div>

          <button type="submit" className="btn-primary w-full text-center" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-dark-950/40 border-t-dark-950 rounded-full animate-spin" />
                Создаём аккаунт...
              </span>
            ) : 'Зарегистрироваться'}
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-4">
          Уже есть аккаунт?{' '}
          <Link to="/login" className="text-neon-cyan hover:text-neon-cyan/80 font-500">
            Войти
          </Link>
        </p>
      </div>
    </div>
  )
}
