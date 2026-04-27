import { useEffect, useState, useCallback } from 'react'
import { Heart, Eye, Repeat2, ExternalLink, RefreshCw, Rss } from 'lucide-react'
import { fetchVKPosts, timeAgo } from '@/lib/vk'
import type { VKPost } from '@/lib/vk'
import clsx from 'clsx'

function PostSkeleton() {
  return (
    <div className="card space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl skeleton shrink-0" />
        <div className="space-y-1.5 flex-1">
          <div className="h-3 w-24 skeleton rounded" />
          <div className="h-2.5 w-16 skeleton rounded" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-3 skeleton rounded w-full" />
        <div className="h-3 skeleton rounded w-5/6" />
        <div className="h-3 skeleton rounded w-3/4" />
      </div>
    </div>
  )
}

function PostCard({ post, index }: { post: VKPost; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const MAX_LEN = 220

  const needsTruncation = post.text.length > MAX_LEN
  const displayText = needsTruncation && !expanded
    ? post.text.slice(0, MAX_LEN).trimEnd() + '…'
    : post.text

  // Parse text: bold lines starting with emoji, linkify urls
  function renderText(text: string) {
    return text.split('\n').map((line, i) => {
      // linkify
      const urlRegex = /(https?:\/\/[^\s]+)/g
      const parts = line.split(urlRegex)
      const rendered = parts.map((part, j) =>
        urlRegex.test(part)
          ? <a key={j} href={part} target="_blank" rel="noopener noreferrer"
              className="text-neon-cyan underline underline-offset-2 break-all">{part}</a>
          : <span key={j}>{part}</span>
      )
      // First line or lines with emoji get bold treatment
      const isHeader = i === 0 || /^\p{Emoji}/u.test(line.trim())
      return (
        <span key={i} className={clsx('block', isHeader && i === 0 ? 'font-display font-700 text-white' : 'text-white/75')}>
          {rendered}
          {i < text.split('\n').length - 1 && '\n'}
        </span>
      )
    })
  }

  return (
    <article
      className="card neon-border-hover animate-fade-in"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-neon-cyan/30 to-neon-blue/30 border border-neon-cyan/20 flex items-center justify-center shrink-0">
          <span className="font-display font-700 text-neon-cyan text-sm">BB</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-display font-700 text-sm leading-none">BBplay Тамбов</div>
          <div className="text-white/35 text-xs mt-0.5">{timeAgo(post.date)}</div>
        </div>
        <a
          href={`https://vk.com/bbplay__tmb?w=wall-${post.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 text-white/30 hover:text-neon-cyan hover:bg-neon-cyan/10 transition-all shrink-0"
        >
          <ExternalLink size={13} />
        </a>
      </div>

      {/* Photo */}
      {post.photos[0] && (
        <div className="rounded-xl overflow-hidden mb-3 bg-dark-700">
          <img
            src={post.photos[0].url}
            alt=""
            className="w-full object-cover max-h-60"
            loading="lazy"
          />
        </div>
      )}

      {/* Text */}
      <div className="text-sm leading-relaxed font-body whitespace-pre-line mb-3">
        {renderText(displayText)}
      </div>

      {needsTruncation && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-neon-cyan text-xs font-display mb-3 hover:text-neon-cyan/70 transition-colors"
        >
          {expanded ? 'Свернуть ↑' : 'Читать полностью ↓'}
        </button>
      )}

      {/* Footer stats */}
      <div className="flex items-center gap-4 pt-2.5 border-t border-white/5">
        <div className="flex items-center gap-1.5 text-white/30 text-xs">
          <Eye size={12} />
          <span>{post.views.count.toLocaleString('ru-RU')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/30 text-xs">
          <Heart size={12} />
          <span>{post.likes.count.toLocaleString('ru-RU')}</span>
        </div>
        <div className="flex items-center gap-1.5 text-white/30 text-xs">
          <Repeat2 size={12} />
          <span>{post.reposts.count.toLocaleString('ru-RU')}</span>
        </div>
        <a
          href="https://vk.com/bbplay__tmb"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto text-[10px] text-white/20 hover:text-white/50 transition-colors font-mono"
        >
          vk.com/bbplay__tmb
        </a>
      </div>
    </article>
  )
}

export default function News() {
  const [posts, setPosts]     = useState<VKPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(false)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true)
    else { setLoading(true); setError(false) }

    try {
      const data = await fetchVKPosts()
      setPosts(data)
      setError(false)
    } catch {
      setError(true)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div className="page-wrapper pb-safe">
      {/* Header */}
      <div className="px-4 pt-12 pb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display font-700 text-2xl">Новости</h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Rss size={11} className="text-neon-cyan" />
            <a
              href="https://vk.com/bbplay__tmb"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 text-xs hover:text-neon-cyan transition-colors"
            >
              vk.com/bbplay__tmb
            </a>
          </div>
        </div>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 transition-all active:scale-90"
        >
          <RefreshCw size={15} className={clsx(refreshing && 'animate-spin')} />
        </button>
      </div>

      <div className="px-4 space-y-3 overflow-y-auto scrollbar-hide">
        {/* Loading skeletons */}
        {loading && Array.from({ length: 4 }).map((_, i) => <PostSkeleton key={i} />)}

        {/* Error state */}
        {error && !loading && (
          <div className="card text-center py-10">
            <div className="text-4xl mb-3">📡</div>
            <div className="font-display font-700 text-white/60 mb-1">Нет соединения</div>
            <div className="text-white/30 text-sm mb-4">Не удалось загрузить новости</div>
            <button onClick={() => load()} className="btn-primary px-6 py-2.5 text-sm mx-auto block w-fit">
              Повторить
            </button>
          </div>
        )}

        {/* Posts */}
        {!loading && !error && posts.map((post, i) => (
          <PostCard key={post.id} post={post} index={i} />
        ))}

        {/* Empty */}
        {!loading && !error && posts.length === 0 && (
          <div className="card text-center py-10">
            <div className="text-4xl mb-3">📭</div>
            <div className="font-display font-700 text-white/60">Постов пока нет</div>
          </div>
        )}

        {/* VK CTA */}
        {!loading && posts.length > 0 && (
          <a
            href="https://vk.com/bbplay__tmb"
            target="_blank"
            rel="noopener noreferrer"
            className="card flex items-center justify-center gap-2 text-white/40 text-sm hover:text-white/70 hover:border-white/20 transition-all active:scale-[0.98] py-3.5"
          >
            <ExternalLink size={14} />
            Все новости во ВКонтакте
          </a>
        )}

        <div className="h-2" />
      </div>
    </div>
  )
}
