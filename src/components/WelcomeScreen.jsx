import { Plus, ChevronRight, Activity, Target, Flame, Zap } from 'lucide-react'
import { getTodayQuote } from '../utils/quotes'

const PROFILE_GRADIENTS = [
  'from-emerald-500 to-cyan-500',
  'from-violet-500 to-purple-600',
  'from-orange-500 to-amber-500',
  'from-rose-500 to-pink-600',
  'from-blue-500 to-indigo-600',
  'from-teal-500 to-green-500',
]

const GOAL_LABELS = {
  lose: 'Weight Loss',
  maintain: 'Maintain Weight',
  gain: 'Muscle Gain',
  fitness: 'Improve Fitness',
}

const GOAL_ICONS = {
  lose: '🔥',
  maintain: '⚖️',
  gain: '💪',
  fitness: '⚡',
}

function ProfileAvatar({ name, index }) {
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  const gradient = PROFILE_GRADIENTS[index % PROFILE_GRADIENTS.length]
  return (
    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center
                     text-white font-bold text-lg shadow-lg flex-shrink-0`}>
      {initials}
    </div>
  )
}

export default function WelcomeScreen({ profiles, onSelectProfile, onAddProfile }) {
  const quote = getTodayQuote()

  return (
    <div className="min-h-screen bg-black flex flex-col overflow-hidden relative">

      {/* Background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-40 left-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col flex-1 px-5 pt-16 pb-10 max-w-lg mx-auto w-full">

        {/* Hero */}
        <div className="mb-10">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-emerald-500/40" />
            <span className="text-xs font-semibold tracking-[0.2em] text-emerald-400 uppercase">Health · Nutrition · Metrics</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-emerald-500/40" />
          </div>

          {/* Logo */}
          <h1 className="text-[72px] font-black leading-none tracking-tighter mb-3"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #10b981 50%, #06b6d4 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
            VITALS
          </h1>
          <p className="text-slate-400 text-lg font-light tracking-wide">Your personal health tracker</p>

          {/* Stats strip */}
          <div className="flex gap-4 mt-6">
            {[
              { icon: Activity, label: 'Track', color: 'text-emerald-400' },
              { icon: Target, label: 'Goal', color: 'text-cyan-400' },
              { icon: Flame, label: 'Burn', color: 'text-orange-400' },
              { icon: Zap, label: 'Energy', color: 'text-yellow-400' },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-1">
                <div className={`w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center`}>
                  <Icon size={18} className={color} />
                </div>
                <span className="text-[10px] text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Daily quote */}
        <div className="mb-8 relative">
          <div className="absolute -left-1 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 to-transparent rounded-full" />
          <div className="pl-4">
            <div className="text-[10px] font-semibold tracking-[0.15em] text-emerald-400 uppercase mb-1.5">
              Today's motivation
            </div>
            <p className="text-white font-medium text-base leading-snug italic">"{quote.text}"</p>
            <p className="text-slate-500 text-xs mt-1.5">— {quote.author}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-slate-800" />
          <span className="text-xs text-slate-600 font-medium tracking-wider uppercase">
            {profiles.length > 0 ? 'Select your profile' : 'Get started'}
          </span>
          <div className="h-px flex-1 bg-slate-800" />
        </div>

        {/* Profile list */}
        <div className="flex-1 space-y-3">
          {profiles.map((profile, i) => (
            <button
              key={profile.id}
              onClick={() => onSelectProfile(profile.id)}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/[0.08]
                         hover:bg-white/[0.06] hover:border-emerald-500/30 active:scale-[0.98]
                         transition-all duration-150 text-left group"
            >
              <ProfileAvatar name={profile.name} index={i} />
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-base leading-tight">{profile.name}</div>
                <div className="text-slate-400 text-xs mt-0.5">
                  {profile.age}y · {profile.weight}kg · {profile.height}cm
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-sm">{GOAL_ICONS[profile.goal]}</span>
                  <span className="text-xs font-medium text-emerald-400">{GOAL_LABELS[profile.goal]}</span>
                  <span className="text-slate-600 text-xs">·</span>
                  <span className="text-xs text-slate-500">{profile.targets?.calories} kcal/day</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-slate-600 group-hover:text-emerald-400 transition-colors flex-shrink-0" />
            </button>
          ))}

          {/* Add new profile */}
          <button
            onClick={onAddProfile}
            className="w-full flex items-center gap-4 p-4 rounded-2xl border border-dashed border-slate-700
                       hover:border-emerald-500/50 hover:bg-emerald-500/5 active:scale-[0.98]
                       transition-all duration-150 text-left group"
          >
            <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-center
                            group-hover:border-emerald-500/50 transition-colors">
              <Plus size={22} className="text-slate-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div>
              <div className="font-semibold text-slate-300 group-hover:text-white transition-colors">Add new profile</div>
              <div className="text-xs text-slate-500 mt-0.5">Set up goals, targets & nutrition plan</div>
            </div>
          </button>
        </div>

        {/* Bottom tagline */}
        <div className="pt-8 text-center">
          <p className="text-xs text-slate-700 tracking-widest uppercase font-medium">
            Built for performance
          </p>
        </div>
      </div>
    </div>
  )
}
