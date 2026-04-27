import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, EyeOff, Zap } from 'lucide-react'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'
import { hapticSuccess, hapticError } from '@/lib/native'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd]   = useState(false)
  const [loading, setLoading]   = useState(false)
  const login = useAuthStore(s => s.login)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) { toast.error('Заполни все поля'); return }
    setLoading(true)
    const ok = await login(email, password)
    setLoading(false)
    if (!ok) { hapticError(); toast.error('Неверные данные. Попробуй ещё раз') } else { hapticSuccess() }
  }

  async function demoLogin() {
    setEmail('demo@bbplay.ru')
    setPassword('demo1234')
    setLoading(true)
    const ok = await login('demo@bbplay.ru', 'demo1234')
    setLoading(false)
    if (!ok) toast.error('Ошибка входа')
  }

  return (
    <div className="page-wrapper items-center justify-center px-5 min-h-dvh">
      {/* Glow bg */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-neon-cyan/5 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-neon-blue/5 blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/30 mb-4 animate-glow">
            <Zap size={32} className="text-neon-cyan" />
          </div>
          <h1 className="font-display font-700 text-3xl tracking-tight text-glow-cyan">BBplay</h1>
          <p className="text-white/40 text-sm mt-1 font-body">Компьютерные клубы Black Bears</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="font-display font-700 text-xl text-center mb-2">Вход в аккаунт</h2>

          <div className="space-y-1">
            <label className="text-xs font-display text-white/50 uppercase tracking-wider">Email</label>
            <input
              type="email"
              className="input-field"
              placeholder="your@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-display text-white/50 uppercase tracking-wider">Пароль</label>
            <div className="relative">
              <input
                type={showPwd ? 'text' : 'password'}
                className="input-field pr-12"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                onClick={() => setShowPwd(!showPwd)}
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full text-center" disabled={loading}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-dark-950/40 border-t-dark-950 rounded-full animate-spin" />
                Входим...
              </span>
            ) : 'Войти'}
          </button>

          {/* Demo hint */}
          <button
            type="button"
            onClick={demoLogin}
            className="w-full text-center text-xs text-neon-cyan/60 hover:text-neon-cyan transition-colors py-1"
          >
            ⚡ Использовать демо-аккаунт
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-4">
          Нет аккаунта?{' '}
          <Link to="/register" className="text-neon-cyan hover:text-neon-cyan/80 transition-colors font-500">
            Зарегистрироваться
          </Link>
        </p>
      </div>
    </div>
  )
}
