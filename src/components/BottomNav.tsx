import { NavLink } from 'react-router-dom'
import { Home, Monitor, Newspaper, MessageSquare, User } from 'lucide-react'
import clsx from 'clsx'

const links = [
  { to: '/',        icon: Home,          label: 'Главная'  },
  { to: '/booking', icon: Monitor,       label: 'Бронь'    },
  { to: '/news',    icon: Newspaper,     label: 'Новости'  },
  { to: '/chat',    icon: MessageSquare, label: 'Чат'      },
  { to: '/profile', icon: User,          label: 'Профиль'  },
]

export default function BottomNav() {
  return (
    <nav className="bottom-nav z-50">
      <div className="flex items-center justify-around px-2 pt-2 pb-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => clsx(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 min-w-0 flex-1',
              isActive
                ? 'text-neon-cyan'
                : 'text-white/40 hover:text-white/70'
            )}
          >
            {({ isActive }) => (
              <>
                <div className={clsx(
                  'w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-200',
                  isActive && 'bg-neon-cyan/10'
                )}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
                </div>
                <span className="text-[10px] font-display font-500 truncate">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
