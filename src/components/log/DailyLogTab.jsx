import { useState, useEffect } from 'react'
import { Plus, Trash2, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import SpeechInput from './SpeechInput'
import { getDailyLog, saveDailyLog, today, getSettings } from '../../utils/storage'
import { sumMeals } from '../../utils/calculations'
import { estimateNutrition } from '../../utils/claude'

const MEALS = ['preBreakfast', 'breakfast', 'postBreakfast', 'lunch', 'evening', 'dinner']
const MEAL_LABELS = {
  preBreakfast: 'Pre-breakfast', breakfast: 'Breakfast',
  postBreakfast: 'Post-breakfast', lunch: 'Lunch',
  evening: 'Evening snack', dinner: 'Dinner'
}
const MEAL_ICONS = {
  preBreakfast: '🌅', breakfast: '🍳',
  postBreakfast: '🥜', lunch: '🍱',
  evening: '☕', dinner: '🌙'
}

function EntryRow({ entry, onDelete }) {
  return (
    <div className="flex items-center gap-2 py-2.5 border-b border-white/[0.05] last:border-0">
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-white">{entry.dish}</div>
        {entry.quantity && <div className="text-xs text-slate-500">{entry.quantity}</div>}
        <div className="flex gap-2 text-[10px] mt-0.5">
          {entry.calories > 0 && <span className="text-orange-400">{entry.calories} kcal</span>}
          {entry.protein > 0 && <span className="text-purple-400">P {entry.protein}g</span>}
          {entry.carbs > 0 && <span className="text-yellow-400">C {entry.carbs}g</span>}
          {entry.fat > 0 && <span className="text-blue-400">F {entry.fat}g</span>}
          {entry.estimated && <span className="text-slate-600 italic">est.</span>}
        </div>
      </div>
      <button onClick={onDelete} className="p-1.5 text-slate-700 hover:text-red-400">
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function AddEntryForm({ onAdd, profile }) {
  const [dish, setDish] = useState('')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [estimated, setEstimated] = useState(null)
  const [error, setError] = useState('')
  const hasApiKey = !!getSettings().claudeApiKey

  const handleEstimate = async () => {
    if (!dish.trim()) return
    if (!hasApiKey) {
      // Add without nutrition data
      onAdd({ dish: dish.trim(), quantity: quantity.trim(), calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, estimated: false })
      setDish(''); setQuantity('')
      return
    }
    setLoading(true)
    setError('')
    try {
      const nutrition = await estimateNutrition(dish, quantity || '1 serving')
      setEstimated(nutrition)
    } catch (e) {
      setError('Could not estimate — add manually or try again')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = () => {
    if (!dish.trim()) return
    onAdd({
      dish: dish.trim(),
      quantity: quantity.trim(),
      calories: estimated?.calories || 0,
      protein: estimated?.protein || 0,
      carbs: estimated?.carbs || 0,
      fat: estimated?.fat || 0,
      fiber: estimated?.fiber || 0,
      estimated: !!estimated
    })
    setDish(''); setQuantity(''); setEstimated(null); setError('')
  }

  return (
    <div className="space-y-3 pt-3 border-t border-white/[0.06]">
      <div className="flex gap-2">
        <input
          value={dish}
          onChange={e => { setDish(e.target.value); setEstimated(null) }}
          onKeyDown={e => e.key === 'Enter' && !estimated && handleEstimate()}
          placeholder="Dish name (e.g. Poha)"
          className="flex-1"
          autoFocus
        />
        <SpeechInput onResult={(text) => { setDish(text); setEstimated(null) }} />
      </div>
      <input
        value={quantity}
        onChange={e => { setQuantity(e.target.value); setEstimated(null) }}
        placeholder="Quantity (e.g. 1 bowl, 200g)"
      />

      {/* Estimated nutrition preview */}
      {estimated && (
        <div className="px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-1">
          <div className="text-xs font-semibold text-emerald-400">Estimated nutrition</div>
          <div className="flex gap-3 text-xs">
            <span className="text-orange-400 font-bold">{estimated.calories} kcal</span>
            <span className="text-purple-400">P {estimated.protein}g</span>
            <span className="text-yellow-400">C {estimated.carbs}g</span>
            <span className="text-blue-400">F {estimated.fat}g</span>
            <span className="text-slate-400">Fiber {estimated.fiber}g</span>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-xs">{error}</p>}

      {!estimated ? (
        <button onClick={handleEstimate} disabled={loading || !dish.trim()} className="btn-primary py-3">
          {loading
            ? <><Loader2 size={14} className="animate-spin inline mr-2" />Calculating nutrition...</>
            : hasApiKey ? 'Calculate nutrition' : 'Add entry'
          }
        </button>
      ) : (
        <div className="flex gap-2">
          <button onClick={handleAdd} className="btn-primary py-2.5 flex-1">
            <Plus size={14} className="inline mr-1" />Add to log
          </button>
          <button onClick={() => setEstimated(null)} className="btn-secondary py-2.5 flex-shrink-0 w-24">
            Re-estimate
          </button>
        </div>
      )}
    </div>
  )
}

function MealSection({ meal, entries, onAdd, onDelete, profile }) {
  const [open, setOpen] = useState(false)
  const [showAdd, setShowAdd] = useState(false)
  const total = entries.reduce((s, e) => s + (e.calories || 0), 0)

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{MEAL_ICONS[meal]}</span>
          <span className="font-bold text-sm">{MEAL_LABELS[meal]}</span>
          {entries.length > 0 && (
            <span className="text-[10px] bg-white/[0.06] text-slate-400 px-2 py-0.5 rounded-full">
              {entries.length}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {total > 0 && <span className="text-xs text-orange-400 font-bold">{total} kcal</span>}
          {open ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 border-t border-white/[0.05]">
          <div className="pt-2">
            {entries.length === 0 ? (
              <p className="text-sm text-slate-600 italic py-2">Nothing logged yet</p>
            ) : (
              entries.map((entry, i) => (
                <EntryRow key={i} entry={entry} onDelete={() => onDelete(i)} />
              ))
            )}
          </div>

          {showAdd ? (
            <>
              <AddEntryForm onAdd={(entry) => { onAdd(entry); setShowAdd(false) }} profile={profile} />
              <button onClick={() => setShowAdd(false)} className="btn-ghost w-full mt-2 text-center">Cancel</button>
            </>
          ) : (
            <button onClick={() => setShowAdd(true)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 text-sm text-emerald-400
                         hover:text-emerald-300 py-2.5 border border-dashed border-emerald-500/20 rounded-xl
                         hover:border-emerald-500/40 transition-colors">
              <Plus size={14} />Log a dish
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export default function DailyLogTab({ profile }) {
  const [date, setDate] = useState(today())
  const [log, setLog] = useState({ meals: {}, water: 0 })

  useEffect(() => {
    if (!profile) return
    setLog(getDailyLog(profile.id, date))
  }, [profile, date])

  const updateLog = (updated) => {
    setLog(updated)
    saveDailyLog(profile.id, date, updated)
  }

  const addEntry = (meal, entry) => {
    const meals = { ...log.meals }
    if (!meals[meal]) meals[meal] = []
    meals[meal] = [...meals[meal], entry]
    updateLog({ ...log, meals })
  }

  const deleteEntry = (meal, idx) => {
    const meals = { ...log.meals }
    meals[meal] = meals[meal].filter((_, i) => i !== idx)
    updateLog({ ...log, meals })
  }

  if (!profile) {
    return <div className="flex items-center justify-center h-64 text-slate-500 text-sm">Select a profile to log meals</div>
  }

  const totals = sumMeals(log.meals || {})
  const targets = profile.targets || {}

  const achievements = [
    { label: 'Calories', current: totals.calories, target: targets.calories, color: 'bg-orange-500', text: 'text-orange-400' },
    { label: 'Protein', current: totals.protein, target: targets.protein, color: 'bg-purple-500', text: 'text-purple-400' },
    { label: 'Carbs', current: totals.carbs, target: targets.carbs, color: 'bg-yellow-500', text: 'text-yellow-400' },
    { label: 'Fat', current: totals.fat, target: targets.fat, color: 'bg-blue-500', text: 'text-blue-400' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Daily Log</h2>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          max={today()} className="text-sm py-2 px-3 w-auto" />
      </div>

      {/* Achievement summary */}
      <div className="card space-y-3">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's achievement</div>
        {achievements.map(({ label, current, target, color, text }) => {
          const pct = Math.min(100, Math.round((current / (target || 1)) * 100))
          return (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">{label}</span>
                <span className={`font-bold ${text}`}>{pct}% <span className="text-slate-500 font-normal">({current} / {target})</span></span>
              </div>
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Meal sections */}
      <div className="space-y-3">
        {MEALS.map(meal => (
          <MealSection
            key={meal}
            meal={meal}
            entries={log.meals?.[meal] || []}
            onAdd={(entry) => addEntry(meal, entry)}
            onDelete={(idx) => deleteEntry(meal, idx)}
            profile={profile}
          />
        ))}
      </div>
    </div>
  )
}
