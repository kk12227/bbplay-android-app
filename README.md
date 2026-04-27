# BBplay — Компьютерные клубы

> Кроссплатформенное мобильное приложение (PWA) для сети компьютерных клубов **Black Bears**, г. Тамбов

## Быстрый старт

```bash
npm install
cp .env.example .env   # добавь ключи
npm run dev            # http://localhost:5173
```

## Deploy на Vercel (бесплатно, 1 минута)

```bash
npm i -g vercel
vercel --prod
# Введи env-переменные в Vercel Dashboard → Settings → Environment Variables
```

## Deploy на Netlify

```bash
npm run build
# Перетащи папку dist/ на netlify.com/drop
```

## Настройка Supabase

1. Создай проект на [app.supabase.com](https://app.supabase.com)
2. SQL Editor → вставь содержимое `supabase/schema.sql` → Run
3. Скопируй `Project URL` и `anon key` в `.env`

## Без Supabase (demo mode)

Приложение работает полностью в **demo mode** без backend:
- Данные хранятся в `localStorage` через Zustand persist
- Авторизация принимает любые credentials (мин. 4 символа пароль)
- Чат-бот работает с fallback-ответами без API ключа

## Структура проекта

```
src/
├── pages/          # Login, Register, Dashboard, Booking, Balance, Chat, Profile
├── components/     # BottomNav, переиспользуемые компоненты
├── lib/
│   ├── store.ts    # Zustand store (auth, bookings)
│   ├── claude.ts   # Claude API + база знаний + fallback
│   └── supabase.ts # Supabase client
└── types/          # TypeScript типы
```
