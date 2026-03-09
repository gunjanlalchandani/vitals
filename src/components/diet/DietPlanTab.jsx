import { useState, useEffect } from 'react'
import { Loader2, Sparkles, Pencil, ChevronDown, ChevronUp, RefreshCw, CheckCircle2 } from 'lucide-react'
import { getDietPlan, saveDietPlan } from '../../utils/storage'
import { generateWeeklyPlan } from '../../utils/claude'
import MealEditModal from './MealEditModal'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
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

function getSelectedMeal(slot) {
  if (!slot) return null
  if (slot.optionA) return slot[`option${slot.selected || 'A'}`]
  return slot
}

function DayCard({ day, plan, profile, onMealEdit, onSelectOption }) {
  const [open, setOpen] = useState(false)
  const dayPlan = plan?.[day] || {}

  const total = MEALS.reduce((sum, meal) => {
    const selected = getSelectedMeal(dayPlan[meal])
    return sum + (selected?.calories || 0)
  }, 0)

  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] overflow-hidden">
      <button onClick={() => setOpen(o => !o)} className="w-full flex items-center justify-between px-4 py-3.5">
        <span className="font-black capitalize text-sm tracking-wide">{day}</span>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-400">{total} kcal</span>
          {open ? <ChevronUp size={15} className="text-slate-500" /> : <ChevronDown size={15} className="text-slate-500" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-white/[0.05] divide-y divide-white/[0.04]">
          {MEALS.map(meal => {
            const slot = dayPlan[meal]
            const hasOptions = slot?.optionA

            return (
              <div key={meal} className="px-4 py-3">
                <div className="flex items-start gap-2">
                  <span className="text-sm flex-shrink-0 mt-0.5">{MEAL_ICONS[meal]}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      {MEAL_LABELS[meal]}
                    </div>
                    {hasOptions ? (
                      <div className="flex gap-2">
                        {['A', 'B'].map(opt => {
                          const option = slot[`option${opt}`]
                          const isSelected = (slot.selected || 'A') === opt
                          return (
                            <button key={opt}
                              onClick={() => onSelectOption(day, meal, opt)}
                              className={`flex-1 text-left px-3 py-2 rounded-xl border transition-all ${
                                isSelected
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                                  : 'bg-white/[0.03] border-white/[0.07] text-slate-400 hover:border-white/20'
                              }`}>
                              <div className="flex items-center gap-1 mb-0.5">
                                <span className={`text-[9px] font-black ${isSelected ? 'text-emerald-400' : 'text-slate-600'}`}>{opt}</span>
                                {isSelected && <CheckCircle2 size={9} className="text-emerald-400" />}
                              </div>
                              <div className="text-xs font-medium leading-tight">{option?.dish}</div>
                              <div className="text-[10px] text-slate-500 mt-0.5">{option?.calories} kcal</div>
                            </button>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-300">{getSelectedMeal(slot)?.dish || <span className="text-slate-600 italic">Not set</span>}</div>
                    )}
                  </div>
                  <button onClick={() => onMealEdit(day, meal)}
                    className="p-1.5 text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors flex-shrink-0 mt-5">
                    <Pencil size={13} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default function DietPlanTab({ profile }) {
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [editTarget, setEditTarget] = useState(null)

  useEffect(() => {
    if (!profile) return
    const stored = getDietPlan(profile.id)
    if (stored) setPlan(stored)
  }, [profile])

  const handleGenerate = async () => {
    setLoading(true)
    setError('')
    try {
      const generated = await generateWeeklyPlan({
        profile,
        targets: profile.targets,
        preferences: profile.dietaryPrefs
      })
      setPlan(generated)
      saveDietPlan(profile.id, generated)
    } catch (e) {
      setError(e.message === 'NO_API_KEY'
        ? 'Claude API key not set. Add it in Settings.'
        : 'Failed to generate plan. ' + e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectOption = (day, meal, opt) => {
    if (!plan) return
    const updated = {
      ...plan,
      [day]: { ...plan[day], [meal]: { ...plan[day][meal], selected: opt } }
    }
    setPlan(updated)
    saveDietPlan(profile.id, updated)
  }

  const handleMealSelect = (item) => {
    if (!editTarget || !plan) return
    const { day, meal } = editTarget
    const currentSlot = plan[day]?.[meal] || {}
    const updated = {
      ...plan,
      [day]: {
        ...plan[day],
        [meal]: {
          optionA: item,
          optionB: currentSlot.optionB || item,
          selected: 'A'
        }
      }
    }
    setPlan(updated)
    saveDietPlan(profile.id, updated)
    setEditTarget(null)
  }

  if (!profile) {
    return <div className="flex items-center justify-center h-64 text-slate-500 text-sm">Select a profile first</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title mb-0">Weekly Plan</h2>
        <button onClick={handleGenerate} disabled={loading}
          className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-400 text-black
                     text-sm font-black px-4 py-2 rounded-xl transition-colors disabled:opacity-50">
          {loading
            ? <Loader2 size={14} className="animate-spin" />
            : plan ? <RefreshCw size={14} /> : <Sparkles size={14} />
          }
          {plan ? 'Regenerate' : 'Generate'}
        </button>
      </div>

      {/* Targets */}
      <div className="card flex gap-4 overflow-x-auto text-center text-sm">
        {[
          { label: 'Target', val: `${profile.targets?.calories} kcal`, color: 'text-orange-400' },
          { label: 'Protein', val: `${profile.targets?.protein}g`, color: 'text-purple-400' },
          { label: 'Carbs', val: `${profile.targets?.carbs}g`, color: 'text-yellow-400' },
          { label: 'Fat', val: `${profile.targets?.fat}g`, color: 'text-blue-400' },
        ].map(({ label, val, color }) => (
          <div key={label} className="flex-shrink-0">
            <div className="text-slate-500 text-xs">{label}</div>
            <div className={`font-black ${color}`}>{val}</div>
          </div>
        ))}
      </div>

      {error && <div className="p-3 bg-red-900/20 border border-red-800 rounded-xl text-red-300 text-sm">{error}</div>}

      {!plan && !loading && (
        <div className="card text-center py-12 space-y-3">
          <div className="text-5xl">🥗</div>
          <p className="text-slate-400 font-semibold">No plan yet</p>
          <p className="text-slate-500 text-xs px-4">Generate a personalised weekly plan based on your calorie targets and food preferences</p>
          <button onClick={handleGenerate} className="btn-primary max-w-xs mx-auto">
            <Sparkles size={15} className="inline mr-2" />Generate weekly plan
          </button>
        </div>
      )}

      {loading && (
        <div className="card text-center py-12 space-y-3">
          <Loader2 size={36} className="animate-spin text-emerald-400 mx-auto" />
          <p className="text-slate-300 font-semibold">Building your meal plan...</p>
          <p className="text-slate-500 text-xs">Using your food preferences · 2 options per meal · ~20 seconds</p>
        </div>
      )}

      {plan && !loading && (
        <div className="space-y-3">
          {DAYS.map(day => (
            <DayCard
              key={day}
              day={day}
              plan={plan}
              profile={profile}
              onMealEdit={(d, m) => setEditTarget({ day: d, meal: m })}
              onSelectOption={handleSelectOption}
            />
          ))}
        </div>
      )}

      {editTarget && (
        <MealEditModal
          mealType={editTarget.meal}
          targetCalories={Math.round((profile.targets?.calories || 2000) / 6)}
          profile={profile}
          onSelect={handleMealSelect}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
