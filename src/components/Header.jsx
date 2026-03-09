import { ChevronDown, User } from 'lucide-react'

export default function Header({ profiles, activeProfileId, onProfileChange }) {
  const active = profiles.find(p => p.id === activeProfileId)

  return (
    <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 py-3">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <span className="text-brand-400 font-bold text-lg tracking-tight">Vitals</span>

        {profiles.length > 0 ? (
          <div className="relative">
            <select
              value={activeProfileId || ''}
              onChange={e => onProfileChange(e.target.value)}
              className="appearance-none bg-slate-800 border border-slate-700 rounded-xl
                         pl-3 pr-8 py-2 text-sm font-medium text-slate-100 focus:outline-none
                         focus:border-brand-500 cursor-pointer"
            >
              {profiles.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        ) : (
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <User size={14} /> No profile
          </span>
        )}
      </div>
    </header>
  )
}
