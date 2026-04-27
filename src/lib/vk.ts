// VK Wall posts fetcher
// Requires VITE_VK_TOKEN (сервисный ключ приложения VK)
// Получить: vk.com/dev → Мои приложения → Сервисный ключ

export interface VKPhoto {
  url: string
  width: number
  height: number
}

export interface VKPost {
  id: number
  date: number
  text: string
  likes: { count: number }
  views: { count: number }
  reposts: { count: number }
  photos: VKPhoto[]
}

// ─── Mock posts (fallback when no VK token) ──────────────────────────────
const MOCK_POSTS: VKPost[] = [
  {
    id: 101,
    date: Date.now() / 1000 - 3600 * 2,
    text: '🔥 ТУРНИР ПО CS2 УЖЕ В ЭТУ СУББОТУ!\n\nПриходи в BBplay Central и сразись за призовой фонд 10 000 ₽.\nРегистрация прямо на стойке администратора.\n\n🕐 Начало: 18:00\n📍 Советская, 155',
    likes: { count: 84 },
    views: { count: 1240 },
    reposts: { count: 12 },
    photos: []
  },
  {
    id: 102,
    date: Date.now() / 1000 - 3600 * 18,
    text: '⚡ НОВОЕ ОБОРУДОВАНИЕ В CYBER-ЗОНЕ!\n\nПолностью обновили 4 места в CYBER-зоне BBplay Central:\n\n🖥 RTX 4090 24GB\n⚡ Intel Core i9-13900K\n💾 64GB DDR5\n🖱 Мониторы 32" 4K 360Hz\n\nБронируй — ощути разницу!',
    likes: { count: 156 },
    views: { count: 2380 },
    reposts: { count: 31 },
    photos: []
  },
  {
    id: 103,
    date: Date.now() / 1000 - 3600 * 36,
    text: '🎮 АКЦИЯ «НОЧНОЙ ГЕЙМЕР»\n\nС 23:00 до 08:00 скидка 30% на все зоны в BBplay Central!\n\nУсловия: бронь через приложение, минимум 3 часа.\n\n📅 Каждую пятницу и субботу\n💬 Вопросы: @bbplay_support',
    likes: { count: 203 },
    views: { count: 3100 },
    reposts: { count: 47 },
    photos: []
  },
  {
    id: 104,
    date: Date.now() / 1000 - 3600 * 72,
    text: '🏆 ИТОГИ ТУРНИРА ПО DOTA 2!\n\nПоздравляем победителей:\n🥇 Team Nexus — 5 000 ₽\n🥈 Dark Force — 2 500 ₽\n🥉 Random Stack — 1 000 ₽\n\nСледующий турнир — через 2 недели. Следи за новостями!',
    likes: { count: 118 },
    views: { count: 1890 },
    reposts: { count: 22 },
    photos: []
  },
  {
    id: 105,
    date: Date.now() / 1000 - 3600 * 96,
    text: '📱 ОБНОВЛЕНИЕ ПРИЛОЖЕНИЯ BBplay!\n\nВышла новая версия с бронированием, пополнением баланса и чат-ботом.\n\nСкачай, установи на главный экран — это PWA, никакого App Store! 🚀',
    likes: { count: 89 },
    views: { count: 1450 },
    reposts: { count: 19 },
    photos: []
  },
  {
    id: 106,
    date: Date.now() / 1000 - 3600 * 144,
    text: '☕ НОВАЯ КОФЕМАШИНА В BBplay ARENA!\n\nТеперь в клубе на Мичуринской есть свежий кофе и горячий шоколад прямо на стойке.\n\nЭнергия для долгих сессий 💪',
    likes: { count: 67 },
    views: { count: 980 },
    reposts: { count: 8 },
    photos: []
  },
]

// ─── Fetch from real VK API ───────────────────────────────────────────────
export async function fetchVKPosts(): Promise<VKPost[]> {
  const token = import.meta.env.VITE_VK_TOKEN

  if (!token) {
    // No token — return mock after short delay to simulate loading
    await new Promise(r => setTimeout(r, 700))
    return MOCK_POSTS
  }

  try {
    const params = new URLSearchParams({
      domain:       'bbplay__tmb',
      count:        '20',
      filter:       'owner',
      v:            '5.199',
      access_token: token,
    })

    const res = await fetch(`https://api.vk.com/method/wall.get?${params}`)
    const data = await res.json()

    if (data.error) throw new Error(data.error.error_msg)

    const items = data.response?.items ?? []

    return items
      .filter((p: any) => !p.marked_as_ads && p.text?.trim())
      .map((p: any): VKPost => {
        // Extract best photo from attachments
        const photos: VKPhoto[] = []
        for (const att of p.attachments ?? []) {
          if (att.type === 'photo') {
            const sizes: any[] = att.photo.sizes ?? []
            const best = sizes.sort((a: any, b: any) => b.width - a.width)[0]
            if (best) photos.push({ url: best.url, width: best.width, height: best.height })
          }
        }

        return {
          id:      p.id,
          date:    p.date,
          text:    p.text,
          likes:   { count: p.likes?.count ?? 0 },
          views:   { count: p.views?.count ?? 0 },
          reposts: { count: p.reposts?.count ?? 0 },
          photos,
        }
      })
  } catch (err) {
    console.warn('VK API error, falling back to mock:', err)
    return MOCK_POSTS
  }
}

// ─── Format relative time ────────────────────────────────────────────────
export function timeAgo(unixTs: number): string {
  const diff = Math.floor(Date.now() / 1000 - unixTs)
  if (diff < 60)   return 'только что'
  if (diff < 3600) return `${Math.floor(diff / 60)} мин назад`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ч назад`
  const d = new Date(unixTs * 1000)
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}
