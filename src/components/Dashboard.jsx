import { useState, useEffect } from 'react'
import { Droplets, Flame, Plus, Minus, Pencil, ChevronRight, Activity, CheckCircle2 } from 'lucide-react'
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts'
import { getDailyLog, saveDailyLog, getDietPlan, saveDietPlan, today, tomorrow, getDayName } from '../utils/storage'
import { sumMeals, calcBMI, bmiCategory } from '../utils/calculations'
import { getTodayQuote } from '../utils/quotes'
import MealEditModal from './diet/MealEditModal'

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
  if (slot.optionA) {
    return slot[`option${slot.selected || 'A'}`]
  }
  return slot // legacy single-option format
}

function WaterTracker({ water, onChange }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Droplets size={16} className="text-blue-400" />
          <span className="font-semibold text-sm">Water</span>
        </div>
        <span className="text-sm font-bold text-blue-400">{water}L / 2L</span>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={() => onChange(Math.max(0, Math.round((water - 0.25) * 100) / 100))}
          className="bg-slate-800 rounded-xl p-2 hover:bg-slate-700 flex-shrink-0">
          <Minus size={13} />
        </button>
        <div className="flex-1 grid grid-cols-8 gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}
              onClick={() => onChange(Math.round(((i + 1) * 0.25) * 100) / 100)}
              className={`h-6 rounded-lg cursor-pointer transition-all ${
                water >= (i + 1) * 0.25
                  ? 'bg-gradient-to-b from-blue-400 to-blue-600'
                  : 'bg-slate-800 hover:bg-slate-700'
              }`}
            />
          ))}
        </div>
        <button onClick={() => onChange(Math.min(4, Math.round((water + 0.25) * 100) / 100))}
          className="bg-slate-800 rounded-xl p-2 hover:bg-slate-700 flex-shrink-0">
          <Plus size={13} />
        </button>
      </div>
    </div>
  )
}

function MealPlanCard({ dateLabel, dayName, dayPlan, isToday, onEdit, onSelectOption }) {
  if (!dayPlan) {
    return (
      <div className="card py-6 text-center space-y-2">
        <p className="text-slate-500 text-sm">No plan for {dateLabel}</p>
        <p className="text-slate-600 text-xs">Generate a weekly plan in the Diet tab</p>
      </div>
    )
  }

  return (
    <div className={`rounded-2xl border overflow-hidden ${
      isToday ? 'border-emerald-500/30 bg-emerald-500/[0.03]' : 'border-white/[0.07] bg-white/[0.02]'
    }`}>
      {/* Card header */}
      <div className={`px-4 py-3 flex items-center justify-between border-b ${
        isToday ? 'border-emerald-500/20 bg-emerald-500/[0.06]' : 'border-white/[0.05] bg-white/[0.02]'
      }`}>
        <div>
          <span className={`font-black text-sm uppercase tracking-wider ${isToday ? 'text-emerald-400' : 'text-slate-400'}`}>
            {dateLabel}
          </span>
          <span className="text-slate-500 text-xs ml-2 capitalize">{dayName}</span>
        </div>
        {isToday && (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            TODAY
          </span>
        )}
      </div>

      {/* Meals */}
      <div className="divide-y divide-white/[0.04]">
        {MEALS.map(meal => {
          const slot = dayPlan[meal]
          const selected = getSelectedMeal(slot)
          const hasOptions = slot?.optionA

          return (
            <div key={meal} className="px-4 py-3">
              <div className="flex items-start gap-3">
                <span className="text-base flex-shrink-0 mt-0.5">{MEAL_ICONS[meal]}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    {MEAL_LABELS[meal]}
                  </div>

                  {hasOptions ? (
                    <div className="flex gap-2">
                      {['A', 'B'].map(opt => {
                        const option = slot[`option${opt}`]
                        const isSelected = (slot.selected || 'A') === opt
                        return (
                          <button
                            key={opt}
                            onClick={() => onSelectOption(dayName, meal, opt)}
                            className={`flex-1 text-left px-3 py-2 rounded-xl border transition-all ${
                              isSelected
                                ? isToday
                                  ? 'bg-emerald-500/15 border-emerald-500/40 text-white'
                                  : 'bg-violet-500/15 border-violet-500/40 text-white'
                                : 'bg-white/[0.03] border-white/[0.07] text-slate-400 hover:border-white/20'
                            }`}
                          >
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className={`text-[9px] font-black ${isSelected ? (isToday ? 'text-emerald-400' : 'text-violet-400') : 'text-slate-600'}`}>
                                {opt}
                              </span>
                              {isSelected && <CheckCircle2 size={10} className={isToday ? 'text-emerald-400' : 'text-violet-400'} />}
                            </div>
                            <div className="text-xs font-medium leading-tight">{option?.dish}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{option?.calories} kcal</div>
                          </button>
                        )
                      })}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-300">{selected?.dish || <span className="text-slate-600 italic">Not set</span>}</div>
                  )}
                </div>

                <button
                  onClick={() => onEdit(dayName, meal)}
                  className="p-1.5 text-slate-600 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors flex-shrink-0 mt-4"
                >
                  <Pencil size={13} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Dashboard({ profile, onTabChange }) {
  const [log, setLog] = useState(null)
  const [plan, setPlan] = useState(null)
  const [editTarget, setEditTarget] = useState(null)
  const quote = getTodayQuote()
  const todayDate = today()
  const tomorrowDate = tomorrow()
  const todayDay = getDayName(todayDate)
  const tomorrowDay = getDayName(tomorrowDate)

  useEffect(() => {
    if (!profile) return
    setLog(getDailyLog(profile.id, todayDate))
    setPlan(getDietPlan(profile.id))
  }, [profile, todayDate])

  if (!profile) return null

  const targets = profile.targets || {}
  const totals = log ? sumMeals(log.meals || {}) : { calories: 0, protein: 0, carbs: 0, fat: 0 }
  const calPct = Math.min(100, Math.round((totals.calories / (targets.calories || 1)) * 100))
  const water = log?.water || 0
  const bmi = calcBMI(profile.weight, profile.height)
  const bmiInfo = bmiCategory(parseFloat(bmi))
  const remaining = Math.max(0, (targets.calories || 0) - totals.calories)

  const updateWater = (val) => {
    const updated = { ...log, water: val }
    setLog(updated)
    saveDailyLog(profile.id, todayDate, updated)
  }

  const handleSelectOption = (dayName, meal, opt) => {
    if (!plan) return
    const updated = {
      ...plan,
      [dayName]: {
        ...plan[dayName],
        [meal]: { ...plan[dayName][meal], selected: opt }
      }
    }
    setPlan(updated)
    saveDietPlan(profile.id, updated)
  }

  const handleMealEdit = (dayName, meal) => {
    setEditTarget({ dayName, meal })
  }

  const handleMealSelect = (item) => {
    if (!editTarget || !plan) return
    const { dayName, meal } = editTarget
    const currentSlot = plan[dayName]?.[meal] || {}
    const updated = {
      ...plan,
      [dayName]: {
        ...plan[dayName],
        [meal]: {
          optionA: currentSlot.optionA || item,
          optionB: currentSlot.optionB || item,
          ...currentSlot,
          optionA: item, // replace selected option
          selected: currentSlot.selected || 'A'
        }
      }
    }
    setPlan(updated)
    saveDietPlan(profile.id, updated)
    setEditTarget(null)
  }

  const chartData = [{ name: 'cal', value: calPct || 1, fill: calPct > 90 ? '#f59e0b' : '#10b981' }]

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div className="space-y-5">
      {/* Greeting */}
      <div className="flex items-start justify-between pt-1">
        <div>
          <p className="text-slate-500 text-sm">{greeting}</p>
          <h2 className="text-2xl font-black text-white">{profile.name.split(' ')[0]} 💪</h2>
        </div>
        <div className="text-xs text-slate-600 text-right pt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </div>
      </div>

      {/* Quote */}
      <div className="px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-cyan-500/5 border border-emerald-500/20">
        <p className="text-sm text-emerald-300 font-medium italic leading-snug">"{quote.text}"</p>
        <p className="text-xs text-slate-500 mt-1">— {quote.author}</p>
      </div>

      {/* Calorie summary */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="72%" outerRadius="100%"
                data={chartData} startAngle={90} endAngle={-270}>
                <RadialBar dataKey="value" background={{ fill: '#1e293b' }} cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-black text-white">{calPct}%</span>
              <span className="text-[9px] text-slate-500">goal</span>
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Flame size={13} className="text-orange-400" />
              <span className="text-xs text-slate-400">Today's calories</span>
            </div>
            <div className="font-black text-xl text-white">
              {totals.calories}
              <span className="text-slate-500 text-sm font-normal ml-1">/ {targets.calories}</span>
            </div>
            <div className="text-xs text-emerald-400 mt-0.5">{remaining} kcal remaining</div>
            <div className="flex gap-3 mt-2 text-xs">
              <span className="text-purple-400">P {totals.protein}g</span>
              <span className="text-yellow-400">C {totals.carbs}g</span>
              <span className="text-orange-400">F {totals.fat}g</span>
            </div>
          </div>
          <button onClick={() => onTabChange('log')}
            className="flex-shrink-0 p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20">
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Water */}
      <WaterTracker water={water} onChange={updateWater} />

      {/* TODAY'S PLAN */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-base text-white uppercase tracking-wide">Meal Plan</h3>
          {!plan && (
            <button onClick={() => onTabChange('diet')}
              className="text-xs text-emerald-400 flex items-center gap-1 hover:text-emerald-300">
              Generate plan <ChevronRight size={12} />
            </button>
          )}
        </div>

        <div className="space-y-4">
          <MealPlanCard
            dateLabel="Today"
            dayName={todayDay}
            dayPlan={plan?.[todayDay]}
            isToday={true}
            onEdit={handleMealEdit}
            onSelectOption={handleSelectOption}
          />
          <MealPlanCard
            dateLabel="Tomorrow"
            dayName={tomorrowDay}
            dayPlan={plan?.[tomorrowDay]}
            isToday={false}
            onEdit={handleMealEdit}
            onSelectOption={handleSelectOption}
          />
        </div>
      </div>

      {/* BMI quick stat */}
      <div className="card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={15} className="text-cyan-400" />
          <div>
            <div className="text-xs text-slate-500">BMI</div>
            <div className="font-black text-lg text-white">{bmi}</div>
          </div>
        </div>
        <span className={`text-xs font-bold px-3 py-1 rounded-full bg-slate-800 ${bmiInfo.color}`}>
          {bmiInfo.label}
        </span>
      </div>

      {/* Meal edit modal */}
      {editTarget && (
        <MealEditModal
          mealType={editTarget.meal}
          targetCalories={Math.round((targets.calories || 2000) / 6)}
          profile={profile}
          onSelect={handleMealSelect}
          onClose={() => setEditTarget(null)}
        />
      )}
    </div>
  )
}
