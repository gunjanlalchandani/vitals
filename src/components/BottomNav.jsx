import { LayoutDashboard, User, CalendarDays, UtensilsCrossed, TrendingUp } from 'lucide-react'

const TABS = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'diet', label: 'Diet', icon: CalendarDays },
  { id: 'log', label: 'Log', icon: UtensilsCrossed },
  { id: 'metrics', label: 'Metrics', icon: TrendingUp },
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur border-t border-white/[0.06]"
         style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="flex max-w-lg mx-auto">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex-1 flex flex-col items-center py-3 gap-0.5 transition-all relative ${
                active ? 'text-emerald-400' : 'text-slate-600 hover:text-slate-400'
              }`}
            >
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
              )}
              <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
              <span className={`text-[10px] font-medium ${active ? 'text-emerald-400' : ''}`}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
