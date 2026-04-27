import { useState, useRef, useEffect } from 'react'
import { Send, Bot, Zap, RefreshCw } from 'lucide-react'
import { sendChatMessage } from '@/lib/claude'
import type { ChatMessage } from '@/types'
import clsx from 'clsx'
import { format } from 'date-fns'

const QUICK_QUESTIONS = [
  '💰 Какие цены на сеансы?',
  '📍 Адреса клубов BBplay',
  '🎁 Бонусы при пополнении',
  '🖥 Характеристики компьютеров',
  '📅 Как отменить бронь?',
  '🏆 Программа лояльности',
]

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 animate-fade-in">
      <div className="w-7 h-7 rounded-full bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center shrink-0">
        <Bot size={14} className="text-neon-cyan" />
      </div>
      <div className="msg-bot rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-neon-cyan/60"
              style={{ animation: `bounce 1.2s ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Привет! Я помощник сети клубов BBplay 🎮\n\nСпрашивай про цены, бронирование, адреса, программу лояльности — отвечу на всё!',
      timestamp: new Date()
    }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef<HTMLDivElement>(null)
  const inputRef              = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  async function sendMessage(text?: string) {
    const content = (text || input).trim()
    if (!content || loading) return

    const userMsg: ChatMessage = {
      id:        'msg-' + Date.now(),
      role:      'user',
      content,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const reply = await sendChatMessage(
        messages.filter(m => m.id !== 'welcome'),
        content
      )
      setMessages(prev => [...prev, {
        id:        'msg-' + Date.now(),
        role:      'assistant',
        content:   reply,
        timestamp: new Date()
      }])
    } catch {
      setMessages(prev => [...prev, {
        id:        'err-' + Date.now(),
        role:      'assistant',
        content:   'Ошибка соединения. Попробуй ещё раз.',
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  function clearChat() {
    setMessages([{
      id:        'welcome',
      role:      'assistant',
      content:   'Чат очищен. Чем могу помочь? 🎮',
      timestamp: new Date()
    }])
  }

  return (
    <div className="page-wrapper" style={{ height: '100dvh' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 border border-neon-cyan/30 flex items-center justify-center">
            <Bot size={18} className="text-neon-cyan" />
          </div>
          <div>
            <h1 className="font-display font-700 text-base leading-none">BBplay Помощник</h1>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-pulse" />
              <span className="text-neon-cyan text-xs">Онлайн</span>
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="w-8 h-8 flex items-center justify-center rounded-xl bg-white/5 text-white/40 hover:text-white/70 transition-colors">
          <RefreshCw size={15} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 scrollbar-hide" style={{ paddingBottom: '140px' }}>
        {messages.map(msg => (
          <div
            key={msg.id}
            className={clsx(
              'flex items-end gap-2 animate-fade-in',
              msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-neon-cyan/20 border border-neon-cyan/30 flex items-center justify-center shrink-0">
                <Bot size={14} className="text-neon-cyan" />
              </div>
            )}
            <div className={clsx(
              'max-w-[80%] rounded-2xl px-4 py-3',
              msg.role === 'user'
                ? 'msg-user rounded-br-sm'
                : 'msg-bot rounded-bl-sm'
            )}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap font-body">{msg.content}</p>
              <p className="text-[10px] text-white/25 mt-1.5 text-right">
                {format(msg.timestamp, 'HH:mm')}
              </p>
            </div>
          </div>
        ))}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>



      {/* Input */}
      <div className="absolute bottom-0 inset-x-0 bg-dark-900/95 backdrop-blur-xl border-t border-white/5 px-4 pt-2"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 80px)' }}>
        {/* Quick questions — always visible */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-2">
          {QUICK_QUESTIONS.map(q => (
            <button
              key={q}
              onClick={() => sendMessage(q.replace(/^\S+\s/, ''))}
              className="shrink-0 px-3 py-1.5 rounded-xl bg-dark-800 border border-white/10 text-xs text-white/50 font-body hover:border-neon-cyan/30 hover:text-white/80 transition-all active:scale-95 whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              className="input-field resize-none min-h-[44px] max-h-28 py-3 pr-4 text-sm leading-relaxed"
              placeholder="Задай вопрос..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              rows={1}
              style={{ height: 'auto' }}
              onInput={e => {
                const t = e.target as HTMLTextAreaElement
                t.style.height = 'auto'
                t.style.height = Math.min(t.scrollHeight, 112) + 'px'
              }}
            />
          </div>
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className={clsx(
              'w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200',
              input.trim() && !loading
                ? 'bg-neon-cyan text-dark-950 active:scale-90'
                : 'bg-dark-700 text-white/30'
            )}
          >
            {loading
              ? <span className="w-4 h-4 border-2 border-dark-950/40 border-t-dark-950 rounded-full animate-spin" />
              : <Send size={16} />
            }
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  )
}
