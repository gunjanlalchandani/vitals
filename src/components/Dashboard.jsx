import { useState, useEffect } from 'react'
import { Droplets, Flame, Dumbbell, Wheat, Leaf, Zap, Plus, Minus, UtensilsCrossed, CalendarDays } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { getDailyLog, saveDailyLog, today } from '../utils/storage'
import { sumMeals, calcBMI, bmiCategory } from '../utils/calculations'

function MacroBar({ label, current, target, color }) {
  const pct = Math.min(100, Math.round((current / (target || 1)) * 100))
  return (
    <div>
      <div className="flex justify-between text-xs text-slate-400 mb-1">
        <span>{label}</span>
        <span>{current}g / {target}g</span>
      </div>
      <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function WaterTracker({ water, onChange }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets size={18} className="text-blue-400" />
          <span className="font-semibold">Water</span>
        </div>
        <span className="text-sm text-slate-400">{water}L / 2.5L</span>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => onChange(Math.max(0, Math.round((water - 0.25) * 100) / 100))}
          className="bg-slate-800 rounded-full p-2 hover:bg-slate-700 active:bg-slate-600 flex-shrink-0">
          <Minus size={14} />
        </button>
        <div className="flex-1 grid grid-cols-8 gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}
              onClick={() => onChange(Math.round(((i + 1) * 0.25) * 100) / 100)}
              className={`h-6 rounded-sm cursor-pointer transition-colors ${
                water >= (i + 1) * 0.25 ? 'bg-blue-400' : 'bg-slate-700'
              }`}
            />
          ))}
        </div>
        <button onClick={() => onChange(Math.min(4, Math.round((water + 0.25) * 100) / 100))}
          className="bg-slate-800 rounded-full p-2 hover:bg-slate-700 active:bg-slate-600 flex-shrink-0">
          <Plus size={14} />
        </button>
      </div>
    </div>
  )
}

export default function Dashboard({ profile, onTabChange }) {
  const [log, setLog] = useState(null)
  const date = today()

  useEffect(() => {
    if (!profile) return
    setLog(getDailyLog(profile.id, date))
  }, [profile, date])

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-slate-500 gap-3">
        <Zap size={40} className="text-slate-700" />
        <p className="text-sm">Add a profile to get started</p>
        <button onClick={() => onTabChange('profile')} className="btn-primary max-w-xs">
          Add Profile
        </button>
      </div>
    )
  }

  const targets = profile.targets || {}
  const totals = log ? sumMeals(log.meals || {}) : { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const calPct = Math.min(100, Math.round((totals.calories / (targets.calories || 1)) * 100))
  const bmi = calcBMI(profile.weight, profile.height)
  const bmiInfo = bmiCategory(parseFloat(bmi))
  const water = log?.water || 0

  const updateWater = (val) => {
    const updated = { ...log, water: val }
    setLog(updated)
    saveDailyLog(profile.id, date, updated)
  }

  const chartData = [{ name: 'cal', value: calPct, fill: '#10b981' }]

  return (
    <div className="space-y-4">
      {/* Greeting */}
      <div>
        <h2 className="text-xl font-bold">Hey, {profile.name.split(' ')[0]} 👋</h2>
        <p className="text-slate-400 text-sm mt-0.5">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Calorie ring */}
      <div className="card">
        <div className="flex items-center gap-4">
          <div className="relative w-24 h-24 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="70%" outerRadius="100%"
                data={chartData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" background={{ fill: '#1e293b' }} cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-brand-400">{calPct}%</span>
              <span className="text-[10px] text-slate-500">of goal</span>
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Flame size={16} className="text-orange-400" />
              <div>
                <div className="font-semibold">{totals.calories} <span className="text-slate-400 text-sm font-normal">/ {targets.calories} kcal</span></div>
                <div className="text-xs text-slate-500">Calories consumed</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Dumbbell size={16} className="text-purple-400" />
              <span className="text-sm">{totals.protein}g protein</span>
            </div>
            <div className="flex gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1"><Wheat size={12} className="text-yellow-400" />{totals.carbs}g carbs</span>
              <span className="flex items-center gap-1"><Leaf size={12} className="text-green-400" />{totals.fat}g fat</span>
            </div>
          </div>
        </div>
      </div>

      {/* Macro bars */}
      <div className="card space-y-3">
        <div className="text-sm font-semibold text-slate-300">Macros</div>
        <MacroBar label="Protein" current={totals.protein} target={targets.protein} color="bg-purple-500" />
        <MacroBar label="Carbs" current={totals.carbs} target={targets.carbs} color="bg-yellow-500" />
        <MacroBar label="Fat" current={totals.fat} target={targets.fat} color="bg-orange-500" />
      </div>

      {/* Water tracker */}
      <WaterTracker water={water} onChange={updateWater} />

      {/* BMI card */}
      <div className="card flex items-center justify-between">
        <div>
          <div className="text-sm text-slate-400">BMI</div>
          <div className="text-2xl font-bold">{bmi}</div>
        </div>
        <span className={`text-sm font-semibold ${bmiInfo.color} bg-slate-800 px-3 py-1 rounded-full`}>
          {bmiInfo.label}
        </span>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onTabChange('log')}
          className="card flex items-center gap-3 hover:border-brand-500/50 transition-colors">
          <UtensilsCrossed size={20} className="text-brand-400" />
          <span className="text-sm font-medium">Log meal</span>
        </button>
        <button onClick={() => onTabChange('diet')}
          className="card flex items-center gap-3 hover:border-brand-500/50 transition-colors">
          <CalendarDays size={20} className="text-brand-400" />
          <span className="text-sm font-medium">View plan</span>
        </button>
      </div>
    </div>
  )
}
