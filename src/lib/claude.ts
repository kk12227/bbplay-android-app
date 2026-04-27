import type { ChatMessage } from '@/types'

const KNOWLEDGE_BASE = `
Ты — умный помощник приложения BBplay для сети компьютерных клубов Black Bears (г. Тамбов).
Отвечай кратко, дружелюбно и по делу. Используй эмодзи где уместно.

=== БАЗА ЗНАНИЙ ===

КЛУБЫ СЕТИ BLACK BEARS:
1. BBplay Central — ул. Советская, 155. Работает 24/7. 80 мест. Рейтинг 4.9
2. BBplay Arena — ул. Мичуринская, 112. 10:00–02:00. 60 мест. Рейтинг 4.7  
3. BBplay North — ул. Студенецкая, 45. 08:00–00:00. 40 мест. Рейтинг 4.8

ЗОНЫ И ЦЕНЫ:
- Standard: от 80 ₽/час. ПК: Intel Core i5, RTX 3060, 16GB RAM, 144Hz Full HD
- VIP: от 140 ₽/час. ПК: Intel Core i9, RTX 4070 Ti, 32GB RAM, 240Hz QHD
- CYBER (только Central): от 200 ₽/час. ПК: Intel Core i9-13900K, RTX 4090, 64GB RAM, 360Hz 4K

ПОПОЛНЕНИЕ БАЛАНСА:
- Банковская карта (Visa/MasterCard/МИР)
- СБП (Система быстрых платежей)
- Наличные на стойке администратора
- Минимальное пополнение: 100 ₽
- Бонус при пополнении от 500 ₽: +5% к сумме
- Бонус при пополнении от 1000 ₽: +10% к сумме
- Бонус при пополнении от 2000 ₽: +15% к сумме

БРОНИРОВАНИЕ:
- Бронь через приложение: до 14 дней вперёд
- Минимальное время сеанса: 1 час
- Максимальное время одной брони: 8 часов
- Отмена брони: бесплатно за 30 минут до начала
- Опоздание более 15 мин — бронь автоматически отменяется
- При бронировании средства резервируются, списываются по завершении

ПРОГРАММА ЛОЯЛЬНОСТИ:
- Каждые 5 часов — 1 бесплатный час
- День рождения: бесплатные 2 часа (нужно уведомление за 3 дня)
- Referral: +100 ₽ за каждого приведённого друга (при его первом визите)
- Топ-10 игроков месяца: 50% скидка на следующий месяц

ТЕХНИЧЕСКИЕ ВОПРОСЫ:
- Интернет: до 1 Гбит/с симметричный
- VPN разрешён
- Headphones: выдаются бесплатно на стойке
- Мышь/клавиатура: персональная периферия разрешена
- Стриминг: OBS, XSplit предустановлены
- Discord/Steam/Epic/Battle.net установлены на всех ПК

ПРАВИЛА:
- Курение запрещено (есть курилка на улице)
- Еда и напитки разрешены (кроме алкоголя)
- Шумное поведение — предупреждение, затем удаление без возврата средств
- Порча оборудования — оплата по прайсу

КОНТАКТЫ:
- Телефон: +7 (4752) 30-00-00
- Email: support@bbplay.ru
- Telegram: @bbplay_support
- Режим ответа поддержки: 24/7

=== КОНЕЦ БАЗЫ ЗНАНИЙ ===

Если вопрос не касается клубов BBplay, вежливо напомни, что ты помогаешь только по теме сети клубов.
Если не знаешь точного ответа — предложи обратиться в поддержку: @bbplay_support.
`

export async function sendChatMessage(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  const apiMessages = messages.map(m => ({
    role: m.role as 'user' | 'assistant',
    content: m.content
  }))

  apiMessages.push({ role: 'user', content: userMessage })

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        system: KNOWLEDGE_BASE,
        messages: apiMessages.slice(-10) // keep last 10 messages for context
      })
    })

    if (!response.ok) {
      const err = await response.json().catch(() => ({}))
      throw new Error(err.error?.message || `API error ${response.status}`)
    }

    const data = await response.json()
    return data.content[0]?.text || 'Извини, не смог обработать запрос. Попробуй ещё раз!'
  } catch (error) {
    console.error('Chat API error:', error)
    // Fallback responses for demo without API key
    return getFallbackResponse(userMessage)
  }
}

function getFallbackResponse(message: string): string {
  const msg = message.toLowerCase()
  if (msg.includes('цен') || msg.includes('стоит') || msg.includes('час')) {
    return 'Цены на сеансы:\n⚡ Standard — от 80 ₽/час\n👑 VIP — от 140 ₽/час\n🔥 CYBER — от 200 ₽/час\n\nПри пополнении от 500 ₽ получаешь бонус до +15%! 💎'
  }
  if (msg.includes('клуб') || msg.includes('адрес') || msg.includes('где')) {
    return 'У нас 3 клуба в Тамбове:\n🏠 Central — Советская, 155 (24/7)\n🏟 Arena — Мичуринская, 112 (10:00–02:00)\n🌿 North — Студенецкая, 45 (08:00–00:00)'
  }
  if (msg.includes('пополн') || msg.includes('баланс') || msg.includes('оплат') || msg.includes('бонус при') || msg.includes('бонусы при')) {
    return 'Пополнить баланс можно картой, СБП или наличными на стойке 💳\nМинимум 100 ₽.\n\nБонусы при пополнении:\n+5% от 500 ₽\n+10% от 1000 ₽\n+15% от 2000 ₽ 🎁'
  }
  if (msg.includes('бронир') || msg.includes('заброн') || msg.includes('занять')) {
    return 'Бронирование через приложение — вкладка "Бронь" 🖥\nДо 14 дней вперёд, минимум 1 час. Средства резервируются сразу и списываются по завершении сеанса.'
  }
  if (msg.includes('отмен') || msg.includes('cancel') || msg.includes('отказ')) {
    return 'Отмена брони:\n✅ Бесплатно — за 30 минут до начала\n⏰ Опоздание более 15 мин — бронь снимается автоматически\n💸 При своевременной отмене средства возвращаются на баланс\n\nОтменить можно в разделе «Профиль» → история броней.'
  }
  if (msg.includes('характерист') || msg.includes('компьютер') || msg.includes('пк') || msg.includes('железо') || msg.includes('конфиг') || msg.includes('видеокарт') || msg.includes('процессор')) {
    return 'Конфигурации ПК по зонам:\n\n⚡ Standard (80 ₽/ч)\nIntel Core i5-12400 · RTX 3060 · 16GB DDR5 · 27" Full HD 144Hz\n\n👑 VIP (140 ₽/ч)\nIntel Core i9-12900K · RTX 4070 Ti · 32GB DDR5 · 27" QHD 240Hz\n\n🔥 CYBER (200 ₽/ч)\nIntel Core i9-13900K · RTX 4090 · 64GB DDR5 · 32" 4K 360Hz'
  }
  if (msg.includes('лояльн') || msg.includes('бонус') || msg.includes('бесплатн') || msg.includes('награда') || msg.includes('реферал') || msg.includes('скидк')) {
    return 'Программа лояльности BBplay 🏆\n\n🎮 Каждые 5 часов — 1 бесплатный час\n🎂 День рождения — 2 бесплатных часа (уведомить за 3 дня)\n👥 Реферал — +100 ₽ за каждого друга при его первом визите\n🥇 Топ-10 игроков месяца — скидка 50% на следующий месяц\n\nПрогресс отображается в разделе «Профиль».'
  }
  return 'Привет! Я помогаю с вопросами по сети клубов BBplay 🎮\nСпрашивай про цены, бронирование, адреса или правила!'
}
