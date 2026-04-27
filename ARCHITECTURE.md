# BBplay — Архитектура и стек технологий

> Документ для проверки проекта на конкурсе Black Bears, г. Тамбов

---

## Обзор решения

**BBplay** — прогрессивное веб-приложение (PWA) для посетителей сети компьютерных клубов Black Bears. Работает как нативное приложение на iOS и Android через браузер — устанавливается на домашний экран, работает в полноэкранном режиме без адресной строки.

### Ключевые экраны
| Экран | Функциональность |
|---|---|
| **Login / Register** | JWT авторизация через Supabase Auth |
| **Dashboard** | Баланс, активные брони, клубы сети, статистика |
| **Booking** | Интерактивная сетка компьютеров, выбор времени, оплата |
| **Balance** | Пополнение с бонусами, история транзакций |
| **Chat** | AI-помощник на базе Claude API с базой знаний |
| **Profile** | Статистика, история, программа лояльности, настройки |

---

## Технический стек

### Frontend
| Технология | Версия | Назначение |
|---|---|---|
| **React** | 18.2 | UI библиотека |
| **TypeScript** | 5.2 | Строгая типизация |
| **Vite** | 5.1 | Сборщик (HMR, tree-shaking) |
| **React Router v6** | 6.21 | Клиентский роутинг, Protected routes |
| **Tailwind CSS** | 3.4 | Utility-first стили |
| **Zustand** | 4.5 | State management (с persist middleware) |
| **vite-plugin-pwa** | 0.18 | Service Worker, Web App Manifest |
| **lucide-react** | 0.312 | Иконки |
| **react-hot-toast** | 2.4 | Toast уведомления |
| **date-fns** | 3.2 | Форматирование дат (locale ru) |

### Backend (BaaS)
| Сервис | Назначение |
|---|---|
| **Supabase** | PostgreSQL БД, Auth (JWT), Row Level Security |
| **Supabase Auth** | Email/Password авторизация, управление сессиями |
| **Supabase Realtime** | Обновление статусов компьютеров в реальном времени |

### AI / Chatbot
| Сервис | Назначение |
|---|---|
| **Anthropic Claude API** | Чат-бот с базой знаний клубов BBplay |
| **Модель** | claude-haiku-4-5-20251001 (быстрый, экономичный) |
| **Контекст** | Последние 10 сообщений диалога |
| **Fallback** | Локальные ответы при отсутствии API ключа |

### Деплой
| Платформа | Ссылка |
|---|---|
| **Vercel** | Основной хостинг (автодеплой из GitHub) |
| **Netlify** | Альтернатива (drag & drop папки dist) |

---

## Архитектура приложения

```
┌─────────────────────────────────────────┐
│              BBplay PWA                 │
│  React 18 + Vite + TypeScript           │
│                                         │
│  ┌──────────┐  ┌──────────┐             │
│  │  Pages   │  │ Components│            │
│  │ Login    │  │ BottomNav │            │
│  │ Register │  └──────────┘            │
│  │ Dashboard│                          │
│  │ Booking  │  ┌──────────┐            │
│  │ Balance  │  │   Lib    │            │
│  │ Chat     │  │ store.ts │ ← Zustand  │
│  │ Profile  │  │ claude.ts│ ← API      │
│  └──────────┘  │supabase  │ ← BaaS     │
│                └──────────┘            │
└────────────┬────────────────────────────┘
             │
    ┌────────┼────────────────┐
    ▼        ▼                ▼
┌───────┐ ┌───────┐    ┌──────────────┐
│Supa-  │ │Claude │    │  localStorage │
│base   │ │ API   │    │ (Zustand      │
│Auth + │ │Haiku  │    │  persist)     │
│DB     │ │       │    │               │
└───────┘ └───────┘    └──────────────┘
```

---

## Схема базы данных

```
profiles          computers
───────────       ─────────────
id (uuid PK)      id (uuid PK)
username          club_id → clubs
balance           seat_number
avatar_url        zone (standard/vip/cyber)
created_at        specs (JSONB)
                  hourly_rate
clubs             status (free/busy/reserved)
─────────
id (uuid PK)      bookings
name              ────────────
address           id (uuid PK)
city              user_id → profiles
open_hours        computer_id → computers
rating            club_id → clubs
total_seats       start_time / end_time
                  total_cost
transactions      status (upcoming/active/completed)
────────────      created_at
id (uuid PK)      [UNIQUE: no overlapping times]
user_id → profiles
type (topup/payment/refund)
amount
description
created_at
```

---

## Поток данных авторизации

```
User → Login Form
         │
         ▼
  Supabase Auth.signIn()
         │
         ├─ Success → JWT token → Zustand store
         │            ↓
         │         profiles table (balance, username)
         │            ↓
         │         React Router → /dashboard
         │
         └─ Error → toast.error()
```

---

## Поток бронирования

```
User → выбирает компьютер (статус: free)
         │
         ▼
Bottom Sheet Modal
├── Характеристики ПК
├── Выбор времени начала
├── Выбор длительности (1-8ч)
└── Расчёт стоимости
         │
         ▼
[Проверка: balance >= cost]
         │
         ├─ Недостаточно → Info hint → перейти на /balance
         │
         └─ Достаточно → Confirm
                  │
                  ▼
         Supabase RPC: create_booking()
         ├── Атомарное списание balance
         ├── INSERT bookings
         └── INSERT transactions (payment)
                  │
                  ▼
         Zustand store update
         toast.success()
```

---

## Чат-бот: архитектура

```
User Input
    │
    ▼
sendChatMessage(history[], userMessage)
    │
    ▼
fetch POST https://api.anthropic.com/v1/messages
    ├── model: claude-haiku-4-5-20251001
    ├── system: KNOWLEDGE_BASE (клубы, цены, правила)
    ├── messages: last 10 messages (контекст)
    └── max_tokens: 600
    │
    ├─ Success → response.content[0].text → UI
    │
    └─ Error → getFallbackResponse(message)
                  │
                  ▼
           Pattern matching на ключевые слова
           (цены, адреса, пополнение, бронирование)
```

### База знаний чат-бота включает:
- Адреса и часы работы 3 клубов
- Зоны и цены (Standard/VIP/CYBER)
- Система бонусов при пополнении (+5/10/15%)
- Правила бронирования и отмены
- Характеристики ПК по зонам
- Программа лояльности
- Контакты поддержки

---

## PWA возможности

| Функция | Реализация |
|---|---|
| Установка на домашний экран | Web App Manifest (vite-plugin-pwa) |
| Полноэкранный режим | `display: standalone` |
| iOS поддержка | `apple-mobile-web-app-capable` meta tag |
| Офлайн работа | Service Worker (Workbox через vite-plugin-pwa) |
| Авто-обновление | `registerType: 'autoUpdate'` |
| Адаптация к safe-area | CSS `env(safe-area-inset-bottom)` |

---

## Demo mode (без backend)

Приложение полностью работает без Supabase и Anthropic API:

| Функция | Demo реализация |
|---|---|
| Авторизация | Любые credentials (мин. 4 символа пароль) |
| Хранилище | Zustand + localStorage persist |
| Баланс | Обновляется локально |
| Брони | Хранятся в localStorage |
| Транзакции | Хранятся в localStorage |
| Чат-бот | Fallback ответы по ключевым словам |

---

## Дополнительные фичи

1. **Бонусная система пополнения** — тиры +5/10/15% с визуальной индикацией
2. **Программа лояльности** — прогресс-бар «каждые 5 часов → бесплатный час»
3. **Фильтрация по зонам** — Standard / VIP / CYBER с ценами
4. **Спецификации ПК** — детальные характеристики каждого места
5. **Быстрые вопросы** — chips с популярными запросами в чате
6. **История транзакций** — раздельно пополнения и списания
7. **Статистика профиля** — часов, визитов, потраченная сумма
8. **Contextual приветствие** — зависит от времени суток
9. **Atomic DB операции** — PostgreSQL функции без race conditions
10. **Анти-overlap** — триггер проверки пересечения броней на уровне БД

---

## Структура проекта

```
bbplay/
├── src/
│   ├── pages/
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Booking.tsx
│   │   ├── Balance.tsx
│   │   ├── Chat.tsx
│   │   └── Profile.tsx
│   ├── components/
│   │   └── BottomNav.tsx
│   ├── lib/
│   │   ├── store.ts        ← Zustand (auth + bookings)
│   │   ├── claude.ts       ← Claude API + knowledge base
│   │   └── supabase.ts     ← Supabase client
│   ├── types/
│   │   └── index.ts        ← TypeScript interfaces
│   ├── App.tsx             ← Router + Protected routes
│   ├── main.tsx
│   └── index.css           ← Tailwind + custom design system
├── supabase/
│   └── schema.sql          ← Full DB schema + RLS + seed
├── public/                 ← PWA icons
├── ARCHITECTURE.md         ← Этот файл
├── PROMPTS.md              ← Промпты разработки
├── .env.example
├── vite.config.ts
├── tailwind.config.js
└── package.json
```

---

*Black Bears · Тамбов · BBplay v1.0*
